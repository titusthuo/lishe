import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FOODS, nutrientPerKES, priceFor, type FoodGroup } from "@/data/foods";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/foods/")({
  head: () => ({
    meta: [
      { title: "Foods explorer — Lishe" },
      { name: "description", content: "Every Kenyan food with nutrients, prices, and nutrient-per-shilling scores." },
      { property: "og:title", content: "Foods explorer — Lishe" },
      { property: "og:description", content: "Kenyan foods, sortable, filterable, with price-adjusted scores." },
    ],
  }),
  component: FoodsExplorer,
});

const GROUPS: FoodGroup[] = ["Cereals", "Legumes", "Vegetables", "Indigenous vegetables", "Fruits", "Meat", "Fish", "Dairy", "Mixed dishes"];

type SortKey = "name" | "group" | "priceKES" | "kcal" | "protein" | "fibre" | "iron" | "calcium" | "vitA" | "vitC" | "proteinKES" | "ironKES" | "fibreKES";

function FoodsExplorer() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<FoodGroup | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("proteinKES");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { region, userPrices } = useStore();

  const rows = useMemo(() => {
    const enriched = FOODS.map(f => {
      const k = f.portionGrams / 100; // scale per-100 g nutrients to the portion
      const price = priceFor(f, region, userPrices);
      return {
        ...f,
        kcal: (f.kcal ?? 0) * k,
        protein: (f.protein ?? 0) * k,
        fibre: (f.fibre ?? 0) * k,
        iron: (f.iron ?? 0) * k,
        calcium: (f.calcium ?? 0) * k,
        vitA: (f.vitA ?? 0) * k,
        vitC: (f.vitC ?? 0) * k,
        priceKES: price.kes,
        priceSource: price.source,
        proteinKES: nutrientPerKES(f, "protein", region, userPrices),
        ironKES: nutrientPerKES(f, "iron", region, userPrices),
        fibreKES: nutrientPerKES(f, "fibre", region, userPrices),
      };
    });
    const filtered = enriched.filter(f => {
      if (group && f.group !== group) return false;
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [q, group, sortKey, sortDir, region, userPrices]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  }

  const COLS: Array<{ key: SortKey; label: string; num?: boolean }> = [
    { key: "name", label: "Food" },
    { key: "group", label: "Group" },
    { key: "priceKES", label: "Price KSh", num: true },
    { key: "kcal", label: "Kcal", num: true },
    { key: "protein", label: "Protein g", num: true },
    { key: "fibre", label: "Fibre g", num: true },
    { key: "iron", label: "Iron mg", num: true },
    { key: "calcium", label: "Calcium mg", num: true },
    { key: "vitA", label: "Vit A µg", num: true },
    { key: "vitC", label: "Vit C mg", num: true },
    { key: "proteinKES", label: "Protein/KSh", num: true },
    { key: "ironKES", label: "Iron/KSh", num: true },
    { key: "fibreKES", label: "Fibre/KSh", num: true },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Foods</h1>
      <p className="mt-3 max-w-[680px] text-muted">Kenyan foods with nutrients and price for a typical portion, plus price-adjusted scores.</p>

      <div className="mt-6 flex flex-col gap-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search food…"
          className="w-full max-w-md rounded border border-hairline bg-surface px-4 py-2.5 text-sm" />
        <div className="flex flex-wrap gap-2 text-xs">
          <button onClick={() => setGroup(null)}
            className={`rounded border px-3 py-1.5 ${group === null ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"}`}>All</button>
          {GROUPS.map(g => (
            <button key={g} onClick={() => setGroup(g)}
              className={`rounded border px-3 py-1.5 ${group === g ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"}`}>{g}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-hairline bg-bg">
            <tr>
              {COLS.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}
                  className={`cursor-pointer whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider ${c.num ? "text-right" : "text-left"} ${sortKey === c.key ? "text-leaf" : "text-ink"}`}>
                  {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(f => (
              <tr key={f.code} className="border-b border-hairline last:border-0 hover:bg-bg">
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link to="/foods/$code" params={{ code: f.code }} className="font-semibold hover:text-leaf">{f.name}</Link>
                  <span className="block text-xs text-muted">{f.portionLabel}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{f.group}</td>
                <td className="num px-3 py-2.5 text-right whitespace-nowrap">
                  {f.priceKES}
                  {f.priceSource === "estimate" && (
                    <span className="ml-1 rounded bg-brick-soft px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brick align-middle" title="Estimated price — not from market data">est</span>
                  )}
                </td>
                <td className="num px-3 py-2.5 text-right">{Math.round(f.kcal)}</td>
                <td className="num px-3 py-2.5 text-right">{f.protein.toFixed(1)}</td>
                <td className="num px-3 py-2.5 text-right">{f.fibre.toFixed(1)}</td>
                <td className="num px-3 py-2.5 text-right">{f.iron.toFixed(1)}</td>
                <td className="num px-3 py-2.5 text-right">{Math.round(f.calcium)}</td>
                <td className="num px-3 py-2.5 text-right">{Math.round(f.vitA)}</td>
                <td className="num px-3 py-2.5 text-right">{Math.round(f.vitC)}</td>
                <td className="num px-3 py-2.5 text-right font-semibold text-leaf">{f.proteinKES.toFixed(2)}</td>
                <td className="num px-3 py-2.5 text-right font-semibold text-leaf">{f.ironKES.toFixed(3)}</td>
                <td className="num px-3 py-2.5 text-right font-semibold text-leaf">{f.fibreKES.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        Nutrients are exact per 100 g (Kenya Food Composition Tables 2018), scaled here to the portion shown under each food (e.g. {"“"}1 slab (250 g){"”"}).
        Those portions are <span className="font-semibold text-ink">typical servings</span> — a reasonable convention, not measured from a Kenyan source, so treat them as a guide.
        Prices tagged <span className="rounded bg-brick-soft px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brick">est</span> are estimates, not from WFP or Mkulima Bora market data.
      </p>
    </div>
  );
}
