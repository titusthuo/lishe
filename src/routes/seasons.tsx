import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SEASONAL_INDEX } from "@/data/generated";

export const Route = createFileRoute("/seasons")({
  head: () => ({
    meta: [
      { title: "Seasons — Lishe" },
      { name: "description", content: "How retail prices move across the year, from WFP market data." },
      { property: "og:title", content: "Seasons — Lishe" },
      { property: "og:description", content: "Monthly price index versus the annual median, per commodity." },
    ],
  }),
  component: Seasons,
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Friendlier labels for the WFP commodity names we have monthly data for.
const LABELS: Record<string, string> = {
  "Beans (dry)": "Beans",
  "Maize": "Maize grain",
  "Sorghum": "Sorghum",
  "Wheat flour": "Wheat flour (chapati)",
  "Sugar": "Sugar",
  "Cooking fat": "Cooking fat",
  "Salt": "Salt",
};

const COMMODITIES = Object.keys(SEASONAL_INDEX).filter((c) => c in LABELS);

function Seasons() {
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
  const [selected, setSelected] = useState<string>(COMMODITIES[0] ?? "");

  const series = SEASONAL_INDEX[selected]?.index ?? [];
  const present = series.filter((v): v is number => v != null);
  const max = present.length ? Math.max(...present, 0) : 0;
  const min = present.length ? Math.min(...present, 0) : 0;
  const span = max - min || 1;

  // Commodities ranked by this month's index (cheapest first), missing months last.
  const ranked = [...COMMODITIES].sort((a, b) => {
    const av = SEASONAL_INDEX[a].index[monthIdx];
    const bv = SEASONAL_INDEX[b].index[monthIdx];
    if (av == null) return 1;
    if (bv == null) return -1;
    return av - bv;
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Seasons</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">
        How retail prices move across the year. Each figure is the median price that month versus the commodity's annual median.
      </p>

      <div className="mt-6 max-w-[680px] border border-hairline bg-bg p-4 text-xs text-muted">
        Built from WFP retail price points. Monthly coverage is uneven, so read these as indicative, not exact. Only commodities
        with data in 8+ months are shown; a dash means no price was recorded that month.
      </div>

      <div className="mt-8 inline-flex flex-wrap gap-1 rounded border border-hairline p-1 text-xs">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => setMonthIdx(i)}
            className={`num rounded px-2.5 py-1.5 ${monthIdx === i ? "bg-ink text-surface" : "text-ink hover:bg-bg"}`}>{m}</button>
        ))}
      </div>

      <div className="mt-10 border border-hairline bg-surface">
        <div className="border-b border-hairline px-5 py-3 text-xs uppercase tracking-widest text-muted">
          {MONTHS[monthIdx]} — versus annual median
        </div>
        <ul>
          {ranked.map((c) => {
            const pct = SEASONAL_INDEX[c].index[monthIdx];
            const abs = pct == null ? 0 : Math.abs(pct);
            const width = Math.min(50, abs);
            return (
              <li key={c} onClick={() => setSelected(c)}
                className={`grid cursor-pointer grid-cols-[180px_1fr_60px] items-center gap-4 border-b border-hairline px-5 py-4 last:border-0 hover:bg-bg ${selected === c ? "bg-bg" : ""}`}>
                <span className="font-semibold">{LABELS[c]}</span>
                <div className="relative h-3">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-ink" />
                  {pct != null && pct >= 0 && (
                    <div className="absolute inset-y-0 left-1/2 bg-brick" style={{ width: `${width}%` }} />
                  )}
                  {pct != null && pct < 0 && (
                    <div className="absolute inset-y-0 right-1/2 bg-leaf" style={{ width: `${width}%` }} />
                  )}
                </div>
                <span className={`num text-right font-semibold ${pct == null ? "text-muted" : pct > 0 ? "text-brick" : pct < 0 ? "text-leaf" : "text-muted"}`}>
                  {pct == null ? "—" : `${pct > 0 ? "+" : ""}${pct}%`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {selected && (
        <div className="mt-10 border border-hairline bg-surface p-6">
          <p className="text-xs uppercase tracking-widest text-muted">
            {LABELS[selected]} — 12-month index ({SEASONAL_INDEX[selected].monthsCovered}/12 months with data)
          </p>
          <svg viewBox="0 0 600 200" className="mt-4 h-48 w-full">
            <line x1="0" y1={190 - ((0 - min) / span) * 180} x2="600" y2={190 - ((0 - min) / span) * 180} stroke="var(--color-hairline)" />
            <polyline
              fill="none" stroke="var(--color-enamel)" strokeWidth="2"
              points={series
                .map((v, i) => (v == null ? null : `${(i / 11) * 600},${190 - ((v - min) / span) * 180}`))
                .filter(Boolean)
                .join(" ")}
            />
            {series.map((v, i) =>
              v == null ? null : (
                <circle key={i} cx={(i / 11) * 600} cy={190 - ((v - min) / span) * 180} r="3" fill="var(--color-enamel)" />
              ),
            )}
          </svg>
          <div className="num mt-2 flex justify-between text-xs text-muted">
            {MONTHS.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
