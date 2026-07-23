import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Lishe" },
      { name: "description", content: "How Lishe scores foods and builds plates." },
      { property: "og:title", content: "Methodology — Lishe" },
      { property: "og:description", content: "Data sources, scoring, and limitations." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[680px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Methodology</h1>
      <div className="mt-8 space-y-5 text-ink">
        <p><strong>Nutrition data.</strong> Kenya Food Composition Tables 2018 (FAO / Government of Kenya). Per-100g reference values for 656 foods.</p>
        <p><strong>Prices.</strong> Seeded from the WFP Global Food Prices Database and national retail averages. Updated by user calibration.</p>
        <p><strong>Plate scoring.</strong> Each candidate plate is scored on protein per shilling, fibre per shilling, and coverage against meal-level nutrient targets (energy, protein, fibre, vitamins).</p>
        <p><strong>Limitations.</strong> Portion sizes are realistic but reference. Actual home-cooked portions vary. Nutrients depend on cultivar and preparation.</p>
      </div>
    </div>
  ),
});
