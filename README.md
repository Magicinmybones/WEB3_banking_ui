# Seamless Web3 Banking

A hand-built HTML / CSS / vanilla-JS implementation of the supplied Figma
files (`Untitled_13.fig`, `Untitled_14.fig`). No frameworks, no build step —
open `index.html` or serve the folder statically.

```
index.html
css/style.css
js/script.js
assets/
  images/   photography and textures exported from the .fig
  svg/      vector paths exported from the .fig
  fonts/    self-hosted woff2
```

## What was implemented

The two files are the same document exported twice, each with a different
frame made visible, so each supplies one section:

| Source file        | Figma frame              | Section in the build |
| ------------------ | ------------------------ | -------------------- |
| `Untitled_13.fig`  | `Dribbble shot HD - 128` | 1 — hero: nav, "Seamless Web3 Banking", card showcase |
| `Untitled_14.fig`  | `Dribbble shot HD - 129` | 2 — "Your Digital Lifestyle" and the three cards |

Inside each frame the website itself is a **1685 × 1073** rounded panel at
`(58, 207)`. The surrounding light-grey presentation board and its
`kris anfalova` / `case ui/ux` credit layers are the mockup wrapper, not the
product, so they are not part of the build. Both panels are reproduced at
their exact Figma coordinates, including the nav bar that each frame carries.

The two sections are **independent**. They share only the design tokens and
the three chrome components that are byte-identical in both frames (logo,
nav pills, white button) — and even those are *positioned* separately, each
section placing them from its own frame. Section 2 owns its whole namespace
(`.lifestyle`, `.lcard`, `.lring`, `.ltag`, …) and inherits no layout from
section 1. On mobile, `--panel-gap` adds a small seam between the reflowed
panels because the source frames are separate boards.

Everything else comes straight out of the file: paint colours, gradient
transforms (linear, radial and angular, converted to their CSS equivalents),
corner radii, stroke weights, blend modes, background/layer blurs, the noise
effect, and every layer's x/y/width/height.

## Assets

Bitmaps were exported from the `.fig` archive and re-encoded (JPEG/WebP for
the photographic layers, PNG for the two card renders). All icons — the logo,
the arrow, the key and the staking bolt — are the original vector paths
decoded out of the file's geometry blobs, not substitutes from an icon set.

## Fonts

The design uses **TT Hoves Medium** (display) and **Suisse Intl Regular**
(body). Both are commercial licences that cannot be redistributed, so the
metrically closest freely available faces are self-hosted instead:

| Figma                 | Build                  | Mean advance delta |
| --------------------- | ---------------------- | ------------------ |
| TT Hoves Medium       | Figtree 500            | ~1.6 %             |
| Suisse Intl Regular   | Instrument Sans 400    | ~1.4 %             |

Every headline and paragraph break is hard-coded, so line wrapping matches
the Figma frames word for word regardless of the substitution. Line heights
use the same rounded pixel values Figma lays text out with, and the two
largest headings are nudged by the ascent difference so their first baseline
lands where Figma puts it.

## Responsive behaviour

The file only contains desktop frames, so the desktop design is preserved as
a proportional artboard:

* **≥ 901px** — each section occupies one dynamic viewport-sized slot. The
  artwork scales uniformly from the limiting axis, then the panel expands
  along the free axis. The two hero panes, edge controls and feature-card
  spacing absorb that room fluidly, so the design fills the viewport without
  side gutters or distorted content. Section-to-section scroll snapping lands
  each panel cleanly.
* **≤ 900px** — the two panels reflow into a single column at readable type
  sizes. The three feature cards are pixel-locked compositions, so each is
  scaled as a unit rather than pulled apart.

## Verification

Both sections were diffed against the reference render embedded in their
own `.fig`: every element's rendered box was checked against the decoded
frame geometry (45 elements, all exact bar the nav pill width, which moves
with the substituted font), and the rasterised sections were aligned and
compared — 3.2 % mean absolute error for section 1 and 2.2 % for section 2,
almost all of it high-frequency photo texture and glyph-shape difference.
The key plate's angular gradient, the one paint whose orientation the file
format leaves ambiguous, was fitted against the reference over 48 candidate
orientations; the winner matches the transform-handle derivation
(`from 180deg`).

## Interactions

Only what the file represents:

* nav pills carry a 10 % white fill that is switched off in the frame — it is
  wired up as the hover / selected state, with smooth scrolling to sections;
* the showcase dots have a selected and an unselected state;
* focus-visible outlines for keyboard use.

No decorative animation was added.
