#!/usr/bin/env python3
"""Validate the public bundle without a browser or optional dependencies."""
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids, self.images = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for attr in ["href", "src"]:
            if attr in attrs:
                self.links.append(attrs[attr])
        if tag == "img":
            self.images.append(attrs)


root = Path(__file__).resolve().parents[1] / "public"
html = (root / "index.html").read_text()
doc = Document()
doc.feed(html)
assert len(doc.ids) == len(set(doc.ids)), "Duplicate HTML IDs"
for link in doc.links:
    url = urlsplit(link)
    assert not url.scheme and not url.netloc, f"Unexpected external request: {link}"
    if url.path:
        assert (root / unquote(url.path)).is_file(), f"Missing asset: {link}"
    elif url.fragment:
        assert url.fragment in doc.ids, f"Missing section: {link}"
for image in doc.images:
    assert "alt" in image, "Image missing alternate text"

raw_data = (root / "data.js").read_text()
assert raw_data.startswith("window.PAPER_DATA = ")
data = json.loads(raw_data[len("window.PAPER_DATA = "):].rstrip(";\n"))
assert [len(data["tables"][mode]) for mode in ["both", "tactile", "visual"]] == [5, 11, 9]
ours = {mode: next(row["values"] for row in rows if row["ours"]) for mode, rows in data["tables"].items()}
expected = {"tactile": ["61.2", "72.3", "61.3"], "visual": ["93.7", "6.1", "8.6"]}
for mode, values in expected.items():
    for i, wanted in zip([0, 3, 4], values):
        reduction = 100 * (1 - Decimal(str(ours["both"][i])) / Decimal(str(ours[mode][i])))
        assert str(reduction.quantize(Decimal(".1"), rounding=ROUND_HALF_UP)) == wanted
    assert all(a < b for a, b in zip(ours["both"], ours[mode]))

for path in root.rglob("*"):
    assert not path.is_symlink(), "Symlinks must not be deployed"
    if path.is_file() and path.suffix in [".html", ".css", ".js", ".svg", ".txt"]:
        text = path.read_text()
        assert not re.search(r"ihsuan|/media/|/home/shared|olp_|6a6a76066a688253972691e8|6aa5e6fea29014ed11f297c5|github\.com/", text, re.I), f"Identity-bearing content in {path.name}"
assert 'content="noindex, nofollow, noarchive"' in html
assert "Disallow: /" in (root / "robots.txt").read_text()
print("PASS: local asset links, section links, image descriptions, 25 table rows, six improvements, and anonymous public text.")
