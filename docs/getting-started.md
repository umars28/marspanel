# Getting started

## Install

Copy `dist/` into your project. That is the whole installation.

```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <link rel="stylesheet" href="/dist/marspanel.min.css">
  <script src="/dist/marspanel-theme.js"></script>
</head>
<body class="mpn-root">
  <script src="/dist/sprites.js"></script>

  <div class="mpn-app">…</div>

  <script src="/dist/marspanel.js"></script>
</body>
</html>
```

Four files, and the order matters:

| File | Where | Why there |
|---|---|---|
| `marspanel.min.css` | `<head>` | — |
| `marspanel-theme.js` | `<head>`, synchronous | Resolves dark or light **before first paint**. Move it lower and you get a flash of the wrong theme. |
| `sprites.js` | first thing in `<body>` | Injects the symbol definitions that every `<use href="#i-…">` resolves against. |
| `marspanel.js` | end of `<body>` | Behaviour. Nothing to initialise. |

`starter/index.html` is this skeleton with a working sidebar, topbar and one card. Copy it and start
deleting.

## Or install from npm

```
npm install marspanel
```

```js
import "marspanel/css";
import "marspanel/theme";
import "marspanel";
```

The package ships `dist/` and `src/`. There is no JavaScript API to import — the CSS and the
`data-mpn-*` attributes are the interface.

## Shipping with zero requests

`sprites.js` exists so the demo works from `file://`. In production, paste `dist/icons.svg` inline
just after `<body>` instead and drop the script. The page then makes no requests of its own at all —
no fonts, no icon CDN, no analytics. That is the point: a console served from a single binary on an
air-gapped node renders identically to one on the public internet.

## Layout

```html
<body class="mpn-root">
  <div class="mpn-app">
    <aside class="mpn-sidebar">…</aside>
    <div class="mpn-main">
      <header class="mpn-topbar">…</header>
      <main class="mpn-page">…</main>
    </div>
  </div>
</body>
```

`mpn-root` carries the theme and paints the wash. `mpn-app` is the two-column grid. Everything else
is ordinary content.

Responsive behaviour is automatic:

| Width | Behaviour |
|---|---|
| ≤ 1300 px | four-up grids collapse to two |
| ≤ 1100 px | sidebar becomes an icon rail |
| ≤ 820 px | sidebar becomes an off-canvas drawer, all grids single column |

Wide tables scroll inside their own `.mpn-table-wrap`. The page body never scrolls sideways.

## Building from source

Only needed if you change `src/`.

```
node build/index.mjs     # or: npm run build
node build/serve.mjs     # http://localhost:8777
```

There are no dependencies to install — the pipeline is six Node scripts using nothing but the
standard library.

| Script | Does |
|---|---|
| `build/sprites.mjs` | copies the SVG sprites to `dist/` and generates the self-injecting `sprites.js` |
| `build/css.mjs` | resolves the `@import` chain into one file and minifies it |
| `build/js.mjs` | concatenates the JS into the head bundle and the body bundle |
| `build/pages.mjs` | scaffolds the demo pages from one shared shell |
| `build/a11y.mjs` | measures every colour pair and rewrites `docs/accessibility.md` |
| `build/verify.mjs` | fails the build on undeclared tokens, missing symbols, broken links, classes used but never defined, and physical CSS properties that would break RTL |

`build/verify.mjs` is the one to care about. It is why a broken link or a typo'd class name cannot
reach a release.

## Next

- [Theming](theming.md) — tokens, dark and light, building your own theme
- [JavaScript](javascript.md) — every `data-mpn-*` attribute
- [RTL and print](rtl-and-print.md)
- [Contrast audit](accessibility.md) — generated, not asserted
