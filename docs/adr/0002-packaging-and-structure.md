# 0002 — Packaging and repository structure

Status: accepted
Date: 2026-09-14

## Context

The library worked before it was packaged. Pages loaded `../src/marspanel.css`, which pulled a
26-file `@import` chain; JavaScript sat in a top-level `js/`; and `assets/` held the SVG sprites next
to generated `.js` copies of themselves. That is a workspace, not a product.

Three problems followed from it:

1. **No single artefact to copy.** A consumer had to take 26 stylesheets and reproduce the import
   order, or accept 26 serial requests and a flash of unstyled content.
2. **Sources and generated output shared a directory.** `assets/icons.svg` and `assets/icons.js`
   looked like peers; one was hand-written and the other was not, and nothing said which.
3. **`js/` at the top level implied it was not source**, while `src/` held only CSS.

## Decision

```
src/css/      tokens/ base/ components/
src/js/       theme.js ui.js widgets.js
src/sprites/  icons.svg illustrations.svg
build/        six Node scripts
dist/         committed output: what consumers copy
pages/        demo pages, loading from dist/
starter/      minimal copy-me page
docs/         guides and decision records
```

Everything hand-written is under `src/`. Everything generated is under `dist/`. `dist/` **is
committed**, because the audience for an HTML template is people who download a zip, not people who
run a build.

`pages/` loads from `dist/`, not from `src/`. That dogfoods the artefact consumers actually get, and
it incidentally fixed a real problem: the `@import` chain was unreliable over `file://`, so the demo
had failed to render at all for some viewers.

Four files ship, and the order is part of the API:

| File | Where | Why |
|---|---|---|
| `marspanel.min.css` | `<head>` | — |
| `marspanel-theme.js` | `<head>`, synchronous | resolves the theme before first paint |
| `sprites.js` | first in `<body>` | defines the symbols `<use>` resolves against |
| `marspanel.js` | end of `<body>` | behaviour |

The theme script is split out of the main bundle for exactly one reason: bundled together, it could
only run where the bundle runs, and anywhere after the head is a flash of the wrong theme.

## The build has no dependencies

Six Node scripts using nothing but the standard library. Not because dependencies are bad, but
because a template whose promise is *this page fetches nothing* loses that argument if building it
needs a lockfile with three hundred entries.

Consequences that were accepted rather than solved:

- **The CSS minifier is hand-written and deliberately conservative.** It protects quoted strings and
  `url()`, strips comments and collapses whitespace, and does nothing else. It will not rewrite
  colours, merge rules or reorder anything. 81.4 kB → 70.9 kB, which gzips to 13.3 kB. A real
  minifier would do better; it would also cost a dependency and the ability to silently change
  meaning.
- **JavaScript is concatenated but not minified.** Collapsing whitespace in JS without a parser
  breaks code through automatic semicolon insertion, quietly and at runtime. Shipping 24 kB of
  readable JavaScript is the better trade.
- The build asserts its own output: brace counts must match before and after minification, no
  `@import` may survive bundling, and parens must balance in each JS bundle.

## Committed output needs a staleness check

Committing `dist/` creates one failure mode: someone edits `src/`, forgets to rebuild, and the
artefact everyone downloads no longer matches the source everyone reads. CI therefore runs the build
and fails if `git status --porcelain dist pages docs/accessibility.md` is non-empty.

This is the single most valuable check in the pipeline, because it is the failure that is invisible
locally — everything works on the machine where `src/` was edited.

## `build/verify.mjs`

Runs on every build. Fails on an undeclared token, a class used in a page but defined in no
stylesheet, a `<use>` pointing at a missing symbol, a broken link or asset path, a page missing its
theme or sprite script, and any physical CSS property outside `base/rtl.css`.

Each rule exists because that mistake was actually made during development. It is a regression suite
for a project that has no unit tests and, being CSS, cannot usefully have many.

## Alternatives rejected

**Ship only `src/` and require a build.** Correct for a library, wrong for a template. AdminLTE is
still the most-forked free admin template largely because it can be dropped into a PHP, Django,
Rails or Go project with no toolchain at all.

**Use esbuild or Lightning CSS.** Better output, and one lockfile away from the thing this project
says it does not need. Revisit if the minified size ever becomes a real complaint.

**Rename `pages/` to `preview/`.** Conventional for a demo, but wrong here: for an HTML admin
template the pages *are* a deliverable. People copy them.
