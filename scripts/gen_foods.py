#!/usr/bin/env python3
"""Generate src/data/foodsKfct.ts from scripts/kfct_raw.json.

Names come straight from the KFCT 2018 PDF extraction (kfct_extract.py),
which produces clean names; only two records need manual overrides (a
" - " inside a name is read as a null cell by the extractor). This script
attaches curated common-name aliases for well-known Kenyan foods so users
can search "sukuma", "ndengu", "githeri" etc. and land on the right row.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "kfct_raw.json"
OUT = ROOT / "src" / "data" / "foodsKfct.ts"
# The count lives in its own module so pages that only render "N foods" don't
# pull the whole dataset into their client chunk.
OUT_META = ROOT / "src" / "data" / "foodsMeta.ts"

GROUP_LABELS = {
    "01": "Cereals & grains",
    "02": "Roots & tubers",
    "03": "Legumes & pulses",
    "04": "Vegetables",
    "05": "Fruits",
    "06": "Milk & dairy",
    "07": "Meat & poultry",
    "08": "Fish & seafood",
    "09": "Fats & oils",
    "10": "Nuts & seeds",
    "11": "Sugars & sweeteners",
    "12": "Beverages",
    "13": "Herbs & spices",
    "14": "Insects",
    "15": "Mixed dishes",
}

# The extractor stops a name at the first token that looks numeric; the
# bare "-" inside these two names reads as a null cell and truncates them.
NAME_OVERRIDES: dict[str, str] = {
    "06020": "Milk, cow, whole, fermented (Lala - Industrial)",
    "06021": "Milk, cow, whole, fermented (Lala - mursik)",
}

# --- Curated common-name aliases --------------------------------------
# Attached to the canonical raw/entry form of each well-known Kenyan food
# so search terms like "ndengu" find the primary row, not every variant.
# Codes verified against kfct_raw.json names.

ALIASES: dict[str, list[str]] = {
    # Cereals & grains
    "01018": ["white maize", "mahindi"],
    "01019": ["yellow maize"],
    "01025": ["mawele", "bulrush millet", "pearl millet"],
    "01027": ["wimbi", "finger millet"],
    "01034": ["mchele", "white rice"],
    "01039": ["mtama", "sorghum white"],
    "01037": ["mtama mwekundu", "red sorghum"],
    # Roots & tubers
    "02013": ["viazi vitamu", "sweet potato"],
    "02015": ["viazi vitamu"],
    "02004": ["ndizi ya kupika", "green banana", "plantain"],
    "02007": ["mihogo", "muhogo", "cassava"],
    # Legumes & pulses
    "03004": ["maharagwe", "kidney beans"],
    "03011": ["kunde", "cowpeas"],
    "03019": ["ndengu", "pojo", "green gram", "mung bean"],
    "03021": ["mbaazi", "pigeon peas"],
    # Vegetables
    "04001": ["mchicha", "terere", "amaranth leaves"],
    "04003": ["managu", "black nightshade", "african nightshade"],
    "04015": ["kunde", "cowpea leaves"],
    "04018": ["mrenda", "murere", "jute mallow"],
    "04020": ["sukuma wiki", "kale", "collards", "collard greens"],
    "04034": ["majani ya viazi vitamu", "sweet potato leaves"],
    "04036": ["nyanya", "tomato"],
    "04007": ["kabichi", "cabbage"],
    # Fruits
    "05003": ["parachichi", "avocado"],
    "05004": ["ndizi", "banana"],
    "05019": ["embe", "mango"],
    "05023": ["chungwa", "orange"],
    # Herbs & spices
    "13023": ["vitunguu", "onion", "red onion"],
    # Fish & seafood
    "08002": ["omena", "dagaa", "silver sardine", "silver cyprinid"],
    # Mixed dishes
    "15005": ["ugali"],
    "15009": ["ugali sembe", "refined maize ugali"],
    "15019": ["chapati"],
    "15020": ["chapati ya wimbi"],
    "15053": ["githeri"],
    "15054": ["mukimo", "irio"],
    "15056": ["matoke"],
    "15044": ["ndengu stew", "mchuzi wa ndengu"],
    "15114": ["njahi", "dolichos", "black bean stew"],
    "15074": ["wali", "boiled rice"],
    "15036": ["pilau"],
    "15015": ["uji wa mawele"],
    "15014": ["uji wa wimbi"],
    "15001": ["uji wa mahindi", "maize porridge"],
    "15031": ["sukuma wiki (stir fried)"],
    "15035": ["saget", "spider plant mix"],
}


def to_ts(v):
    if v is None:
        return "null"
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, float):
        if v.is_integer():
            return str(int(v))
        return repr(round(v, 2))
    if isinstance(v, list):
        return "[" + ", ".join(to_ts(x) for x in v) + "]"
    return json.dumps(v)


def main() -> None:
    raw = json.loads(SRC.read_text())

    foods = []
    for row in raw:
        group = GROUP_LABELS.get(row["group"])
        if group is None:  # junk appendix codes (27xxx)
            continue
        if row.get("kcal") is None:
            continue
        code = row["code"]
        name = NAME_OVERRIDES.get(code, row["name"])
        foods.append({
            "code": code,
            "name": name,
            "group": group,
            "aliases": ALIASES.get(code, []),
            "kcal": row.get("kcal"),
            "protein": row.get("protein"),
            "fat": row.get("fat"),
            "carb": row.get("carb"),
            "fibre": row.get("fibre"),
            "calcium": row.get("calcium"),
            "iron": row.get("iron"),
            "zinc": row.get("zinc"),
            "sodium": row.get("sodium"),
            "potassium": row.get("potassium"),
            "vitA": row.get("vitA"),
            "vitC": row.get("vitC"),
        })

    foods.sort(key=lambda f: (f["group"], f["name"].lower()))

    lines: list[str] = []
    lines.append("// AUTO-GENERATED by scripts/gen_foods.py — do not edit by hand.")
    lines.append("// Source: Kenya Food Composition Tables 2018 (FAO / Government of Kenya).")
    lines.append("// Values are per 100 g edible portion, raw unless the name says otherwise.")
    lines.append("")
    lines.append("export interface KfctFood {")
    lines.append("  code: string;")
    lines.append("  name: string;")
    lines.append("  group: string;")
    lines.append("  aliases: string[];")
    lines.append("  kcal: number | null;")
    lines.append("  protein: number | null;")
    lines.append("  fat: number | null;")
    lines.append("  carb: number | null;")
    lines.append("  fibre: number | null;")
    lines.append("  calcium: number | null;")
    lines.append("  iron: number | null;")
    lines.append("  zinc: number | null;")
    lines.append("  sodium: number | null;")
    lines.append("  potassium: number | null;")
    lines.append("  vitA: number | null;")
    lines.append("  vitC: number | null;")
    lines.append("}")
    lines.append("")
    labels = sorted({f["group"] for f in foods})
    lines.append("export const KFCT_GROUPS: readonly string[] = [")
    for g in labels:
        lines.append(f"  {json.dumps(g)},")
    lines.append("] as const;")
    lines.append("")
    lines.append("export const KFCT_FOODS: KfctFood[] = [")
    keys = [
        "code", "name", "group", "aliases",
        "kcal", "protein", "fat", "carb", "fibre",
        "calcium", "iron", "zinc", "sodium", "potassium",
        "vitA", "vitC",
    ]
    for f in foods:
        parts = ", ".join(f"{k}: {to_ts(f.get(k))}" for k in keys)
        lines.append(f"  {{ {parts} }},")
    lines.append("];")
    lines.append("")
    lines.append("export function findKfctFood(code: string): KfctFood | undefined {")
    lines.append("  return KFCT_FOODS.find((f) => f.code === code);")
    lines.append("}")
    lines.append("")

    OUT.write_text("\n".join(lines))

    OUT_META.write_text(
        "// AUTO-GENERATED by scripts/gen_foods.py — do not edit by hand.\n"
        "// Kept separate from foodsKfct.ts so pages that only show the count\n"
        "// don't pull the whole dataset into their bundle.\n"
        "\n"
        f"export const KFCT_FOOD_COUNT = {len(foods)};\n"
    )

    aliased = sum(1 for f in foods if f["aliases"])
    print(f"wrote {OUT} with {len(foods)} foods, {aliased} with common-name aliases")
    print(f"wrote {OUT_META} with KFCT_FOOD_COUNT = {len(foods)}")


if __name__ == "__main__":
    main()
