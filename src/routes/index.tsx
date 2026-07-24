import { createFileRoute, Link } from "@tanstack/react-router";
import { KFCT_FOOD_COUNT } from "@/data/foodsMeta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lishe — Eat a balanced diet on a Kenyan budget" },
      {
        name: "description",
        content:
          "Learn what a balanced plate looks like with local Kenyan foods, and ask a nutrition helper your questions. General nutrition information, not medical advice.",
      },
      { property: "og:title", content: "Lishe — Eat a balanced diet on a Kenyan budget" },
      {
        property: "og:description",
        content:
          "Learn what a balanced plate looks like with local Kenyan foods, and ask a nutrition helper your questions.",
      },
    ],
  }),
  component: Home,
});

const PLATE = [
  { label: "Vegetables & fruit", share: "½", tone: "bg-leaf", text: "text-leaf" },
  { label: "Staples", share: "¼", tone: "bg-enamel", text: "text-enamel" },
  { label: "Protein", share: "¼", tone: "bg-brick", text: "text-brick" },
] as const;

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1200px] gap-14 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-leaf">Nutrition, made local</p>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-[64px]">
              Eat a balanced diet on a Kenyan budget.
            </h1>
            <p className="mt-6 max-w-[520px] text-lg text-muted">
              Learn what a balanced plate looks like with foods you can actually find — ugali,
              sukuma wiki, terere, omena, ndengu — and ask a nutrition helper your questions.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <Link
                to="/learn"
                className="rounded bg-leaf px-6 py-3 font-semibold text-surface transition-colors hover:bg-ink"
              >
                Learn the basics
              </Link>
              <Link
                to="/ask"
                className="text-sm font-semibold underline underline-offset-4 hover:text-leaf"
              >
                Ask the helper
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted">
              General nutrition information — not medical advice.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="border border-hairline bg-surface p-8">
              <p className="text-xs uppercase tracking-widest text-muted">A balanced plate</p>
              <div className="mt-5 flex flex-col gap-4">
                {PLATE.map((p) => (
                  <div key={p.label} className="flex items-center gap-4">
                    <span className={`num text-3xl font-semibold ${p.text}`}>{p.share}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{p.label}</p>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded bg-hairline">
                        <div
                          className={`h-full ${p.tone}`}
                          style={{ width: p.share === "½" ? "50%" : "25%" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted">
                A common teaching aid consistent with WHO healthy-diet guidance — a starting point,
                not a rigid rule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            { n: "76.3%", label: "of Kenyans cannot afford a healthy diet (FAO SOFI 2026)" },
            {
              n: `${KFCT_FOOD_COUNT}`,
              label: "local foods with nutrition data from the Kenya Food Composition Tables 2018",
            },
            { n: "0", label: "accounts required — nothing to sign up for" },
          ].map((s) => (
            <div key={s.label}>
              <p className="num text-4xl font-semibold text-ink md:text-5xl">{s.n}</p>
              <p className="mt-3 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Three things you can do */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-20 sm:px-6 md:grid-cols-3">
          {[
            {
              to: "/learn" as const,
              tag: "01",
              tone: "text-leaf",
              title: "Learn the basics",
              body: "What a balanced plate is, how often to eat each food group, and simple limits on salt, sugar and fat — grounded in WHO and Kenyan guidance.",
              cta: "Start learning →",
            },
            {
              to: "/ask" as const,
              tag: "02",
              tone: "text-enamel",
              title: "Ask the helper",
              body: "A friendly AI helper for nutrition and balanced-diet questions, tuned for local foods and budgets. It steers medical questions to a professional.",
              cta: "Ask a question →",
            },
            {
              to: "/foods" as const,
              tag: "03",
              tone: "text-brick",
              title: "Look up foods",
              body: "Browse local foods and their nutrition per typical serving — energy, protein, fibre, iron, calcium and vitamins — straight from the KFCT 2018.",
              cta: "Browse foods →",
            },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group flex flex-col border border-hairline bg-surface p-8 transition-colors hover:border-ink"
            >
              <p className={`text-xs uppercase tracking-widest ${c.tone}`}>{c.tag}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{c.title}</h2>
              <p className="mt-4 flex-1 text-sm text-muted">{c.body}</p>
              <span className="mt-6 text-sm font-semibold text-leaf group-hover:text-ink">
                {c.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Lishe */}
      <section className="border-b border-hairline bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <p className="text-xs uppercase tracking-widest text-leaf">Why Lishe</p>
          <h2 className="mt-3 max-w-[720px] font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Built for the food you actually eat.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Kenyan food, not American",
                body: "Ugali, githeri, sukuma wiki, terere, mrenda, ndengu, njahi, omena, matoke. Search by the name you know — the site finds the KFCT entry.",
              },
              {
                title: "Real data, cited",
                body: "Every nutrient number comes from the Kenya Food Composition Tables 2018 (FAO / Government of Kenya). Every article on Learn links to WHO, FAO, MoH or UNICEF.",
              },
              {
                title: "No accounts, no ads",
                body: "Nothing to sign up for. No tracking. Your Ask chat history is saved only in your browser — we never store it on our servers.",
              },
            ].map((c) => (
              <div key={c.title}>
                <h3 className="font-display text-lg font-bold text-ink">{c.title}</h3>
                <p className="mt-3 text-sm text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section>
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
          <p className="text-xs uppercase tracking-widest text-muted">Where this comes from</p>
          <p className="mt-3 max-w-[680px] text-sm text-ink">
            Kenya Food Composition Tables 2018 (FAO / Government of Kenya) · WHO healthy-diet
            guidance · Kenya Ministry of Health food-based dietary guidelines.
          </p>
          <p className="mt-3 max-w-[680px] text-xs text-muted">
            Lishe gives general nutrition information, not medical advice. For a condition,
            pregnancy, or a sick child, see a doctor or a KNDI-registered nutritionist.
          </p>
        </div>
      </section>
    </div>
  );
}
