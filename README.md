# Humvee A2 Driver Trainer

Humvee A2 Driver Trainer is a mobile-first educational game for learning the basics of a
US military HMMWV "Humvee" A2. It is designed first for phone landscape/fullscreen play,
while also supporting desktop browsers with keyboard, gamepad, and pointer controls. It
is built with [Phaser 4](https://phaser.io/) and ships as static files.

Hebrew is the default language. English is also available from the title screen.

> **Training aid, not an operator's manual.** This game is a simplified educational
> simulation. It is not an authoritative source. The real reference is the operator's
> technical manual **TM 9-2320-280-10**. Always follow official training and supervision
> before operating any actual vehicle.

## Stages

1. **Controls Tour** — tap every driver control to learn what it does, then run the
   start-up sequence (parking brake, wait-to-start glow plugs, start, select a gear).
2. **Transmission & T-Case** — learn the physical shifter layout before driving:
   transfer case on the left (`HL / H / N / L`), transmission on the right.
3. **Obstacle Judgment** — answer randomized passable/impassable questions for
   grades, side-slopes, steps, trenches, and tree/log obstacles.
4. **City Driving** — top-down simulator: use forward and reverse, obey lights/signs,
   stay on curved roads, and reach the destination.
5. **Off-Road & Gears** — drills the **transfer case** (`HL / H / N / L`) and
   **transmission** (`P / R / N / OD / D / 2 / 1`) against terrain scenarios.
6. **Technical Off-Road** — slopes, side-slopes, traction loss (3-wheel), and water
   fording, including a rear/isometric view for side-slope judgment.
7. **Trailer Parking** — hitch up and reverse an M149 water trailer into a marked
   bay (articulated trailer physics; reverse steering is inverted).
8. **Pre/Post Checks** — inspect tires, oil, fluids, belts, hoses, wiring, leaks, and
   post-drive tire/hub condition.
9. **Gauge Scan** — answer quiz questions about oil pressure, temperature, fuel,
   speed/odometer, and voltage readings.
10. **Humvee Trivia** — answer history and specification questions based on the English
   and Hebrew Wikipedia pages for Humvee.

## Controls

On a phone, **tilt to steer** or thumb-swipe/drag over the on-screen wheel; tap the
wheel to re-centre tilt. On desktop use the arrow keys / WASD, a connected gamepad's
left stick and triggers, or drag the on-screen wheel.
Gas/brake are the on-screen pedals. Driving HUDs show speed, RPM, gear, and range so
transmission and transfer-case choices visibly affect engine speed and vehicle speed. A
**fullscreen** button (⛶) is on the menu and every stage — best experienced
fullscreen in landscape. After loading, the opening about page has a Continue button that
requests fullscreen before entering the menu.

## Languages

Hebrew (עברית) and English are supported, with right-to-left rendering for Hebrew.
The game defaults to Hebrew unless the player has saved another preference. To add a
language, copy `src/i18n/en.ts` to `src/i18n/<code>.ts`, translate the values, register
it in `src/i18n/i18n.ts`, and run `npm run build`.

## Credits and contact

- Source code: <https://github.com/barakplasma/humvee>
- Author: Barak Plasma, <https://github.com/barakplasma>
- Contact: use LinkedIn from the GitHub profile.

The in-game credits page links to the repository, issue tracker, and GitHub profile.

## Contributing

Bug reports and fixes are welcome. Content corrections are especially valuable: vehicle
controls, gauges, obstacle limits, pre/post driving checks, transfer-case and transmission behavior,
trailer handling, and top-down driving physics should be reported when they are wrong or
misleading.

Use GitHub Issues for bugs and content problems:

    https://github.com/barakplasma/humvee/issues

Pull requests are welcome for fixes. By contributing, you agree to the contribution terms
in [`LICENSE`](LICENSE).

## Development

Authored code lives in `src/` and compiles to browser-ready ES modules in `js/`.
The project uses TypeScript with a TypeScript 7 preview check (`tsgo`) for faster
iteration, following the incremental approach described by the VS Code team.

```bash
npm install
npm run build
npm run check
```

## Run locally

Serve the compiled static site over HTTP (ES modules need `http://`, not `file://`):

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

Art is resolved per logical id with this priority (see `src/assets/manifest.ts`):

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

> Note: the Stage 1 hotspot positions in `src/data/controls.ts` are tuned to the shipped
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

- TypeScript source compiled to vanilla ES modules; Phaser 4.2.1 vendored locally at
  `js/vendor/phaser.min.js`
  (no CDN, fully self-contained and offline-capable).
- Progress and language are saved in `localStorage`.
- `Phaser.Scale.FIT` keeps a 1280×720 design landscape and scales to the device; a
  rotate-to-landscape hint appears on portrait phones.

## License

All rights reserved. Contributions are accepted under the inbound contribution terms in
[`LICENSE`](LICENSE), but the project is not open-source licensed for reuse,
redistribution, hosting, or derivative works without separate permission.
