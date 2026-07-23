import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Lishe works" },
      { name: "description", content: "Three steps: enter your budget, we check 656 foods against real prices, you get meals that fit." },
      { property: "og:title", content: "How Lishe works" },
      { property: "og:description", content: "Three steps to eat well on the money you have." },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  { n: "1", title: "Tell us your budget.", body: "Type how much you have — for a meal or a full day. No signup, no account." },
  { n: "2", title: "We check 656 foods against real prices and Kenyan nutrition data.", body: "Kenya Food Composition Tables 2018 for nutrition. WFP price database seeded from national data." },
  { n: "3", title: "You get meals that fit, ranked by nutrition per shilling.", body: "Real Kenyan portions. You can swap, exclude, and share." },
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">How it works</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">Three steps. No accounts. No paywall.</p>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="border border-hairline bg-surface p-8">
            <p className="num text-6xl font-semibold text-leaf">{s.n}</p>
            <h2 className="mt-6 font-display text-xl font-bold">{s.title}</h2>
            <p className="mt-3 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-24 border-t border-hairline pt-14">
        <h2 className="font-display text-3xl font-bold">What we don't know</h2>
        <div className="mt-6 max-w-[680px] space-y-4 text-ink">
          <p>Prices vary by neighbourhood. A bunch of managu is not the same price in Kibera as it is in Karen.</p>
          <p>We seed from national data. When you tell us your prices on the calibration page, results get more accurate for your area.</p>
          <p>Nutrition data is per-100g reference values. Actual portions vary by cook and by cook day. We use realistic Kenyan portion sizes, not lab weights.</p>
        </div>
        <Link to="/plates" className="mt-10 inline-block rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">
          Start
        </Link>
      </section>
    </div>
  );
}
