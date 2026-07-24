import { Fragment, type ReactNode } from "react";

// Renders the small markdown subset Gemini replies use — bold, italic,
// inline code, headings, bullet and numbered lists — as styled elements
// instead of raw asterisks. Builds React nodes directly, so no HTML
// injection is possible.

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g;

function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (
      part.length > 2 &&
      ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_")))
    ) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-hairline px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const BULLET = /^(\s*)[-*•]\s+(.*)$/;
const NUMBERED = /^(\s*)\d+[.)]\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

type ListItem = { text: string; nested: boolean };
type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: ListItem[] }
  | { kind: "ol"; items: ListItem[] };

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const h = HEADING.exec(line.trim());
    if (h) {
      blocks.push({ kind: "h", text: h[1] });
      continue;
    }

    const b = BULLET.exec(line);
    const n = b ? null : NUMBERED.exec(line);
    if (b || n) {
      const m = (b ?? n)!;
      const kind = b ? "ul" : "ol";
      const item = { text: m[2], nested: m[1].length >= 2 };
      const last = blocks[blocks.length - 1];
      if (last && last.kind === kind) {
        last.items.push(item);
      } else {
        blocks.push({ kind, items: [item] });
      }
      continue;
    }

    // A whole line in bold acts as a heading.
    const bold = /^\*\*([^*]+)\*\*:?$/.exec(line.trim());
    if (bold) {
      blocks.push({ kind: "h", text: bold[1] });
      continue;
    }

    const last = blocks[blocks.length - 1];
    if (last && last.kind === "p") {
      last.text += " " + line.trim();
    } else {
      blocks.push({ kind: "p", text: line.trim() });
    }
  }
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === "h") {
          return (
            <p key={i} className="pt-1 font-semibold text-ink first:pt-0">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.kind === "ul" || block.kind === "ol") {
          const List = block.kind === "ul" ? "ul" : "ol";
          return (
            <List
              key={i}
              className={`space-y-1 pl-5 ${block.kind === "ul" ? "list-disc" : "list-decimal"}`}
            >
              {block.items.map((item, j) => (
                <li key={j} className={item.nested ? "ml-4 list-[circle]" : undefined}>
                  {renderInline(item.text)}
                </li>
              ))}
            </List>
          );
        }
        return <p key={i}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
