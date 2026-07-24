import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { KFCT_FOODS, KFCT_GROUPS, type KfctFood } from "@/data/foodsKfct";

export const Route = createFileRoute("/foods/")({
  head: () => ({
    meta: [
      { title: "Foods — Kenya Food Composition Tables 2018 | Lishe" },
      {
        name: "description",
        content:
          "Search over 640 Kenyan foods and see their nutrients per 100 g, straight from the Kenya Food Composition Tables 2018 (FAO / Government of Kenya).",
      },
      { property: "og:title", content: "Foods — Kenya Food Composition Tables 2018 | Lishe" },
      {
        property: "og:description",
        content:
          "Search over 640 Kenyan foods and their nutrients from the Kenya Food Composition Tables 2018.",
      },
    ],
  }),
  component: FoodsExplorer,
});

type SortKey = "name" | "group" | "kcal" | "protein" | "fibre" | "iron" | "calcium" | "vitC";

const COLS: Array<{ key: SortKey; label: string; num?: boolean }> = [
  { key: "name", label: "Food" },
  { key: "group", label: "Group" },
  { key: "kcal", label: "Kcal", num: true },
  { key: "protein", label: "Protein g", num: true },
  { key: "fibre", label: "Fibre g", num: true },
  { key: "iron", label: "Iron mg", num: true },
  { key: "calcium", label: "Calcium mg", num: true },
  { key: "vitC", label: "Vit C mg", num: true },
];

function numVal(v: number | null): number {
  return v ?? -1;
}

function fmt(v: number | null, digits = 1): string {
  if (v == null) return "—";
  return v.toFixed(digits);
}

function FoodsExplorer() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = KFCT_FOODS.filter((f) => {
      if (group && f.group !== group) return false;
      if (!term) return true;
      if (f.name.toLowerCase().includes(term)) return true;
      // Common-name aliases let "sukuma", "ndengu", "githeri" etc. find their
      // KFCT rows even though those local names aren't in the English entry.
      return f.aliases.some((a) => a.toLowerCase().includes(term));
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === "name" || sortKey === "group") {
        const av = a[sortKey];
        const bv = b[sortKey];
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const av = numVal(a[sortKey]);
      const bv = numVal(b[sortKey]);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [q, group, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "name" || k === "group" ? "asc" : "desc");
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-leaf">Foods</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
        Kenya Food Composition Tables
      </h1>
      <p className="mt-3 max-w-[680px] text-muted">
        Nutrient values per 100 g for {KFCT_FOODS.length} local and prepared foods, taken directly
        from the Kenya Food Composition Tables 2018 (FAO / Government of Kenya). Values are for the
        raw edible portion unless the name says otherwise.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for a food — e.g. sukuma, omena, ndengu…"
          className="w-full max-w-md rounded border border-hairline bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setGroup(null)}
            className={`rounded border px-3 py-1.5 ${
              group === null ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"
            }`}
          >
            All
          </button>
          {KFCT_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded border px-3 py-1.5 ${
                group === g ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          Showing <span className="num font-semibold text-ink">{rows.length}</span> of{" "}
          <span className="num font-semibold text-ink">{KFCT_FOODS.length}</span> foods.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-hairline bg-bg">
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`cursor-pointer whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider ${
                    c.num ? "text-right" : "text-left"
                  } ${sortKey === c.key ? "text-leaf" : "text-ink"}`}
                >
                  {c.label}
                  {sortKey === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f: KfctFood) => (
              <tr key={f.code} className="border-b border-hairline last:border-0 hover:bg-bg">
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Link
                    to="/foods/$code"
                    params={{ code: f.code }}
                    className="font-semibold hover:text-leaf"
                  >
                    {f.name}
                  </Link>
                  {f.aliases.length > 0 && (
                    <span className="ml-2 text-xs text-muted" title={f.aliases.join(", ")}>
                      · aka {f.aliases.slice(0, 2).join(", ")}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">{f.group}</td>
                <td className="num px-3 py-2.5 text-right">
                  {f.kcal == null ? "—" : Math.round(f.kcal)}
                </td>
                <td className="num px-3 py-2.5 text-right">{fmt(f.protein)}</td>
                <td className="num px-3 py-2.5 text-right">{fmt(f.fibre)}</td>
                <td className="num px-3 py-2.5 text-right">{fmt(f.iron)}</td>
                <td className="num px-3 py-2.5 text-right">
                  {f.calcium == null ? "—" : Math.round(f.calcium)}
                </td>
                <td className="num px-3 py-2.5 text-right">
                  {f.vitC == null ? "—" : Math.round(f.vitC)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="px-3 py-10 text-center text-sm text-muted">
                  No foods match that search. Try a different word or clear the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-[860px] text-xs text-muted">
        A dash (—) means the KFCT 2018 does not publish a value for that nutrient — not that the
        food contains none of it. Values are per 100 g of the edible portion; use them as a guide,
        not a laboratory reading.
      </p>
    </div>
  );
}
