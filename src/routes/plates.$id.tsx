import { createFileRoute, Link } from "@tanstack/react-router";
import { findPlate, priceFor, plateCost } from "@/data/foods";
import { useStore } from "@/data/store";
import { REGION_PRICE_DATE } from "@/data/generated";
import { X } from "lucide-react";

export const Route = createFileRoute("/plates/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Plate — Lishe` },
      { name: "description", content: `Nutrient breakdown for plate ${params.id}.` },
      { property: "og:title", content: "Plate — Lishe" },
      { property: "og:description", content: "Nutrient breakdown and ingredient swaps." },
    ],
  }),
  component: PlateDetail,
});

function PlateDetail() {
  const { id } = Route.useParams();
  const { region, userPrices } = useStore();
  const plate = findPlate(id);

  if (!plate) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-20">
        <h1 className="font-display text-3xl font-bold">Plate not found</h1>
        <Link to="/plates" className="mt-6 inline-block text-leaf underline">Back to plates</Link>
      </div>
    );
  }

  const { kes: total, hasEstimate } = plateCost(plate, region, userPrices);
  const priceNote = region !== "Kenya" && REGION_PRICE_DATE[region]
    ? `${region} · WFP retail, as of ${REGION_PRICE_DATE[region]}`
    : "national median";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/20">
      <Link to="/plates" className="flex-1" aria-label="Close" />
      <aside className="flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-hairline bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h1 className="font-display text-xl font-bold">Plate detail</h1>
          <Link to="/plates" aria-label="Close" className="rounded p-1 hover:bg-bg"><X size={20} /></Link>
        </div>

        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-widest text-muted">Ingredients</p>
          <ul className="mt-3 border border-hairline">
            {plate.items.map(i => {
              const p = priceFor(i.food, region, userPrices);
              return (
                <li key={i.food.code} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-hairline px-4 py-3 last:border-0 text-sm">
                  <div>
                    <p className="font-semibold">{i.food.name}</p>
                    <p className="text-xs text-muted">{i.food.portionLabel} · <span className="num">{i.food.portionGrams * i.qty}g</span>{p.source === "estimate" ? " · est." : ""}</p>
                  </div>
                  <span className="num text-right text-sm text-muted">KSh {p.kes * i.qty}</span>
                </li>
              );
            })}
            <li className="grid grid-cols-[1fr_auto] items-center gap-4 border-t-2 border-ink px-4 py-3 text-sm">
              <p className="font-semibold">Total{hasEstimate ? <span className="ml-1 font-normal text-muted">· incl. estimate</span> : ""}</p>
              <span className="num text-right font-semibold text-enamel">KSh {total}</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted">Prices: {priceNote}.</p>

          <p className="mt-8 text-xs uppercase tracking-widest text-muted">Nutrients</p>
          <table className="mt-3 w-full border border-hairline text-sm">
            <tbody>
              {[
                ["Calories", plate.totals.kcal.toFixed(0), "kcal"],
                ["Protein", plate.totals.protein.toFixed(1), "g"],
                ["Fibre", plate.totals.fibre.toFixed(1), "g"],
                ["Iron", plate.totals.iron.toFixed(1), "mg"],
                ["Calcium", plate.totals.calcium.toFixed(0), "mg"],
                ["Vitamin C", plate.totals.vitC.toFixed(0), "mg"],
              ].map(([k, v, u]) => (
                <tr key={k} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2.5 text-muted">{k}</td>
                  <td className="num px-4 py-2.5 text-right"><span>{v}</span> <span className="text-xs text-muted">{u}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-6 border-t border-hairline pt-4 text-xs text-muted">Nutrients: Kenya Food Composition Tables 2018. Prices: WFP Global Food Prices Database, retail.</p>
        </div>
      </aside>
    </div>
  );
}
