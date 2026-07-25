import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { askNutrition, type ChatMessage } from "@/data/ai";
import { Markdown } from "@/components/site/Markdown";
import {
  createConversation,
  loadState,
  saveState,
  titleFor,
  type Conversation,
} from "@/lib/ask-store";

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

function relativeTime(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function Ask() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversations.find((c) => c.id === activeId)?.messages ?? [];

  // Restore saved conversations on first client render. There is always exactly
  // one active conversation, so the composer never has nowhere to write.
  useEffect(() => {
    const state = loadState();
    if (state.conversations.length === 0) {
      const fresh = createConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    } else {
      setConversations(state.conversations);
      setActiveId(state.activeId ?? state.conversations[0].id);
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after we've read the initial value —
  // otherwise the empty initial state would clobber the stored history.
  useEffect(() => {
    if (!hydrated) return;
    saveState({ activeId, conversations });
  }, [hydrated, activeId, conversations]);

  function scrollToLatest() {
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
    );
  }

  // Targets a captured id rather than the active one, so a reply still lands in
  // the conversation that asked for it if the visitor switches while it's in flight.
  function writeMessages(id: string, next: ChatMessage[]) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, messages: next, title: titleFor(next), updatedAt: Date.now() } : c,
      ),
    );
  }

  async function send(text: string) {
    const question = text.trim();
    const id = activeId;
    if (!question || loading || !id) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    writeMessages(id, next);
    setInput("");
    setLoading(true);
    scrollToLatest();

    try {
      const { reply } = await askNutrition({ data: { messages: next } });
      writeMessages(id, [...next, { role: "assistant", content: reply }]);
    } catch {
      writeMessages(id, [
        ...next,
        { role: "assistant", content: "Sorry — something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollToLatest();
    }
  }

  function newChat() {
    if (loading) return;
    setHistoryOpen(false);
    const empty = conversations.find((c) => c.messages.length === 0);
    if (empty) {
      setActiveId(empty.id);
      return;
    }
    const fresh = createConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }

  function openChat(id: string) {
    if (loading) return;
    setActiveId(id);
    setHistoryOpen(false);
    scrollToLatest();
  }

  function deleteChat(id: string) {
    if (loading) return;
    const target = conversations.find((c) => c.id === id);
    if (
      target &&
      target.messages.length > 0 &&
      !window.confirm(`Delete "${target.title}"? You can't recover it after this.`)
    ) {
      return;
    }

    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fresh = createConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
      return;
    }
    setConversations(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  }

  const ordered = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const saved = ordered.filter((c) => c.messages.length > 0);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1100px] gap-8 px-4 py-10 sm:px-6">
      {historyOpen && (
        <button
          type="button"
          aria-label="Close chats"
          onClick={() => setHistoryOpen(false)}
          className="fixed inset-0 z-10 cursor-default bg-ink/25 md:hidden"
        />
      )}
      <aside
        className={`${historyOpen ? "flex" : "hidden"} absolute inset-x-4 top-20 z-20 max-h-[70vh] flex-col rounded border border-hairline bg-surface p-3 shadow-lg md:static md:z-auto md:flex md:max-h-none md:w-60 md:shrink-0 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        <button
          onClick={newChat}
          type="button"
          className="flex items-center justify-center gap-2 rounded bg-leaf px-4 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading}
        >
          <Plus size={15} />
          New chat
        </button>

        <p className="mt-6 px-1 text-xs uppercase tracking-widest text-muted">Past chats</p>

        <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
          {!hydrated || saved.length === 0 ? (
            <p className="px-1 text-xs leading-relaxed text-muted">
              Your past chats appear here, saved in this browser.
            </p>
          ) : (
            saved.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-1 rounded border px-2 py-2 transition-colors ${
                  c.id === activeId
                    ? "border-hairline bg-leaf-soft"
                    : "border-transparent hover:border-hairline hover:bg-surface"
                }`}
              >
                <button
                  onClick={() => openChat(c.id)}
                  type="button"
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                  aria-current={c.id === activeId ? "true" : undefined}
                >
                  <MessageSquare size={14} className="mt-0.5 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{c.title}</span>
                    <span className="block text-[11px] text-muted">
                      {relativeTime(c.updatedAt)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => deleteChat(c.id)}
                  type="button"
                  title="Delete this chat"
                  aria-label={`Delete ${c.title}`}
                  className="shrink-0 rounded p-1 text-muted opacity-0 transition-opacity hover:text-brick focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-leaf">Nutrition helper</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Ask Lishe</h1>
            <p className="mt-3 max-w-[560px] text-muted">
              Questions about eating well and balanced diet on a Kenyan budget. General nutrition
              information — not medical advice.
            </p>
          </div>
          <button
            onClick={() => setHistoryOpen((open) => !open)}
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded border border-hairline bg-surface px-3 py-2 text-xs text-muted hover:border-ink hover:text-ink md:hidden"
            aria-expanded={historyOpen}
          >
            <MessageSquare size={14} />
            {hydrated && saved.length > 0 ? `Chats (${saved.length})` : "Chats"}
          </button>
        </div>

        {hydrated && messages.length > 0 && (
          <p className="mt-4 text-[11px] text-muted">
            Your chats are saved only in this browser, so you can come back to them later on this
            device — they're never stored on our servers. Messages you send are processed by
            Google's Gemini API to generate each reply.
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
                className={
                  m.role === "user" ? "flex justify-end" : "flex flex-col items-start gap-1"
                }
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
                    General nutrition information — not medical advice. For a condition, pregnancy,
                    or a sick child, check with a doctor or KNDI-registered nutritionist.
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
    </div>
  );
}
