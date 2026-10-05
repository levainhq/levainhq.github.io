# levainhq.com

The product site for [Levain](https://github.com/levainhq/levain) — a portable
cognitive-partnership memory and methodology kit.

Static, no build step. Deployed by GitHub Pages from `main`.

## Design

Runs on the Clapham estate design system. `tokens.css` is shared verbatim with
[phillipclapham.com](https://phillipclapham.com); `site.css` was forked from
the same file and has since diverged in both directions (the card-tilt rule
lives only here, some estate additions only there), so never sync it by
copying the file across. Re-derive the difference with
`diff site.css <(git -C ../phill-site show origin/main:site.css)` (bash or zsh,
with a `phill-site` sibling checkout, after a `git fetch` there).
`levain.css` holds only what a product site needs and a personal site does not
(code blocks, the pull-quote).

The cognitive-pulse field is deliberately *not* shared: it is the person's hero,
not the product's.

## Content discipline

Every claim in the ledger carries a receipt. The receipts that carry a figure
were re-derived against `levainhq/levain@7370778` (origin/main, 2026-09-30):
the firing tier's import edges by walking every file's AST, the anneal pin from
`pyproject.toml`, the kernel's export count from `levain/kernel.py`. The pin was
re-checked against the `v0.5.0` tag (`3052f04`, 2026-10-02). The page's `data-audited`
baseline is the version its Levain claims were last re-checked against: 0.5.12, against the
`v0.5.12` CHANGELOG (no floor, gate or confinement change since the 0.5.5 re-check; `levain/firing/` is unchanged v0.5.9 to v0.5.12; 0.5.10's auto-memory mirror, on by default, is now stated in the "path you govern" row-note, by Phill's ruling 2026-10-04) and that tag's
anneal pin (`git show v0.5.12:pyproject.toml`) (2026-10-04). The pin is never typed into the page:
`version-badges.js` fills it from the live `requires_dist` (`curl -s https://pypi.org/pypi/levain/json`),
so it follows a release with no edit. Only the baseline is hand-moved
(`grep -o 'data-audited="[^"]*"' index.html`), and only after a re-audit of the claims. The Linux
bash-refusal sentence was re-derived from the `v0.5.3` CHANGELOG's known open issues; the
"checks names" sentence in "No security absolutes", from the `v0.5.5` CHANGELOG's hardlink
item. The Levain version
is never typed into the page: `version-badges.js` reads it from PyPI. Counts of the live codebase (lines, tests) are deliberately NOT printed on
the page: a count rots the day after it is written, and the test count has to
come from running the suite, never from grepping `def test_`. The 96 → 549
accrual figures are exempt because they are a fixed historical snapshot. If you add a
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
