import { createFileRoute, Link } from "@tanstack/react-router";
import { findKfctFood, type KfctFood } from "@/data/foodsKfct";

export const Route = createFileRoute("/foods/$code")({
  head: ({ params }) => {
    const f = findKfctFood(params.code);
    const title = f ? `${f.name} — Nutrients per 100 g | Lishe` : "Food — Lishe";
    const description = f
      ? `Nutrient values per 100 g for ${f.name}, from the Kenya Food Composition Tables 2018.`
      : "Food detail.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: FoodDetail,
});

function row(label: string, v: number | null, unit: string, digits = 1): [string, string] {
  if (v == null) return [label, "—"];
  const rounded = digits === 0 ? Math.round(v).toString() : v.toFixed(digits);
  return [label, `${rounded} ${unit}`];
}

function FoodDetail() {
  const { code } = Route.useParams();
  const f = findKfctFood(code);
  if (!f) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-20">
        <h1 className="font-display text-3xl font-bold">Food not found</h1>
        <p className="mt-3 text-muted">
          We couldn't find a food with that code in the Kenya Food Composition Tables.
        </p>
        <Link to="/foods" className="mt-6 inline-block text-leaf underline">
          Back to foods
        </Link>
      </div>
    );
  }

  const macros: Array<[string, string]> = [
    row("Energy", f.kcal, "kcal", 0),
    row("Protein", f.protein, "g"),
    row("Fat", f.fat, "g"),
    row("Carbohydrate", f.carb, "g"),
    row("Fibre", f.fibre, "g"),
  ];
  const micros: Array<[string, string]> = [
    row("Calcium", f.calcium, "mg", 0),
    row("Iron", f.iron, "mg"),
    row("Zinc", f.zinc, "mg"),
    row("Sodium", f.sodium, "mg", 0),
    row("Potassium", f.potassium, "mg", 0),
    row("Vitamin A", f.vitA, "µg RAE", 0),
    row("Vitamin C", f.vitC, "mg", 0),
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
      <Link to="/foods" className="text-sm text-muted hover:text-ink">
        ← All foods
      </Link>
      <p className="mt-4 text-xs uppercase tracking-widest text-leaf">{f.group}</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">{f.name}</h1>
      {f.aliases.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Also known as{" "}
          <span className="text-ink">{f.aliases.join(", ")}</span>
        </p>
      )}
      <p className="mt-2 text-xs text-muted">KFCT 2018 · Food code {f.code}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <NutrientTable title="Macronutrients per 100 g" rows={macros} />
        <NutrientTable title="Minerals & vitamins per 100 g" rows={micros} />
      </div>

      <p className="mt-8 max-w-[720px] text-xs text-muted">
        A dash (—) means the Kenya Food Composition Tables 2018 do not publish a value for that
        nutrient in this food — not that the food contains none of it. Values are for the raw
        edible portion unless the food name says otherwise.
      </p>

      <div className="mt-10 border border-hairline bg-surface p-6">
        <p className="text-sm font-semibold">Want to eat this in a balanced way?</p>
        <p className="mt-2 text-sm text-muted">
          Combine foods from different groups so your plate has vegetables and fruit, a staple, and
          a protein source. Ask the nutrition helper for practical, budget-friendly ideas.
        </p>
        <Link
          to="/ask"
          className="mt-4 inline-block rounded bg-leaf px-5 py-2.5 text-sm font-semibold text-surface hover:bg-ink"
        >
          Ask the helper about {f.name.split(",")[0]} →
        </Link>
      </div>
    </div>
  );
}

function NutrientTable({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest text-muted">{title}</h2>
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
  );
}

// Keep the type import from getting tree-shaken away by TypeScript's isolatedModules mode.
export type { KfctFood };
