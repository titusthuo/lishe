import { comparisonBad, comparisonGood, plateCost, type Plate } from "@/data/foods";
import { useStore } from "@/data/store";

const METRICS: Array<{ key: keyof Plate["totals"]; label: string; unit: string; higherIsBetter: boolean }> = [
  { key: "kcal", label: "Calories", unit: "kcal", higherIsBetter: false },
  { key: "protein", label: "Protein", unit: "g", higherIsBetter: true },
  { key: "fibre", label: "Fibre", unit: "g", higherIsBetter: true },
  { key: "iron", label: "Iron", unit: "mg", higherIsBetter: true },
  { key: "calcium", label: "Calcium", unit: "mg", higherIsBetter: true },
  { key: "vitC", label: "Vitamin C", unit: "mg", higherIsBetter: true },
];

function metricValue(plate: Plate, key: keyof Plate["totals"]): number {
  return plate.totals[key];
}

export function ComparisonCard({ budget = 100, good, bad, compact = false }: { budget?: number; good?: Plate; bad?: Plate; compact?: boolean }) {
  const left = bad ?? comparisonBad();
  const right = good ?? comparisonGood();

  return (
    <section className="border border-hairline bg-surface">
      <div className="border-b border-hairline px-6 py-5">
        <p className="text-xs uppercase tracking-widest text-muted">For the same money</p>
        <h2 className="mt-1 font-display text-2xl font-bold">
          KSh <span className="num">{budget}</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-hairline">
        <PlateColumn label={left.items.map((i) => `${i.food.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(" + ")} tone="brick" plate={left} compare={right} side="left" compact={compact} />
        <PlateColumn label={right.items.map((i) => i.food.name).join(" + ")} tone="leaf" plate={right} compare={left} side="right" compact={compact} />
      </div>
      <div className="flex items-center justify-between border-t border-hairline px-6 py-3">
        <p className="text-xs text-muted">Per-100g values from Kenya Food Composition Tables 2018.</p>
        <button className="rounded border border-hairline bg-bg px-3 py-1.5 text-xs font-semibold hover:bg-ink hover:text-surface">
          Share
        </button>
      </div>
    </section>
  );
}

function PlateColumn({
  label,
  tone,
  plate,
  compare,
  side,
  compact,
}: {
  label: string;
  tone: "brick" | "leaf";
  plate: Plate;
  compare: Plate;
  side: "left" | "right";
  compact: boolean;
}) {
  const { region, userPrices } = useStore();
  const toneClass = tone === "brick" ? "text-brick" : "text-leaf";
  const { kes } = plateCost(plate, region, userPrices);
  return (
    <div className="p-6">
      <p className={`font-display text-lg font-bold ${toneClass}`}>{label}</p>
      <p className="mt-1 text-xs text-muted">
        Total: <span className="num">KSh {kes}</span>
      </p>
      <dl className="mt-5 flex flex-col gap-3">
        {METRICS.map((m) => {
          const v = metricValue(plate, m.key);
          const other = metricValue(compare, m.key);
          const wins = m.higherIsBetter ? v > other : v < other;
          const winColor = m.higherIsBetter ? "text-leaf" : "text-brick";
          return (
            <div key={m.key as string} className="flex items-baseline justify-between border-b border-hairline pb-2">
              <dt className="text-sm text-muted">{m.label}</dt>
              <dd className={`num text-right ${compact ? "text-lg" : "text-xl"} font-semibold ${wins ? `${winColor}` : "text-ink"}`}>
                {v.toFixed(m.key === "kcal" || m.key === "calcium" ? 0 : 1)}
                <span className="ml-1 text-xs font-normal text-muted">{m.unit}</span>
              </dd>
            </div>
          );
        })}
      </dl>
      {/* side kept for potential future use */}
      <span className="sr-only">{side}</span>
    </div>
  );
}
