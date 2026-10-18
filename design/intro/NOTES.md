# Assembled intro: prototype notes

Prototype on branch `proto/intro-assembly`. Not for production as it stands (see Known limits).

## Preview it locally

```
SITE_BASE_PATH="" SITE_ORIGIN="https://jaipur-freiburg.de" npx next build
cd out && python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/ and stop the server when done. A reload plays it again.

## Timeline

| Time (s) | What happens |
|---|---|
| 0.0 to 0.8 | Empty plate, real gold logo centred in the viewport. This state is pure CSS, so the static HTML already shows it before JavaScript runs. |
| 0.8 to 1.4 | Logo glides up to where the green logo sat in the banner (power3.inOut, 0.6 s). Tagline fades in under it from 1.0 (0.4 s). |
| 1.2 to 2.8 | Ten pieces, 0.12 s apart: left lamp, right lamp, tandoori platter, peas curry, raita, paneer kadai, biryani, thali, samosa plate, paneer butter masala. Each settles from scale 1.08, 6 px up and transparent, to rest in 0.5 s (power2.out). The lamps start as the logo finishes its glide; the last piece lands at 2.78. |
| 2.8 to 3.3 | Hold on the full picture. |
| 3.3 to 3.75 | Picture and logo fade out while the stage turns the dark site colour #0D1117. |
| 3.65 to 4.15 | Stage fades out, hero shows. The intro unmounts and the hero carousel's 5 s timer starts now. |

The empty plate used to stand alone for 1.4 s, the whole glide included. The pieces now start 0.2 s earlier, at 1.2, so the first lamp is arriving while the logo settles. Everything after moved with them, so stagger, durations, hold (0.52 s) and fade are as before; the intro is 0.2 s shorter.

The order is back to front, so a dish never appears under one that is already there.

## Guardrails (checked by frames.py on the built site)

| Check | Result |
|---|---|
| Navbar above the intro: element under the reserve button (desktop) and menu button (phone) during the intro | navbar at 1440 x 900, 1920 x 1080 and 390 x 844 |
| Click at 0.6 s skips: stage gone 0.45 s later | yes, all three sizes |
| Carousel timer starts at the end, not on mount | intro ended 4.28 s after navigation, first slide change 9.30 s, gap 5.02 s |
| Client side navigation to /impressum and back to / | intro does not replay |
| prefers-reduced-motion: reduce | stage never shown, carousel runs from load |
| Horizontal overflow at all three sizes | 0 px |
| Tagline follows the language switch | DE, EN, FR frames |
| At rest, picture against the source mapped through the picture's own box (navbar and logo box left out) | mean difference 4.13 (1440), 3.52 (1920), 3.77 (390) out of 255; the `*-rest-diff-x8.jpg` maps show even resampling texture on every edge, no outline on one side of a dish, so every piece sits on its place |

Timing, skip, reduced motion, the no storage rule and the hand off to the hero are unchanged this round; only the layout and the images changed.

## Files

| File | Role |
|---|---|
| `design/intro/source/banner.webp` | Original source art, 1179 x 538. Superseded: the cut now runs from a 4x Real-ESRGAN upscale of it, 4716 x 2152, kept outside the repository (`jaipur-preview/intro-source/banner-x4.png`, 20 MB) |
| `design/intro/cut.py` | Cuts plate and layers from the source given as its argument, writes lossless full resolution masters to `design/intro/master/` (gitignored, never shipped), checks the at rest composite before compression |
| `design/intro/export.py` | Makes the shipped files from the masters: every image at 1/4, 1/2 and 3/4 of the master, plus phone crops; writes `public/images/intro/*.webp` and `src/data/intro-layers.json` |
| `design/intro/proof.py` | Composites every shipped set and measures it against the source resized to that set |
| `design/intro/frames.py` | Serves `out/`, drives the system Chrome, captures frames, runs the guardrail checks, the rest state check, the Retina crop and the payload measurement |
| `design/intro/proof/` | Review images at 1179 px: `plate.jpg` (the empty plate), `side-by-side.jpg` (source above, composite below), `composite.jpg`, `diff-x8.jpg`, `cores-overlay.jpg` (cores magenta, reach of the lifted shadows cyan) |
| `design/intro/frames/` | `desktop-t*.jpg` (1440 x 900), `wide-t*.jpg` (1920 x 1080), `phone-t*.jpg` (390 x 844) at 0.0, 1.2, 2.0, 3.4 s; `desktop-retina-thali-2x-t3.0s.jpg`; `*-rest-diff-x8.jpg`; `*-skip-click-at-0.6s.jpg`; `desktop-en/fr-t3.0s.jpg`; `desktop-reduced-motion-t0.3s.jpg` |
| `src/components/HomeIntro.tsx`, `intro.module.css` | The intro |
| `src/app/page.tsx` | Renders the intro, carousel timer waits for it |

Redo everything from the 4x source (about 6 minutes, cut.py peaks at 3.8 GB, so take the shared heavy lock):

```
SRC=".../jaipur-preview/intro-source/banner-x4.png"
python3 design/intro/cut.py "$SRC" && python3 design/intro/export.py && python3 design/intro/proof.py "$SRC"
```

then build and `python3 design/intro/frames.py "$SRC"`. export.py needs a master whose sides are multiples of 4 px, so it stops on the old 1179 px source. Shapes are hand fitted in the `LAYERS` table at the top of cut.py, in 1179 px design units scaled to the source; they fitted the 4x source unchanged (see `cores-overlay.jpg`).

Frames are taken by pausing the GSAP timeline and seeking it to each time, so a frame shows exactly that second of the intro without screenshot lag. The skip, carousel and navigation checks run in real time.

## The empty plate

What shows from 0 to about 1.3 s: cream paper with its grain, the three mandala ornaments, the scattered leaves that lie on open paper, and the green cloth at the top right. Before this round it showed dark ghost patches where dishes and lamps had been, an olive smear under the right lamp and dark pockets along the bottom edge. How each is solved in cut.py:

| Problem | Fix |
|---|---|
| Dark ghosts and rims around every dish | The dishes' soft shadows are no longer left on the paper. Around each dish the darkening is measured against the clean paper tone and split into a translucent overlay (opacity and colour per pixel) over lifted paper (clean tone plus the paper's own grain and ornament). Each dish carries its share of the overlay, so its shadow arrives with it. Shadow too deep to lift goes with the dish whole. |
| Fill tone muddied by shadows and dish edges | The clean tone is estimated only from paper that is not darker than its surroundings, never from shadows, leaves or steel, and not from the darker strip along the picture's left, right and bottom edges. |
| Flat fill | Grain with the clean paper's own statistics (strength per channel in a fine and a medium band, same colour correlation), random so no motif repeats. |
| Ornament cut off by a hole | Near every hole edge the paper's own structure is mirrored in and fades out over 28 px, so mandala lines run on. The mandala under the tandoori platter is continued around its centre (fitted to its visible rings at 310, 222) by reflecting its visible arc. |
| Olive smear under the right lamp | The cloth is a protected shape (`CLOTH`), drawn along its own folds. The shaded nook between lamp and cloth goes with the lamp; the plate shows paper there with a soft contact shadow under the cloth's edge. |
| Leaves cut along a dish outline | Leaves and crumbs that touch a dish (or overlap a leaf that does) go with it whole, with their own soft shadow; leaves on open paper stay whole. The left lamp now arrives with its leaf spray and the right lamp with its sprig. |
| Dark pockets along the bottom | Pockets of table shut in by dishes and the picture edge go to the nearest dish. |

Each layer's edge is a soft 4 px rim whose colour is solved against what lies under it, so WebP has no hard edge to ring on (with a hard edge, faint lines traced every outline in the difference map).

Where two dishes meet, the earlier one also reaches 16 px under the later one, opaque, its colour fading to the plate's over that distance. Without that, both rims were partly transparent over the light plate, and once each layer was resized on its own (by export.py, and by the browser at every size) a hairline of plate showed between them, for example through the leaf between peas curry and samosa plate. Before the dishes land the reach is invisible: it ends in plate colour.

## Crispness

The 4x source replaces the 1179 px banner. Every image is shipped in three sets: 1179, 2358 and 3537 px wide (1/4, 1/2 and 3/4 of the master; the 4716 px master itself is never shipped). Every layer box sits on a 4 px grid of the master, so in each set every layer lands on whole pixels of its own plate. Resizing is Lanczos on premultiplied colour in float, so soft edges and shadows keep their colour.

`srcset` lists the three sets with their real widths and `sizes` gives each image's rendered width (the picture is 100vh x 4716/2152 wide, or 100vw on screens wider than the banner). Every file of a set scales by the same factor, so the browser picks one set for all eleven images. Measured choices and sharpness:

| Screen | Set the browser picked | Image px per CSS px | Device px per image px | Before (1179 px source) |
|---|---|---|---|---|
| 1440 x 900 at 2x | 3537 | 1.79 | 1.12 | 2.44 |
| 1920 x 1080 at 1x | 3537 | 1.49 | 0.67 | 1.63 |
| 390 x 844 at 3x | 3537 phone crop | 1.91 | 1.57 | 1.89 |

Desktop goes from art enlarged 2.4 times on a Retina screen to 1.1 times. The phone now shows the picture 2.5 times larger than before (it covers the screen), and is still a little sharper than before. See `desktop-retina-thali-2x-t3.0s.jpg`: rice grains, naan blisters and coriander veins hold at 2x. The upscale itself has the slightly painted look of Real-ESRGAN in fine texture; it adds no detail the original never had.

## Payload

Bytes of intro images each device really downloaded (frames.py, `performance` resource entries, encoded size):

| Device | Bytes | Files |
|---|---|---|
| Retina desktop 1440 x 900 at 2x | 1,047,558 (1.05 MB) | plate and ten layers of the 3537 set |
| Desktop 1920 x 1080 at 1x | 1,047,558 | same set: the 2358 set is 9 px short of the 2367 px the picture needs |
| Phone 390 x 844 at 3x | 206,776 (207 KB) | plate, thali and four slivers of the 3537 phone crop |

Whole sets as exported: 235 KB (1179), 606 KB (2358), 1,048 KB (3537); phone crops 47, 119 and 207 KB. WebP quality 86 for the plate (smooth paper bands below about 85) and 80 for the layers (at 90 the 3537 set was 1.47 MB; dishes show no visible loss at 80 at these densities).

Phone crops: on screens up to 3:5 (all phones upright), the picture is centred on the thali and shows at most a band 0.6 x its height wide. export.py cuts the plate and every layer to that band (`*-phone-*.webp`), and a `<picture>` source with `(max-aspect-ratio: 3/5)` serves them. The five layers that never reach the band (both lamps, raita, paneer kadai, paneer butter masala) are hidden on phones with `display: none` and `loading="lazy"`, so a phone never fetches them (checked: six files). They keep their slot in the stagger, so the timing is the same. The gold logo PNG is the navbar's own file, already loaded.

## Logo contrast

Measured on the previous build's 1440 px frame at 3.0 s, not measured again this round. The logo still sits on the same cream paper, now also over a soft paper coloured glow, so the numbers should hold.

| Pair | Ratio |
|---|---|
| Gold (median of the logo strokes) on open cream | 1.77:1 |
| Brightest gold (90th percentile) on open cream | 1.22:1 |
| Edge ring 2 px around the strokes, with the treatment, on open cream | 1.95:1 |
| Brightest gold against that edge ring | 1.61:1 |
| Tagline #5a3a12 on the cream | 8.4:1 |

Gold on cream is too faint: the highlights nearly vanish. The logo file is unchanged. CSS adds a 0.6 px dark brown edge, a 3 px soft shadow and a 14 px faint halo (`filter: drop-shadow`, colour rgb 46 28 8).

## Layout

The picture covers the whole stage like `object-fit: cover`, on every screen: height 100 % and width 2.19 times that, or full width with the top and bottom trimmed on screens wider than 2.19:1. It is centred on the thali horizontally, clamped so it never stops covering. All geometry is in container units of the fixed stage, so it stays exact while a phone's toolbars move. Plate and pieces share one box rule (position and size in percent of the picture, from intro-layers.json), so every piece is locked to the plate's cover transform at any aspect ratio; the rest state check above confirms it at all three sizes.

The navbar sits over the picture. Behind it the stage draws the navbar's own scrolled look (rgba 13 17 23 at 0.85, 20 px backdrop blur), so its light links stay readable and the picture runs on underneath. There is no cream field and no mask fade anymore.

Logo and tagline sit in the open paper between the navbar and the top of the thali (40 % down the picture). The logo is sized to fit that space (at most 20 % of the picture width, at least 140 px), with a soft radial paper coloured glow behind both, no box.

| Screen | Picture | Logo width (from the CSS) | What shows |
|---|---|---|---|
| 1440 x 900 | 1972 x 900, 243 px cut on the left | 300 px | everything but the outer halves of both lamps |
| 1920 x 1080 | 2367 x 1080 | 395 px | the same, a little wider |
| 390 x 844 | 1850 x 844, centred on the thali | 218 px (56 % of the width) | the thali, cropped at both sides; tagline on two balanced lines above it |

Also looked at, not part of the frame set: 768 x 1024 (thali nearly whole, brand above it), 1280 x 720 and 2560 x 1080 (covered, 44 px trimmed top and bottom): no strip anywhere.

## Composite difference

Plate plus all ten layers at rest, against the source, outside the logo and tagline box:

| Stage | Mean absolute difference (0 to 255) |
|---|---|
| Before compression, full 4716 px (cut.py self check) | 0.011 |
| Shipped 3537 set (proof.py, float compositing, source resized to 3537) | 2.71, 99th percentile 17, max 55; encode floor 2.26 |
| Same files, second way (Pillow 8 bit alpha_composite) | 2.71 |
| Shipped 2358 set | 3.20; floor 2.70 |
| Shipped 1179 set | 4.16; floor 3.43 |
| Phone crops, 3537 / 2358 / 1179 | 2.75 / 3.27 / 4.35 |

The floor is what re-encoding the resized source alone at quality 86 costs; every set stays within 1.3 times it (proof.py fails above 1.5). The floors are higher than last round's 1.41 because the upscaled source has far more fine texture per pixel. The difference map shows WebP noise spread over food texture; the hairlines between neighbouring dishes are gone (see The empty plate). One faint line remains along the edge of the green cloth under the right lamp, where the cloth is cut off from the lamp; at normal size it reads as the cloth's own edge.

## Known limits

- The sharper source is an AI upscale, not a sharper original: fine texture has a slightly painted look up close. The original layered file would still be better.
- The empty plate is synthesised, not photographed. Under the dishes it is clean tone and grain; the mandala under the platter is a symmetric continuation of its visible quarter; up close a few faint flecks remain where leaves and stems were lifted off. A tiny leaf tip is left on the plate's top edge at the far left; it is under the navbar on every screen.
- The empty plate has fewer leaves than the finished picture: the sprays under the lamps, the right lamp's sprig and the leaves tucked against dishes arrive with them.
- Three small spots are fixed by hand shapes in `LAYERS`; they fitted the 4x source unchanged.
- Where two dishes meet, the earlier one shows its 16 px reach, fading to the plate, until the later one lands (0.12 to 0.5 s); with the reach, this soft margin is now along every shared edge, not only along overlaps. Visible in `desktop-t2.0s.jpg` beside the biryani and under the peas curry.
- Cover crops by design: at 1440 x 900 the outer halves of both lamps are off screen. On an upright phone only the thali and slivers of its neighbours show, so for the first 2 s the phone shows the logo on plain paper, the thali lands at about 2.0 to 2.5 s, and nine of the ten arrivals happen off screen. A phone specific arrangement would need its own art and timing.
- Phone landscape (844 x 390): covered, no strip, but the navbar takes a quarter of the height, so the logo (at its 140 px minimum) and tagline sit over the naan and the tagline is too small to read. Not handled.
- A 1920 x 1080 screen at 1x downloads the 3537 set (1.05 MB) because the 2358 set is 9 px short. A set between 2358 and 3537 px would suit it better, but needs a finer grid than 4 px in cut.py so every box stays on whole pixels.
- `window.__jaipurIntro` exposes the timeline for frames.py. Remove it before shipping.
- The hero text entrance still runs on mount and has finished under the intro by the time it lifts.
- Built once this round, under the shared lock; cut.py ran twice (the second run added the reach under later dishes), also under the lock.
