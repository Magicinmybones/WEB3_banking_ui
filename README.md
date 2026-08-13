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

* **≥ 1200px** — each section occupies one dynamic viewport-sized slot. The
  artwork scales uniformly from the limiting axis, then the panel expands
  along the free axis. The two hero panes and edge controls absorb that room
  fluidly. Section 2 remains an edge-to-edge three-column track with 10px
  panel insets and 10px card gutters; the card surfaces grow with the columns
  while their pixel-locked illustrations stay centred and undistorted.
  Section-to-section scroll snapping lands each panel cleanly.
* **600 – 1199px** — the tablet architecture, below.
* **≤ 599px** — the mobile architecture, below.

### Where the tablet breakpoint comes from

A uniformly scaled artboard never collides or overflows as the viewport
narrows — it just renders smaller — so the only thing that can fail is
legibility, and that is what the breakpoint was measured against. Rendered
type at each width:

| viewport | scale | lede | card copy | nav pill | tag / eyebrow |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | 0.839 | 18.5 | 15.1 | 13.4 | 11.7 |
| 1280 × 800 | 0.746 | 16.4 | 13.4 | 11.9 | 10.4 |
| 1200 × 800 | 0.712 | 15.7 | 12.8 | 11.4 | 10.0 |
| 1180 × 820 | 0.700 | 15.4 | 12.6 | 11.2 | 9.8 |
| 1024 × 768 | 0.608 | 13.4 | 11.0 | 9.7 | 8.5 |

1200px is the last width where the body copy still holds the 13px range and
the small labels hold 10px, so the artboard keeps its own architecture down to
there — well past the conventional 1024px tablet breakpoint — and hands over
only where it would start shrinking the design instead of laying it out. The
height axis is deliberately left out of the trigger, so no window that renders
the desktop composition today changes architecture.

### The tablet architecture

Below 1200px the artboard stops scaling and the same elements are re-composed
at their native type sizes. Nothing is removed and no component is redrawn.

* **Hero.** The two panes stay side by side whenever the viewport is at least
  as wide as it is tall — keying the switch to the shape rather than to a
  device width keeps every landscape tablet on the frame's own split and gives
  portrait ones the stacked composition, with no jump at an arbitrary width.
  The copy that floats over the left pane on desktop keeps that pane as its
  surface: the two share one grid cell.
* **Showcase.** Becomes a four-row grid (eyebrow, card, copy, dots), so the
  pieces cannot collide the way the desktop percentages did once the pane
  changed shape. The card is sized by the row it is given and is never scaled
  past its own 301 × 423 render, so it stays sharp; its aspect ratio holds to
  four decimal places at every width.
* **Feature cards.** Two across while a column can still carry a card at a
  readable scale (≥ 940px, where the 18px description is still ~14px); the two
  tall cards pair on the first row and the short one centres below at exactly
  one column's width, so all three keep the same scale. Below that the grid
  goes to one column and the cards run at their native size — they are 1×
  exports, so they are never upscaled.
* **Navigation.** One bar for the whole page. Each frame carries its own nav
  bar, which is right on desktop — the panels are separate boards and only one
  is ever on screen — but once they reflow into a single scrolling document it
  shows as two stacked bars. Section 2's copy of the chrome stands down and
  section 1's is lifted out of its panel onto the viewport, fixed to the top,
  serving both sections. No destination is lost: the two bars carried the same
  three links and the same button. It reads as no surface at all over the
  panel's black at rest, and picks up a tint and blur — the glass treatment
  the tags and badge already use — once artwork scrolls under it. Both panels
  inset their content by the bar's height, and in-page jumps clear it. The nav
  row itself folds into a burger; see below.
* **Margins** scale with the viewport (`clamp`) instead of holding the desktop
  values or collapsing to the edge.

The section transition and scroll snapping belong to the scaled artboard and
are not used below 1200px, where the page simply flows.

### Where the mobile breakpoint comes from

The compact architecture holds all the way down to 600px, which is its own
floor, so mobile begins exactly where it ends — it cannot start any later.
What fails first below it is the feature card: it is a pixel-locked 548px
composition scaled as a unit, so its type scales with it.

| viewport | card scale | description | label |
| --- | --- | --- | --- |
| 560px | 0.95 | 17.1 | 13.3 |
| 480px | 0.80 | 14.5 | 11.3 |
| 440px | 0.73 | 13.2 | 10.2 |
| 375px | 0.61 | **11.0** | **8.6** |
| 320px | 0.51 | **9.2** | **7.2** |

Below roughly 440px it falls under the same 13px body / 10px label floor the
artboard hands over at, and no phone in portrait is wider than that.

### The mobile architecture

* **Feature cards.** The card stops being scaled. It keeps the frame's own
  vertical composition — every offset is the Figma y coordinate measured from
  the card surface — and its native element sizes, and only re-anchors the
  artwork horizontally to the card's centre. The copy returns to normal flow
  so it can wrap. The gaps are expressed against the card's width rather than
  in pixels, so the composition keeps its proportions as the card narrows
  instead of leaving the artwork stranded in a fixed band. At the top of the
  band they resolve to the frame's own numbers, which is what makes the 600px
  boundary invisible: the description holds 18px and the labels 14px at every
  width down to 320px, where they were 9.2px and 7.2px before.
* **Hero.** The media pane returns to the frame's own portrait proportion. A
  landscape pane starves the card — the subject of the section — because the
  card is sized by the row it is given, and on a phone that row runs out
  first. The card goes from 134px wide to 207px at 375px.
* **Navigation.** The single fixed bar and its burger, which the compact
  architecture already carries, now reach phones too; the nav row used to wrap
  onto two lines here. The menu takes the page width instead of hanging off
  one corner.
* **Copy.** Where a phone has to wrap the frame's hard line breaks again, the
  result is balanced rather than left with a stray word.

One adaptation was unavoidable: the transfer node's travel is drawn from a
path measured in the frame's own coordinates. The scaled card carries it
fine, but nothing scales on mobile, so the dot would leave the artwork
entirely — it keeps its place in the composition instead, and the globe clip
still loops.

## Verifying the responsive work

Renders were diffed pixel by pixel against the same commit's output at
1200 × 800/900, 1280 × 800, 1366 × 768, 1440 × 900, 1600 × 1000, 1920 × 1080
and at 375 × 812, 500 × 900, 599 × 900: **zero differing pixels**, so neither
the desktop artboard nor the small-viewport reflow moved. Thirty viewport
sizes from 1440px down to 600px, and sixteen more from 599px to 320px, were
then checked for horizontal overflow,
elements escaping their panel, internal scrollbars, collisions between the
showcase pieces and between the feature cards, card aspect distortion, and
that the burger and the nav row are never both present — all clean.

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

## Tablet menu

The one thing the frames do not contain is a tablet nav. When the bar folds,
the logo stays exactly as it is and the links and the "Get Early Access"
button move into a burger — they are not duplicated: both live in a wrapper
that is `display: contents` at every other width, so each frame keeps placing
them from its own coordinates and the desktop DOM is untouched.

The surface it opens is built from paints the page already uses — the section
2 card gradient, the 10% hairline, the 26px pane radius, and the staking
badge's shadow and 27.3px blur — and it holds the unchanged pill and button
components, only stacked. The burger's three hairlines are the panel's own 1px
stroke weight and cross into a close icon while it is open.

It opens on click, closes on Escape (returning focus to the burger), on a
click outside, and on choosing a destination; `aria-expanded` and
`aria-controls` are wired, the first item takes focus on open, and the closed
surface is `visibility: hidden`, so it is out of the tab order. Only CSS
decides when the burger applies.
All motion is scoped to the two supplied reference sequences.
