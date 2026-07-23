import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lishe" },
      { name: "description", content: "Who built Lishe and why." },
      { property: "og:title", content: "About — Lishe" },
      { property: "og:description", content: "The problem, in plain terms, and honest limitations." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-[680px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">About</h1>
      <div className="mt-8 space-y-6 text-lg leading-relaxed">
        <p>Most Kenyans cannot afford the diet the guidelines recommend, and most nutrition tools are built for Western supermarkets. Lishe is a small, honest attempt to teach the basics of balanced eating using foods people actually eat here — ugali, githeri, sukuma wiki, terere, omena, ndengu.</p>
        <p>There are two things to do: <strong>learn</strong> what a balanced plate looks like and how often to eat each food group, and <strong>ask</strong> a nutrition helper your own questions. Both are grounded in mainstream guidance — WHO healthy-diet advice and Kenya's food-based dietary guidelines.</p>
        <p>The food nutrition figures come from the Kenya Food Composition Tables 2018 (FAO / Government of Kenya). Where a number is an assumption — like a typical serving size — we say so on the page.</p>
        <p className="text-muted">Lishe gives general nutrition information, not medical advice. For a condition, pregnancy, or a sick child, please see a doctor or a KNDI-registered nutritionist.</p>
      </div>
    </div>
  );
}
