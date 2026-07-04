# Meridian — a travel catalog

A high-end travel catalog site. Six places, six moods, one continuous scroll.

## Structure

- Vertical scroll-snap: every section is a full-viewport (`100svh`) panel, one country per section
- Four photographic layers per panel: a blurred full-bleed backdrop, a ghost index numeral, an offset photo plate (alternating left/right), and the content stack — all drifting at different rates
- Oversized city-name headline fitted to 80% of the viewport width, layered over the plate it slightly overlaps
- On snap entry: the plate opens with a `clip-path` reveal, the photo settles from a slow Ken Burns zoom, and the headline rises letter by letter with a staggered, slightly overshooting ease; kicker, coordinates, blurb, and link follow
- Current-section indicator at bottom right: rolling counter, progress rule, and place label, tinted with the active section's accent
- Rail navigation on the right edge (hover reveals labels, click to jump), plus arrow-key navigation
- Pointer + scroll parallax driven by a single lerped `requestAnimationFrame` loop
- Variable-font proximity effect: headline letters swell in weight toward the cursor
- Dark tonal palette with an animated film-grain overlay
- Display typography: Fraunces (variable, optical size 144) with Instrument Sans for UI labels — both self-hosted in `assets/fonts/`

## Itinerary pages

Every panel's "View itinerary" link opens a long-form companion page in
`itinerary/` — same palette, type system, eases, grain, and rail, but built
for reading rather than snapping. Each page is one consistent sequence:

1. **Hero** — the destination restated: full-bleed backdrop, ghost numeral,
   letter-rise headline, coordinates, and a one-line standfirst
2. **I · The brief** — an italic lede, two paragraphs of approach, and a
   ruled fact sheet (season, duration, pace, base, getting in)
3. **II · Day by day** — four or five days, each with a summary and a
   time-stamped list of moments; alternating photo plates open with the
   catalog's clip-path reveal, photo-less days carry a ghost day numeral
4. **III · Field note** — a full-bleed pull quote on the accent's radial glow
5. **IV · Essentials** — getting there / staying / notes
6. **Next departure** — an oversized link to the following destination,
   plus a return to the catalog

The section rail tracks these six stops; the bottom-right indicator becomes
a reading-progress rule. Each page carries its destination's accent color
and tonal gradients on `<body data-city>`.

## Imagery

Each section's primary image is a bespoke photograph generated with
Higgsfield (Soul v2, 1536×2048), art-directed to the catalog's dark tonal
palette — the sharp plate loads the raw PNG while the blurred full-bleed
backdrop loads the lightweight webp preview. Fallback candidates are
Unsplash CDN hotlinks, and if every candidate fails the section falls back
to its tonal gradient plate and hides the credit — the layout never breaks.
Images load lazily as the reader approaches each section. To art-direct a
section, edit its candidate list in `js/main.js` (`PHOTOS`); the itinerary
pages keep their own per-slot candidate lists in `js/itinerary.js`
(hero plus two bespoke day plates per destination).

## Motion system

Four custom eases defined once in `css/style.css`:

| token | curve | used for |
| --- | --- | --- |
| `--e-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | long exponential settles |
| `--e-cinema` | `cubic-bezier(0.65, 0.05, 0, 1)` | clip reveals, big moves |
| `--e-chew` | `cubic-bezier(0.34, 1.52, 0.44, 1)` | overshooting, tactile accents |
| `--e-soft` | `cubic-bezier(0.45, 0, 0.15, 1)` | fades and color shifts |

Continuous motion (parallax, letter weights) is lerped per frame rather than
transitioned, which is what gives it the smooth, weighted feel.
Everything respects `prefers-reduced-motion`.

## Running

Static site, no build step. Serve the root over HTTP (fonts won't load from `file://`):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

```
index.html        markup: six place panels + fixed chrome + rail nav
itinerary/        six long-form itinerary pages (one per destination)
css/style.css     palette, layered gradients, eases, reveal choreography, grain
css/itinerary.css shared itinerary layout: hero, brief, days, note, essentials
js/main.js        photo loading with fallback, letter-splitting, 80vw text
                  fitting, IntersectionObserver, rAF motion engine, rail/keys
js/itinerary.js   itinerary photo slots, scroll reveals, section rail,
                  reading progress, hero parallax
assets/fonts/     self-hosted variable woff2 (Fraunces, Instrument Sans)
```
