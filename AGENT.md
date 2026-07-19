# AGENT.md — Humvee A2 Driver Trainer

Guidance and design record for future work on this project (human or AI agents).
Read this before making changes.

## What this is

A **mobile-first, browser-based educational game** that teaches how to operate a
US military **HMMWV "Humvee" A2**. Built for Android Chrome (works on any modern
browser). It is a **simplified training aid**, not an official manual — every
screen carries a disclaimer referencing **TM 9-2320-280-10**. Keep that framing:
do not present the game as authoritative, and do not add real weapons/ordnance
operation.

Live site (GitHub Pages): `https://barakplasma.github.io/humvee/`

## Tech + architecture

- **Phaser 3.87.0**, vendored locally at `js/vendor/phaser.min.js` (no CDN, no
  build step, offline-capable). Loaded as a global `Phaser` in `index.html`.
- **Vanilla ES modules** for our own code (`<script type="module">`). No bundler,
  no npm runtime deps. This must stay true — anything requiring a build breaks the
  "just serve the folder" model and GitHub Pages deploy.
- **Design resolution:** 1280×720 landscape. Scale mode `FIT` + `CENTER_BOTH`
  (`js/config.js`). Everything is positioned in this 1280×720 space. A portrait
  overlay in `index.html`/`css/style.css` nudges phones to landscape.
- **State:** `localStorage` for progress (`js/data/progress.js`) and language
  (`js/i18n/i18n.js`). Keys: `humvee.progress`, `humvee.locale`.
- Debug/test hook: `window.__HUMVEE_GAME__` is the Phaser.Game instance.

### File map
```
index.html               entry: viewport, Phaser vendor, module entry, rotate hint
css/style.css            full-screen canvas, portrait hint, no-scroll
js/theme.js              COLORS, FONT, GAME_WIDTH/HEIGHT constants
js/config.js             Phaser config + scene registration (add new scenes here)
js/main.js               boots the game after restoring locale
js/i18n/                 i18n.js (t, setLocale, isRTL, events) + en.js + he.js
js/data/controls.js      HMMWV control list (i18n keys + Stage 1 hotspot positions)
js/data/progress.js      unlock/score persistence; TOTAL_STAGES
js/assets/manifest.js    replaceable-art registry + assetKey() resolver
js/ui/DriveControls.js   wheel + tilt + pedals + gear selectors + HUD (driving stages)
js/ui/Dialog.js          teaching cards, toasts, objective banners, buttons
js/ui/LangSwitch.js      EN/HE toggle (restarts scene to re-render + flip RTL)
js/ui/fullscreen.js      addFullscreenButton(scene, x, y)
js/scenes/BootScene.js   resolves art (override->procedural) + procedural generators
js/scenes/MenuScene.js   title, stage cards (count-driven layout), lang, fullscreen
js/scenes/Stage1..5.js   the five stages (see below)
js/scenes/StageCompleteScene.js  score summary + next/menu
assets/photos/           real museum photos (override AI/procedural)
assets/ai/               AI-generated alternates (Gemini via OpenRouter)
assets/overrides.json    id -> image path map (the only art-wiring file)
.github/workflows/deploy-pages.yml   GitHub Pages deploy
```

## The five stages

Stages unlock sequentially (complete N → unlock N+1), tracked in `progress.js`.
Each stage ends by starting `StageCompleteScene` with `{ stage, score, nextScene }`.

1. **Driver Controls** (`Stage1Scene`) — first-person cockpit (real photo
   `dashboard_panel`). 12 tappable hotspots (from `js/data/controls.js`) teach each
   control; positions are **tuned to the shipped cockpit photo's cover-fit layout**.
   After all 12 are reviewed, dismissing the final card starts a guided **start-up
   sequence** checklist (parking brake → P → RUN → wait-to-start glow plugs → START
   → release brake → D).
2. **City Driving** (`Stage2Scene`) — top-down. Obey a traffic light + stop sign,
   stay on the road (L-shaped course), reach the destination. Manual kinematics
   (no arcade bodies): heading + signed speed; forward vector `(sinθ, -cosθ)`.
3. **Off-Road & Gears** (`Stage3Scene`) — top-down trail with gear **gates** that
   only open when the correct transfer case + transmission are selected
   (reverse→R, slippery→HL, climb→L+1, cruise→H+D/OD). Teaches terrain→gear mapping.
4. **Technical Off-Road** (`Stage4Scene`) — **side view** with a terrain heightmap
   and pitch/roll indicators. Steep climb (needs low range + momentum), descent
   (engine braking), side-slope rollover meter, 3-wheel/traction-loss, water
   fording. Uses **signed speed** (negative = reverse); P holds, N rolls with
   gravity, forward/R drive.
5. **Trailer Parking** (`Stage5Scene`) — top-down articulated **water trailer
   (M149)**. Intro shows a real trailer photo + explains reverse steering. Park the
   trailer in a marked bay (aligned within 14°, stopped ~1s). Jackknife warning
   when articulation > ~77°.

### Trailer kinematics (Stage 5)
Bicycle model + rear-hitch trailer. Tractor rear axle `P`, heading `th`; trailer
heading `ph`. Per frame: `thDot = v/WHEELBASE * tan(steerAngle)`; advance `P` along
`(sin th, -cos th)`; `phDot = v/TLEN*sin(th-ph) - HITCH/TLEN*thDot*cos(th-ph)`. This
naturally produces "reverse steering is inverted" and jackknifing. Constants at the
top of the file (`WHEELBASE`, `HITCH`, `TLEN`, `BAY`).

## Controls / input (`js/ui/DriveControls.js`)

Steering input priority each frame: **keyboard > wheel drag > device tilt > centre**.
- **Device tilt (primary on phones):** `deviceorientation` → `beta/gamma` chosen by
  `screen.orientation.angle`; neutral captured on first reading; tapping the wheel
  re-centres (`recenterTilt`); iOS gated behind `DeviceOrientationEvent.requestPermission`
  on first pointer. This is the requested main mobile control — keep it working.
- **Wheel drag** and **keyboard** (arrows/WASD) remain as fallbacks (keyboard also
  makes headless testing possible).
- Pedals are hold-to-apply (`throttle`/`brakeInput` ramp). Optional gear selectors
  (`selectors: true`) render the transmission (`P R N OD D 2 1`) + transfer
  (`H HL N L`) columns and emit `onGear`/`onRange`.
- HUD (`setSpeedDisplay`) shows SPD/GEAR/RANGE.

When embedding in a scrolling scene, set `dc.container.setScrollFactor(0)` so the
HUD/wheel/pedals stay pinned (they're built in screen space). `Dialog` outputs are
already `scrollFactor(0)`.

## Fullscreen (`js/ui/fullscreen.js`)
`addFullscreenButton(scene, x, y)` — must be triggered by a pointer gesture (it is).
Present on the menu and every stage. Entering fullscreen on the menu persists into
stages (same canvas). Do not call `startFullscreen()` outside an input handler.

## Pixel 10 / mobile notes
Target device: Pixel 10, landscape. We keep 1280×720 `FIT` (letterboxes slightly on
20:9 — acceptable) plus fullscreen to reclaim browser chrome. Do **not** switch to
`ENVELOP`/crop or change the base resolution: Stage 1 hotspots and all scene layouts
are hardcoded to 1280×720, and Stage 1 hotspots are additionally tuned to the cockpit
photo's cover-fit. Touch targets are large (pedals 120×180, wheel r≈100).

## Internationalization
- All user-facing copy lives in `js/i18n/en.js` / `he.js` keyed by id. **Never
  hardcode display strings in scenes** — add a key and use `t("key")`. `controls.js`
  stores i18n **keys**, not text.
- English is the base + fallback for missing keys. Hebrew is **RTL**; `LangSwitch`
  flips `document.dir` and restarts the scene so text re-renders. Add a locale by
  copying `en.js`, translating, and registering it in `i18n.js` `LOCALES`.
- System fonts cover Latin + Hebrew (no webfont dependency).

## Assets pipeline
Resolution priority per logical id: **override image (`assets/overrides.json`) →
procedural fallback** (drawn in `BootScene.gen_*`). One manifest fetch, no 404 spam.
- Real photos live in `assets/photos/`; AI alternates in `assets/ai/`. To change the
  art for an id, edit `assets/overrides.json` only. A real photo always wins because
  the JSON points at it.
- Ids: `title_art`, `dashboard_panel`, `humvee_topdown`, `humvee_side`, `trail_bg`,
  `trailer_photo`. Vehicle sprites + tiled trail stay procedural (clean transparency
  / seamless tiling); title, cockpit, and trailer ship as real photos.
- `humvee_topdown` and the Stage 5 `trailer_top` are procedural top-down sprites
  (photos can't provide a top-down orientation).
- **If you swap `dashboard_panel`**, re-tune Stage 1 hotspot coords in
  `js/data/controls.js` to the new framing (they are cover-fit dependent).

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
- Keep it buildless and dependency-free at runtime.
- Add new scenes to `js/config.js` **and** wire unlock flow (`nextScene` +
  `TOTAL_STAGES`). Menu cards are count-driven (width auto-scales).
- Top-down heading convention everywhere: texture points up; forward =
  `(sinθ, -cosθ)`; `sprite.rotation = θ`. Side view (Stage 4) tilts by terrain slope.
- UI overlays must be `scrollFactor(0)` in camera-following scenes.
- Respect the "training aid, not a manual" framing and the TM 9-2320-280-10 note.
