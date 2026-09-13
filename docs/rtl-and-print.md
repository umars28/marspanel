# Right-to-left and print

## RTL

```html
<html dir="rtl">
```

That is all. Or use the toggle in the demo topbar, or `data-mpn-dir-toggle` on any button.

Every directional rule in the library is a **logical property** — `margin-inline-start`,
`border-inline-end`, `padding-inline`, `inset-inline`, `text-align: start`. The browser mirrors them
for free, and `build/verify.mjs` fails the build if a `margin-left`, `padding-right` or
`border-left` appears anywhere outside `base/rtl.css`.

`base/rtl.css` is ninety lines, because only four kinds of thing have no logical form:

| What | Why it needs a manual flip |
|---|---|
| `transform` | `translateX(-100%)` for the off-canvas sidebar, and every chevron rotation |
| inset `box-shadow` | the 2 px state rail on a failing table row sits on the wrong edge |
| asymmetric `border-radius` | button groups, input addons, chat bubbles |
| `background-position` | the select arrow |

Doing this before the pages were written kept it at ninety lines. Retrofitting RTL across
thirty-eight already-written pages would have been a few hundred lines of patches — the ordering is
most of the saving.

### Writing RTL-safe CSS

```css
margin-inline-start: auto;      /* not margin-left */
border-inline-end: 1px solid;   /* not border-right */
inset-inline-start: 0;          /* not left */
text-align: start;              /* not left */
padding-inline: 12px 32px;      /* start, end */
```

If you genuinely need a physical property, put it in `base/rtl.css` behind `[dir="rtl"]` and give
the LTR case its own rule. The verifier will stop you anywhere else.

## Print

`base/print.css` is always loaded; it only takes effect inside `@media print`.

It relights the whole theme — `--mpn-bg` becomes white, the wash disappears, shadows and blur go to
zero, radius drops to 4 px — then hides everything that means nothing on paper: sidebar, topbar,
scrim, toasts, tooltips, menus, popovers, drawers, page actions, toolbars, bulk bars, pagers and
buttons.

What it adds back matters more:

- `thead { display: table-header-group }` so a long table repeats its header on every page
- `break-inside: avoid` on cards and rows, `break-after: avoid` on headings
- external link URLs printed after the link text
- status pills drawn as outlined text, since tinted backgrounds vanish on a laser printer
- `@page { margin: 16mm }`

```html
<div data-mpn-no-print>…</div>   <!-- hide on paper -->
<div class="mpn-print-only">…</div>  <!-- show only on paper -->
```

Test on `pages/invoice.html`. An invoice that cannot be printed cleanly is not an invoice.
