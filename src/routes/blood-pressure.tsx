import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blood-pressure")({
  head: () => ({
    meta: [
      { title: "Blood pressure — Lishe" },
      { name: "description", content: "Sodium in Kenyan foods. Name the real culprits." },
      { property: "og:title", content: "Blood pressure — Lishe" },
      { property: "og:description", content: "Stock cubes, packaged soups, processed meats — where the salt hides." },
    ],
  }),
  component: BP,
});

const SODIUM: Array<[string, number]> = [
  ["Stock cube (1 cube, 4g)", 1800], ["Packaged soup mix (1 sachet)", 1400],
  ["Sausage (100g)", 1100], ["Bacon (100g)", 1500], ["White bread (2 slices)", 490],
  ["Chapati (1 piece)", 240], ["Sukuma wiki, boiled (150g)", 36], ["Githeri (250g)", 12],
];

function BP() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Blood pressure</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">
        The daily sodium ceiling is <span className="num text-ink">2,000 mg</span>. Most of it comes from a small list of foods.
      </p>

      <div className="mt-10 max-w-[560px] border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-bg">
            <tr><th className="px-4 py-3 text-left font-semibold">Food</th><th className="px-4 py-3 text-right font-semibold">Sodium (mg)</th></tr>
          </thead>
          <tbody>
            {SODIUM.map(([n, v]) => (
              <tr key={n} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">{n}</td>
                <td className={`num px-4 py-3 text-right ${v > 500 ? "text-brick font-semibold" : ""}`}>{v.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 border border-brick bg-brick-soft p-6 text-brick">
        <p className="text-base font-semibold">This is nutrition information, not medical advice.</p>
        <p className="mt-2 text-sm">Speak to your doctor or a KNDI-registered nutritionist before changing your diet.</p>
      </div>

      <Link to="/plates" className="mt-10 inline-block rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">
        Open Plates
      </Link>
    </div>
  );
}
