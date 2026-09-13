# Contributing

## Setup

```
git clone https://github.com/umars28/marspanel
cd marspanel
node build/index.mjs
node build/serve.mjs     # http://localhost:8777
```

Node 18 or newer. There is nothing to `npm install` — the build uses only the standard library, and
keeping it that way is a design constraint, not an accident.

## The rules that the verifier enforces

`node build/verify.mjs` runs on every build and in CI. It fails on:

- a `var(--mpn-…)` that no stylesheet declares
- a `mpn-` class used in a page but defined nowhere
- a `<use href="#…">` pointing at a symbol that is not in the sprite
- a broken link or asset path in any page
- a `margin-left`, `padding-right` or `border-left` outside `base/rtl.css`
- a page missing the theme script or the sprite script

Fix the cause, never the check.

## Conventions

**Components never reference primitives.** `button.css` may use `var(--mpn-accent)`; it may not use
`var(--mpn-indigo-500)`. If you need a value that has no role yet, add the role to
`tokens/semantic.css` first.

**Logical properties only.** `margin-inline-start`, not `margin-left`. See
[docs/rtl-and-print.md](docs/rtl-and-print.md).

**State goes through the vocabulary.** A new component that shows status reads `--mpn-state` and
`--mpn-state-tint`. It does not read `--mpn-danger` directly, and it does not invent a seventh state.

**No comments in source.** Explain non-obvious decisions in the commit message, in `docs/`, or in an
ADR — somewhere a reader will actually look.

**No runtime dependencies. Ever.** Not a font, not an icon CDN, not a chart library. The promise that
a page makes no requests of its own is the product.

## Adding a component

1. New file in `src/css/components/`, one component group per file.
2. Add the `@import` to `src/css/marspanel.css`, alphabetically.
3. Add a live example to `pages/components.html` — an undocumented component does not exist.
4. `node build/index.mjs` and check both themes, both directions, and the three breakpoints.

## Adding an icon

Add the `<symbol>` to `src/sprites/icons.svg` with a `viewBox="0 0 24 24"`, stroke paths only, no
`fill` and no hard-coded colour — `.mpn-icon` supplies `currentColor` and the stroke width. Then
rebuild; `pages/icons.html` picks it up automatically.

## Changing colour

Run `node build/a11y.mjs` and read the failures. It composites translucent surfaces over their real
backdrop before measuring, so it catches what eyeballing does not. The first audit of the default
theme failed fourteen pairs.

Never lower a threshold to make a colour pass.

## Commits and versions

The public API is the set of `mpn-*` classes, `--mpn-*` tokens and `data-mpn-*` attributes.
Renaming or removing any of them is a breaking change and needs a major version. Record every
user-visible change in `CHANGELOG.md` under `Unreleased`.

Architectural decisions go in `docs/adr/` as a numbered record — what was decided, what the
alternatives were, and what it costs.
