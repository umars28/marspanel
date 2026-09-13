# 0001 — Visual direction: Aurora

Status: accepted
Date: 2026-09-14

## Context

The visual direction could not be chosen by discussion. Written descriptions and ASCII sketches
cannot carry what actually separates one direction from another: colour weight, shadow size, row
rhythm, border weight, type scale.

So a probe was built instead — one dashboard screen, identical markup, rendered in several directions
with a toggle. Seven directions were drawn across two rounds:

| | Direction | Outcome |
|---|---|---|
| A | Dense operator — dark navy, mono-accented, hairline borders, 34 px rows | kept through both rounds |
| B | Soft SaaS — light, 14 px radius, soft shadow, pastel accent | rejected |
| C | Enterprise classic — 4 px radius, card header bars, blue, high chrome | rejected |
| D | Editorial — heavy 2 px rules, oversized type, one loud accent | rejected |
| E | Terminal — monospace throughout, zero radius, reverse-video buttons | rejected |
| F | **Aurora** — dark, radial wash, glass surfaces, gradient primary | **chosen** |
| G | Warm — warm neutral greys, terracotta accent, 10 px radius | rejected |
| H | Tonal — no borders at all, tonal fills, pill controls, 50 px rows | survived, not chosen |
| I | Void — pure black, monochrome chrome, colour reserved for status | survived, not chosen |
| J | Frost — translucent light surfaces, system blue, capsule controls | survived, not chosen |

## Decision

Aurora is the default theme: dark-first, translucent surfaces layered over a radial
indigo / cyan / violet wash, 12 px radius, 42 px rows, gradient primary action.

## Consequences

**Backdrop filters are load-bearing.** `.mpn-card`, the sidebar, the topbar and every overlay use
`backdrop-filter: blur() saturate()`. Where it is unsupported the surfaces fall back to a flat
translucent fill, which stays legible but loses the depth the direction is built on. This is the
first thing to check when the theme looks wrong.

**Surfaces are alpha, not hex.** `--mpn-bg-raised` is `rgba(255,255,255,.075)`, not a colour. Nesting
two translucent surfaces compounds their lightness, so a card inside a card reads brighter than
either. Nesting is allowed at most one level deep.

**Depth ordering must survive greyscale.** `sunken → base → raised → overlay` is a monotonic
lightness ramp. The wash sits behind everything at `z-index: 0` on `.mpn-root::before` and must never
be layered between surfaces.

## What was learned from the probe

Forcing one markup to serve every direction found a real defect in the token design: directions H and
I set component outlines to `transparent`, which also erased table row dividers, because both read a
single `--mpn-border`. The token layer now separates `--mpn-border` from `--mpn-line`.

The probe also showed that colour is the least of what distinguishes a direction. B and C were both
light with a blue-violet accent and still read as different products, because radius was 14 px
against 4 px and rows were 52 px against 36 px. Six knobs carry the identity: radius, row height,
border width, shadow, numeral font, and stat type scale.

## Alternatives kept alive

H, I and J survived selection and are not discarded. Because components only reference semantic
tokens, each can ship later as an alternate theme — a block of variables plus a handful of geometry
overrides — without touching a single component file.
