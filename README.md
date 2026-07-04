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

## Photography

Photographs are hotlinked from the Unsplash CDN (per Unsplash's hotlinking
guidelines). Each section has an ordered candidate list in `js/main.js`
(`PHOTOS`); if every candidate fails to load, the section falls back to its
tonal gradient plate and hides the photo credit — the layout never breaks.
To art-direct a section, replace the URLs in that map.

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
css/style.css     palette, layered gradients, eases, reveal choreography, grain
js/main.js        photo loading with fallback, letter-splitting, 80vw text
                  fitting, IntersectionObserver, rAF motion engine, rail/keys
assets/fonts/     self-hosted variable woff2 (Fraunces, Instrument Sans)
```
