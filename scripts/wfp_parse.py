"""Parse WFP Kenya food prices CSV into clean latest-retail-price data.

Output: for each (market, commodity) keep the most recent RETAIL price, normalised
to KES per kg where the unit is a mass. Also compute a national + per-region
median latest price per commodity for fallback when a market lacks an item.
"""
import csv, json, re, statistics
from collections import defaultdict

CSV = "/home/hp/Downloads/wfp_food_prices_ken (1).csv"
OUT = "/home/hp/plate-planner-main/scripts/wfp_prices.json"

def unit_to_kg_factor(unit):
    """Return kg represented by one 'unit', or None if not mass-based."""
    u = unit.strip().lower()
    m = re.match(r"([\d.]+)\s*(kg|g)\b", u)
    if m:
        val = float(m.group(1)); return val/1000 if m.group(2) == "g" else val
    if u in ("kg",): return 1.0
    if u in ("g", "gram"): return 0.001
    return None  # L, ml, pcs, unit, etc. -> not a mass

def main():
    # (market, commodity) -> best (date, price_per_kg, region, unit, raw_price)
    best = {}
    with open(CSV, newline="") as fh:
        r = csv.DictReader(fh)
        for row in r:
            if row.get("pricetype", "").strip() != "Retail":
                continue
            if row.get("currency", "").strip() != "KES":
                continue
            try:
                price = float(row["price"])
            except (ValueError, KeyError):
                continue
            factor = unit_to_kg_factor(row.get("unit", ""))
            if not factor:
                continue
            ppk = price / factor
            date = row["date"]; market = row["market"].strip(); commodity = row["commodity"].strip()
            region = row["admin1"].strip()
            key = (market, commodity)
            cur = best.get(key)
            if cur is None or date > cur["date"]:
                best[key] = {"date": date, "price_per_kg": round(ppk, 2),
                             "region": region, "unit": row["unit"].strip(),
                             "market": market, "commodity": commodity}

    # National + regional median latest price per commodity
    by_comm = defaultdict(list)
    by_comm_region = defaultdict(list)
    for (market, commodity), v in best.items():
        by_comm[commodity].append(v["price_per_kg"])
        by_comm_region[(commodity, v["region"])].append(v["price_per_kg"])

    national = {c: round(statistics.median(vs), 2) for c, vs in by_comm.items()}
    regional = {f"{c}|{reg}": round(statistics.median(vs), 2)
                for (c, reg), vs in by_comm_region.items()}

    markets = sorted({m for (m, _c) in best})
    regions = sorted({v["region"] for v in best.values() if v["region"]})

    out = {
        "generated_from": "WFP Global Food Prices (Kenya), retail only, latest per market",
        "commodities": sorted(by_comm),
        "markets": markets,
        "regions": regions,
        "national_median_per_kg": national,
        "regional_median_per_kg": regional,
        "market_prices": [best[k] for k in best],
    }
    json.dump(out, open(OUT, "w"), indent=1)
    print("markets:", len(markets), "regions:", len(regions), "commodities:", len(by_comm))
    print("market-commodity price points:", len(best))
    print("\nNational median KES/kg (latest per market):")
    for c in sorted(national):
        # show a few relevant staples
        if c in ("Maize flour","Maize flour (white)","Beans","Beans (dry)","Rice","Kale",
                 "Milk (cow, pasteurized)","Potatoes (Irish)","Sugar","Cowpeas (dry)",
                 "Spinach","Cabbage","Tomatoes","Sorghum","Bananas","Wheat flour","Oil (vegetable)"):
            print(f"  {c:32s} {national[c]:8.1f}  (latest sample date varies)")

if __name__ == "__main__":
    main()
