# Theming

## Three layers, and the order is enforced

```
src/css/tokens/primitive.css    --mpn-indigo-500: #6366F1        raw values, no meaning
src/css/tokens/semantic.css     --mpn-accent: var(--mpn-indigo-500)   a role
src/css/components/button.css   background: var(--mpn-accent)          usage
```

**A component never references a primitive.** That single rule is what makes an alternate theme a
block of variables instead of a search through twenty stylesheets. `build/verify.mjs` fails the
build if a component reaches for an undeclared token, and the layering is the reason it can.

`tokens/geometry.css` holds the other half of what a theme changes — radius, row height, border
width, blur, control height. Colour is the *least* of what distinguishes one look from another:
during the visual probe, two directions shared a palette and still read as different products
because one used 14 px radius and 52 px rows and the other used 4 px and 36 px.

## Switching dark and light

`marspanel-theme.js` resolves the theme before first paint and writes `data-theme` on `<html>`:

1. `localStorage["mpn-theme"]` if the user has chosen
2. otherwise `prefers-color-scheme`
3. otherwise dark

```js
mpnTheme.get();        // "dark" | "light"
mpnTheme.set("light");
mpnTheme.toggle();
mpnTheme.clear();      // forget the choice, follow the system again
```

Any element with `data-mpn-theme-toggle` flips it. There is no CSS-only media-query fallback on
purpose: two copies of a palette drift, and dark is a safe default for a page whose script failed.

## Two tokens for lines, not one

```
--mpn-border    component outlines: cards, inputs, buttons
--mpn-line      dividers: table rows, feed items, section rules
```

These were one token until a theme set it to `transparent` to drop card outlines and silently
erased every table row divider with it. If your theme removes outlines, it must still draw rows.

## Status is a vocabulary, not a colour

Six states, one class, and every stateful component reads the same two variables:

```css
.mpn-is-warn {
  --mpn-state: var(--mpn-warn);
  --mpn-state-tint: var(--mpn-warn-tint);
}
```

So `mpn-is-warn` works identically on a pill, a banner, a timeline dot, a calendar event, a board
card, an info box, a log line, a topology node and a donut segment. Adding a seventh state means one
block of two lines, not one rule per component.

Map your own nouns onto the six. `running`, `bound`, `granted`, `paid` and `shipped` are all `ok`.

## Surfaces are alpha, not hex

In Aurora, `--mpn-bg-raised` is `rgba(255,255,255,.075)` — a translucency, not a colour. Two
consequences you cannot ignore:

- **Nesting compounds.** A card inside a card reads brighter than either. Nest at most one level.
- **`backdrop-filter` is load-bearing.** Where it is unsupported, surfaces fall back to a flat
  translucent fill: still legible, but the depth the theme is built on is gone.

The contrast audit composites every translucent surface over its real backdrop before measuring, so
the numbers in [accessibility.md](accessibility.md) are what renders, not what is declared.

## Writing another theme

Aurora won the probe; three other directions survived it and were never discarded. Shipping one is a
new file that overrides the semantic and geometry layers, nothing more:

```css
@import "../tokens/primitive.css";

:root[data-skin="void"] {
  --mpn-bg: #000;
  --mpn-bg-raised: #0a0a0c;
  --mpn-border: rgba(255, 255, 255, 0.1);
  --mpn-line: rgba(255, 255, 255, 0.08);
  --mpn-accent: #fafafa;
  --mpn-radius: 4px;
  --mpn-row-h: 36px;
  --mpn-blur: 0px;
}
```

Two rules keep this honest:

1. Redefine only what `semantic.css` and `geometry.css` declare. If you need a new token, it belongs
   in the semantic layer for every theme, not in yours.
2. Run `node build/a11y.mjs`. A theme that has not been measured is a theme that fails somewhere you
   have not looked — the first audit of Aurora failed fourteen pairs.

## Density

Three presets, set on any ancestor:

```html
<div data-density="compact">…</div>
```

| Value | Row height | Card padding |
|---|---|---|
| `compact` | 34 px | 14 px |
| default | 42 px | 18 px |
| `relaxed` | 52 px | 22 px |
