import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Lishe" },
      { name: "description", content: "What Lishe collects and what it doesn't." },
      { property: "og:title", content: "Privacy — Lishe" },
      { property: "og:description", content: "No accounts. No storage. Nothing to leak." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[680px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Privacy</h1>
      <div className="mt-8 space-y-5 text-ink">
        <p>Lishe requires no account. We do not store your budget, your food preferences, or your prices.</p>
        <p>We collect anonymous, aggregate usage counts to know which features are used. Nothing that identifies a person or a household.</p>
      </div>
    </div>
  ),
});
