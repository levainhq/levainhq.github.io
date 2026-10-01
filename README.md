# levainhq.com

The product site for [Levain](https://github.com/levainhq/levain) — a portable
cognitive-partnership memory and methodology kit.

Static, no build step. Deployed by GitHub Pages from `main`.

## Design

Runs on the Clapham estate design system — `tokens.css` and `site.css` are
shared verbatim with [phillipclapham.com](https://phillipclapham.com), so the
person and the product read as unmistakably kin. `levain.css` holds only what a
product site needs and a personal site does not (code blocks, the pull-quote).

The cognitive-pulse field is deliberately *not* shared: it is the person's hero,
not the product's.

## Content discipline

Every claim in the ledger carries a receipt. The receipts that carry a figure
were re-derived against `levainhq/levain@7370778` (origin/main, 2026-09-30):
the firing tier's import edges by walking every file's AST, the version from
PyPI, the anneal pin from `pyproject.toml`, the kernel's export count from
`levain/kernel.py`. Line counts and test counts are deliberately NOT printed on
the page: a count rots the day after it is written, and the test count has to
come from running the suite, never from grepping `def test_`. If you add a
number, add the command that derives it.

The `Boundaries, kept honest` section is load-bearing: it states what the kit
does *not* do. Keep it in step with the `Boundaries, kept honest` section of the
Levain README. A floor that oversells itself is worse than no floor.

## Custom domain

`levainhq.com` is the canonical host, set by the `CNAME` file and matched by
the repo's Pages settings. `levainhq.github.io` 301s to it.

If the site ever 404s at the custom domain, check in this order: the `CNAME`
file is present in the repo root; the domain is set under Pages settings; and
DNS resolves to GitHub Pages (`185.199.108-111.153`) rather than to a proxy
sitting in front of them.
