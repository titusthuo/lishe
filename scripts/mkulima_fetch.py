"""Refresh scripts/mkulima_prices.json from Mkulima Bora (portal.mkulimabora.org).

WHY THIS IS A SEPARATE SCRIPT:
  The Claude Code sandbox this repo was built in has NO outbound network from the
  shell (curl returns http=000), so ingestion cannot run there. Run this on your
  own networked machine, then commit the refreshed JSON and re-run gen_data.py.

WHAT IT DOES:
  For each food we track, fetch its Mkulima Bora commodity page and pull the
  "average retail price ... Ksh<N>/kg" figure, then write mkulima_prices.json.
  gen_data.py turns per-kg into per-portion using the grams below.

HONESTY NOTES:
  - Only foods with a working Mkulima slug are ingested; the rest keep their
    WFP price or labelled estimate. This is intentional partial coverage.
  - The regex targets the stable "average ... Ksh<number>" sentence. If Mkulima
    changes their markup, FOODS values with no match are skipped (old JSON kept).
  - Verify a couple of numbers by eye against the site before trusting a refresh —
    a scraped feed for money/health data should never be blindly trusted.
"""
import json
import re
import sys
import urllib.request
from datetime import date

# code -> (Mkulima commodity slug, meal grams priced). Extend as slugs are confirmed.
# Slug is the trailing segment of https://portal.mkulimabora.org/market-prices/<slug>
# (e.g. /market-prices/duck). Confirm each slug in a browser before trusting it.
FOODS = {
    "04039": ("amaranth", 120),      # Terere (amaranth leaves)
    "08002": ("omena", 60),          # Omena (silver fish)
    "03019": ("green-grams", 80),    # Ndengu (green gram)
    "05003": ("avocado", 150),       # Avocado
}
BASE = "https://portal.mkulimabora.org/market-prices/{slug}"
PRICE_RE = re.compile(r"average[^.]*?Ksh\s*([\d,]+(?:\.\d+)?)", re.IGNORECASE)
NAMES = {
    "04039": "Terere (amaranth leaves)", "08002": "Omena (silver fish)",
    "03019": "Ndengu (green gram)", "05003": "Avocado",
}


def fetch(slug: str) -> str:
    req = urllib.request.Request(
        BASE.format(slug=slug), headers={"User-Agent": "lishe-price-refresh/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def main() -> int:
    out = []
    for code, (slug, grams) in FOODS.items():
        try:
            html = fetch(slug)
        except Exception as e:  # network/HTTP problem: skip, keep old value
            print(f"SKIP {code} ({slug}): {e}", file=sys.stderr)
            continue
        m = PRICE_RE.search(html)
        if not m:
            print(f"SKIP {code} ({slug}): no price matched", file=sys.stderr)
            continue
        ppk = float(m.group(1).replace(",", ""))
        out.append({"code": code, "name": NAMES[code], "price_per_kg": ppk, "grams": grams})
        print(f"OK {code} {NAMES[code]}: Ksh {ppk}/kg")

    if not out:
        print("No prices fetched; leaving mkulima_prices.json untouched.", file=sys.stderr)
        return 1

    doc = {
        "_source": "Mkulima Bora market portal (portal.mkulimabora.org) — average national retail price per kg.",
        "_note": "Refreshed by scripts/mkulima_fetch.py. Re-run scripts/gen_data.py after updating.",
        "as_of": date.today().isoformat(),
        "prices": out,
    }
    with open("scripts/mkulima_prices.json", "w") as f:
        json.dump(doc, f, indent=2)
        f.write("\n")
    print(f"wrote scripts/mkulima_prices.json ({len(out)} foods)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
