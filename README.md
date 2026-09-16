# GelSlim 5.0 — project website

Anonymous project page for *GelSlim 5.0: Unifying Vision and Touch with a Single Fingertip Camera*.

Live site: https://gelslim5.github.io/geslim5_website/

Static HTML, CSS, and JavaScript in `public/`. All assets are served locally; there are no analytics, external fonts, or third-party scripts.

## Preview

```sh
python3 -m http.server 8000 --directory public
```

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`, which publishes `public/` with GitHub Actions. The repository's Pages source must be set to **GitHub Actions** (Settings → Pages → Build and deployment).

## Updating from the manuscript

With Pillow and PyMuPDF installed, point the script at a directory containing the compiled `main.pdf`, `main.tex`, and `figures/`:

```sh
python3 scripts/prepare_assets.py /path/to/compiled/paper
```

This regenerates `public/data.js` (abstract and Table II), the figures, and the anonymized `paper.pdf`. Prose in `public/index.html` is written for the page and must be reviewed by hand when the protocol or numbers change.

`python3 scripts/check_site.py` checks local references, anonymity, and the consistency of displayed results.

## Anonymity

`noindex` and `robots.txt` discourage indexing but are not access control. Keep commits under the anonymous project account; remove the `robots` meta tag and the `robots.txt` disallow rule after the review period.
