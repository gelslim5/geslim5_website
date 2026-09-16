# GelSlim 5.0 — anonymous project website

A responsive static research website based on the current manuscript and implementation. All public images, styles, scripts, and the anonymous manuscript are served locally. There are no analytics, external fonts, author profiles, or links to the development repository.

## Preview

From this directory:

```sh
python3 -m http.server 8000 --directory public
```

Open `http://localhost:8000`. No Node.js, package manager, or build is required. `public/index.html` also works when opened directly.

## Publish to GitHub Pages

The current live site is https://gelslim5.github.io/geslim5_website/. Its repository publishes the contents of `public/` from the root of `main`, using GitHub Pages branch deployment. The isolated publishing checkout is `.work/github-publish`; its Git author is the dedicated project account. Copy reviewed public files into that checkout before committing updates.

The following workflow is an alternative for a fresh repository using the complete deployment ZIP:

Use a dedicated anonymous GitHub account and repository. Extract `anonymous-project-site.zip` into the repository root. Alternatively, copy only `public/`, `.github/`, `scripts/`, `README.md`, and `.gitignore` from this directory. Do not upload `.work/`, the surrounding research repository, or its Git history.

1. Push to the repository's `main` branch.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Run **Publish anonymous project website** from the Actions tab, or push again.

The workflow publishes only `public/`. The project works at either `https://ACCOUNT.github.io/REPOSITORY/` or an account-level Pages URL because all asset URLs are relative. Configure the Pages environment to allow the main branch if the repository has deployment protection rules.

This uses the [official GitHub Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Pages visibility depends on the account and repository plan.

No Git repository was initialized here. If creating a fresh repository, use an anonymous commit author as well as an anonymous owner. A GitHub account name, profile, commit history, or identifiable repository elsewhere can disclose identity even when page contents are anonymous. `noindex` and `robots.txt` discourage indexing; they are not access control.

## Content and provenance

- Title, abstract, reported metrics, and evaluation protocol come from the reviewed manuscript.
- All 25 rows and all five metrics are exported from Table II, with no invented results.
- Improvement cards compare the paired VisTacFusion row with its own single-modality rows, not with independently trained baselines.
- The model description follows the SITR-B/16 + MAE-L/16 configuration and the implementation of the fusion trunk, DPT, and pose head.
- Geometry and pose use separate task-selected checkpoints, as explained in the visible evaluation setup section.
- Figures are manuscript assets; images are re-encoded without metadata and without altering pixels. The overview is rendered from the manuscript PDF figure.
- The downloadable manuscript is copied into a new PDF without original metadata, annotations, or attachments. Its author metadata is `Anonymous`.
- There is no public code link because no anonymous code release URL has been provided.

The page uses a conventional research layout: centered paper title, PDF link, overview figure, abstract, method, and results. Fusion data flow and evaluation setup are always visible. Author information remains omitted, without an anonymity banner. Layout references were the ICRA project pages for [3DTacDex](https://3dtacdex.github.io/), [QuietWalk](https://sony.github.io/QuietWalk/), and [See to Touch](https://see-to-touch.github.io/); no template source or research text was copied.

## Updating assets

Use a clean, compiled copy of the intended manuscript. Do not use an outdated `main.pdf` after editing LaTeX. With Pillow and PyMuPDF installed:

```sh
python3 scripts/prepare_assets.py /path/to/compiled/paper
```

This regenerates `public/data.js`, the figures, and the downloadable PDF. Public files contain no source machine paths. The abstract is grouped into paragraphs for reading; the text matches the manuscript. Tables and percentage cards use the exported numerical values.

For content changes that alter the dataset or protocol, also review the contextual prose in `public/index.html`. The preparation script intentionally validates Table II's expected row counts so a changed table structure cannot silently produce an incomplete comparison.

## Checks

```sh
python3 scripts/check_site.py
```

This checks local references, anonymous content, and consistency of displayed results. Browser interaction checks can additionally be run with Playwright using `scripts/check_browser.py` against a running local server.
