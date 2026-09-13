# JavaScript

Two files, no configuration, no initialisation call. Everything is wired through `data-mpn-*`
attributes and delegated from `document`, so markup you inject at runtime works without being told
about.

## Overlays

```html
<button data-mpn-open="detail">Open</button>

<div class="mpn-drawer" id="detail" hidden role="dialog" aria-modal="true">
  <button data-mpn-close>Close</button>
</div>
```

Works for `.mpn-modal`, `.mpn-drawer` and `.mpn-palette`. Each one traps `Tab`, closes on `Escape`
and on scrim click, stacks correctly when opened over another, and returns focus to whatever opened
it.

`⌘K` / `Ctrl+K` opens `.mpn-palette` if the page has one.

```js
mpnUI.open(el);
mpnUI.close(el);
```

## Menus, popovers and tooltips

```html
<button data-mpn-menu="row-menu">Actions</button>
<div class="mpn-menu" id="row-menu" hidden>…</div>
```

Position is computed against the trigger and flipped upward when the menu would fall off the bottom
of the viewport — in RTL it aligns to the trigger's right edge instead. Do not write `top` and
`left` yourself.

```html
<button data-mpn-tip="Rotate this key">…</button>
```

Tooltips appear on hover **and on keyboard focus**, and dismiss on scroll. A tooltip only reachable
with a mouse is not a tooltip.

## Toasts

```js
mpnUI.toast({
  title: "Snapshot queued",
  body: "snap-4471 · web-01",
  state: "ok",      // ok | warn | danger | info | pending | idle
  timeout: 4000     // 0 keeps it until dismissed
});
```

The host container is created on first use. Each toast is `role="status"` and carries its own
dismiss button.

## Tabs and wizard steps

```html
<div class="mpn-tabs" data-mpn-tabs>
  <a role="tab" aria-selected="true" aria-controls="p1" href="#">Overview</a>
  <a role="tab" aria-selected="false" aria-controls="p2" href="#">Logs</a>
</div>
<div id="p1">…</div>
<div id="p2" hidden>…</div>
```

Arrow keys move between tabs and respect RTL. Steps work the same way with `data-mpn-steps` on the
`.mpn-stepper`, and `data-mpn-step-next` / `data-mpn-step-prev` pointing at its id. Completed steps
are marked automatically; the container emits `mpn:step` with the new index.

## Tables

```html
<table data-mpn-sort>
  <thead>
    <tr><th data-sort="text">Name</th><th data-sort="num">Age</th></tr>
  </thead>
  <tbody>
    <tr><td>web-01</td><td data-value="14">14d</td></tr>
  </tbody>
</table>
```

`data-value` overrides the cell text when sorting. **Use it for anything that reads as text but
means a number** — without it `2m` sorts before `14d`, and a table that looks sorted but is not is
worse than one that will not sort at all.

```html
<input data-mpn-filter="inst-table">
<span data-mpn-filter-count>8</span>
```

Bulk selection needs a `data-mpn-select-all` checkbox in the head, `data-mpn-row-check` in each row
and a `[data-mpn-bulkbar]` element; the count lands in `[data-mpn-bulk-count]`.

## Navigation and panes

| Attribute | Effect |
|---|---|
| `data-mpn-nav-toggle` | opens the sidebar drawer below 820 px |
| `data-mpn-nav-group` | collapsible sidebar section; expects a sibling `.mpn-nav-sub` |
| `data-mpn-sidebar-lock` | pins the sidebar to its icon rail on desktop, remembered in `localStorage` |
| `data-mpn-tree-toggle` | expands the `.mpn-tree-branch` it sits in |
| `data-mpn-split` | drag handle for `.mpn-split`, writes `--mpn-split-w` |
| `data-mpn-theme-toggle` | flips dark / light |
| `data-mpn-dir-toggle` | flips LTR / RTL, remembered in `localStorage` |

## Widgets

`widgets.js` upgrades three inputs in place.

```html
<input class="mpn-input" data-mpn-datepicker placeholder="YYYY-MM-DD">

<div class="mpn-combo" data-mpn-combo>
  <input class="mpn-combo-field" aria-label="Time zone">
  <input type="hidden" name="tz">
  <div class="mpn-combo-list" hidden>
    <button class="mpn-combo-option" data-value="Asia/Jakarta">Asia/Jakarta</button>
    <div class="mpn-combo-empty" hidden>No zone matches</div>
  </div>
</div>

<input class="mpn-input" data-mpn-colorpicker value="#6366f1">
```

The date picker writes `YYYY-MM-DD` and fires `change`. The combobox filters as you type, moves with
arrow keys, commits on `Enter`, writes to its hidden input and fires `mpn:choose`.

After injecting markup at runtime:

```js
mpnWidgets.init(container);
```

Already-upgraded elements are skipped, so calling it twice is safe.

## What is deliberately absent

No carousel, no rich-text editor, no chart library, no jQuery-style plugin registry. Each one either
needs a dependency or does not belong in an admin panel, and the promise of a page that makes no
network requests is worth more than all three.
