import { createFileRoute, Link } from "@tanstack/react-router";
import { KFCT_FOOD_COUNT } from "@/data/foodsMeta";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lishe" },
      {
        name: "description",
        content:
          "Lishe teaches balanced eating using local Kenyan foods, grounded in the Kenya Food Composition Tables 2018 and WHO guidance. Free, no accounts, no ads.",
      },
      { property: "og:title", content: "About — Lishe" },
      {
        property: "og:description",
        content:
          "A Kenya-specific nutrition site: local foods, official data, an AI helper, and clear disclaimers.",
      },
    ],
  }),
  component: About,
});

const DIFFERENCES: Array<{ title: string; body: string }> = [
  {
    title: "Kenyan food, not American",
    body:
      "Most nutrition sites are built around burgers, salads and cereal-bar snacks. Lishe is built around ugali, githeri, sukuma wiki, terere, managu, mrenda, ndengu, njahi, omena, matoke — the food you actually cook and eat.",
  },
  {
    title: "Real data, not vibes",
    body:
      "All nutrient numbers come from the Kenya Food Composition Tables 2018 (FAO / Government of Kenya) — 640+ foods, verified per 100 g. Guidance is grounded in WHO and Kenya Ministry of Health publications, with every source linked on the Learn page.",
  },
  {
    title: "Search by the name you know",
    body:
      "Type \"ndengu\", \"sukuma\", \"omena\", \"terere\", \"githeri\" or \"mukimo\" — you'll find the right KFCT entry even when the book calls it \"Vigna radiata\" or \"Dagaa fish (omena), dried, raw\".",
  },
  {
    title: "AI helper, tuned for Kenya",
    body:
      "The Ask helper uses Google Gemini with a system prompt written for a Kenyan audience — local foods, real budgets, plain language. It stays inside its lane and refers you to a doctor or KNDI-registered nutritionist for anything clinical.",
  },
  {
    title: "Nothing to sign up for",
    body:
      "No account. No email. No tracking scripts. No ads. Your Ask chat history is saved only in your browser so you can come back to it on the same device — we never store it on our servers. (Messages you send are processed by our server and Google's Gemini API to generate a reply, then discarded.)",
  },
  {
    title: "Honest about what we don't know",
    body:
      "Where the KFCT doesn't publish a value, we show \"—\" instead of a made-up number. We don't display retail prices because market prices vary too much to be responsibly automated. When something's a general educational aid, we say so.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-20 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-leaf">About</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">
        Nutrition, made local
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed">
        <p>
          FAO's 2026 SOFI report estimates that <strong>76.3% of Kenyans cannot afford
          the diet the guidelines recommend</strong>. That's not because Kenyans don't care what
          they eat. It's because most nutrition tools are built for supermarket shoppers in
          Nairobi's leafy suburbs, or for New York, and they either recommend food people can't
          buy, or they ignore the food people actually eat.
        </p>
        <p>
          Lishe is a small, honest attempt to fix that. Two things to do here: <strong>learn</strong>{" "}
          what a balanced plate looks like using foods from your kitchen, and <strong>ask</strong>{" "}
          a nutrition helper your own questions. Both are grounded in mainstream, checkable
          guidance — WHO healthy-diet advice and Kenya's food-based dietary guidelines.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">What makes Lishe different</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DIFFERENCES.map((d) => (
            <div key={d.title} className="border border-hairline bg-surface p-6">
              <h3 className="font-display text-lg font-bold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">What's in the site</h2>
        <ul className="mt-4 space-y-3 text-muted">
          <li>
            <span className="font-semibold text-ink">
              <Link to="/learn" className="hover:text-leaf">
                Learn
              </Link>
            </span>{" "}
            — food groups, the balanced plate, how often to eat what, limits on salt and sugar,
            plus a curated reading library from WHO, FAO, Kenya MoH and UNICEF.
          </li>
          <li>
            <span className="font-semibold text-ink">
              <Link to="/foods" className="hover:text-leaf">
                Foods
              </Link>
            </span>{" "}
            — {KFCT_FOOD_COUNT} foods from the Kenya Food Composition Tables 2018, searchable
            by both English and common Kenyan names, with full nutrient values per 100 g.
          </li>
          <li>
            <span className="font-semibold text-ink">
              <Link to="/ask" className="hover:text-leaf">
                Ask
              </Link>
            </span>{" "}
            — a chat helper for nutrition questions on a Kenyan budget. Your conversation stays
            in your browser.
          </li>
        </ul>
      </section>

      <p className="mt-16 text-sm text-muted">
        Lishe provides general nutrition information, not medical advice. For a condition,
        pregnancy, or a sick child, please see a doctor or a KNDI-registered nutritionist.
      </p>
    </div>
  );
}
