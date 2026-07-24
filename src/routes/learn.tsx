import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LEARN_ARTICLES,
  LEARN_TOPICS,
  type LearnArticle,
  type LearnSource,
} from "@/data/learn";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — eating a balanced diet | Lishe" },
      {
        name: "description",
        content:
          "The basics of a balanced diet, plus a curated library of trusted nutrition reading from the WHO, FAO, Kenya Ministry of Health and UNICEF.",
      },
      { property: "og:title", content: "Learn — eating a balanced diet | Lishe" },
      {
        property: "og:description",
        content:
          "Balanced-diet basics and a curated reading library from WHO, FAO, Kenya MoH and UNICEF.",
      },
    ],
  }),
  component: Learn,
});

const GROUPS: Array<{ name: string; role: string; examples: string }> = [
  {
    name: "Staples (energy)",
    role: "Give you energy to get through the day.",
    examples: "Ugali, rice, chapati, sweet potato, arrowroot, matoke, cassava",
  },
  {
    name: "Body-building foods (protein)",
    role: "Build and repair muscles; vital for children.",
    examples: "Beans, ndengu, njahi, omena, eggs, milk, fish, meat",
  },
  {
    name: "Vegetables & fruit (protective)",
    role: "Vitamins, minerals and fibre that protect against disease.",
    examples: "Sukuma wiki, terere, managu, mrenda, tomato, oranges, mango, banana",
  },
  {
    name: "Fats & oils (in moderation)",
    role: "Concentrated energy; help absorb some vitamins.",
    examples: "Avocado, groundnuts, cooking oil — small amounts",
  },
];

const PLATE = [
  { part: "½ your plate", what: "Vegetables and fruit", tone: "text-leaf" },
  { part: "¼ your plate", what: "Whole-grain staples", tone: "text-enamel" },
  { part: "¼ your plate", what: "Body-building foods (protein)", tone: "text-brick" },
];

const LIMITS: Array<{ label: string; guide: string }> = [
  {
    label: "Salt",
    guide:
      "Less than 5 g a day — about one teaspoon (WHO). Use iodised salt, but use it sparingly. Watch soups, crisps and processed foods.",
  },
  {
    label: "Added sugar",
    guide:
      "Keep free sugars under 10% of your daily energy — about 50 g, or 12 teaspoons, on a 2,000-kcal day (WHO). Sodas and sweet tea add up fast.",
  },
  {
    label: "Fats",
    guide:
      "Keep total fat at 30% or less of energy, and saturated fat under 10% (WHO). Use oil in moderation; choose avocado, groundnuts and fish.",
  },
  {
    label: "Water",
    guide: "Drink plenty of safe water through the day instead of sugary drinks.",
  },
];

const HOW_OFTEN: Array<{ freq: string; what: string }> = [
  { freq: "Every day", what: "Vegetables and fruit; fresh or fermented milk or yoghurt" },
  { freq: "≥ 4× a week", what: "Beans, peas, lentils, cowpeas, pigeon peas, soya, nuts and seeds" },
  { freq: "≥ 2× a week", what: "Lean meat, fish, poultry, insects or eggs" },
  { freq: "Sparingly", what: "Sugar, solid fat and salt" },
];

// Each topic gets a distinct pair of tones and an inline SVG illustration so
// every card carries a small piece of imagery without pulling remote assets.
const TOPIC_COLOR: Record<string, { bg: string; accent: string; text: string }> = {
  "Balanced diet": { bg: "bg-leaf-soft", accent: "bg-leaf", text: "text-leaf" },
  "Salt, sugar, fat": { bg: "bg-brick-soft", accent: "bg-brick", text: "text-brick" },
  "Fruit & vegetables": { bg: "bg-leaf-soft", accent: "bg-leaf", text: "text-leaf" },
  "Iron & vitamin A": { bg: "bg-enamel-soft", accent: "bg-enamel", text: "text-enamel" },
  Children: { bg: "bg-enamel-soft", accent: "bg-enamel", text: "text-enamel" },
  "Pregnancy & breastfeeding": { bg: "bg-brick-soft", accent: "bg-brick", text: "text-brick" },
  "Food security": { bg: "bg-hairline", accent: "bg-ink", text: "text-ink" },
};

// Palette matches src/styles.css @theme.
const LEAF = "#2F5D3A";
const LEAF_LIGHT = "#5B8A62";
const ENAMEL = "#1F4E8C";
const ENAMEL_LIGHT = "#5B7CB0";
const BRICK = "#A63D2F";
const BRICK_LIGHT = "#C56F62";
const INK = "#181815";
const CREAM = "#FBFAF8";

function TopicArt({ topic }: { topic: string }) {
  const wrap = "absolute right-0 top-0 h-40 w-40 -mr-2 -mt-2";
  switch (topic) {
    case "Balanced diet":
      // A tilted plate split into vegetables (½), staples (¼) and protein (¼).
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          <ellipse cx="60" cy="66" rx="46" ry="12" fill={INK} opacity="0.08" />
          <circle cx="60" cy="60" r="44" fill={CREAM} stroke={INK} strokeWidth="2.5" />
          <path d="M60 60 L60 16 A44 44 0 0 0 16 60 Z" fill={LEAF} />
          <path d="M60 60 L60 104 A44 44 0 0 1 16 60 Z" fill={LEAF_LIGHT} />
          <path d="M60 16 A44 44 0 0 1 104 60 L60 60 Z" fill={ENAMEL} />
          <path d="M104 60 A44 44 0 0 1 60 104 L60 60 Z" fill={BRICK} />
          <circle cx="60" cy="60" r="6" fill={CREAM} stroke={INK} strokeWidth="2" />
        </svg>
      );

    case "Salt, sugar, fat":
      // A salt shaker with a sugar cube and a droplet of oil.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* Salt shaker */}
          <path d="M40 32 h28 l4 8 v40 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 v-40 z" fill={BRICK_LIGHT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M40 40 h32" stroke={INK} strokeWidth="2" />
          <path d="M40 32 h28 l4 8 h-32 z" fill={BRICK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="48" cy="36" r="1.2" fill={CREAM} />
          <circle cx="54" cy="36" r="1.2" fill={CREAM} />
          <circle cx="60" cy="36" r="1.2" fill={CREAM} />
          {/* Sprinkling grains */}
          <circle cx="34" cy="94" r="2" fill={INK} />
          <circle cx="28" cy="102" r="1.5" fill={INK} />
          <circle cx="40" cy="100" r="1.5" fill={INK} />
          {/* Sugar cube */}
          <rect x="82" y="72" width="18" height="18" fill={CREAM} stroke={INK} strokeWidth="2" rx="2" />
          <path d="M82 78 h18 M82 84 h18 M88 72 v18 M94 72 v18" stroke={INK} strokeWidth="0.8" opacity="0.4" />
          {/* Oil droplet */}
          <path d="M96 34 c-6 8 -8 12 -8 16 a8 8 0 0 0 16 0 c0 -4 -2 -8 -8 -16 z" fill={LEAF_LIGHT} stroke={INK} strokeWidth="2" />
        </svg>
      );

    case "Fruit & vegetables":
      // Tomato + leafy green + orange citrus wedge.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* Tomato */}
          <circle cx="38" cy="66" r="22" fill={BRICK} stroke={INK} strokeWidth="2" />
          <path d="M30 46 q4 -8 8 -6 q4 -2 8 6 q-2 4 -8 4 q-6 0 -8 -4 z" fill={LEAF} stroke={INK} strokeWidth="2" />
          <circle cx="30" cy="60" r="2" fill={CREAM} opacity="0.5" />
          {/* Leafy green */}
          <path d="M78 30 q-14 6 -18 26 q-2 12 8 18 q10 -4 14 -20 q4 -14 -4 -24 z" fill={LEAF} stroke={INK} strokeWidth="2" />
          <path d="M76 40 q-6 20 -4 30" stroke={LEAF_LIGHT} strokeWidth="1.8" fill="none" />
          <path d="M76 40 q-8 4 -10 12 M76 50 q-6 4 -8 10 M76 60 q-4 4 -6 8" stroke={LEAF_LIGHT} strokeWidth="1.2" fill="none" />
          {/* Citrus wedge */}
          <path d="M100 84 a20 20 0 0 0 -20 -20 L100 84 z" fill={BRICK_LIGHT} stroke={INK} strokeWidth="2" />
          <path d="M100 84 L92 74 M100 84 L84 78 M100 84 L86 68" stroke={INK} strokeWidth="1" opacity="0.5" />
        </svg>
      );

    case "Iron & vitamin A":
      // A leaf holding a golden sun and a droplet — nutrients from plants.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* Leaf */}
          <path d="M28 92 q-4 -40 32 -60 q40 -18 40 20 q0 40 -40 44 q-24 2 -32 -4 z" fill={LEAF} stroke={INK} strokeWidth="2" />
          <path d="M32 88 q28 -32 60 -50" stroke={LEAF_LIGHT} strokeWidth="1.8" fill="none" />
          {/* Sun (vitamin A) */}
          <circle cx="80" cy="46" r="12" fill={BRICK_LIGHT} stroke={INK} strokeWidth="2" />
          <path d="M80 26 v6 M80 60 v6 M60 46 h6 M94 46 h6 M66 32 l4 4 M90 56 l4 4 M66 60 l4 -4 M90 36 l4 -4" stroke={BRICK} strokeWidth="2" strokeLinecap="round" />
          {/* Blood drop (iron) */}
          <path d="M40 60 c-6 8 -8 12 -8 16 a8 8 0 0 0 16 0 c0 -4 -2 -8 -8 -16 z" fill={BRICK} stroke={INK} strokeWidth="2" />
          <circle cx="38" cy="72" r="1.6" fill={CREAM} opacity="0.7" />
        </svg>
      );

    case "Children":
      // Warm bowl of porridge with a spoon and steam.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* Steam */}
          <path d="M40 24 q-4 8 0 16 q4 8 0 16" stroke={ENAMEL_LIGHT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M56 20 q-4 8 0 16 q4 8 0 16" stroke={ENAMEL_LIGHT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M72 24 q-4 8 0 16 q4 8 0 16" stroke={ENAMEL_LIGHT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* Bowl */}
          <path d="M18 68 h84 a6 6 0 0 1 -6 22 h-72 a6 6 0 0 1 -6 -22 z" fill={ENAMEL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="60" cy="68" rx="42" ry="6" fill={BRICK_LIGHT} stroke={INK} strokeWidth="2" />
          <circle cx="46" cy="66" r="2" fill={CREAM} />
          <circle cx="60" cy="70" r="2.4" fill={LEAF_LIGHT} />
          <circle cx="72" cy="66" r="1.8" fill={CREAM} />
          {/* Spoon */}
          <ellipse cx="98" cy="52" rx="6" ry="10" transform="rotate(30 98 52)" fill={CREAM} stroke={INK} strokeWidth="2" />
          <path d="M104 60 l14 26" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "Pregnancy & breastfeeding":
      // Silhouette holding a warm apple — nourishment for two.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* Head */}
          <circle cx="52" cy="26" r="10" fill={BRICK_LIGHT} stroke={INK} strokeWidth="2" />
          {/* Torso */}
          <path d="M40 38 q0 -4 6 -4 h12 q6 0 6 4 q4 14 8 22 q6 12 -4 20 q-4 2 -8 0 q0 12 -2 20 h-16 q-2 -8 -2 -20 q-4 2 -8 0 q-10 -8 -4 -20 q4 -8 8 -22 z" fill={BRICK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          {/* Apple in arms */}
          <circle cx="78" cy="66" r="14" fill={LEAF} stroke={INK} strokeWidth="2" />
          <path d="M78 52 q0 -4 4 -6" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M80 50 q6 -4 10 -2" fill={LEAF_LIGHT} stroke={INK} strokeWidth="1.5" />
        </svg>
      );

    case "Food security":
      // Household roof + a grain sheaf inside = food at home.
      return (
        <svg className={wrap} viewBox="0 0 120 120" aria-hidden>
          {/* House shield */}
          <path d="M20 60 L60 22 L100 60 V100 H20 Z" fill={ENAMEL} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 60 L60 22 L100 60" fill={ENAMEL_LIGHT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          {/* Grain sheaf */}
          <path d="M60 96 v-32" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="60" cy="62" rx="4" ry="8" fill={BRICK_LIGHT} stroke={INK} strokeWidth="1.5" />
          <ellipse cx="52" cy="66" rx="4" ry="8" transform="rotate(-20 52 66)" fill={BRICK_LIGHT} stroke={INK} strokeWidth="1.5" />
          <ellipse cx="68" cy="66" rx="4" ry="8" transform="rotate(20 68 66)" fill={BRICK_LIGHT} stroke={INK} strokeWidth="1.5" />
          <ellipse cx="46" cy="74" rx="4" ry="8" transform="rotate(-30 46 74)" fill={BRICK} stroke={INK} strokeWidth="1.5" />
          <ellipse cx="74" cy="74" rx="4" ry="8" transform="rotate(30 74 74)" fill={BRICK} stroke={INK} strokeWidth="1.5" />
          {/* Ground */}
          <path d="M20 100 h80" stroke={INK} strokeWidth="2" />
        </svg>
      );

    default:
      return null;
  }
}

const SOURCE_HINT: Record<LearnSource, string> = {
  WHO: "World Health Organization",
  FAO: "Food and Agriculture Organization of the UN",
  "Kenya MoH": "Kenya Ministry of Health",
  UNICEF: "United Nations Children's Fund",
};

function Learn() {
  const [topic, setTopic] = useState<string | null>(null);
  const [source, setSource] = useState<LearnSource | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return LEARN_ARTICLES.filter((a) => {
      if (topic && a.topic !== topic) return false;
      if (source && a.source !== source) return false;
      if (term && !(`${a.title} ${a.summary}`.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [q, topic, source]);

  const sources: LearnSource[] = ["WHO", "FAO", "Kenya MoH", "UNICEF"];

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-widest text-leaf">Learn</p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">
        Eating a balanced diet
      </h1>
      <p className="mt-4 max-w-[640px] text-lg text-muted">
        A balanced diet just means eating a variety of foods, in the right amounts, so your body
        gets the energy and nutrients it needs. Here's how that looks with everyday Kenyan meals.
      </p>

      <section className="mt-14 max-w-[820px]">
        <h2 className="font-display text-2xl font-bold">The food groups</h2>
        <p className="mt-2 text-muted">
          Kenyan food-based dietary guidelines group foods by what they do for the body. A good meal
          pulls from several — staples with at least two or three other groups.
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

      <section className="mt-14 max-w-[820px]">
        <h2 className="font-display text-2xl font-bold">The balanced plate</h2>
        <p className="mt-2 text-muted">
          A simple way to picture a meal: fill half your plate with vegetables and fruit, a quarter
          with staples, and a quarter with protein.
        </p>
        <div className="mt-6 space-y-3">
          {PLATE.map((p) => (
            <div key={p.part} className="flex items-center gap-4 border border-hairline bg-surface p-4">
              <span className={`num w-28 shrink-0 font-display text-lg font-bold ${p.tone}`}>{p.part}</span>
              <span className="text-ink">{p.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 max-w-[820px]">
        <h2 className="font-display text-2xl font-bold">How often to eat what</h2>
        <p className="mt-2 text-muted">
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

      <section className="mt-14 max-w-[820px]">
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

      <section className="mt-20 border-t border-hairline pt-14">
        <p className="text-xs uppercase tracking-widest text-leaf">Reading library</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          Trusted articles on nutrition and balanced diet
        </h2>
        <p className="mt-3 max-w-[720px] text-muted">
          Every article below is a hand-picked, current publication from the World Health
          Organization, FAO, the Kenya Ministry of Health, or UNICEF. Tap any card to read the
          original source in a new tab.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles — e.g. salt, breastfeeding, iron…"
            className="w-full max-w-md rounded border border-hairline bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setTopic(null)}
              className={`rounded border px-3 py-1.5 ${
                topic === null ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"
              }`}
            >
              All topics
            </button>
            {LEARN_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`rounded border px-3 py-1.5 ${
                  topic === t ? "border-ink bg-ink text-surface" : "border-hairline bg-surface"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSource(null)}
              className={`rounded border px-3 py-1.5 ${
                source === null ? "border-leaf bg-leaf text-surface" : "border-hairline bg-surface"
              }`}
            >
              All sources
            </button>
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`rounded border px-3 py-1.5 ${
                  source === s ? "border-leaf bg-leaf text-surface" : "border-hairline bg-surface"
                }`}
                title={SOURCE_HINT[s]}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            Showing <span className="num font-semibold text-ink">{filtered.length}</span> of{" "}
            <span className="num font-semibold text-ink">{LEARN_ARTICLES.length}</span> articles.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} a={a} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted">
              No articles match those filters. Try clearing them or searching a different word.
            </p>
          )}
        </div>
      </section>

      <div className="mt-16 border border-brick bg-brick-soft p-6 text-brick">
        <p className="text-base font-semibold">This is nutrition information, not medical advice.</p>
        <p className="mt-2 text-sm">
          If you're pregnant, managing a condition, or feeding a sick child, speak to a doctor or a
          KNDI-registered nutritionist.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to="/ask"
          className="rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink"
        >
          Ask the nutrition helper →
        </Link>
        <Link
          to="/foods"
          className="rounded border border-ink px-6 py-3 font-semibold hover:bg-ink hover:text-surface"
        >
          Browse foods
        </Link>
      </div>
    </div>
  );
}

function ArticleCard({ a }: { a: LearnArticle }) {
  const c = TOPIC_COLOR[a.topic] ?? TOPIC_COLOR["Balanced diet"];
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col border border-hairline bg-surface transition-colors hover:border-ink"
    >
      <div className={`relative flex h-40 items-end overflow-hidden ${c.bg}`}>
        <div className={`absolute inset-y-0 left-0 w-1.5 ${c.accent}`} />
        <TopicArt topic={a.topic} />
        <div className="relative flex w-full items-end justify-between p-5">
          <span className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>
            {a.topic}
          </span>
          <span className="rounded border border-ink bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
            {a.source}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-muted">Published {a.year}</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink group-hover:text-leaf">
          {a.title}
        </h3>
        <p className="mt-3 flex-1 text-sm text-muted">{a.summary}</p>
        <span className="mt-6 text-sm font-semibold text-leaf group-hover:text-ink">
          Read on {a.source} ↗
        </span>
      </div>
    </a>
  );
}
