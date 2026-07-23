import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { askNutrition, type ChatMessage } from "@/data/ai";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask Lishe — nutrition helper" },
      { name: "description", content: "Ask questions about nutrition and balanced eating on a Kenyan budget." },
      { property: "og:title", content: "Ask Lishe — nutrition helper" },
      { property: "og:description", content: "A friendly AI helper for nutrition and balanced diet questions." },
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

function Ask() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      setMessages([...next, { role: "assistant", content: "Sorry — something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[760px] flex-col px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-leaf">Nutrition helper</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Ask Lishe</h1>
        <p className="mt-3 max-w-[560px] text-muted">
          Questions about eating well and balanced diet on a Kenyan budget. General nutrition
          information — not medical advice.
        </p>
      </div>

      <div ref={scrollRef} className="mt-8 flex-1 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded border border-hairline bg-surface px-3 py-2 text-left text-sm hover:border-ink"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col items-start gap-1"}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-ink text-surface"
                    : "border border-hairline bg-surface text-ink"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && (
                <p className="max-w-[85%] px-1 text-[11px] leading-snug text-muted">
                  General nutrition information — not medical advice. For a condition, pregnancy, or a sick child, check with a doctor or KNDI-registered nutritionist.
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
        For medical concerns, pregnancy, or a sick child, see a doctor or a KNDI-registered nutritionist.
      </p>
    </div>
  );
}
