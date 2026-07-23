import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/counties")({
  head: () => ({
    meta: [
      { title: "For counties & NGOs — Lishe" },
      { name: "description", content: "12 ASAL counties, 65 markets, 20 years of price history and seasonality." },
      { property: "og:title", content: "For counties & NGOs — Lishe" },
      { property: "og:description", content: "Data exports and programme partnerships." },
    ],
  }),
  component: Counties,
});

const COUNTIES = ["Turkana", "Marsabit", "Mandera", "Wajir", "Garissa", "Isiolo", "Samburu", "Baringo", "West Pokot", "Tana River", "Kilifi", "Kwale"];

function Counties() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Counties & NGOs</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">
        Live 2026 retail data across <span className="num text-ink">12 ASAL counties</span>, <span className="num text-ink">65 markets</span>, plus <span className="num text-ink">20 years</span> of history and seasonality.
      </p>

      <div className="mt-14 border border-hairline bg-surface p-8">
        <h2 className="font-display text-lg font-bold">Counties with live coverage</h2>
        <ul className="mt-6 grid grid-cols-2 gap-y-2 text-sm md:grid-cols-4">
          {COUNTIES.map((c) => <li key={c} className="text-ink">{c}</li>)}
        </ul>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-hairline bg-surface p-8">
          <h3 className="font-display text-xl font-bold">Data export</h3>
          <p className="mt-3 text-sm text-muted">CSV or API. Prices per commodity, per market, weekly since 2005.</p>
          <a href="mailto:data@lishe.co.ke" className="mt-6 inline-block text-sm font-semibold text-leaf underline">Request access →</a>
        </div>
        <div className="border border-hairline bg-surface p-8">
          <h3 className="font-display text-xl font-bold">Programme partnership</h3>
          <p className="mt-3 text-sm text-muted">Nutrition programmes co-designed with county health teams. Baseline, targeting, and monitoring.</p>
          <a href="mailto:partners@lishe.co.ke" className="mt-6 inline-block text-sm font-semibold text-leaf underline">Get in touch →</a>
        </div>
      </div>
    </div>
  );
}
