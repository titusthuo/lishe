import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { setUserPrice, useStore } from "@/data/store";
import { findFood, priceFor } from "@/data/foods";

export const Route = createFileRoute("/prices")({
  head: () => ({
    meta: [
      { title: "Prices — Lishe" },
      { name: "description", content: "Calibrate Lishe to your neighbourhood's prices." },
      { property: "og:title", content: "Prices — Lishe" },
      { property: "og:description", content: "Eight prices, once. Every result gets accurate." },
    ],
  }),
  component: Prices,
});

// Real KFCT food codes users can calibrate. Prices are per the portion Lishe uses.
const ITEM_CODES = ["04020", "04039", "04003", "15005", "03019", "08002", "06022", "07011"];

function Prices() {
  const { region, userPrices } = useStore();
  const [values, setValues] = useState<Record<string, number | "">>({});
  const [saved, setSaved] = useState(false);

  const items = ITEM_CODES.map(code => findFood(code)).filter((f): f is NonNullable<typeof f> => !!f);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const [code, v] of Object.entries(values)) {
      if (v === "") continue;
      setUserPrice(code, Number(v));
    }
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Prices</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">
        Prices differ by neighbourhood. Enter what you pay for each portion and Lishe uses your numbers instead of the regional reference.
      </p>

      {saved && (
        <div className="mt-8 border border-leaf bg-leaf-soft p-4 text-sm text-leaf">
          Saved — Lishe now uses your prices. They stay on this device.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-10 grid gap-6 md:grid-cols-2">
        {items.map(f => {
          const ref = priceFor(f, region, userPrices);
          const savedPrice = userPrices[f.code];
          const v = values[f.code];
          const outOfBand = typeof v === "number" && (v < ref.kes * 0.4 || v > ref.kes * 2.5);
          return (
            <div key={f.code} className="border border-hairline bg-surface p-5">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-display text-base font-bold">{f.name}</p>
                  <p className="text-xs text-muted">{f.portionLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">KSh</span>
                  <input type="number" min="0" value={v ?? ""} placeholder={String(ref.kes)}
                    onChange={e => setValues(x => ({ ...x, [f.code]: e.target.value === "" ? "" : Number(e.target.value) }))}
                    className="num w-24 rounded border border-hairline bg-bg px-3 py-2 text-right font-mono text-lg" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">
                Reference <span className="num text-ink">KSh {ref.kes}</span>
                {" · "}{ref.source === "community" ? "your price" : ref.source === "mkulima" ? "Mkulima Bora retail" : ref.source === "wfp" ? "WFP retail" : "estimate"}
                {savedPrice != null ? " · saved" : ""}
              </p>
              {outOfBand && (
                <p className="mt-2 text-xs text-brick">That's far from the reference. Double-check the portion.</p>
              )}
            </div>
          );
        })}

        <div className="md:col-span-2 flex items-center gap-6">
          <button className="rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">Save</button>
          <button type="button" onClick={() => setValues({})} className="text-sm font-semibold underline">Clear form</button>
        </div>
      </form>
    </div>
  );
}
