# Meridian — a travel catalog

A high-end travel catalog site. Six cities, six moods, one continuous scroll.

## Structure

- Vertical scroll-snap: every section is a full-viewport (`100svh`) panel, one country per section
- Oversized city-name headline fitted to 80% of the viewport width, layered over a full-bleed tonal gradient and an inner gradient plate it slightly overlaps
- On snap entry, the headline rises letter by letter with a staggered reveal; kicker, coordinates, blurb, and link follow in sequence
- Current-section indicator at bottom right: rolling counter, progress rule, and place label, tinted with the active section's accent
- Dark tonal palette with an animated film-grain overlay
- Display typography: Fraunces (variable, optical size 144) with Instrument Sans for UI labels — both self-hosted in `assets/fonts/`

## Running

Static site, no build step. Serve the root over HTTP (fonts won't load from `file://`):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

```
index.html        markup: six country panels + fixed chrome
css/style.css     palette, gradients, reveal animations, grain
js/main.js        headline letter-splitting, 80vw text fitting,
                  IntersectionObserver snap-entry detection, indicator
assets/fonts/     self-hosted variable woff2 (Fraunces, Instrument Sans)
```

Respects `prefers-reduced-motion`.
