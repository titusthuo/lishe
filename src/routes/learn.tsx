import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — eating a balanced diet | Lishe" },
      { name: "description", content: "The basics of a balanced diet, explained for everyday Kenyan meals and budgets." },
      { property: "og:title", content: "Learn — eating a balanced diet | Lishe" },
      { property: "og:description", content: "Food groups, the balanced plate, sugar and salt, on a Kenyan budget." },
    ],
  }),
  component: Learn,
});

const GROUPS: Array<{ name: string; role: string; examples: string }> = [
  { name: "Staples (energy)", role: "Give you energy to get through the day.", examples: "Ugali, rice, chapati, sweet potato, arrowroot, matoke, cassava" },
  { name: "Body-building foods (protein)", role: "Build and repair muscles; vital for children.", examples: "Beans, ndengu, njahi, omena, eggs, milk, fish, meat" },
  { name: "Vegetables & fruit (protective)", role: "Vitamins, minerals and fibre that protect against disease.", examples: "Sukuma wiki, terere, managu, mrenda, tomato, oranges, mango, banana" },
  { name: "Fats & oils (in moderation)", role: "Concentrated energy; help absorb some vitamins.", examples: "Avocado, groundnuts, cooking oil — small amounts" },
];

const PLATE = [
  { part: "½ your plate", what: "Vegetables and fruit", tone: "text-leaf" },
  { part: "¼ your plate", what: "Whole-grain staples", tone: "text-enamel" },
  { part: "¼ your plate", what: "Body-building foods (protein)", tone: "text-brick" },
];

const LIMITS: Array<{ label: string; guide: string }> = [
  { label: "Salt", guide: "Less than 5 g a day — about one teaspoon (WHO). Use iodised salt, but use it sparingly. Watch soups, crisps and processed foods." },
  { label: "Added sugar", guide: "Keep free sugars under 10% of your daily energy — about 50 g, or 12 teaspoons, on a 2,000-kcal day (WHO). Sodas and sweet tea add up fast." },
  { label: "Fats", guide: "Keep total fat at 30% or less of energy, and saturated fat under 10% (WHO). Use oil in moderation; choose avocado, groundnuts and fish." },
  { label: "Water", guide: "Drink plenty of safe water through the day instead of sugary drinks." },
];

// Kenya Ministry of Health (2017) frequency messages.
const HOW_OFTEN: Array<{ freq: string; what: string }> = [
  { freq: "Every day", what: "Vegetables and fruit; fresh or fermented milk or yoghurt" },
  { freq: "≥ 4× a week", what: "Beans, peas, lentils, cowpeas, pigeon peas, soya, nuts and seeds" },
  { freq: "≥ 2× a week", what: "Lean meat, fish, poultry, insects or eggs" },
  { freq: "Sparingly", what: "Sugar, solid fat and salt" },
];

function Learn() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-leaf">Learn</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">Eating a balanced diet</h1>
      <p className="mt-4 max-w-[620px] text-lg text-muted">
        A balanced diet just means eating a variety of foods, in the right amounts, so your body gets
        the energy and nutrients it needs. Here's how that looks with everyday Kenyan meals.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">The three food groups</h2>
        <p className="mt-2 max-w-[620px] text-muted">
          Kenyan food-based dietary guidelines group foods by what they do for the body. A good meal
          pulls from all three.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.name} className="border border-hairline bg-surface p-6">
              <h3 className="font-display text-lg font-bold">{g.name}</h3>
              <p className="mt-2 text-sm text-muted">{g.role}</p>
              <p className="mt-3 text-sm text-ink">{g.examples}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">The balanced plate</h2>
        <p className="mt-2 max-w-[620px] text-muted">
          A simple way to picture a meal: fill half your plate with vegetables and fruit, a quarter
          with staples, and a quarter with protein.
        </p>
        <div className="mt-6 space-y-3">
          {PLATE.map((p) => (
            <div key={p.part} className="flex items-center gap-4 border border-hairline bg-surface p-4">
              <span className={`num w-24 shrink-0 font-display text-lg font-bold ${p.tone}`}>{p.part}</span>
              <span className="text-ink">{p.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">Aim for variety</h2>
        <p className="mt-2 max-w-[620px] text-muted">
          No single food has everything. Eat different foods across the week, and aim for at least
          400 g of vegetables and fruit each day (WHO). Indigenous vegetables like terere, managu and
          mrenda are among the cheapest and most nutritious options.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">How often to eat what</h2>
        <p className="mt-2 max-w-[620px] text-muted">
          Kenya's national guidelines give simple frequencies to aim for.
        </p>
        <div className="mt-6 divide-y divide-hairline border border-hairline bg-surface">
          {HOW_OFTEN.map((h) => (
            <div key={h.freq} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
              <span className="w-32 shrink-0 font-display text-lg font-bold text-leaf">{h.freq}</span>
              <span className="text-sm text-muted">{h.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">Go easy on these</h2>
        <div className="mt-6 divide-y divide-hairline border border-hairline bg-surface">
          {LIMITS.map((l) => (
            <div key={l.label} className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-6">
              <span className="w-32 shrink-0 font-display text-lg font-bold">{l.label}</span>
              <span className="text-sm text-muted">{l.guide}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 border border-brick bg-brick-soft p-6 text-brick">
        <p className="text-base font-semibold">This is nutrition information, not medical advice.</p>
        <p className="mt-2 text-sm">
          If you're pregnant, managing a condition, or feeding a sick child, speak to a doctor or a
          KNDI-registered nutritionist.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/ask" className="rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">
          Ask the nutrition helper →
        </Link>
        <Link to="/foods" className="rounded border border-ink px-6 py-3 font-semibold hover:bg-ink hover:text-surface">
          Browse foods
        </Link>
      </div>

      <section className="mt-14 border-t border-hairline pt-8">
        <h2 className="font-display text-lg font-bold">Where this comes from</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          <li>
            <a
              href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline hover:text-leaf"
            >
              WHO — Healthy diet (fact sheet)
            </a>
            . Figures for fruit &amp; vegetables (≥400 g/day), free sugars (&lt;10% of energy), fat
            (≤30%, saturated &lt;10%) and salt (&lt;5 g/day). Updated 26 January 2026.
          </li>
          <li>
            <a
              href="https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/kenya/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline hover:text-leaf"
            >
              National Guidelines for Healthy Diets and Physical Activity
            </a>
            {" — "}Kenya Ministry of Health (Nutrition and Dietetics Unit), 2017. Food groups,
            variety, and the eating-frequency messages above.
          </li>
          <li>
            <span className="font-semibold text-ink">Kenya Food Composition Tables, 2018</span>
            {" — "}FAO / Government of Kenya. Source for the nutrient numbers used across Lishe.
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          The balanced-plate picture is a common teaching aid, not a Kenya-specific standard.
        </p>
      </section>
    </div>
  );
}
