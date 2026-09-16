#!/usr/bin/env python3
"""Export the reviewed paper to anonymous web assets.

Usage: python scripts/prepare_assets.py /path/to/compiled/paper
Dependencies: Pillow and PyMuPDF. No model inference is run.
Only the public directory is deployed; source paths are never exported.
"""
import argparse
import json
import re
from pathlib import Path

import pymupdf
from PIL import Image


def plain_tex(text):
    text = re.sub(r"\\cite\{[^}]*\}", "", text)
    text = re.sub(r"\\textcolor\{[^}]*\}\{([^{}]*)\}", r"\1", text)
    text = re.sub(r"\\href\{[^}]*\}\s*\{[^{}]*\}", "", text)
    text = text.replace(r"\method{}", "VisTacFusion").replace(r"\sensor{}", "GelSlim 5.0")
    text = re.sub(r"\\(?:textbf|textit|mathrm)\{([^{}]*)\}", r"\1", text)
    text = text.replace(r"$^{\dag}$", "").replace(r"$L_1$", "L₁").replace(r"\%", "%")
    return re.sub(r"\s+", " ", text.replace("~", " ").replace("--", "–")).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paper", type=Path)
    args = parser.parse_args()
    output = Path(__file__).resolve().parents[1] / "public"
    assets = output / "assets"
    assets.mkdir(exist_ok=True)
    source = args.paper
    tex = "\n".join(line for line in (source / "main.tex").read_text().splitlines() if not line.lstrip().startswith("%"))
    abstract = plain_tex(tex.split(r"\begin{abstract}", 1)[1].split(r"\end{abstract}", 1)[0])
    # Use the complete manuscript abstract, grouped for comfortable web reading.
    abstract = abstract.replace(" To combine these observations,", "\nTo combine these observations,")
    abstract = abstract.replace(" On real validation data", "\nOn real validation data")
    tables = {}
    for mode, marker in [("visual", "(a) Vis only"), ("tactile", "(b) Tac only"), ("both", "(c) Both")]:
        block = tex.split(marker, 1)[1]
        block = re.split(r"\\(?:midrule|bottomrule)", block, maxsplit=1)[0]
        rows = []
        for row in block.split(r"\\"):
            if " & " not in row:
                continue
            row = re.sub(r"\\addlinespace\[[^]]*\]", "", row)
            row = re.sub(r"\\rowcolor\{[^}]*\}", "", row).strip()
            cells = row.split("&")
            if len(cells) != 6:
                raise ValueError("Expected five Table II metrics")
            name = plain_tex(cells[0])
            values = [None if "---" in value else float(plain_tex(value)) for value in cells[1:]]
            rows.append({"name": name, "shared": r"\dag" in cells[0], "ours": name == "VisTacFusion", "values": values})
        tables[mode] = rows
    assert [len(tables[m]) for m in ["both", "tactile", "visual"]] == [5, 11, 9]
    assert all(sum(row["ours"] for row in rows) == 1 for rows in tables.values())
    data = {"abstract": abstract.splitlines(), "tables": tables}
    (output / "data.js").write_text("window.PAPER_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")

    for original, filename, scale in [("figure1.pdf", "overview.webp", 2), ("figure2.pdf", "sensor.webp", 2), ("figure4.pdf", "observations.webp", 3)]:
        with pymupdf.open(source / "figures" / original) as doc:
            pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            Image.frombytes("RGB", [pix.width, pix.height], pix.samples).save(assets / filename, quality=90, method=6)
    # Re-encode to remove image metadata; PNG pixels are not changed.
    for original, filename in [("figure3.png", "architecture.png"), ("qualitative_results.jpg", "qualitative.jpg"), ("ratio_sweep_panel.png", "data-mixing.png")]:
        with Image.open(source / "figures" / original) as original_image:
            clean = Image.frombytes(original_image.mode, original_image.size, original_image.tobytes())
            clean.save(assets / filename, optimize=True, **({"quality": 90} if filename.endswith(".jpg") else {}))
    for stale in ["qualitative.png"]:
        (assets / stale).unlink(missing_ok=True)

    # Copy only visible PDF pages, without source metadata, annotations, or attachments.
    with pymupdf.open(source / "main.pdf") as original:
        anonymous = pymupdf.open()
        anonymous.insert_pdf(original, links=False, annots=False)
        anonymous.set_metadata({"title": "GelSlim 5.0: Unifying Vision and Touch with a Single Fingertip Camera", "author": "Anonymous", "subject": "Anonymous manuscript for review"})
        text = "\n".join(page.get_text() for page in anonymous)
        for identifier in ["/media/", "ihsuan", "6a6a76066a688253972691e8", "6aa5e6fea29014ed11f297c5", "olp_"]:
            assert identifier not in text, "Identity-bearing text found in PDF"
        anonymous.save(assets / "paper.pdf", garbage=4, deflate=True)
        print(f"Exported {len(anonymous)} manuscript pages and {sum(map(len, tables.values()))} Table II rows.")
        anonymous.close()
    print("Anonymous website assets ready.")


if __name__ == "__main__":
    main()
