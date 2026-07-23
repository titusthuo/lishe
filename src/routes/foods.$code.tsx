import { createFileRoute, Link } from "@tanstack/react-router";
import { findFood, priceFor } from "@/data/foods";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/foods/$code")({
  head: ({ params }) => {
    const f = findFood(params.code);
    const title = f ? `${f.name} — Lishe` : "Food — Lishe";
    return {
      meta: [
        { title },
        { name: "description", content: f ? `Nutrition and price for ${f.name}.` : "Food detail." },
        { property: "og:title", content: title },
        { property: "og:description", content: f ? `Nutrition and price for ${f.name}.` : "Food detail." },
      ],
    };
  },
  component: FoodDetail,
});

function FoodDetail() {
  const { code } = Route.useParams();
  const { region, userPrices } = useStore();
  const f = findFood(code);
  if (!f) return (
    <div className="mx-auto max-w-[680px] px-6 py-20">
      <h1 className="font-display text-3xl font-bold">Food not found</h1>
      <Link to="/foods" className="mt-6 inline-block text-leaf underline">Back to foods</Link>
    </div>
  );

  const price = priceFor(f, region, userPrices);
  const priceLabel = price.source === "mkulima"
    ? `Mkulima Bora retail${price.asOf ? `, as of ${price.asOf}` : ""}`
    : price.source === "wfp"
      ? `WFP retail${price.asOf ? `, as of ${price.asOf}` : ""}`
      : price.source === "community"
        ? "Community-entered price"
        : "Estimate (not WFP-tracked)";
  const rows: Array<[string, string]> = [
    ["Calories", `${f.kcal ?? 0} kcal`],
    ["Protein", `${(f.protein ?? 0).toFixed(1)} g`],
    ["Fibre", `${(f.fibre ?? 0).toFixed(1)} g`],
    ["Carbohydrate", `${(f.carbs ?? 0).toFixed(1)} g`],
    ["Iron", `${(f.iron ?? 0).toFixed(1)} mg`],
    ["Calcium", `${f.calcium} mg`],
    ["Vitamin A", `${f.vitA} µg`],
    ["Vitamin C", `${f.vitC} mg`],
    ["Sodium", `${f.sodium} mg`],
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
      <Link to="/foods" className="text-sm text-muted hover:text-ink">← All foods</Link>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">{f.name}</h1>
      <p className="mt-2 text-muted">{f.group}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted">Nutrients per 100 g</h2>
          <table className="mt-3 w-full border border-hairline bg-surface text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2.5 text-muted">{k}</td>
                  <td className="num px-4 py-2.5 text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted">Portion & price</h2>
          <div className="mt-3 border border-hairline bg-surface p-6">
            <p className="font-display text-lg font-bold">{f.portionLabel}</p>
            <p className="mt-1 num text-sm text-muted">{f.portionGrams} g</p>
            <p className="mt-1 text-xs text-muted">Typical serving — an assumption for illustration, not a measured standard.</p>
            <p className="mt-4 num text-3xl font-semibold text-enamel">KSh {price.kes}</p>
            <p className="mt-3 text-xs text-muted">{priceLabel} · price for {region}.</p>
          </div>

          <Link to="/ask" className="mt-8 inline-block text-sm font-semibold text-leaf underline">
            Ask the helper about this food →
          </Link>
        </div>
      </div>
    </div>
  );
}
