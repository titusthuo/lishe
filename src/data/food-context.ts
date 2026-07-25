// Retrieval for the Ask helper. Gemini has no knowledge of the Kenya Food
// Composition Tables, so foods like "Busara" simply don't exist to it. This
// module finds the foods a question is actually about and formats their real
// rows so the model answers from our data instead of guessing.

// Imported with explicit .ts extensions so scripts/eval_ask.ts can load this
// module under plain node and evaluate the grounding the site actually sends.
import { KFCT_FOODS, KFCT_GROUPS, type KfctFood } from "./foodsKfct.ts";
import { LEARN_ARTICLES, LEARN_TOPICS } from "./learn.ts";

const MAX_FOODS = 8;

// A food token has to carry real weight before it pulls a row in. "busara" is
// unique to one row and scores ~3.8; "raw" or "boiled" land far below this.
const MIN_SCORE = 1.6;

// Dropped from both the index and the question. Three kinds of noise: English
// function words; nutrient names, which matter because a few KFCT entries list
// nutrients in their own name ("...fortified (iron, thiamin...)") and would
// otherwise answer "how much iron in terere"; and colours, which are moderately
// rare across the table yet never what a question is really about.
const STOPWORDS = new Set(
  `a an and are as at be best better but by can cheap cheapest content daily day do does eat
   eating energy every find food foods for from get give good has have healthy health high how
   i if in is it its know level like low make many me meal meals mineral minerals much my no not
   nutrient nutrients of on or per rich should so source sources tell than that the their them
   then there they this to too up us use value values vs was we week what when where which who
   why will with without you your amount calorie calories carb carbs carbohydrate carbohydrates
   calcium fat fats fibre fiber iron kcal kenya kenyan potassium protein proteins salt sodium
   sugar sugars vitamin vitamins zinc
   black brown green red white yellow`
    .split(/\s+/)
    .filter(Boolean),
);

// Crude singulariser. It only has to be consistent across the index and the
// question, so "leaves" -> "leave" is harmless as long as both sides agree.
function stem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(?:oe|se|xe|ze|che|she)s$/.test(token)) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

// Curly quotes and parentheses are common in KFCT names (“Busara” (Whole Maize…)),
// so strip everything that isn't a letter or digit before comparing.
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function foodTokens(food: KfctFood): string[] {
  return [...new Set(tokenize([food.name, ...food.aliases].join(" ")))];
}

const TOKENS: string[][] = KFCT_FOODS.map(foodTokens);

// Inverse document frequency: "busara" appears once and identifies a food;
// "raw" appears in hundreds and identifies nothing.
const WEIGHTS = new Map<string, number>();
{
  const df = new Map<string, number>();
  for (const tokens of TOKENS) {
    for (const t of tokens) df.set(t, (df.get(t) ?? 0) + 1);
  }
  for (const [token, count] of df) {
    WEIGHTS.set(token, Math.log(KFCT_FOODS.length / count));
  }
}

function matchFoods(question: string, limit = MAX_FOODS): KfctFood[] {
  const asked = new Set(tokenize(question));
  if (asked.size === 0) return [];

  const scored: Array<{ food: KfctFood; score: number }> = [];

  for (let i = 0; i < KFCT_FOODS.length; i++) {
    const tokens = TOKENS[i];
    let matched = 0;
    let score = 0;
    for (const t of tokens) {
      if (!asked.has(t)) continue;
      matched++;
      score += WEIGHTS.get(t) ?? 0;
    }
    if (matched === 0) continue;

    // Reward rows the question describes fully, so "maize flour" beats a
    // porridge that merely mentions maize among five other words.
    const coverage = matched / tokens.length;
    const final = score * (0.5 + 0.5 * coverage);
    if (final >= MIN_SCORE) scored.push({ food: KFCT_FOODS[i], score: final });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.food);
}

function nutrients(food: KfctFood): string {
  const fields: Array<[string, number | null, string]> = [
    ["energy", food.kcal, "kcal"],
    ["protein", food.protein, "g"],
    ["fat", food.fat, "g"],
    ["carbohydrate", food.carb, "g"],
    ["fibre", food.fibre, "g"],
    ["calcium", food.calcium, "mg"],
    ["iron", food.iron, "mg"],
    ["zinc", food.zinc, "mg"],
    ["sodium", food.sodium, "mg"],
    ["potassium", food.potassium, "mg"],
    ["vitamin A (RAE)", food.vitA, "µg"],
    ["vitamin C", food.vitC, "mg"],
  ];
  return fields
    .filter(([, value]) => value !== null)
    .map(([label, value, unit]) => `${label} ${value}${unit}`)
    .join(", ");
}

function formatFoodContext(foods: KfctFood[]): string {
  if (foods.length === 0) return "";
  const rows = foods
    .map(
      (f) =>
        `- ${f.name} — group: ${f.group}; page: /foods/${f.code}; per 100 g edible portion: ${nutrients(f)}`,
    )
    .join("\n");

  return `FOOD DATA from this site's copy of the Kenya Food Composition Tables 2018 (FAO / Government of Kenya). These rows are authoritative — the numbers below are correct even if they differ from what you remember, and these foods exist even if you have not heard of them.

${rows}

Use these values when the question is about these foods. Quote them as "per 100 g", credit the Kenya Food Composition Tables 2018, and link the food's page. If the question is about a food that is not listed above, do not invent numbers for it.`;
}

// Follow-ups ("and how much iron?") name no food, so fall back to the recent
// questions before giving up on grounding the answer.
export function buildFoodContext(messages: Array<{ role: string; content: string }>): string {
  const questions = messages.filter((m) => m.role === "user").map((m) => m.content);
  if (questions.length === 0) return "";

  let foods = matchFoods(questions[questions.length - 1]);
  if (foods.length === 0) foods = matchFoods(questions.slice(-3).join(" "));
  return formatFoodContext(foods);
}

// Static, cheap, and always sent: lets the helper describe the site and point
// people at the right page instead of guessing at what Lishe offers.
export const SITE_CONTEXT = `ABOUT THIS SITE (Lishe)
Lishe is a free nutrition-education site for Kenya. It has no accounts and stores nothing on its servers; chats are saved only in the visitor's own browser.

Pages:
- / — home
- /foods — searchable explorer of ${KFCT_FOODS.length} Kenyan foods from the Kenya Food Composition Tables 2018, with per-100 g nutrient values. Individual foods are at /foods/<code>.
- /learn — ${LEARN_ARTICLES.length} hand-checked articles from WHO, FAO, Kenya's Ministry of Health and UNICEF.
- /ask — this helper.
- /about, /contact, /privacy, /terms

Food groups on /foods: ${KFCT_GROUPS.join(", ")}.
Topics on /learn: ${LEARN_TOPICS.join(", ")}.

When a question is covered by a page here, mention it by its path (for example "see /foods/15018") so the visitor can read the source data themselves.`;
