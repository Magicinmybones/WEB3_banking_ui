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
  along the free axis. The two hero panes and edge controls absorb that room
  fluidly. Section 2 remains an edge-to-edge three-column track with 10px
  panel insets and 10px card gutters; the card surfaces grow with the columns
  while their pixel-locked illustrations stay centred and undistorted.
  Section-to-section scroll snapping lands each panel cleanly.
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

## Section transition

Scrolling between the two sections plays the transition from the reference
recording. Every value below was measured off that recording frame by frame
at 60fps and fitted, rather than eyeballed:

| what | from → to | timing | curve |
| --- | --- | --- | --- |
| section 1 scene | opacity 1 → 0 | 0–800ms | linear |
| section 1 scene | translateY 0 → −3150px | 0–800ms | `2^(9.1(u−1))` ease-in, fit rms 3.4px |
| section 1 scene | scale 1 → 0.961 | 0–800ms | `1 − 0.039·u^0.62`, fit rms 0.001 |
| nav pills | x 96.76px → section 2's centred x | 17–750ms | `cubic-bezier(.42,.09,0,1)`, fit rmse 0.002 |
| section 2 heading | opacity 0 → 1 | 750–1333ms | ease-out, p 2.2 |
| security card | surface → illustration | 1060–1900ms | ease-out, p 2.2 |
| transfer card | surface → globe | 1390–2350ms | ease-out, p 2.2 |
| staking card | surface → rings → card → badge/tag | 1900–3400ms | ease-out, p 2.2 |

The logo and the "Get Early Access" button never move: the recording carries
one persistent header through the transition, which is why section 2's bar is
aligned to section 1's 37px rather than its own frame's 23px. At the 800ms
mark both scenes are invisible and the two panels are pixel-identical, so the
scroll is moved between slots there and the cut cannot be seen. The
transition is desktop-only and is skipped under `prefers-reduced-motion`.

The original handoff track remains verified against the recording (46
transition frames). The new Section 2 descendant sequence was mapped from the
recording's 24fps entrance frames and is kept on independent progress tracks:

| measurement | mean error | max error |
| --- | --- | --- |
| nav pill x | +0.7px | 3.0px |
| section 1 opacity | −0.007 | 0.028 |
| section 1 vertical position | −1.0px | 10.5px |
| section 2 heading opacity | +0.003 | 0.056 |

## Section 1 entrance

Section 1 now reproduces the reference entrance as independent descendant
tracks, so the completed section-to-section transition can continue to move
`.hero__scene` without competing transforms:

* the three display lines reveal through blur at 360ms, 460ms and 560ms;
* supporting copy and controls follow between 780ms and 1340ms;
* the Visa card fades/scales from 48% to full size, turns linearly through the
  reference's edge-on 270° pose, then completes 360° and rests face-on;
* the right pane uses the supplied five-second animated mountain clip, cropped
  to its square picture area and optimized to a 1080px H.264 web asset. A WebP
  poster is present for startup and playback fallback.

The entrance is desktop-only and respects `prefers-reduced-motion`; in that
mode the static final artwork is shown and the background video is paused.

## Section 2 entrance

The Section 1→2 handoff remains unchanged through its 800ms scene boundary.
After that boundary, Section 2 uses separately measured, reversible tracks:
the heading resolves first, then the security surface and key, then the
transfer surface and globe, and finally the staking surface, rings, card,
badge and yield tag. The supplied five-second globe clip starts with the
transfer artwork and loops with the reference's transfer node: the node fades
in beside “Any wallet”, follows a measured SVG-compatible circular motion path
over the globe, fades beside “Bank account”, and resets invisibly for the next
pass. The landscape
media window uses `object-fit: contain` so the square source retains the
reference's complete globe crown instead of being enlarged and top-clipped.

## Interactions

Only what the file represents:

* nav pills carry a 10 % white fill that is switched off in the frame — it is
  wired up as the hover / selected state, with smooth scrolling to sections;
* the showcase dots have a selected and an unselected state;
* focus-visible outlines for keyboard use.

All motion is scoped to the two supplied reference sequences.
