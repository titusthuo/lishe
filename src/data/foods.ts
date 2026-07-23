// Lishe food + pricing model.
// Nutrition: Kenya Food Composition Tables 2018 (per 100 g) — see scripts/gen_data.py.
// Prices: WFP Global Food Prices (Kenya), retail, by region; falls back to a labelled estimate.
import {
  GEN_FOODS,
  REGIONAL_PRICE_PER_KG,
  NATIONAL_PRICE_PER_KG,
  REGION_PRICE_DATE,
  MKULIMA_PORTION_KES,
  MKULIMA_DATE,
  type GenFood,
} from "./generated";
import { NATIONAL, type RegionOption } from "./store";

export type FoodGroup =
  | "Cereals"
  | "Legumes"
  | "Vegetables"
  | "Indigenous vegetables"
  | "Fruits"
  | "Meat"
  | "Fish"
  | "Dairy"
  | "Mixed dishes";

export type Food = GenFood & { group: FoodGroup };

export const FOODS: Food[] = GEN_FOODS as Food[];

export function findFood(code: string): Food | undefined {
  return FOODS.find((f) => f.code === code);
}

const n = (v: number | null): number => v ?? 0;

// ---- Pricing -------------------------------------------------------------
export type PriceSource = "mkulima" | "wfp" | "estimate" | "community";
export interface FoodPrice {
  kes: number;
  source: PriceSource;
  asOf: string | null; // date for WFP, null otherwise
}

function regionTable(region: RegionOption): Record<string, number> {
  if (region === NATIONAL) return NATIONAL_PRICE_PER_KG;
  return REGIONAL_PRICE_PER_KG[region] ?? NATIONAL_PRICE_PER_KG;
}

export function priceFor(
  food: Food,
  region: RegionOption,
  userPrices: Record<string, number> = {},
): FoodPrice {
  const u = userPrices[food.code];
  if (u != null && !Number.isNaN(u)) return { kes: u, source: "community", asOf: null };

  const mk = MKULIMA_PORTION_KES[food.code];
  if (mk != null) return { kes: mk, source: "mkulima", asOf: MKULIMA_DATE };

  if (food.wfpCommodity && food.priceGrams != null) {
    const perKg =
      regionTable(region)[food.wfpCommodity] ?? NATIONAL_PRICE_PER_KG[food.wfpCommodity];
    if (perKg != null) {
      const kes = Math.round((perKg * food.priceGrams) / 1000);
      const asOf = region === NATIONAL ? latestDate() : (REGION_PRICE_DATE[region] ?? null);
      return { kes: Math.max(1, kes), source: "wfp", asOf };
    }
  }
  return { kes: food.estPriceKES, source: "estimate", asOf: null };
}

let _latest: string | null = null;
function latestDate(): string {
  if (_latest) return _latest;
  _latest = Object.values(REGION_PRICE_DATE).sort().at(-1) ?? "";
  return _latest;
}

// ---- Nutrition targets ---------------------------------------------------
export const MEAL_TARGETS = { kcal: 700, protein: 20, fibre: 10, vitC: 30, iron: 5, calcium: 300 };
export const DAY_TARGETS = { kcal: 2100, protein: 60, fibre: 30, vitC: 90, iron: 15, calcium: 900 };

// ---- Plates --------------------------------------------------------------
export interface PlateItem {
  food: Food;
  qty: number;
}
export interface PlateTotals {
  kcal: number;
  protein: number;
  fibre: number;
  vitC: number;
  iron: number;
  calcium: number;
}
export interface Plate {
  id: string;
  items: PlateItem[];
  totals: PlateTotals;
}

function plateTotals(items: PlateItem[]): PlateTotals {
  const t: PlateTotals = { kcal: 0, protein: 0, fibre: 0, vitC: 0, iron: 0, calcium: 0 };
  for (const { food, qty } of items) {
    const factor = (food.portionGrams * qty) / 100;
    t.kcal += n(food.kcal) * factor;
    t.protein += n(food.protein) * factor;
    t.fibre += n(food.fibre) * factor;
    t.vitC += n(food.vitC) * factor;
    t.iron += n(food.iron) * factor;
    t.calcium += n(food.calcium) * factor;
  }
  return t;
}

function makePlate(id: string, codes: Array<[string, number]>): Plate {
  const items: PlateItem[] = [];
  for (const [code, qty] of codes) {
    const f = findFood(code);
    if (f) items.push({ food: f, qty });
  }
  return { id, items, totals: plateTotals(items) };
}

export function plateCost(
  plate: Plate,
  region: RegionOption,
  userPrices: Record<string, number> = {},
): { kes: number; hasEstimate: boolean } {
  let kes = 0;
  let hasEstimate = false;
  for (const { food, qty } of plate.items) {
    const p = priceFor(food, region, userPrices);
    if (p.source === "estimate") hasEstimate = true;
    kes += p.kes * qty;
  }
  return { kes, hasEstimate };
}

const ALL_PLATES: Plate[] = [
  makePlate("githeri-terere-avocado", [["15053", 1], ["04039", 1], ["05003", 1]]),
  makePlate("ugali-sukuma-omena", [["15005", 1], ["04020", 1], ["08002", 1]]),
  makePlate("ndengu-managu-sweetpotato", [["03019", 1], ["04003", 1], ["02014", 1]]),
  makePlate("beans-sukuma-ugali", [["03004", 1], ["04020", 1], ["15005", 1]]),
  makePlate("matoke-kunde-egg", [["15056", 1], ["04066", 1], ["07011", 1]]),
  makePlate("mrenda-ugali-omena", [["04070", 1], ["15005", 1], ["08002", 1]]),
  makePlate("njahi-sweetpotato-orange", [["15114", 1], ["02014", 1], ["05023", 1]]),
  makePlate("githeri-avocado", [["15053", 1], ["05003", 1]]),
  makePlate("ugali-sukuma-egg", [["15005", 1], ["04020", 1], ["07011", 1]]),
  makePlate("rice-ndengu-terere", [["01034", 1], ["03019", 1], ["04039", 1]]),
  makePlate("sorghum-managu-egg", [["01039", 1], ["04003", 1], ["07011", 1]]),
  makePlate("mukimo-egg", [["15054", 1], ["07011", 1]]),
  makePlate("ugali-spinach-beef", [["15005", 1], ["04030", 1], ["07002", 1]]),
  makePlate("rice-beans-tomato", [["01034", 1], ["03004", 1], ["04036", 1]]),
];

export interface PlateFilters {
  vegetarian?: boolean;
  noDairy?: boolean;
  noCooking?: boolean;
  exclude?: string[];
}

const MEAT_GROUPS: FoodGroup[] = ["Meat", "Fish"];
const DAIRY_CODES = ["06022", "07011"];
const NO_COOK_CODES = new Set(["05003", "05004", "05023", "05019", "05024", "06022", "01007"]);

export function suggestPlates(
  budgetKES: number,
  mode: "meal" | "day",
  region: RegionOption,
  userPrices: Record<string, number> = {},
  filters: PlateFilters = {},
): Array<Plate & { cost: number; hasEstimate: boolean }> {
  const budget = mode === "day" ? budgetKES / 3 : budgetKES;
  const excl = new Set(filters.exclude ?? []);
  return ALL_PLATES.map((p) => {
    const { kes, hasEstimate } = plateCost(p, region, userPrices);
    return { ...p, cost: kes, hasEstimate };
  })
    .filter((p) => {
      if (p.cost > budget) return false;
      for (const { food } of p.items) {
        if (excl.has(food.code) || excl.has(food.name.toLowerCase())) return false;
        if (filters.vegetarian && MEAT_GROUPS.includes(food.group)) return false;
        if (filters.noDairy && DAIRY_CODES.includes(food.code)) return false;
        if (filters.noCooking && !NO_COOK_CODES.has(food.code)) return false;
      }
      return true;
    })
    .sort((a, b) => b.totals.protein + b.totals.fibre - (a.totals.protein + a.totals.fibre));
}

export function findPlate(id: string): Plate | undefined {
  return ALL_PLATES.find((p) => p.id === id);
}

// Comparison card: starch-only cheap plate vs a balanced one, same idea, real foods.
export function comparisonBad(): Plate {
  return makePlate("chapati-only", [["15019", 3]]);
}
export function comparisonGood(): Plate {
  return makePlate("githeri-terere-avocado", [["15053", 1], ["04039", 1], ["05003", 1]]);
}

// Nutrient delivered per shilling, at a given region's price.
export function nutrientPerKES(
  food: Food,
  nutrient: "protein" | "iron" | "fibre",
  region: RegionOption,
  userPrices: Record<string, number> = {},
): number {
  const per100 = n(food[nutrient]);
  const price = priceFor(food, region, userPrices).kes;
  if (price <= 0) return 0;
  const gramsPerKES = food.portionGrams / price;
  return (per100 * gramsPerKES) / 100;
}
