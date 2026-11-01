# levainhq.com

The product site for [Levain](https://github.com/levainhq/levain) — a consent
queue and memory harness for Claude Code and Codex.

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

Every claim on the page is sourced to a line in the Levain repo at a named
release. The copy refresh of 2026-11-01 was derived against the `v0.11.27` tag
(`f5962e35`): the README at that tag is the source of truth for the product
description, and a claim the README does not make is checked against the code
at the tag or removed. To re-derive: for each
sentence on the page, find the line in the README at the tag (or the code, or
the plan row for a 1.0 item) that makes it true, and quote it; a line number
rots on the next release, a quoted string does not.

The Levain version is never typed into the page: `version-badges.js` reads it
from PyPI. The anneal pin is never typed either: the same script fills it from
the live `requires_dist` (`curl -s https://pypi.org/pypi/levain/json`). The
page's `data-audited` baseline is the release its claims were last re-checked
against, now 0.11.27; only that baseline is hand-moved
(`grep -o 'data-audited="[^"]*"' index.html`), and only after a re-audit of the
claims. Counts of the live codebase (lines, tests) are deliberately NOT printed
on the page: a count rots the day after it is written, and the test count has
to come from running the suite, never from grepping `def test_`. The figures
that remain are exempt or derived: 96 → 549 is a fixed historical snapshot,
`14 exported names` is `len(levain.kernel.__all__)`, and the deferral numbers
(6 of 10, 0 of 10, p = 0.011) are the one contrast of four that cleared in
`docs/evidence/deferral-probe.md`. If you add a number, add the command that
derives it.

A claim that was once true and is not now has to be removed, not corrected in
place. The 0.5.x page said the firing tier had zero outward import edges and
that standard credential stores were opt-in; neither holds at 0.11.27 (the
tier now imports outward, and the credential deny is on by default).

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
