"""Parse Kenya Food Composition Tables 2018 into structured JSON.

Tables are 3-page spreads: PROX (proximates) -> MIN (minerals) -> VIT (vitamins),
pages 42..179. Rows are matched across spreads by 5-digit food code.
Uses word x-coordinates to assign values to columns (handles missing cells).
"""
import pdfplumber, json, re, sys
from collections import defaultdict

PDF = "/home/hp/Downloads/Final-Food-compostion-book-2018.pdf"
OUT = "/home/hp/plate-planner-main/scripts/kfct_raw.json"

CODE_RE = re.compile(r"^\d{5}$")
GROUP_RE = re.compile(r"^\d{2}$")
NUM_RE = re.compile(r"^\[?-?\d+(?:\.\d+)?\]?$")  # 22, 1.1, [0.4], 0  (no ranges)
STAT_LEAD = ("SD or min-max", "SD", "min-max")

DATA_X_MIN = 330.0   # nutrient columns start ~350; names/codes are left of this
MAX_DIST = 28.0      # max px from a column anchor to accept a value

# Column anchors (x-center) measured from KFCT header rows. left->right.
PROX_ANCHORS = [("edible",358.4),("kJ",414.4),("kcal",462.6),("water",510.8),
                ("protein",559.0),("fat",607.2),("carb",685.0),("fibre",728.1),("ash",780.0)]
MIN_ANCHORS = [("Ca",361.7),("Fe",421.0),("Mg",480.4),("P",539.7),
               ("K",599.1),("Na",658.4),("Zn",717.8),("Se",777.2)]
VIT_ANCHORS = [("vitA_RAE",307.3),("vitA_RE",344.2),("retinol",383.2),("bcarotene",435.0),
               ("thiamin",492.2),("riboflavin",547.1),("niacin",596.7),("folate",642.8),
               ("vitB12",742.0),("vitC",788.1)]

def num(tok):
    t = tok.strip().strip("[]")
    if t in ("", "tr", "n", "-"):
        return None
    try:
        return float(t)
    except ValueError:
        return None

def cluster_rows(words, ytol=3.0):
    words = sorted(words, key=lambda w: (round(w["top"]), w["x0"]))
    rows = []
    cur, cur_top = [], None
    for w in words:
        if cur_top is None or abs(w["top"] - cur_top) <= ytol:
            cur.append(w); cur_top = w["top"] if cur_top is None else cur_top
        else:
            rows.append(sorted(cur, key=lambda x: x["x0"])); cur = [w]; cur_top = w["top"]
    if cur:
        rows.append(sorted(cur, key=lambda x: x["x0"]))
    return rows

def cx(w):
    return (w["x0"] + w["x1"]) / 2

def build_anchors(rows, kind):
    """Derive column x-centers from THIS page's header (robust to cross-page drift)."""
    firsttop = None
    for r in rows:
        if r and CODE_RE.match(r[0]["text"]):
            firsttop = r[0]["top"]; break
    hw = [w for r in rows for w in r if firsttop is None or w["top"] < firsttop - 2]
    if kind == "PROX":
        factor = [cx(w) for w in hw if w["text"] == "factor"]
        kJ = [cx(w) for w in hw if w["text"] == "(kJ)"]
        kcal = [cx(w) for w in hw if w["text"] == "(kcal)"]
        g = sorted(cx(w) for w in hw if w["text"] == "(g)")
        if not (kJ and kcal and len(g) >= 6):
            return None
        names = ["kJ","kcal","water","protein","fat","carb","fibre","ash"]
        xs = [kJ[0], kcal[0]] + g[:6]
        if factor:  # edible conversion factor column present on most pages
            names = ["edible"] + names
            xs = [factor[0]] + xs
        return list(zip(names, xs))
    if kind == "MIN":
        xs = sorted([cx(w) for w in hw if w["text"] == "(mg)"] +
                    [cx(w) for w in hw if w["text"] == "(mcg)"])
        if len(xs) < 8:
            return None
        names = ["Ca","Fe","Mg","P","K","Na","Zn","Se"]
        return list(zip(names, xs[:8]))
    if kind == "VIT":
        rae = [cx(w) for w in hw if w["text"] == "RAE"]
        cc = [cx(w) for w in hw if w["text"] == "C" and cx(w) > 770]
        anch = []
        if rae: anch.append(("vitA_RAE", rae[0]))
        if cc: anch.append(("vitC", cc[0]))
        return anch or None
    return None

def data_nums(row):
    """Numeric tokens that sit in the nutrient columns (x-center > DATA_X_MIN)."""
    out = []
    for w in row:
        cx = (w["x0"] + w["x1"]) / 2
        if cx > DATA_X_MIN and NUM_RE.match(w["text"]):
            out.append((cx, num(w["text"])))
    return out

def assign(rn, anchors):
    """Assign each (x, val) to nearest column anchor within MAX_DIST."""
    out = {}
    for cx, val in rn:
        if val is None:
            continue
        best, bd = None, MAX_DIST
        for name, ax in anchors:
            d = abs(ax - cx)
            if d < bd:
                bd = d; best = name
        if best is not None and best not in out:
            out[best] = val
    return out

def is_stat_row(row):
    lead = " ".join(w["text"] for w in row if (w["x0"]+w["x1"])/2 < DATA_X_MIN).strip()
    return lead.startswith(STAT_LEAD) or lead in ("n", "")

def parse_page(pg, kind):
    words = pg.extract_words(use_text_flow=False, keep_blank_chars=False)
    rows = cluster_rows(words)
    anchors = build_anchors(rows, kind)
    if not anchors:
        return {}, {}
    result = {}   # code -> {col: val}
    names = {}
    cur_code = None
    cur_captured = False
    cur_name_parts = []
    for r in rows:
        first = r[0]["text"] if r else ""
        lead = " ".join(w["text"] for w in r if cx(w) < DATA_X_MIN).strip()
        rn = data_nums(r)
        if CODE_RE.match(first):
            cur_code = first
            cur_captured = False
            nm = " ".join(w["text"] for w in r if 55 < cx(w) < DATA_X_MIN).strip()
            cur_name_parts = [nm] if nm else []
            names[cur_code] = nm
            if rn:
                result[cur_code] = assign(rn, anchors); cur_captured = True
        elif lead.startswith(STAT_LEAD) or lead == "n":
            continue
        else:
            if rn and cur_code and not cur_captured:
                result[cur_code] = assign(rn, anchors); cur_captured = True
            elif not rn and lead and cur_code and lead not in " ".join(cur_name_parts):
                cur_name_parts.append(lead)
                names[cur_code] = " ".join(cur_name_parts).strip()
    return result, names

def main():
    prox, minr, vit, names = {}, {}, {}, {}
    with pdfplumber.open(PDF) as pdf:
        for pno in range(42, 180):
            pg = pdf.pages[pno-1]
            txt = pg.extract_text() or ""
            if "(kcal)" in txt:
                res, nm = parse_page(pg, "PROX"); prox.update(res)
                for k,v in nm.items():
                    if v: names[k] = v
            elif "Vit A" in txt and "Retinol" in txt:
                res, nm = parse_page(pg, "VIT"); vit.update(res)
            elif "Se" in txt and "Zn" in txt:
                res, nm = parse_page(pg, "MIN"); minr.update(res)
    codes = sorted(set(prox) | set(minr) | set(vit))
    foods = []
    for c in codes:
        p, m, v = prox.get(c, {}), minr.get(c, {}), vit.get(c, {})
        foods.append({
            "code": c, "name": names.get(c, ""), "group": c[:2],
            "kcal": p.get("kcal"), "protein": p.get("protein"), "fat": p.get("fat"),
            "carb": p.get("carb"), "fibre": p.get("fibre"), "ash": p.get("ash"),
            "calcium": m.get("Ca"), "iron": m.get("Fe"), "magnesium": m.get("Mg"),
            "phosphorus": m.get("P"), "potassium": m.get("K"), "sodium": m.get("Na"),
            "zinc": m.get("Zn"),
            "vitA": v.get("vitA_RAE"), "vitC": v.get("vitC"),
        })
    json.dump(foods, open(OUT, "w"), indent=1)
    print("foods:", len(foods))
    withkcal = sum(1 for f in foods if f["kcal"] is not None)
    print("with kcal:", withkcal, " with protein:", sum(1 for f in foods if f["protein"] is not None),
          " with iron:", sum(1 for f in foods if f["iron"] is not None),
          " with vitC:", sum(1 for f in foods if f["vitC"] is not None))

if __name__ == "__main__":
    main()
