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

Every claim in the ledger carries a receipt, and every receipt was verified
against the source at `levainhq/levain@d4163af` — not against the README, and
not from memory. Test counts come from running the suite, never from grepping
`def test_`, which undercounts parametrized cases.

The `Boundaries, kept honest` section is load-bearing: it states what the kit
does *not* do, including that the automation-threshold membrane is a
specification rather than shipped code. A floor that oversells itself is worse
than no floor.

## DNS cutover (pending)

`levainhq.com` currently sits behind a Cloudflare redirect rule that 302s to
the Levain repo. Until that is changed, the `CNAME` file is held as
`CNAME.pending`: with it in place GitHub Pages 301s `levainhq.github.io` to
`levainhq.com`, which Cloudflare then bounces to the repo — so the site
redirects past itself and is unreachable.

To cut over:

1. In Cloudflare, remove the `levainhq.com` redirect rule.
2. Point `levainhq.com` at GitHub Pages (either the four A records for
   `185.199.108–111.153`, or a CNAME to `levainhq.github.io`), DNS-only —
   grey cloud, not proxied.
3. `mv CNAME.pending CNAME`, commit, push.
4. Confirm the custom domain and HTTPS enforcement in the repo's Pages settings.

Until then the site serves at
[levainhq.github.io](https://levainhq.github.io).
