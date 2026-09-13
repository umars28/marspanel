# Security

## Scope

marspanel is CSS, HTML and browser JavaScript. It has no server, no build-time dependencies, no
network calls and no data handling of its own. That removes most of the usual attack surface, and it
means the realistic vulnerability classes here are narrow:

- **DOM XSS** in `src/js/` — anywhere the library writes `innerHTML` from a value a page author did
  not control. `mpnUI.toast()` interpolates `title` and `body` as HTML on purpose so icons and
  `<strong>` work; **do not pass unescaped user input to it.** Escape at the call site.
- **Sprite injection** — `dist/sprites.js` writes the sprite markup into the document. Build it only
  from SVG you control.
- **Clickjacking or focus escape** in overlays — a modal whose focus trap can be escaped while the
  scrim is up.

Out of scope: the demo data in `pages/` (fictional), the absence of CSRF or authentication (there is
no server), and anything requiring a compromised build machine.

## Reporting

Open a [private security advisory](https://github.com/umars28/marspanel/security/advisories/new).
Do not open a public issue for something exploitable.

Expect an acknowledgement within 7 days. There is one maintainer, so please be patient beyond that.

## Supported versions

Only the latest minor release. The project is pre-1.0; there are no backports.

## Hardening notes for consumers

The library adds nothing to your CSP. It works under a strict policy because it loads nothing:

```
default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:
```

`data:` is needed only for the checkbox tick, which is an inline SVG data URI in `form.css`.

If you inline the sprite instead of loading `sprites.js`, you can drop `script-src` entirely for
pages that need no behaviour.
