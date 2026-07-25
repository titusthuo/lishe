// Curated library of authoritative nutrition and balanced-diet reading.
// Each entry links to a real, hand-checked source (WHO, FAO, Kenya MoH, UNICEF).
// Add or update entries here only after verifying the URL and summary yourself.

export type LearnSource = "WHO" | "FAO" | "Kenya MoH" | "UNICEF";

export interface LearnArticle {
  id: string;
  title: string;
  summary: string;
  topic: string;
  source: LearnSource;
  year: number;
  url: string;
}

export const LEARN_TOPICS = [
  "Balanced diet",
  "Salt, sugar, fat",
  "Fruit & vegetables",
  "Iron & vitamin A",
  "Children",
  "Pregnancy & breastfeeding",
  "Food security",
] as const;

export type LearnTopic = (typeof LEARN_TOPICS)[number];

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    id: "who-healthy-diet",
    title: "Healthy diet — WHO fact sheet",
    summary:
      "The single best summary of what a healthy adult diet looks like: variety, fruit and vegetables, whole grains, limits on free sugars (<10% of energy), salt (<5 g/day), total fat (≤30%) and saturated fat (<10%).",
    topic: "Balanced diet",
    source: "WHO",
    year: 2020,
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  },
  {
    id: "who-salt",
    title: "Sodium reduction — WHO fact sheet",
    summary:
      "Why most of us eat too much salt, where it hides (bread, soups, processed meats, stock cubes), and the WHO target of under 5 g of salt (2 g sodium) a day.",
    topic: "Salt, sugar, fat",
    source: "WHO",
    year: 2023,
    url: "https://www.who.int/news-room/fact-sheets/detail/sodium-reduction",
  },
  {
    id: "who-sugars-guideline",
    title: "Guideline: Sugars intake for adults and children",
    summary:
      "The official WHO guideline recommending free sugars stay under 10% of daily energy — and ideally under 5% — with practical examples of what that looks like.",
    topic: "Salt, sugar, fat",
    source: "WHO",
    year: 2015,
    url: "https://www.who.int/publications/i/item/9789241549028",
  },
  {
    id: "who-obesity-overweight",
    title: "Obesity and overweight — WHO fact sheet",
    summary:
      "How overweight and obesity develop, their link to diet quality and physical activity, and the population-level actions that help households eat better.",
    topic: "Balanced diet",
    source: "WHO",
    year: 2024,
    url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
  },
  {
    id: "who-anaemia",
    title: "Anaemia — WHO fact sheet",
    summary:
      "Why iron-deficiency anaemia is so common in women and young children, food sources of iron, and the role of iron-rich staples like beans, ndengu, omena and dark leafy greens.",
    topic: "Iron & vitamin A",
    source: "WHO",
    year: 2023,
    url: "https://www.who.int/news-room/fact-sheets/detail/anaemia",
  },
  {
    id: "who-micronutrients",
    title: "Micronutrients — WHO overview",
    summary:
      "The vitamins and minerals the body needs in small amounts and what happens when they're missing: iron, vitamin A, iodine, zinc, folate and vitamin B12.",
    topic: "Iron & vitamin A",
    source: "WHO",
    year: 2024,
    url: "https://www.who.int/health-topics/micronutrients",
  },
  {
    id: "fao-kenya-fbdg",
    title: "Kenya National Guidelines for Healthy Diets and Physical Activity",
    summary:
      "Kenya's own food-based dietary guidelines. The source of the food-group buckets and eating-frequency messages Lishe uses on this page.",
    topic: "Balanced diet",
    source: "Kenya MoH",
    year: 2017,
    // The Ministry's own host (nutritionhealth.or.ke) 503s and FAO's catalogue
    // page for it is unreliable, so this is the Wayback snapshot of the
    // official PDF — authentic document, official origin, stable host. The
    // widely-circulated arua-ncd.org copy is an unofficial mirror.
    url: "https://web.archive.org/web/20250801052233/https://www.nutritionhealth.or.ke/wp-content/uploads/Downloads/National%20Guidelines%20for%20Healthy%20Diets%20and%20Physical%20Activity%202017.pdf",
  },
  {
    id: "fao-kfct-2018",
    title: "Kenya Food Composition Tables (KFCT), 2018",
    summary:
      "The reference dataset behind Lishe's Foods explorer: nutrients per 100 g for hundreds of Kenyan foods, from ugali and terere to omena and githeri.",
    topic: "Balanced diet",
    source: "FAO",
    year: 2018,
    url: "https://openknowledge.fao.org/handle/20.500.14283/I8897EN",
  },
  {
    id: "fao-sofi-2026",
    title: "State of Food Security and Nutrition in the World (SOFI) 2026",
    summary:
      "FAO's annual global report. Contains the figure that 76.3% of Kenyans cannot afford a healthy diet — the reason Lishe exists.",
    topic: "Food security",
    source: "FAO",
    year: 2026,
    url: "https://openknowledge.fao.org/handle/20.500.14283/cd8306en",
  },
  {
    id: "who-fruit-veg",
    title: "Increasing fruit and vegetable consumption",
    summary:
      "Why 400 g a day matters and how to hit it with local produce: sukuma wiki, terere, managu, mrenda, cabbage, tomato, banana, mango, oranges.",
    topic: "Fruit & vegetables",
    source: "WHO",
    year: 2023,
    url: "https://www.who.int/initiatives/behealthy/healthy-diet",
  },
  {
    id: "who-breastfeeding",
    title: "Breastfeeding — WHO",
    summary:
      "Exclusive breastfeeding for the first six months and continued breastfeeding up to 2 years of age or beyond, with clear reasons and support tips.",
    topic: "Pregnancy & breastfeeding",
    source: "WHO",
    year: 2024,
    url: "https://www.who.int/health-topics/breastfeeding",
  },
  {
    id: "who-complementary-feeding",
    title: "Infant and young child feeding — WHO fact sheet",
    summary:
      "What complementary feeding looks like from six months onwards: how often to feed, food consistency, and the mix of animal-source foods, legumes, fruit and vegetables.",
    topic: "Children",
    source: "WHO",
    year: 2023,
    url: "https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding",
  },
  {
    id: "unicef-kenya-nutrition",
    title: "Nutrition in Kenya — UNICEF",
    summary:
      "UNICEF Kenya's overview of the country's nutrition challenges — stunting, wasting, and micronutrient deficiencies — and what families and health workers can do.",
    topic: "Children",
    source: "UNICEF",
    year: 2024,
    url: "https://www.unicef.org/kenya/nutrition",
  },
  {
    id: "who-vitamin-a",
    title: "Vitamin A deficiency — WHO",
    summary:
      "Why vitamin A matters for eyes and immunity, and the everyday foods that carry it: dark green leaves, orange-fleshed sweet potato, mango, carrot, liver.",
    topic: "Iron & vitamin A",
    source: "WHO",
    year: 2023,
    url: "https://www.who.int/data/nutrition/nlis/info/vitamin-a-deficiency",
  },
  {
    id: "who-saturated-fat",
    title: "Saturated fatty acid and trans-fatty acid intake — WHO guideline",
    summary:
      "The WHO recommendation to keep saturated fat under 10% of energy and trans fats under 1%, with practical food-level substitutions.",
    topic: "Salt, sugar, fat",
    source: "WHO",
    year: 2023,
    // who.int/publications/i/item/9789240073630 resets the connection; the IRIS
    // repository handle is WHO's stable permalink for the same guideline.
    url: "https://iris.who.int/handle/10665/375034",
  },
  {
    id: "who-adult-nutrition",
    title: "Nutrition — WHO health topic hub",
    summary:
      "WHO's landing page for nutrition: links out to guidelines on diet quality, food-based dietary guidelines, malnutrition and more. A good starting point.",
    topic: "Balanced diet",
    source: "WHO",
    year: 2024,
    url: "https://www.who.int/health-topics/nutrition",
  },
];
