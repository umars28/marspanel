# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [semantic versioning](https://semver.org/spec/v2.0.0.html), where the public API is
the set of `mpn-*` class names, `--mpn-*` tokens and `data-mpn-*` attributes. Renaming or removing
any of those is a breaking change.

## [Unreleased]

## [0.1.0] — 2026-09-14

First public release.

### Added

- **Aurora**, the default theme: dark-first, translucent surfaces over a radial
  indigo / cyan / violet wash. Recorded in `docs/adr/0001-visual-direction.md` along with the nine
  directions it was chosen against.
- Three-layer token system — `tokens/primitive.css` → `tokens/semantic.css` → components — plus
  `tokens/geometry.css` for the non-colour knobs. Components never reference primitives.
- 342 `mpn-*` classes across 26 stylesheets: actions, status, surfaces, feedback, tables, forms,
  navigation, overlays, charts, content, code, and workspace widgets (calendar, board, chat, tree,
  split pane).
- One status vocabulary — `ok warn danger info pending idle` — applied with a single `mpn-is-*`
  class that every stateful component reads.
- 131 icons and 10 illustrations as inline SVG sprites. No icon font, no CDN.
- `js/ui.js`: overlays with focus trapping, auto-positioned menus and popovers, tooltips, a toast
  API, tabs, wizard steps, table sort and filter, bulk selection, collapsible nav, tree, split pane
  and a command palette — all driven by `data-mpn-*` attributes, nothing to initialise.
- `js/widgets.js`: date picker, searchable select and colour picker, written from scratch.
- Full right-to-left support through CSS logical properties, with `base/rtl.css` covering only what
  has no logical form.
- A print stylesheet that turns the theme light, drops chrome, and repeats table headers per page.
- 38 demo pages including seven authentication screens and five error states.
- Build pipeline with no third-party dependencies: `@import` bundler, conservative
  string-safe CSS minifier, sprite generator, page scaffolder, contrast auditor and a verifier that
  fails on undeclared tokens, missing symbols, broken links and physical CSS properties.

### Fixed during development

- `reset.css` set `svg { fill: none }`, which erased every illustration. `fill: none` now belongs to
  `.mpn-icon` alone.
- `.mpn-nav-toggle { display: none }` lost to `.mpn-icon-btn { display: grid }` on equal specificity,
  so the mobile menu button showed on desktop.
- A single `--mpn-border` token drove both component outlines and table row dividers, so any theme
  that dropped outlines also erased the rows. Split into `--mpn-border` and `--mpn-line`.
- Age columns sorted `2m` before `14d` because they compared as text. Sortable cells now carry
  `data-value`.
- Fourteen colour pairs failed WCAG contrast on first audit — every light-theme status colour
  against its own tint, plus white on the dark accent. All 54 pairs pass at 0.1.0.
