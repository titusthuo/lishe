"""Generate src/data/generated.ts from real KFCT nutrition + WFP regional prices.

Each curated food carries:
  - nutrition (per 100g) pulled from KFCT 2018 by code (REAL)
  - portionLabel / portionGrams (for the meal shown)
  - wfpCommodity + priceGrams: if set, price = regional WFP KES/kg * priceGrams/1000 (REAL, dated)
  - estPriceKES: fallback per-portion estimate for foods WFP does not track (labelled "estimate")
"""
import json, statistics
from collections import defaultdict
from datetime import date, timedelta

# Prices are medianed over a recent window so old readings don't drag the number
# down. WFP Kenya data pools 2020->2026; a 6-year median badly understates today.
RECENT_WINDOW_DAYS = 365
MIN_RECENT_POINTS = 3  # if a market has fewer recent points, fall back to all-time

KFCT = json.load(open("/home/hp/plate-planner-main/scripts/kfct_raw.json"))
WFP = json.load(open("/home/hp/plate-planner-main/scripts/wfp_prices.json"))
MKULIMA = json.load(open("/home/hp/plate-planner-main/scripts/mkulima_prices.json"))
KD = {f["code"]: f for f in KFCT}
OUT = "/home/hp/plate-planner-main/src/data/generated.ts"

# Mkulima Bora urban-retail portions: code -> per-portion KES (real, dated).
# Ranked above WFP because it tracks Nairobi/urban retail, incl. foods WFP misses.
MKULIMA_KES = {
    p["code"]: round(p["price_per_kg"] * p["grams"] / 1000)
    for p in MKULIMA["prices"]
}
MKULIMA_DATE = MKULIMA["as_of"]

# curated foods: (kfctCode, name, group, portionLabel, portionGrams, wfpCommodity, priceGrams, estPriceKES)
# wfpCommodity None -> not WFP-tracked; price comes from estPriceKES (community/estimate).
FOODS = [
 ("15005","Ugali (maize)","Cereals","1 slab (250g)",250,"Maize flour",100,25),
 ("15053","Githeri (maize + beans)","Mixed dishes","1 plate (300g)",300,None,None,45),
 ("15054","Mukimo","Mixed dishes","1 plate (300g)",300,None,None,60),
 ("15056","Matoke (banana + meat)","Mixed dishes","1 plate (300g)",300,None,None,70),
 ("01034","Rice, white","Cereals","1 plate (~70g dry)",70,"Rice",70,35),
 ("01039","Sorghum ugali","Cereals","1 plate (~80g dry)",80,"Sorghum",80,30),
 ("15019","Chapati","Cereals","1 piece (60g)",60,"Wheat flour",45,20),
 ("01007","White bread","Cereals","2 slices (60g)",60,"Bread",60,15),
 ("02009","Potato, boiled","Vegetables","1 plate (200g)",200,"Potatoes (Irish)",220,30),
 ("02014","Sweet potato, orange","Cereals","1 medium (180g)",180,None,None,30),
 ("02023","Cassava, boiled","Cereals","1 piece (150g)",150,None,None,25),
 ("02020","Arrowroot (nduma)","Cereals","1 piece (150g)",150,None,None,50),
 ("03004","Beans, boiled","Legumes","1 plate (~90g dry)",90,"Beans (dry)",90,40),
 ("15114","Njahi (black bean) stew","Legumes","1 plate (250g)",250,None,None,55),
 ("03019","Ndengu (green gram)","Legumes","1 plate (~80g dry)",80,None,None,45),
 ("04020","Sukuma wiki (kale)","Vegetables","1 serving (150g)",150,"Kale",200,20),
 ("04030","Spinach","Vegetables","1 serving (120g)",120,"Spinach",150,25),
 ("04039","Terere (amaranth leaves)","Indigenous vegetables","1 serving (120g)",120,None,None,20),
 ("04003","Managu (nightshade)","Indigenous vegetables","1 serving (120g)",120,None,None,25),
 ("04070","Mrenda (jute mallow)","Indigenous vegetables","1 serving (120g)",120,None,None,25),
 ("04066","Kunde (cowpea leaves)","Indigenous vegetables","1 serving (120g)",120,None,None,20),
 ("04036","Tomato","Vegetables","2 medium (150g)",150,"Tomatoes",150,20),
 ("13023","Onion, red","Vegetables","1 medium (60g)",60,"Onions (red)",60,10),
 ("08002","Omena (silver fish)","Fish","1 mug (60g)",60,None,None,50),
 ("08010","Tilapia","Fish","1 fillet (120g)",120,None,None,90),
 ("07002","Beef, lean","Meat","1 portion (120g)",120,"Meat (beef)",120,90),
 ("07011","Egg, whole","Dairy",  "1 egg (55g)",55,None,None,20),
 ("06022","Milk, cow, fresh","Dairy","1 cup (250ml)",250,None,None,30),
 ("05003","Avocado","Fruits","1 medium (150g)",150,None,None,20),
 ("05004","Banana","Fruits","1 piece (120g)",120,None,None,15),
 ("05023","Orange","Fruits","1 piece (130g)",130,None,None,20),
 ("05019","Mango","Fruits","1 medium (200g)",200,None,None,30),
 ("05024","Papaya (pawpaw)","Fruits","1 slice (150g)",150,None,None,20),
]

def num(x):
    return None if x is None else round(x, 2)

# --- Build regional & national medians + as-of dates from WFP market points ---
region_pts = defaultdict(lambda: defaultdict(list))   # region -> commodity -> [(date, ppk)]
nat_pts = defaultdict(list)                            # commodity -> [(date, ppk)]
month_pts = defaultdict(lambda: defaultdict(list))    # commodity -> month(1-12) -> [ppk]
region_date = defaultdict(str)
rc_date = defaultdict(str)  # (region,commodity) -> latest date
for p in WFP["market_prices"]:
    reg, com, ppk, dt = p["region"], p["commodity"], p["price_per_kg"], p["date"]
    if not reg:
        continue
    region_pts[reg][com].append((dt, ppk))
    nat_pts[com].append((dt, ppk))
    try:
        month_pts[com][int(dt[5:7])].append(ppk)  # seasonality intentionally pools all years
    except (ValueError, IndexError):
        pass
    if dt > region_date[reg]:
        region_date[reg] = dt
    if dt > rc_date[(reg, com)]:
        rc_date[(reg, com)] = dt

LATEST = max((p["date"] for p in WFP["market_prices"] if p["region"]), default="")
CUTOFF = (date.fromisoformat(LATEST) - timedelta(days=RECENT_WINDOW_DAYS)).isoformat() if LATEST else ""

def recent_median(pairs):
    """Median of the last RECENT_WINDOW_DAYS; falls back to all-time if too sparse."""
    recent = [v for d, v in pairs if d >= CUTOFF]
    use = recent if len(recent) >= MIN_RECENT_POINTS else [v for _, v in pairs]
    return round(statistics.median(use), 2)

REGIONS = sorted(region_pts)
NAT = {c: recent_median(v) for c, v in nat_pts.items()}
REG = {}
for reg in REGIONS:
    REG[reg] = {c: recent_median(v) for c, v in region_pts[reg].items()}

# --- Monthly seasonality index: median price per calendar month vs annual median ---
# Only commodities with data in >=10 of 12 months (enough to be meaningful).
SEASONAL = {}   # commodity -> { index: [12 ints, % vs annual median], months_covered }
for com, months in month_pts.items():
    covered = [m for m in range(1, 13) if months.get(m)]
    if len(covered) < 8:
        continue
    annual = statistics.median([v for _, v in nat_pts[com]])
    if annual <= 0:
        continue
    idx = []
    for m in range(1, 13):
        pts = months.get(m)
        if pts:
            idx.append(round((statistics.median(pts) / annual - 1) * 100))
        else:
            idx.append(None)
    SEASONAL[com] = {"index": idx, "monthsCovered": len(covered)}

# --- Assemble foods with real nutrition ---
missing = []
out_foods = []
for code, name, group, plabel, pg, wc, pgrams, est in FOODS:
    k = KD.get(code)
    if not k or k.get("kcal") is None:
        missing.append((code, name)); continue
    out_foods.append({
        "code": code, "name": name, "group": group,
        "portionLabel": plabel, "portionGrams": pg,
        "wfpCommodity": wc, "priceGrams": pgrams, "estPriceKES": est,
        "kcal": num(k["kcal"]), "protein": num(k["protein"]), "fat": num(k["fat"]),
        "carbs": num(k["carb"]), "fibre": num(k["fibre"]),
        "iron": num(k["iron"]), "calcium": num(k["calcium"]), "zinc": num(k["zinc"]),
        "sodium": num(k["sodium"]), "vitA": num(k["vitA"]), "vitC": num(k["vitC"]),
    })

if missing:
    print("WARNING missing/blank nutrition:", missing)

# --- Emit TypeScript ---
def ts(v):
    if v is None: return "null"
    if isinstance(v, str): return json.dumps(v)
    return repr(v)

lines = []
lines.append("// AUTO-GENERATED by scripts/gen_data.py — do not edit by hand.")
lines.append("// Nutrition: Kenya Food Composition Tables 2018 (per 100 g).")
lines.append("// Prices: WFP Global Food Prices (Kenya), retail, latest per market, median by region.")
lines.append("")
lines.append("export const PRICE_REGIONS = " + json.dumps(REGIONS) + " as const;")
lines.append("export type Region = (typeof PRICE_REGIONS)[number];")
lines.append("")
lines.append("export const REGION_PRICE_DATE: Record<string, string> = " +
             json.dumps({r: region_date[r] for r in REGIONS}, indent=1) + ";")
lines.append("")
lines.append("// Median retail KES per kg, by region then commodity.")
lines.append("export const REGIONAL_PRICE_PER_KG: Record<string, Record<string, number>> = " +
             json.dumps(REG, indent=1) + ";")
lines.append("")
lines.append("// Monthly seasonality: % vs annual median for each WFP commodity (null = no data that month).")
lines.append("export interface SeasonalIndex { index: Array<number | null>; monthsCovered: number; }")
lines.append("export const SEASONAL_INDEX: Record<string, SeasonalIndex> = " +
             json.dumps(SEASONAL, indent=1) + ";")
lines.append("")
lines.append("export const NATIONAL_PRICE_PER_KG: Record<string, number> = " +
             json.dumps(NAT, indent=1) + ";")
lines.append("")
lines.append("// Mkulima Bora urban-retail: per-portion KES by food code (real, dated). Ranked above WFP.")
lines.append("export const MKULIMA_DATE = " + json.dumps(MKULIMA_DATE) + ";")
lines.append("export const MKULIMA_PORTION_KES: Record<string, number> = " +
             json.dumps(MKULIMA_KES, indent=1) + ";")
lines.append("")
lines.append("export interface GenFood {")
for f in ["code","name","group","portionLabel"]:
    lines.append(f"  {f}: string;")
lines.append("  portionGrams: number;")
lines.append("  wfpCommodity: string | null;")
lines.append("  priceGrams: number | null;")
lines.append("  estPriceKES: number;")
for f in ["kcal","protein","fat","carbs","fibre","iron","calcium","zinc","sodium","vitA","vitC"]:
    lines.append(f"  {f}: number | null;")
lines.append("}")
lines.append("")
lines.append("export const GEN_FOODS: GenFood[] = [")
for f in out_foods:
    parts = ", ".join(f"{k}: {ts(v)}" for k, v in f.items())
    lines.append("  { " + parts + " },")
lines.append("];")
lines.append("")
open(OUT, "w").write("\n".join(lines))
print("wrote", OUT)
print("foods:", len(out_foods), "regions:", REGIONS)
print("region dates:", {r: region_date[r] for r in REGIONS})
