#!/usr/bin/env python3
"""Exercise the website with Playwright; run a preview server first.

python scripts/check_browser.py http://127.0.0.1:8000 --screenshots .work
"""
import argparse
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("url", nargs="?", default="http://127.0.0.1:8000")
parser.add_argument("--screenshots", type=Path, default=Path(".work"))
args = parser.parse_args()
args.screenshots.mkdir(exist_ok=True, parents=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, device_scale_factor=1, reduced_motion="reduce")
    page = context.new_page()
    errors, failures, requests = [], [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("response", lambda r: failures.append(f"{r.status}: {r.url}") if r.status >= 400 else None)
    page.on("request", lambda r: requests.append(r.url))
    page.goto(args.url, wait_until="networkidle")
    assert page.locator("#results-body tr").count() == 5
    assert page.locator("#depth-improvement").inner_text() == "61.2"
    page.locator('[data-baseline="visual"]').click()
    assert [page.locator(f"#{name}-improvement").inner_text() for name in ["depth", "angle", "translation"]] == ["93.7", "6.1", "8.6"]
    page.locator('[data-baseline="tactile"]').click()
    assert [page.locator(f"#{name}-improvement").inner_text() for name in ["depth", "angle", "translation"]] == ["61.2", "72.3", "61.3"]
    for mode, count in [("tactile", 11), ("visual", 9), ("both", 5)]:
        page.locator(f'[data-mode="{mode}"]').click()
        assert page.locator("#results-body tr").count() == count
        assert page.locator(f'[data-mode="{mode}"]').get_attribute("aria-pressed") == "true"
    for link in page.locator("[data-zoom]").all():
        link.click()
        assert page.locator("#figure-dialog").evaluate("d => d.open")
        page.keyboard.press("Escape")
        assert not page.locator("#figure-dialog").evaluate("d => d.open")
    assert page.locator("details").count() == 0
    assert page.locator("#fusion-details table").is_visible()
    assert page.locator("#evaluation-details").is_visible()
    assert "anonymous" not in page.locator("body").inner_text().lower()
    for width, height, name in [(1440, 1000, "desktop"), (390, 844, "mobile"), (320, 740, "small-mobile")]:
        page.set_viewport_size({"width": width, "height": height})
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(250)
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Page overflow at {width}px"
        for image in page.locator("img[src]").all():
            if not image.is_visible():
                continue
            image.scroll_into_view_if_needed()
            assert image.evaluate("i => i.complete && i.naturalWidth > 0"), "Image failed to load"
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(250)
        page.screenshot(path=str(args.screenshots / f"preview-{name}.png"), full_page=True)
    assert not errors, errors
    assert not failures, failures
    assert all(urlsplit(url).netloc == urlsplit(args.url).netloc for url in requests), "Unexpected third-party requests"
    assert context.request.get(args.url.rstrip("/") + "/assets/paper.pdf").status == 200
    browser.close()
print("PASS: results, mode tables, zoom dialogs, evaluation details, three responsive widths, image loading, PDF, and no external requests or browser errors.")
