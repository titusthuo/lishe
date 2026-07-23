import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { suggestPlates, priceFor, MEAL_TARGETS, DAY_TARGETS, type Plate } from "@/data/foods";
import { useStore } from "@/data/store";
import { REGION_PRICE_DATE } from "@/data/generated";
import { ComparisonCard } from "@/components/site/ComparisonCard";

export const Route = createFileRoute("/plates")({
  head: () => ({
    meta: [
      { title: "Plates — Lishe" },
      { name: "description", content: "Enter your budget and get balanced Kenyan meals that fit." },
      { property: "og:title", content: "Plates — Lishe" },
      { property: "og:description", content: "Type what you have. See what to eat." },
    ],
  }),
  component: Plates,
});

const CHIPS = [50, 100, 200, 500];

function Plates() {
  const [budget, setBudget] = useState<number | "">("");
  const [mode, setMode] = useState<"meal" | "day">("meal");
  const [submitted, setSubmitted] = useState(false);
  const [veg, setVeg] = useState(false);
  const [noDairy, setNoDairy] = useState(false);
  const [noCook, setNoCook] = useState(false);
  const [excludeStr, setExcludeStr] = useState("");
  const { region, userPrices } = useStore();

  const results = useMemo(() => {
    if (!submitted || budget === "" || budget <= 0) return [];
    const exclude = excludeStr.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    return suggestPlates(Number(budget), mode, region, userPrices, { vegetarian: veg, noDairy, noCooking: noCook, exclude });
  }, [submitted, budget, mode, region, userPrices, veg, noDairy, noCook, excludeStr]);

  if (!submitted) {
    return (
      <>
      <div className="mx-auto flex min-h-[calc(100vh-16rem)] max-w-[760px] flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-muted">Lishe</p>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">How much do you have?</h1>

        <div className="mt-10 flex items-baseline gap-4">
          <span className="font-display text-3xl font-semibold text-muted md:text-4xl">KSh</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="100"
            className="num w-full border-b-2 border-ink bg-transparent pb-2 font-mono text-6xl font-semibold text-ink outline-none md:text-[96px] md:leading-none"
            min="1"
            autoFocus
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {CHIPS.map(v => (
            <button key={v} onClick={() => setBudget(v)}
              className={`num rounded border px-5 py-2 font-mono text-lg ${budget === v ? "border-ink bg-ink text-surface" : "border-hairline bg-surface text-ink hover:border-ink"}`}>
              {v}
            </button>
          ))}
        </div>

        <div className="mt-8 inline-flex overflow-hidden rounded border border-hairline text-sm">
          {(["meal", "day"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-6 py-2.5 font-semibold ${mode === m ? "bg-ink text-surface" : "bg-surface text-ink"}`}>
              {m === "meal" ? "One meal" : "Full day"}
            </button>
          ))}
        </div>

        <button
          onClick={() => budget !== "" && budget > 0 && setSubmitted(true)}
          disabled={budget === "" || budget <= 0}
          className="mt-12 self-start rounded bg-leaf px-8 py-4 text-lg font-semibold text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Show me
        </button>
      </div>
      <Outlet />
      </>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <p className="text-xs uppercase tracking-widest text-muted">Budget</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl text-muted">KSh</span>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
              className="num w-24 border-b-2 border-ink bg-transparent font-mono text-4xl font-semibold outline-none" />
          </div>

          <div className="mt-6 inline-flex overflow-hidden rounded border border-hairline text-xs">
            {(["meal", "day"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-1.5 font-semibold ${mode === m ? "bg-ink text-surface" : "bg-surface text-ink"}`}>
                {m === "meal" ? "One meal" : "Full day"}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted">Filters</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={veg} onChange={e => setVeg(e.target.checked)} /> Vegetarian</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={noDairy} onChange={e => setNoDairy(e.target.checked)} /> No dairy</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={noCook} onChange={e => setNoCook(e.target.checked)} /> No cooking facilities</label>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted">Don't like</p>
            <input value={excludeStr} onChange={e => setExcludeStr(e.target.value)} placeholder="e.g. omena, njahi"
              className="mt-2 w-full rounded border border-hairline bg-surface px-3 py-2 text-sm" />
          </div>

          <button className="mt-6 w-full rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-surface">
            Show me others
          </button>
        </aside>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h1 className="font-display text-2xl font-bold">
              {results.length} plate{results.length === 1 ? "" : "s"} at <span className="num">KSh {budget}</span>
            </h1>
          </div>
          <p className="mb-6 text-xs text-muted">
            Prices for <span className="font-semibold text-ink">{region}</span>
            {region !== "Kenya" && REGION_PRICE_DATE[region] ? ` · WFP retail, as of ${REGION_PRICE_DATE[region]}` : " · national median"}
          </p>

          {results.length === 0 ? (
            <div className="border border-hairline bg-surface p-8 text-muted">
              Nothing fits that budget with these filters. Try raising the budget or removing a filter.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {results.map(p => <PlateCard key={p.id} plate={p} cost={p.cost} hasEstimate={p.hasEstimate} mode={mode} />)}
            </div>
          )}

          <div className="mt-16">
            <ComparisonCard budget={typeof budget === "number" ? budget : 100} />
          </div>
        </div>
      </div>
    </div>
    <Outlet />
    </>
  );
}

function PlateCard({ plate, cost, hasEstimate, mode }: { plate: Plate; cost: number; hasEstimate: boolean; mode: "meal" | "day" }) {
  const { region, userPrices } = useStore();
  const targets = mode === "meal" ? MEAL_TARGETS : DAY_TARGETS;
  const bars = [
    { label: "Energy", value: plate.totals.kcal, target: targets.kcal, unit: "kcal" },
    { label: "Protein", value: plate.totals.protein, target: targets.protein, unit: "g" },
    { label: "Fibre", value: plate.totals.fibre, target: targets.fibre, unit: "g" },
    { label: "Vitamin C", value: plate.totals.vitC, target: targets.vitC, unit: "mg" },
  ];
  return (
    <Link to="/plates/$id" params={{ id: plate.id }} className="group block border border-hairline bg-surface p-6 transition-colors hover:border-ink">
      <div className="flex flex-col gap-1.5">
        {plate.items.map(i => {
          const p = priceFor(i.food, region, userPrices);
          return (
            <div key={i.food.code} className="flex items-baseline justify-between border-b border-hairline pb-1.5 last:border-0">
              <span className="font-display text-lg font-semibold">{i.food.name}</span>
              <span className="num text-sm text-muted">KSh {p.kes * i.qty}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
        <span className="text-xs uppercase tracking-widest text-muted">Total{hasEstimate ? <span className="ml-1 normal-case text-muted">· incl. estimate</span> : ""}</span>
        <span className="num text-2xl font-semibold text-enamel">KSh {cost}</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {bars.map(b => {
          const pct = Math.min(100, (b.value / b.target) * 100);
          const targetPct = 100;
          return (
            <div key={b.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted">{b.label}</span>
                <span className="num text-ink">{b.value.toFixed(0)} <span className="text-muted">{b.unit}</span></span>
              </div>
              <div className="relative mt-1 h-2 w-full bg-hairline">
                <div className="absolute inset-y-0 left-0 bg-leaf" style={{ width: `${pct}%` }} />
                <div className="absolute inset-y-0 w-px bg-ink" style={{ left: `${Math.min(100, targetPct)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
