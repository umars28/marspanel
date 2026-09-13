## What changes

<!-- One or two sentences. The why matters more than the what. -->

## Checklist

- [ ] `node build/index.mjs` passes, including `verify` and `a11y`
- [ ] `dist/`, `pages/` and `docs/accessibility.md` are rebuilt and committed — CI fails if committed output no longer matches its sources
- [ ] Checked in **both themes** and in **RTL**
- [ ] Checked at **1300 / 1100 / 820 px**
- [ ] No new runtime dependency, webfont or CDN
- [ ] Components reference semantic tokens only, never primitives
- [ ] Logical properties only (`margin-inline-start`, not `margin-left`)
- [ ] `CHANGELOG.md` updated under `Unreleased`

## Breaking change

The public API is the set of `mpn-*` classes, `--mpn-*` tokens and `data-mpn-*` attributes.

- [ ] This renames or removes one of those

<!-- If checked, say which and what replaces it. -->

## Colour changed?

Paste the relevant rows from `docs/accessibility.md`. Never lower a threshold to make a colour pass.
