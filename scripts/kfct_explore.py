import pdfplumber, sys

PDF = "/home/hp/Downloads/Final-Food-compostion-book-2018.pdf"

def classify(text):
    t = text or ""
    has_kcal = "(kcal)" in t
    has_min = "Se" in t and "Zn" in t and "Fe" in t and "(mcg)" in t
    has_vit = "Vit A" in t and "Retinol" in t
    if has_kcal: return "PROX"
    if has_vit: return "VIT"
    if has_min: return "MIN"
    return "-"

with pdfplumber.open(PDF) as pdf:
    n = len(pdf.pages)
    print("pages:", n)
    seq = []
    for i, pg in enumerate(pdf.pages):
        txt = pg.extract_text() or ""
        c = classify(txt)
        seq.append(c)
    # print compact map
    for i, c in enumerate(seq):
        if c != "-":
            print(i+1, c)
