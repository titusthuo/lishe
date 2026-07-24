import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";

// Runs only on the server, so GEMINI_API_KEY is never shipped to the browser.
export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const SYSTEM_PROMPT = `You are "Lishe Helper", a friendly nutrition educator for a Kenyan audience.

Your job: help ordinary Kenyans understand nutrition and how to eat a balanced diet on a real budget, using foods they can actually find — ugali, githeri, sukuma wiki, terere, managu, omena, ndengu, beans, sweet potato, fruits, eggs, milk, etc.

How to answer:
- ALWAYS finish your answer. Never cut off mid-sentence. If you have more to say than fits, wrap up with a clean final line rather than trailing off.
- Structure most answers as: one short opening sentence, then 3–6 short bullet points, then one closing tip. Keep bullets to a single line each.
- Speak in plain language a secondary-school student in Kenya could follow. No jargon unless you explain it.
- Ground everything in mainstream guidance (WHO healthy diet, Kenya food-based dietary guidelines): variety, plenty of vegetables and fruit, whole grains, limit added sugar, salt under 5 g/day, healthy fats.
- Be practical and specific to Kenya: affordable local foods, market realities, common meals like githeri, ugali with sukuma, ndengu stew, mukimo, matoke, terere.
- Never invent specific prices or precise nutrient numbers you are not sure about. If you don't know, say so.

Scope:
- Only answer questions about nutrition, food, and healthy or balanced eating. If asked about something else, briefly say that's outside what you can help with and offer a nutrition question you could answer instead.
- You give general nutrition information, NOT medical advice. If the user describes a medical condition, pregnancy, a child's illness, symptoms, medication, or supplements, tell them to see a doctor or a KNDI-registered nutritionist, and only give general food-group guidance.`;

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  finishReason?: string;
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

const NOT_CONFIGURED =
  "The nutrition helper isn't configured yet — set GEMINI_API_KEY in your environment to enable it.";
const RATE_LIMITED =
  "You've asked a lot of questions in a short time. Give it a minute and try again — the helper is free to use and shared with everyone.";
const GENERIC_ERROR = "Sorry — the helper couldn't answer just now. Please try again in a moment.";
const BLOCKED =
  "I can't answer that one. Try a question about nutrition, balanced diet, or a specific food, and I'll help.";

// In-process sliding window. Fluid Compute reuses instances, so this stops the
// obvious abuse case, but it is per-instance rather than global — a determined
// caller spread across instances can still get through. Move to a shared store
// (e.g. Redis) if the Gemini bill starts to matter.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const MAX_TRACKED_CLIENTS = 5_000;
const hits = new Map<string, number[]>();

function overRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const recent = (hits.get(clientKey) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(clientKey, recent);
    return true;
  }

  recent.push(now);
  hits.set(clientKey, recent);

  // Bound memory: drop clients whose windows have fully expired, and if that
  // isn't enough, evict oldest-inserted keys.
  if (hits.size > MAX_TRACKED_CLIENTS) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
    while (hits.size > MAX_TRACKED_CLIENTS) {
      const oldest = hits.keys().next();
      if (oldest.done) break;
      hits.delete(oldest.value);
    }
  }

  return false;
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NOT_CONFIGURED;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            // 2048 gives the model room to finish complete answers without
            // truncating mid-sentence, without runaway responses.
            maxOutputTokens: 2048,
          },
        }),
      },
    );
  } catch (err) {
    console.error("Gemini fetch failed", err);
    return GENERIC_ERROR;
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Gemini error", res.status, detail);
    return GENERIC_ERROR;
  }

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    return BLOCKED;
  }

  const cand = data.candidates?.[0];
  const finishReason = cand?.finishReason;
  const text = (cand?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    if (finishReason === "SAFETY" || finishReason === "BLOCKLIST") return BLOCKED;
    return "Sorry — I didn't catch that. Could you rephrase your question?";
  }

  // If the model hit the token cap we still return what we have, but nudge the
  // user to ask a narrower follow-up instead of leaving them staring at a cut-off answer.
  if (finishReason === "MAX_TOKENS") {
    return `${text}\n\n(That's as much as fits in one reply — ask me a narrower follow-up and I'll go deeper.)`;
  }

  return text;
}

export const askNutrition = createServerFn({ method: "POST" })
  .validator((data: { messages: ChatMessage[] }) => {
    if (!Array.isArray(data?.messages)) throw new Error("messages must be an array");
    return {
      messages: data.messages
        .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content.slice(0, 2000),
        })),
    };
  })
  .handler(async ({ data }) => {
    if (data.messages.length === 0) {
      return { reply: "Ask me a question about nutrition or balanced eating and I'll help." };
    }

    // Unknown IP falls into one shared bucket rather than bypassing the limit.
    const clientKey = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (overRateLimit(clientKey)) return { reply: RATE_LIMITED };

    const reply = await callGemini(data.messages);
    return { reply };
  });
