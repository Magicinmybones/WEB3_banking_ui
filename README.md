# Seamless Web3 Banking

A hand-built HTML / CSS / vanilla-JS implementation of the supplied Figma
file (`Untitled_13.fig`). No frameworks, no build step — open `index.html`
or serve the folder statically.

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

The document contains one page with two 1800 × 1350 presentation frames:

| Figma frame            | Section in the build |
| ---------------------- | -------------------- |
| `Dribbble shot HD - 128` | Hero — nav, "Seamless Web3 Banking", card showcase |
| `Dribbble shot HD - 129` | Features — "Your Digital Lifestyle" and the three cards |

Inside each frame the website itself is a **1685 × 1073** rounded panel at
`(58, 207)`. The surrounding light-grey presentation board and its
`kris anfalova` / `case ui/ux` credit layers are the mockup wrapper, not the
product, so they are not part of the build. Both panels are reproduced at
their exact Figma coordinates, including the nav bar that each frame carries.

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

The file only contains desktop frames, so the design is not reinterpreted:

* **≥ 1685px** — renders 1:1.
* **900–1685px** — the whole artboard is scaled proportionally, so every
  proportion stays identical to Figma.
* **< 900px** — the two panels reflow into a single column at readable type
  sizes. The three feature cards are pixel-locked compositions, so each is
  scaled as a unit rather than pulled apart.

## Interactions

Only what the file represents:

* nav pills carry a 10 % white fill that is switched off in the frame — it is
  wired up as the hover / selected state, with smooth scrolling to sections;
* the showcase dots have a selected and an unselected state;
* focus-visible outlines for keyboard use.

No decorative animation was added.
