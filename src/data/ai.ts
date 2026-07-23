import { createServerFn } from "@tanstack/react-start";

// Runs only on the server, so GEMINI_API_KEY is never shipped to the browser.
export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const SYSTEM_PROMPT = `You are "Lishe Helper", a friendly nutrition educator for a Kenyan audience.

Your job: help ordinary Kenyans understand nutrition and how to eat a balanced diet on a real budget, using foods they can actually find — ugali, githeri, sukuma wiki, terere, managu, omena, ndengu, beans, sweet potato, fruits, eggs, milk, etc.

Rules:
- Only answer questions about nutrition, food, and healthy/balanced eating. If asked about something else, politely say that's outside what you can help with and steer back to nutrition.
- Be practical and specific to Kenya: affordable local foods, market realities, common meals.
- Keep answers short and clear. Use plain language. Prefer a few bullet points over long paragraphs.
- Ground advice in mainstream guidance (WHO healthy diet, Kenyan food-based dietary guidelines): variety, plenty of vegetables and fruit, whole grains, limit added sugar, salt under ~5 g/day, healthy fats.
- You give general nutrition information, NOT medical advice. If someone describes a medical condition, pregnancy, a child's illness, or asks about medication/supplements, tell them to see a doctor or a KNDI-registered nutritionist.
- Never invent specific prices or precise nutrient numbers you are not sure about. If you don't know, say so.`;

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return "The nutrition helper isn't configured yet — set GEMINI_API_KEY in your environment to enable it.";
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Gemini error", res.status, detail);
    return "Sorry — the helper couldn't answer just now. Please try again in a moment.";
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  return text.trim() || "Sorry — I didn't catch that. Could you rephrase your question?";
}

export const askNutrition = createServerFn({ method: "POST" })
  .validator((data: { messages: ChatMessage[] }) => {
    if (!Array.isArray(data?.messages)) throw new Error("messages must be an array");
    return {
      messages: data.messages
        .filter((m) => m && typeof m.content === "string")
        .slice(-12)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content.slice(0, 2000),
        })),
    };
  })
  .handler(async ({ data }) => {
    const reply = await callGemini(data.messages);
    return { reply };
  });
