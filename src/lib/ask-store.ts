import type { ChatMessage } from "@/data/ai";

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AskState {
  activeId: string | null;
  conversations: Conversation[];
}

const STORAGE_KEY = "lishe.ask.conversations.v1";
// The single-thread key this store replaced. Read once so anyone returning with
// an existing conversation keeps it, then removed.
const LEGACY_KEY = "lishe.ask.messages.v1";

const MAX_MESSAGES_PER_CONVERSATION = 200;
const MAX_CONVERSATIONS = 50;
const MAX_TITLE_LENGTH = 48;

export const NEW_CONVERSATION_TITLE = "New chat";

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createConversation(): Conversation {
  return { id: newId(), title: NEW_CONVERSATION_TITLE, updatedAt: Date.now(), messages: [] };
}

// Conversations are named after the question that started them, which is what a
// visitor scans the list for.
export function titleFor(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return NEW_CONVERSATION_TITLE;
  const flat = first.content.replace(/\s+/g, " ").trim();
  if (!flat) return NEW_CONVERSATION_TITLE;
  if (flat.length <= MAX_TITLE_LENGTH) return flat;
  return `${flat.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    !!value &&
    typeof value === "object" &&
    "role" in value &&
    "content" in value &&
    ((value as ChatMessage).role === "user" || (value as ChatMessage).role === "assistant") &&
    typeof (value as ChatMessage).content === "string"
  );
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isChatMessage)
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-MAX_MESSAGES_PER_CONVERSATION);
}

function parseConversation(value: unknown): Conversation | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Conversation>;
  if (typeof raw.id !== "string" || !raw.id) return null;

  const messages = parseMessages(raw.messages);
  return {
    id: raw.id,
    title: typeof raw.title === "string" && raw.title ? raw.title : titleFor(messages),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    messages,
  };
}

function migrateLegacy(): Conversation[] {
  const raw = window.localStorage.getItem(LEGACY_KEY);
  if (!raw) return [];

  let messages: ChatMessage[] = [];
  try {
    messages = parseMessages(JSON.parse(raw));
  } catch {
    messages = [];
  }

  window.localStorage.removeItem(LEGACY_KEY);
  if (messages.length === 0) return [];

  return [{ id: newId(), title: titleFor(messages), updatedAt: Date.now(), messages }];
}

export function loadState(): AskState {
  if (typeof window === "undefined") return { activeId: null, conversations: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const migrated = migrateLegacy();
      return { activeId: migrated[0]?.id ?? null, conversations: migrated };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { activeId: null, conversations: [] };

    const state = parsed as Partial<AskState>;
    const conversations = Array.isArray(state.conversations)
      ? state.conversations
          .map(parseConversation)
          .filter((c): c is Conversation => c !== null)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, MAX_CONVERSATIONS)
      : [];

    const activeId =
      typeof state.activeId === "string" && conversations.some((c) => c.id === state.activeId)
        ? state.activeId
        : (conversations[0]?.id ?? null);

    return { activeId, conversations };
  } catch {
    return { activeId: null, conversations: [] };
  }
}

export function saveState(state: AskState): void {
  if (typeof window === "undefined") return;

  // An untouched "New chat" is a UI placeholder, not history — keep it out of
  // the stored list unless it's the one currently open.
  const conversations = state.conversations
    .filter((c) => c.messages.length > 0 || c.id === state.activeId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONVERSATIONS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, conversations }));
  } catch {
    /* localStorage disabled or full — carry on in memory */
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
