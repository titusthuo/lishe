import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Lishe" },
      { name: "description", content: "Terms of use for Lishe." },
      { property: "og:title", content: "Terms — Lishe" },
      { property: "og:description", content: "Nutrition information, not medical advice." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[680px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Terms</h1>
      <div className="mt-8 space-y-5 text-ink">
        <p>Lishe provides nutrition information, not medical advice. Speak to a doctor or KNDI-registered nutritionist before changing your diet, especially if you are pregnant or managing a chronic condition.</p>
        <p>Prices and nutrient values are references, not guarantees.</p>
      </div>
    </div>
  ),
});
