#!/usr/bin/env python3
"""Extract the main nutrient tables from the Kenya Food Composition Tables 2018 PDF.

Reads `pdftotext -layout` output of the KFCT 2018 book and produces
scripts/kfct_raw.json with one record per food code:
  code, name, kcal, protein, fat, carb, fibre,
  calcium, iron, zinc, sodium, potassium, vitA (RAE), vitC

Parsing strategy: within the "Table 1" section the book cycles, per food
group and page, through three sub-tables (proximates / minerals /
vitamins), each identified by its repeating page header. Data rows start
with a 5-digit code. Within each page block, rows that carry a full set
of numeric cells fix the character positions of the columns; rows with
blank cells are then assigned by nearest column position instead of by
counting, so a missing "edible portion" or folate cell cannot shift iron
into the zinc column. Names wrapped across lines are reassembled from
the neighbouring lines. Anything still ambiguous is logged to
scripts/kfct_review.log for manual review rather than guessed.
"""
from __future__ import annotations

import json
import re
import statistics
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = Path.home() / "Downloads" / "Final-Food-compostion-book-2018.pdf"
OUT = ROOT / "scripts" / "kfct_raw.json"
REVIEW = ROOT / "scripts" / "kfct_review.log"

SECTION_START = "Table 1: Energy, proximates, minerals and vitamins"
SECTION_END = "CHOLESTEROL, OXALATES AND PHYTATES"

MINERALS_HDR = re.compile(r"\bCa\s+Fe\s+Mg\s+P\s+K\s+Na\s+Zn\s+Se\b")
VITAMINS_HDR = re.compile(r"\bRAE\s+RE\b|b-carotene|Riboflavin")
PROXIMATES_HDR = re.compile(r"Edible conversion|Edible\s*$")

# 6-digit codes in the book that are typos for real 5-digit codes
TYPO_CODES = {"004034": "04034", "010010": "01010", "001041": "01041", "007019": "07019"}

# The book assigns the same code to two different foods in a few places.
# (code, name prefix) -> corrected/synthetic code
NAME_CODE_FIXES = [
    ("02023", "Beet root", "02022"),      # beetroot stewed is 02022 in the mineral/vitamin tables
    ("15066", "Biryani stew", "15066-2"),  # book reuses 15066 for both Biryani rice and stew
]

CODE_ROW = re.compile(r"^\s*(\d{5})(?!\d)\*{0,2}\s*(.*)$")
LONG_CODE_ROW = re.compile(r"^\s*(\d{6,})")
GROUP_ROW = re.compile(r"^\s*\d{2}\s+[A-Z][A-Z ,&/'\-]+$")
SKIP_ROW = re.compile(r"^\s*(SD or min-max|n)\b")
NUM_TOKEN = re.compile(r"^(?:tr|-|\[\d+(?:\.\d+)?\]|\d+(?:\.\d+)?)\*{0,2},?$")
PURE_TEXT = re.compile(r"^\s{4,}([A-Za-z(][A-Za-z0-9 ,()&/'\-\.]*?)\s*$")

TABLES = {
    "prox": (9, {"kcal": 2, "protein": 4, "fat": 5, "carb": 6, "fibre": 7}),
    # group-15 mixed dishes have no edible-portion column
    "prox8": (8, {"kcal": 1, "protein": 3, "fat": 4, "carb": 5, "fibre": 6}),
    "mins": (8, {"calcium": 0, "iron": 1, "zinc": 6, "sodium": 5, "potassium": 4}),
    "vits": (11, {"vitA": 0, "vitC": 10}),
}

ENERGY_HDR = re.compile(r"Energy\s+Energy")


def num(tok: str) -> float | None:
    tok = tok.rstrip(",").rstrip("*").strip("[]")
    if tok == "-":
        return None  # value not published
    if tok == "tr":
        return 0.0
    return float(tok)


def num_spans(line: str, limit_start: int = 0):
    """Numeric tokens with their character centre positions."""
    out = []
    for m in re.finditer(r"\S+", line):
        if m.start() < limit_start:
            continue
        if NUM_TOKEN.match(m.group()):
            out.append((m.group(), (m.start() + m.end()) / 2))
    return out


class Row:
    def __init__(self, code: str, name: str, cells, line: str):
        self.code = code
        self.name = name
        self.cells = cells  # list of (token, centre)
        self.line = line


def flush_block(rows: list[Row], table: str, foods: dict, review: list[str]) -> None:
    if not rows:
        return
    ncols, fields = TABLES[table]

    complete = [r for r in rows if len(r.cells) == ncols]
    centres: list[float] = []
    if complete:
        for i in range(ncols):
            centres.append(statistics.median(r.cells[i][1] for r in complete))

    for r in rows:
        vals: list[str | None] = [None] * ncols
        if len(r.cells) == ncols:
            for i, (tok, _) in enumerate(r.cells):
                vals[i] = tok
        elif centres and r.cells:
            used = set()
            ok = True
            for tok, centre in r.cells:
                j = min(range(ncols), key=lambda i: abs(centres[i] - centre))
                if abs(centres[j] - centre) > 12:
                    continue  # stray digit from the food name — drop it
                if j in used:
                    ok = False
                    break
                used.add(j)
                vals[j] = tok
            if not ok or not used:
                review.append(f"{table} {r.code} ambiguous cells: {r.line.strip()}")
                continue
        else:
            review.append(
                f"{table} {r.code} expected {ncols} cells, got {len(r.cells)}: {r.line.strip()}"
            )
            continue

        rec = foods.setdefault(r.code, {"code": r.code, "names": []})
        if r.name:
            rec["names"].append(r.name)
        for field, idx in fields.items():
            if vals[idx] is None:
                continue
            v = num(vals[idx])
            if v is None:
                continue
            if rec.get(field) is not None:
                if rec[field] != v:
                    review.append(
                        f"{table} {r.code} duplicate code, {field} {rec[field]} vs {v}: {r.line.strip()}"
                    )
                continue
            rec[field] = v


def parse(lines: list[str]):
    foods: dict[str, dict] = {}
    review: list[str] = []
    table: str | None = None
    in_section = False
    block: list[Row] = []

    i = 0
    while i < len(lines):
        line = lines[i]
        if "...." in line:  # table-of-contents dot leaders
            i += 1
            continue
        if SECTION_START in line:
            in_section = True
            table = "prox"
            i += 1
            continue
        if in_section and SECTION_END in line:
            break
        if not in_section:
            i += 1
            continue

        new_table = None
        if MINERALS_HDR.search(line):
            new_table = "mins"
        elif VITAMINS_HDR.search(line):
            new_table = "vits"
        elif re.search(r"Water\s+Protein\s+Fat", line) or PROXIMATES_HDR.search(line):
            # 9-column proximates pages carry an "Edible conversion factor"
            # column; the group-15 recipe pages do not.
            window = " ".join(lines[max(0, i - 3):i + 4])
            new_table = "prox" if ("Edible" in window or "conversion" in window) else "prox8"
        if new_table:
            if table:
                flush_block(block, table, foods, review)
            block = []
            table = new_table
            i += 1
            continue

        if SKIP_ROW.match(line) or GROUP_ROW.match(line) or table is None:
            i += 1
            continue
        lm = LONG_CODE_ROW.match(line)
        if lm:
            fixed = TYPO_CODES.get(lm.group(1))
            if fixed is None:
                review.append(f"{table} long code (PDF typo?): {line.strip()}")
                i += 1
                continue
            line = line.replace(lm.group(1), fixed, 1)

        m = CODE_ROW.match(line)
        if not m:
            i += 1
            continue
        code, rest = m.groups()
        rest_start = len(line) - len(line.lstrip())  # not used for cells

        cells = num_spans(line, limit_start=m.start(2))
        name_end = min((c for _, c in cells), default=len(line))
        # name = tokens on this line before the first numeric cell
        name = ""
        nm = re.match(r"^\s*(\d{5})(?!\d)\*{0,2}\s*", line)
        name_zone = line[nm.end():]
        name_tokens = []
        for t in re.finditer(r"\S+", name_zone):
            if NUM_TOKEN.match(t.group()):
                break
            name_tokens.append(t.group())
        name = " ".join(name_tokens).strip()
        # numeric cells only after the name
        cells = [c for c in cells if c[1] > (nm.end() + len(" ".join(name_tokens)))]

        # a row of dashes means "no values published" — accept as all-null
        if not cells and len(re.findall(r"(?<!\S)-(?!\S)", line)) >= 3:
            rec = foods.setdefault(code, {"code": code, "names": []})
            if name:
                rec["names"].append(name)
            i += 1
            continue

        consumed_next = False
        if not cells and i + 1 < len(lines):
            nxt = lines[i + 1]
            if not CODE_ROW.match(nxt) and not SKIP_ROW.match(nxt):
                nxt_cells = num_spans(nxt)
                if nxt_cells:
                    txt = []
                    for t in re.finditer(r"\S+", nxt):
                        if NUM_TOKEN.match(t.group()):
                            break
                        txt.append(t.group())
                    name = (name + " " + " ".join(txt)).strip()
                    cells = nxt_cells
                    consumed_next = True

        if len(name) < 4:
            prefix = suffix = ""
            pm = PURE_TEXT.match(lines[i - 1]) if i > 0 else None
            if pm and not SKIP_ROW.match(lines[i - 1]):
                prefix = pm.group(1).strip()
            k = i + (2 if consumed_next else 1)
            sm = PURE_TEXT.match(lines[k]) if k < len(lines) else None
            if sm and not SKIP_ROW.match(lines[k]):
                suffix = sm.group(1).strip()
            name = " ".join(p for p in (prefix, name, suffix) if p)
        elif name.endswith(("(without", "boiled,", "peeled,", "dried,", "whole,", "drained")):
            k = i + (2 if consumed_next else 1)
            sm = PURE_TEXT.match(lines[k]) if k < len(lines) else None
            if sm and not SKIP_ROW.match(lines[k]):
                name = name + " " + sm.group(1).strip()

        for fix_code, prefix, new_code in NAME_CODE_FIXES:
            if code == fix_code and name.startswith(prefix):
                code = new_code
                break

        block.append(Row(code, name, cells, line))
        i += 2 if consumed_next else 1

    if table:
        flush_block(block, table, foods, review)
    return foods, review


def main() -> None:
    txt = subprocess.run(
        ["pdftotext", "-layout", str(PDF), "-"],
        capture_output=True, text=True, check=True,
    ).stdout
    foods, review = parse(txt.splitlines())

    out = []
    for code, rec in sorted(foods.items()):
        names = rec.pop("names")
        name = max(names, key=len) if names else ""
        name = re.sub(r"\s+", " ", name.replace("**", "").replace("*", "")).strip(" ,")
        rec["name"] = name
        rec["group"] = code[:2]
        for f in ("kcal", "protein", "fat", "carb", "fibre", "calcium", "iron",
                  "zinc", "sodium", "potassium", "vitA", "vitC"):
            rec.setdefault(f, None)
        out.append(rec)

    OUT.write_text(json.dumps(out, indent=1))
    REVIEW.write_text("\n".join(review) + "\n")
    complete = sum(1 for r in out if all(r[f] is not None for f in ("kcal", "vitA", "iron")))
    noname = sum(1 for r in out if len(r["name"]) < 4)
    print(f"{len(out)} foods -> {OUT}")
    print(f"{complete} with kcal+iron+vitA present; {noname} short names; {len(review)} review lines")


if __name__ == "__main__":
    main()
