import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/diabetes")({
  head: () => ({
    meta: [
      { title: "Diabetes — Lishe" },
      { name: "description", content: "Glycemic load in plain English, with Kenyan staples ranked." },
      { property: "og:title", content: "Diabetes — Lishe" },
      { property: "og:description", content: "Total carbohydrate in a portion matters more than GI alone." },
    ],
  }),
  component: Diabetes,
});

const ROWS: Array<[string, number]> = [
  ["Githeri", 40], ["Ndengu", 25], ["Njahi", 24], ["Bulgur", 48],
  ["Matoke", 51], ["Sweet potato", 63], ["Ugali", 70], ["White rice", 73], ["Potato", 78],
];

function Diabetes() {
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const rows = [...ROWS].sort((a, b) => sort === "asc" ? a[1] - b[1] : b[1] - a[1]);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Diabetes</h1>
      <div className="mt-6 max-w-[680px] space-y-4 text-ink">
        <p>Glycemic index tells you how fast a food raises blood sugar. Glycemic <strong>load</strong> tells you how much sugar the portion actually delivers.</p>
        <p>A high-GI food eaten in a small portion can matter less than a moderate-GI food eaten in a big portion. Think about the plate, not the label.</p>
      </div>

      <div className="mt-10 max-w-[560px] overflow-hidden border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-bg">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kenyan staple</th>
              <th className="cursor-pointer px-4 py-3 text-right font-semibold" onClick={() => setSort(s => s === "asc" ? "desc" : "asc")}>
                GI {sort === "asc" ? "↑" : "↓"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([n, gi]) => (
              <tr key={n} className="border-b border-hairline last:border-0 hover:bg-bg">
                <td className="px-4 py-3">{n}</td>
                <td className="num px-4 py-3 text-right">{gi}</td>
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
        Open Plates with diabetes mode
      </Link>
    </div>
  );
}
