import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/pregnancy")({
  head: () => ({
    meta: [
      { title: "Pregnancy & under-5 — Lishe" },
      { name: "description", content: "Iron, folate, vitamin A, calcium — the Kenyan foods that deliver." },
      { property: "og:title", content: "Pregnancy & under-5 — Lishe" },
      { property: "og:description", content: "Managu, omena, orange-fleshed sweet potato — what actually delivers." },
    ],
  }),
  component: Pregnancy,
});

const ROWS = [
  { food: "Managu (raw, 100g)", nutrient: "Iron", value: "8.6 mg" },
  { food: "Terere, boiled (100g)", nutrient: "Iron", value: "5.3 mg" },
  { food: "Omena, dried (100g)", nutrient: "Calcium", value: "2,790 mg" },
  { food: "Sweet potato, orange (180g)", nutrient: "Vitamin A", value: "1,710 µg" },
  { food: "Sukuma wiki (150g)", nutrient: "Calcium", value: "546 mg" },
];

function Pregnancy() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Pregnancy & under-5</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">Iron, folate, vitamin A, calcium. Highlight the foods that genuinely deliver.</p>

      <div className="mt-10 max-w-[720px] border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-bg">
            <tr><th className="px-4 py-3 text-left font-semibold">Food</th><th className="px-4 py-3 text-left font-semibold">Nutrient</th><th className="px-4 py-3 text-right font-semibold">Amount</th></tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.food} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">{r.food}</td>
                <td className="px-4 py-3 text-leaf font-semibold">{r.nutrient}</td>
                <td className="num px-4 py-3 text-right">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 max-w-[720px] border border-hairline bg-bg p-5">
        <p className="text-sm"><strong>Caution:</strong> Liver is extremely high in vitamin A and should be limited in pregnancy — no more than one small portion per week.</p>
      </div>

      <div className="mt-6 max-w-[720px] border border-brick bg-brick-soft p-6 text-brick">
        <p className="text-base font-semibold">This is nutrition information, not medical advice.</p>
        <p className="mt-2 text-sm">Speak to your doctor or a KNDI-registered nutritionist before changing your diet.</p>
      </div>

      <Link to="/plates" className="mt-10 inline-block rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">
        Open Plates
      </Link>
    </div>
  );
}
