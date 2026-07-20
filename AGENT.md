# AGENT.md — Humvee A2 Driver Trainer

Guidance and design record for future work on this project (human or AI agents).
Read this before making changes.

## What this is

A **mobile-first, browser-based educational game** that teaches how to operate a
US military **HMMWV "Humvee" A2**. Built first for Android Chrome in landscape
fullscreen, while still working on desktop through keyboard, gamepad, and pointer
fallbacks. It is a **simplified training aid**, not an official manual — every
screen carries a disclaimer referencing **TM 9-2320-280-10**. Keep that framing:
do not present the game as authoritative, and do not add real weapons/ordnance
operation.

Live site (GitHub Pages): `https://barakplasma.github.io/humvee/`

## Tech + architecture

- **Phaser 4.2.1**, vendored locally at `js/vendor/phaser.min.js` (no CDN, no
  runtime CDN, offline-capable). Loaded as a global `Phaser` in `index.html`.
- **TypeScript source** lives in `src/` and compiles to vanilla ES modules in `js/`
  with `npm run build`. No bundler and no npm runtime deps. GitHub Pages serves the
  compiled `js/` tree plus static assets.
- Use `npm run typecheck:ts7` for the fast TypeScript 7 `tsgo` no-emit check, and
  keep `npm run build` as the conservative emit path until TS 7 is the only compiler
  this repo needs.
- The first migration is intentionally incremental: converted files currently carry
  `// @ts-nocheck` while the old dynamic Phaser scene fields are typed gradually.
  Remove that header one file at a time when adding real annotations.
- **Design resolution:** 1280×720 landscape. Scale mode `FIT` + `CENTER_BOTH`
  (`src/config.ts`). Everything is positioned in this 1280×720 space. A portrait
  overlay in `index.html`/`css/style.css` nudges phones to landscape.
- Product priority is mobile first. Desktop is required and should be polished, but
  do not optimize layouts, text density, or controls for desktop at the expense of
  phone landscape/fullscreen play.
- **State:** `localStorage` for progress (`src/data/progress.ts`) and language
  (`src/i18n/i18n.ts`). Keys: `humvee.progress`, `humvee.locale`.
- Debug/test hook: `window.__HUMVEE_GAME__` is the Phaser.Game instance.

### File map
```
index.html               entry: viewport, Phaser vendor, module entry, rotate hint
css/style.css            full-screen canvas, portrait hint, no-scroll
src/theme.ts             COLORS, FONT, GAME_WIDTH/HEIGHT constants
src/config.ts            Phaser config + scene registration (add new scenes here)
src/main.ts              boots the game after restoring locale
src/i18n/                i18n.ts (t, setLocale, isRTL, events) + en.ts + he.ts
src/data/controls.ts     HMMWV control list (i18n keys + Stage 1 hotspot positions)
src/data/progress.ts     unlock/score persistence; TOTAL_STAGES
src/assets/manifest.ts   replaceable-art registry + assetKey() resolver
src/ui/DriveControls.ts  wheel + tilt + pedals + gear selectors + HUD (driving stages)
src/ui/Dialog.ts         teaching cards, toasts, objective banners, buttons
src/ui/LangSwitch.ts     EN/HE toggle (restarts scene to re-render + flip RTL)
src/ui/fullscreen.ts     addFullscreenButton(scene, x, y)
src/scenes/BootScene.ts  resolves art (override->procedural) + procedural generators
src/scenes/MenuScene.ts  title, stage cards (count-driven layout), lang, fullscreen
src/scenes/Stage1..8.ts plus StageGear/StageObstacle   the ten stages (see below)
src/scenes/StageCompleteScene.ts  score summary + next/menu
js/                       compiled TypeScript output loaded by index.html
assets/photos/           curated real photos (override AI/procedural)
assets/photos/_album_raw/ gitignored raw Google Photos album dump
assets/ai/               AI-generated alternates (Gemini via OpenRouter)
assets/overrides.json    id -> image path map (the only art-wiring file)
.github/workflows/deploy-pages.yml   GitHub Pages deploy
```

## The ten stages

All stages are directly selectable. Best score per stage is tracked in `src/data/progress.ts`.
Each stage ends by starting `StageCompleteScene` with `{ stage, score, nextScene }`.

1. **Driver Controls** (`Stage1Scene`) — first-person cockpit (real photo
   `dashboard_panel`). 12 tappable hotspots (from `src/data/controls.ts`) teach each
   control; positions are **tuned to the shipped cockpit photo's cover-fit layout**.
   After all 12 are reviewed, dismissing the final card starts a guided **start-up
   sequence** checklist (parking brake → N → RUN → wait-to-start glow plugs → START
   → release brake → D).
2. **Transmission & T-Case** (`StageGearScene`) — focused shifter lesson using the
   real shifter closeup. Transfer case is on the left in physical order
   `HL / H / N / L`; transmission is on the right in order `P / R / N / OD / D / 2 / 1`.
   Range changes are only accepted while the transmission is in `N`.
3. **Obstacle Judgment** (`StageObstacleScene`) — randomized passable/impassable
   terrain quiz for grade, side-slope, vertical step, trench, and log/tree obstacles.
   Shows the source/threshold after each answer. Grade/side-slope values come from
   TM 9-2320-280-10 and TC 21-305-20 Figure 7-13; step/log/trench values are simplified
   training thresholds with source caveats in the scene text.
4. **City Driving** (`Stage2Scene`) — top-down. Obey a traffic light + stop sign,
   stay on curved roads, use forward/reverse, and reach the destination. Manual
   kinematics (no arcade bodies): heading + signed speed; forward vector
   `(sinθ, -cosθ)`. Uses a kinematic bicycle yaw model so the vehicle cannot pivot
   in place. Fails/restarts if the player drives too far off-road.
5. **Off-Road & Gears** (`Stage3Scene`) — top-down trail with gear **gates** that
   only open when the correct transfer case + transmission are selected
   (reverse→R, slippery→HL, climb→L+1, cruise→H+D/OD). Teaches terrain→gear mapping.
   Uses signed-speed bicycle yaw so reverse steering emerges from motion direction.
   Transfer-case range changes are rejected unless the vehicle is stopped and the
   transmission is in N, matching TM drivetrain-protection guidance.
6. **Technical Off-Road** (`Stage4Scene`) — side view with a terrain heightmap and
   pitch/roll indicators. The side-slope section switches to a rear/isometric camera
   so body roll is visible. Steep climb (needs low range + momentum), descent
   (engine braking), side-slope rollover meter, 3-wheel/traction-loss, water fording.
   Uses signed speed (negative = reverse); P holds, N rolls with gravity, forward/R drive.
   Source note: TM 9-2320-280-10 lists 60% grade and 40% side-slope capabilities as
   textual performance values, but no verified slope illustration. The verified
   illustrated HMMWV slope/climb figure is TC 21-305-20/AFMAN 24-306(I), Figure 7-13.
7. **Trailer Parking** (`Stage5Scene`) — top-down articulated **water trailer
   (M149)**. Intro shows a real trailer photo + explains reverse steering. Park the
   trailer in a marked bay (aligned within 14°, stopped ~1s). Jackknife warning
   when articulation > ~77°.
8. **Pre/Post Checks** (`Stage6Scene`) — photo-led inspection checklist. Covers
   tire pressure/condition, engine oil, fluid reservoirs, belts/hoses/wiring, and
   air restriction, post-drive leak/tire/hub checks.
9. **Gauge Scan** (`Stage7Scene`) — close-up gauge quiz. Tap oil pressure,
   temperature, fuel, speed/odometer, and voltmeter hotspots, then answer the
   multiple-choice operational question. Wrong answers reduce score.
10. **Humvee Trivia** (`Stage8Scene`) — multiple-choice trivia based on the English
   and Hebrew Wikipedia pages for Humvee:
   `https://en.wikipedia.org/wiki/Humvee` and `https://he.wikipedia.org/wiki/Humvee`.
   Keep facts high-level and non-operational: name meaning, manufacturer, service
   dates, specifications, and replacement-program context.

### Trailer kinematics (Stage 5)
Bicycle model + rear-hitch trailer. Tractor rear axle `P`, heading `th`; trailer
heading `ph`. Per frame: `thDot = v/WHEELBASE * tan(steerAngle)`; advance `P` along
`(sin th, -cos th)`; `phDot = v/TLEN*sin(th-ph) - HITCH/TLEN*thDot*cos(th-ph)`. This
naturally produces "reverse steering is inverted" and jackknifing. Constants at the
top of the file (`WHEELBASE`, `HITCH`, `TLEN`, `BAY`).

## Controls / input (`src/ui/DriveControls.ts`)

Steering input priority each frame: **keyboard > wheel drag > device tilt > centre**.
- **Device tilt (primary on phones):** `deviceorientation` → `beta/gamma` chosen by
  `screen.orientation.angle`; neutral captured on first reading; tapping the wheel
  re-centres (`recenterTilt`); iOS gated behind `DeviceOrientationEvent.requestPermission`
  on first pointer. This is the requested main mobile control — keep it working.
- **Wheel drag/thumb swipe** and **keyboard** (arrows/WASD) remain as fallbacks
  (keyboard also makes headless testing possible).
- Pedals are hold-to-apply (`throttle`/`brakeInput` ramp). Driving stages with gas
  should call `getDriveSpec()` / `getRpm()` so gear/range choices affect acceleration,
  speed ceiling, load, and RPM consistently.
- Optional gear selectors
  (`selectors: true`) render the transmission (`P R N OD D 2 1`) + transfer
  (`HL H N L`) columns and emit `onGear`/`onRange`. Match the cockpit photos:
  transfer case on the left, transmission on the right.
- HUD (`setSpeedDisplay`) shows speed, RPM, gear, and range when RPM is provided.

When embedding in a scrolling scene, set `dc.container.setScrollFactor(0)` so the
HUD/wheel/pedals stay pinned (they're built in screen space). `Dialog` outputs are
already `scrollFactor(0)`.

## Top-down vehicle physics

For Stages 2–3, steering must not directly rotate the sprite. Model steering as a
front-wheel angle in a simple kinematic bicycle equation:
`yawRate = signedSpeed / wheelbase * tan(steerAngle)`. At zero speed, yaw is zero.
This is intentionally more accurate than an arcade pivot: gas/brake change speed,
speed plus front-wheel steering changes heading, and reverse uses negative signed
speed. Do not reintroduce low-speed steering floors that let the vehicle spin while
stationary.

### Recommended Phaser skills
Before Phaser engine, scene lifecycle, or input work, install and use the relevant
official Phaser Codex skills from:
`https://github.com/phaserjs/phaser/tree/master/skills`

Installed official Phaser skills in this repo/session:
- `actions-and-utilities`
- `animations`
- `audio-and-sound`
- `cameras`
- `curves-and-paths`
- `data-manager`
- `events-system`
- `filters-and-postfx`
- `game-object-components`
- `game-setup-and-config`
- `geometry-and-math`
- `graphics-and-shapes`
- `groups-and-containers`
- `input-keyboard-mouse-touch`
- `loading-assets`
- `particles`
- `physics-arcade`
- `physics-matter`
- `render-textures`
- `scale-and-responsive`
- `scenes`
- `sprites-and-images`
- `text-and-bitmaptext`
- `tilemaps`
- `time-and-timers`
- `tweens`
- `v3-to-v4-migration`
- `v4-new-features`

Each lives at `/root/.codex/skills/<skill-name>/SKILL.md`. Read the matching skill
before changing that Phaser subsystem.

## Fullscreen (`src/ui/fullscreen.ts`)
`addFullscreenButton(scene, x, y)` — must be triggered by a pointer gesture (it is).
Present on the menu and every stage. Entering fullscreen on the menu persists into
stages (same canvas). Do not call `startFullscreen()` outside an input handler.

## Pixel 10 / mobile notes
Mobile landscape/fullscreen is the baseline acceptance target. Desktop browser play is
required as a secondary target, mainly through keyboard/WASD, gamepad, and pointer
fallbacks.

Target device: Pixel 10, landscape. We keep 1280×720 `FIT` (letterboxes slightly on
20:9 — acceptable) plus fullscreen to reclaim browser chrome. Do **not** switch to
`ENVELOP`/crop or change the base resolution: Stage 1 hotspots and all scene layouts
are hardcoded to 1280×720, and Stage 1 hotspots are additionally tuned to the cockpit
photo's cover-fit. Touch targets are large (pedals 120×180, wheel r≈100).

For browser regression testing, read `skills/test-phaser-game/SKILL.md`. The main
automated Pixel 10 check is:

```bash
npm run test:pixel10-menu
```

## Internationalization
- All user-facing copy lives in `src/i18n/en.ts` / `he.ts` keyed by id. **Never
  hardcode display strings in scenes** — add a key and use `t("key")`. `controls.js`
  stores i18n **keys**, not text.
- English is the base + fallback for missing keys. Hebrew is **RTL**; `LangSwitch`
  flips `document.dir` and restarts the scene so text re-renders. Add a locale by
  copying `en.ts`, translating, and registering it in `i18n.ts` `LOCALES`.
- System fonts cover Latin + Hebrew (no webfont dependency).

## Assets pipeline
Resolution priority per logical id: **override image (`assets/overrides.json`) →
procedural fallback** (drawn in `BootScene.gen_*`). One manifest fetch, no 404 spam.
- Real photos live in `assets/photos/`; AI alternates in `assets/ai/`. To change the
  art for an id, edit `assets/overrides.json` only. A real photo always wins because
  the JSON points at it.
- Raw album downloads live in `assets/photos/_album_raw/`, which is intentionally
  gitignored. Promote only cropped/compressed assets from that folder into tracked
  `assets/photos/`.
- Ids include `title_art`, `dashboard_panel`, `trail_bg`, `trailer_photo`,
  Stage 1 closeups (`closeup_steering`, `closeup_gauges`, `closeup_panel`,
  `closeup_switch`, `closeup_shifters`), Stage 6 inspection photos
  (`inspection_engine`, `inspection_tire`, `inspection_fluids`), and procedural
  vehicle sprites (`humvee_topdown`, `humvee_side`).
- Vehicle sprites stay procedural for clean transparency and orientation; title,
  cockpit, trail, trailer, closeup, and inspection shots use cropped album photos.
- `humvee_topdown` and the Stage 5 `trailer_top` are procedural top-down sprites
  (photos can't provide a top-down orientation).
- **If you swap `dashboard_panel`**, re-tune Stage 1 hotspot coords in
  `src/data/controls.ts` to the new framing (they are cover-fit dependent).
  Prefer adding closeup photos to `Dialog.showCard({ imageKey })` over replacing the
  overview map.

### Generating AI art (optional)
Use OpenRouter with an image model. `google/gemini-2.5-flash-image` works with default
account privacy settings (FLUX/others were blocked by a data-policy guardrail on the
test key) at ~$0.04/image, 1024×1024. Request body: chat/completions with
`"modalities": ["image"]`; the PNG comes back as a data URL in
`choices[0].message.images[0].image_url.url`. Compress to JPEG (~quality 82) before
committing — keep the repo light for mobile. Never commit API keys.

## Verification
There is a Playwright smoke test (kept in the session scratchpad, not committed):
launch `python3 -m http.server` at the repo root, then drive Chromium at a mobile
viewport. It asserts every scene boots with **0 page errors**, driving physics
respond to input, the Stage 5 trailer stays hitched, Stage 3 gear-gate logic is
correct, Stage 4 Park doesn't roll, Stage 1 waits for the final card, and EN→HE flips
to RTL + persists. **Before committing gameplay changes, re-run it and eyeball
screenshots.** Tilt steering can't be tested headless — verify on a real phone.

## Deploy
`.github/workflows/deploy-pages.yml` publishes the repo root to GitHub Pages on push
to `main` or the dev branch (`.nojekyll` keeps paths verbatim). Pages must be enabled
once (Settings → Pages → Source: GitHub Actions); the workflow sets
`configure-pages enablement: true` but the Actions token could not self-enable on a
private repo — it worked after the repo was made public + Pages enabled.

## Conventions / gotchas
- Keep it dependency-free at runtime: compile TypeScript before serving or deploying,
  but do not add a bundler or runtime npm package.
- Add new scenes to `src/config.ts` **and** wire unlock flow (`nextScene` +
  `TOTAL_STAGES`). Menu cards are count-driven (width auto-scales).
- Top-down heading convention everywhere: texture points up; forward =
  `(sinθ, -cosθ)`; `sprite.rotation = θ`. Side view (Stage 4) tilts by terrain slope.
- UI overlays must be `scrollFactor(0)` in camera-following scenes.
- Respect the "training aid, not a manual" framing and the TM 9-2320-280-10 note.
