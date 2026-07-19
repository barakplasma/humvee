# Humvee A2 Driver Trainer

A simple, mobile-first educational game (built for **Android Chrome**, works on any modern
browser) that teaches how to operate a **US military HMMWV "Humvee" A2**. Built with
[Phaser 4](https://phaser.io/) — no build step, just static files.

> ⚠️ **Training aid, not an operator's manual.** This game is a simplified educational
> simulation. It is **not** an authoritative source. The real reference is the operator's
> technical manual **TM 9-2320-280-10**. Always follow official training and supervision
> before operating any actual vehicle.

## Stages

1. **Controls Tour** — tap every driver control to learn what it does, then run the
   start-up sequence (parking brake, wait-to-start glow plugs, start, select a gear).
2. **City Driving** — top-down simulator: obey lights/signs, stay on the road, reach the
   destination.
3. **Off-Road & Gears** — drills the **transfer case** (`H / HL / N / L`) and
   **transmission** (`P / R / N / OD / D / 2 / 1`) against terrain scenarios.
4. **Technical Off-Road** — slopes, side-slopes, traction loss (3-wheel), and water
   fording, using the techniques from Stage 3.
5. **Trailer Parking** — hitch up and reverse an M149 water trailer into a marked
   bay (articulated trailer physics; reverse steering is inverted).

## Controls

On a phone, **tilt to steer** (tap the wheel to re-centre); on desktop use the arrow
keys / WASD, a connected gamepad's left stick and triggers, or drag the on-screen wheel.
Gas/brake are the on-screen pedals. A
**fullscreen** button (⛶) is on the menu and every stage — best experienced
fullscreen in landscape.

## Languages

English and Hebrew (עברית), with right-to-left support. Use the language toggle on the
title screen. To add a language, copy `js/i18n/en.js` to `js/i18n/<code>.js`, translate the
values, and register it in `js/i18n/i18n.js`.

## Run locally

No dependencies to install. Serve the folder over HTTP (ES modules need `http://`, not
`file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Pushing to `main` (or the dev branch) triggers `.github/workflows/deploy-pages.yml`, which
publishes the static site to **GitHub Pages**:

    https://barakplasma.github.io/humvee/

(You may need to enable Pages once in the repo's **Settings → Pages → Source: GitHub
Actions**.)

## Assets: real photos + AI images

Art is resolved per logical id with this priority (see `js/assets/manifest.js`):

**override image (real photo or AI) → procedural drawing (always available)**

So the game runs fully even with no image files present. Override images are listed in
[`assets/overrides.json`](assets/overrides.json), a simple id → path map:

```json
{
  "title_art": "assets/photos/title_art.jpg",
  "dashboard_panel": "assets/photos/dashboard_panel.jpg"
}
```

The title and cockpit ship as **real museum photos** of an HMMWV in `assets/photos/`.
AI-generated alternates (Google Gemini image via OpenRouter) remain in `assets/ai/` and
can be swapped back in by re-pointing the ids above.

> Note: the Stage 1 hotspot positions in `js/data/controls.js` are tuned to the shipped
> `dashboard_panel` cockpit photo. If you replace it with a differently-framed photo,
> nudge those coordinates to match.

### Replacing an AI image with a real museum photo

1. Drop your photo into `assets/photos/` (e.g. `assets/photos/dashboard_panel.jpg`).
2. Point that id at it in `assets/overrides.json`
   (`"dashboard_panel": "assets/photos/dashboard_panel.jpg"`).

That's it — a real photo always wins over the AI image. Recognised ids:

| id                | used for                                 | good aspect |
| ----------------- | ---------------------------------------- | ----------- |
| `title_art`       | title / menu background                  | any (cover) |
| `dashboard_panel` | Stage 1 first-person cockpit background  | any (cover) |
| `humvee_topdown`  | vehicle sprite, Stages 2–3 (top-down)    | transparent |
| `humvee_side`     | vehicle sprite, Stage 4 (side profile)   | transparent |
| `trail_bg`        | Stage 3 off-road ground (tiled)          | seamless    |

The vehicle sprites and the tiled trail default to procedural art (clean transparency /
seamless tiling); the title and cockpit ship as AI images.

## Tech notes

- Vanilla ES modules; Phaser 4.2.1 vendored locally at `js/vendor/phaser.min.js`
  (no CDN, fully self-contained and offline-capable).
- Progress and language are saved in `localStorage`.
- `Phaser.Scale.FIT` keeps a 1280×720 design landscape and scales to the device; a
  rotate-to-landscape hint appears on portrait phones.
