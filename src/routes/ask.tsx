import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { askNutrition, type ChatMessage } from "@/data/ai";
import { Markdown } from "@/components/site/Markdown";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask Lishe — nutrition helper" },
      {
        name: "description",
        content:
          "Ask questions about nutrition and balanced eating on a Kenyan budget. General nutrition information, not medical advice.",
      },
      { property: "og:title", content: "Ask Lishe — nutrition helper" },
      {
        property: "og:description",
        content: "A friendly AI helper for nutrition and balanced diet questions.",
      },
    ],
  }),
  component: Ask,
});

const SUGGESTIONS = [
  "What makes a balanced plate?",
  "Cheap sources of protein in Kenya?",
  "How much sugar is too much in a day?",
  "What should I eat more of on a tight budget?",
];

const STORAGE_KEY = "lishe.ask.messages.v1";
const MAX_STORED_MESSAGES = 200;

function loadStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          "role" in m &&
          "content" in m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
}

function saveStoredMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    /* localStorage disabled or full — carry on in memory */
  }
}

function Ask() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore any previous conversation on first client render.
  useEffect(() => {
    setMessages(loadStoredMessages());
    setHydrated(true);
  }, []);

  // Persist on every change, but only after we've read the initial value —
  // otherwise the empty initial state would clobber the stored history.
  useEffect(() => {
    if (!hydrated) return;
    saveStoredMessages(messages);
  }, [messages, hydrated]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await askNutrition({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry — something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
      );
    }
  }

  function clearConversation() {
    if (loading) return;
    if (messages.length === 0) return;
    const ok = window.confirm(
      "Clear this conversation from your browser? You can't recover it after this.",
    );
    if (!ok) return;
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[760px] flex-col px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-leaf">Nutrition helper</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Ask Lishe</h1>
          <p className="mt-3 max-w-[560px] text-muted">
            Questions about eating well and balanced diet on a Kenyan budget. General nutrition
            information — not medical advice.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="flex shrink-0 items-center gap-1.5 rounded border border-hairline bg-surface px-3 py-2 text-xs text-muted hover:border-brick hover:text-brick"
            title="Clear this conversation from your browser"
            type="button"
          >
            <Trash2 size={14} />
            Clear chat
          </button>
        )}
      </div>

      {hydrated && messages.length > 0 && (
        <p className="mt-4 text-[11px] text-muted">
          This conversation is saved only in your browser, so you can come back to it later on this
          device — it's never stored on our servers. Messages you send are processed by Google's
          Gemini API to generate each reply.
        </p>
      )}

      <div ref={scrollRef} className="mt-6 flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div>
            <p className="mb-3 text-sm text-muted">Try one of these to get started:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded border border-hairline bg-surface px-3 py-2 text-left text-sm hover:border-ink"
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start gap-1"}
            >
              <div
                className={`max-w-[85%] rounded px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-ink text-surface"
                    : "border border-hairline bg-surface text-ink"
                }`}
              >
                {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
              </div>
              {m.role === "assistant" && (
                <p className="max-w-[85%] px-1 text-[11px] leading-snug text-muted">
                  General nutrition information — not medical advice. For a condition, pregnancy, or
                  a sick child, check with a doctor or KNDI-registered nutritionist.
                </p>
              )}
            </div>
          ))
        )}
        {loading && <div className="text-sm text-muted">Thinking…</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about nutrition or balanced diet…"
          className="flex-1 rounded border border-hairline bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded bg-leaf px-6 py-3 text-sm font-semibold text-surface hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
      <p className="mt-3 text-xs text-muted">
        For medical concerns, pregnancy, or a sick child, see a doctor or a KNDI-registered
        nutritionist.
      </p>
    </div>
  );
}
