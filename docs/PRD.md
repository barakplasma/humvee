# Humvee A2 Driver Trainer PRD

## Product Summary

Humvee A2 Driver Trainer is a mobile-first browser game that teaches a simplified
driver-familiarization flow for the HMMWV A2. It is an educational training aid,
not an official operator manual. The product should help players recognize controls,
understand basic driving behaviors, choose gears for terrain, reverse a trailer, and
perform basic checks before and after driving.

## Audience

- Primary: people learning the basic layout and driving concepts of a HMMWV A2.
- Secondary: instructors or enthusiasts who want a quick interactive reference.
- Primary target: Android Chrome on a Pixel-class phone in landscape fullscreen.
- Desktop support is required for development, keyboard fallback, gamepad/pointer
  play, and casual play, but desktop must not drive layout or control decisions ahead
  of the mobile experience.

## Non-Goals

- Do not present the game as official instruction.
- Do not model weapons, ordnance, or tactical employment.
- Do not require a build step, server backend, login, or network at runtime.
- Do not replace TM 9-2320-280-10 or real supervised training.

## Current Experience

The game has ten stages:

1. Driver Controls: dashboard overview with hotspot lessons and closeup photos, then
   a guided startup checklist.
2. Transmission & T-Case: focused shifter-layout lesson, with transfer case on the
   left in physical order `HL / H / N / L` and transmission on the right.
3. Obstacle Judgment: randomized passable/impassable quiz for grade, side-slope,
   vertical step, trench width, and tree/log height.
4. City Driving: road discipline, red light, stop sign, reverse, curved roads, and
   destination driving.
5. Off-Road & Gears: transfer-case and transmission choices for terrain gates,
   including stopped/neutral transfer-case range changes.
6. Technical Off-Road: slope, descent, traction, rollover, side-slope rear/isometric
   view, and water hazards.
7. Trailer Parking: articulated M149-style trailer reversing and parking.
8. Pre/Post Checks: tire pressure/condition, oil, fluids, belts/hoses/wiring, air
   restriction, leaks, tires, and hubs.
9. Gauge Scan: oil pressure, temperature, fuel, speed/odometer, and voltmeter
   multiple-choice quiz.
10. Humvee Trivia: high-level history and specification quiz based on the English and
   Hebrew Wikipedia pages for Humvee.

All stages are directly selectable from the menu. Best score is tracked per stage in
localStorage.

## Design Principles

- Use real album photos where they improve recognition. Keep the Stage 1 dashboard
  overview stable because hotspots are tuned to it; use closeups inside dialogs rather
  than replacing that overview casually.
- Treat mobile landscape/fullscreen as the baseline for every screen. Desktop should
  work well, but it is the secondary presentation of the same mobile-first design.
- Preserve the 1280x720 landscape design coordinate system. It keeps all stages,
  hotspots, and mobile controls predictable.
- Keep the UI dense and functional. This is a trainer, not a marketing site.
- Use large tap targets and scene-level Phaser pointer handling for controls embedded
  in containers.
- Prefer concrete tasks over passive reading: tap controls, select gears, drive,
  reverse, inspect, and answer gauge questions.
- Keep text concise enough for mobile cards, and add every display string through
  `src/i18n/en.ts` and `src/i18n/he.ts`.
- Top-down driving should feel like a vehicle, not a rotateable sprite: steering
  changes heading only while the vehicle is moving, using a front-wheel bicycle model.

## Core Controls

- Steering priority: keyboard, wheel drag, gamepad stick, device tilt, center.
- On mobile, steering must work with either device tilt or thumb swipe/drag over the
  on-screen wheel.
- Gas and brake are hold-to-apply pedals with ramped values.
- Gear selectors must match the cockpit photo: transfer case on the left, transmission
  on the right.
- Transfer-case selector order must match the physical lever: `HL`, `H`, `N`, `L`.
- Driving stages with gas must show RPM and make gear/range changes strongly affect
  acceleration, engine load, and speed ceiling.
- Fullscreen must only be triggered from pointer gestures.

## Driving Physics Guidelines

- Use signed speed and a front-wheel steering angle for top-down yaw:
  `yawRate = signedSpeed / wheelbase * tan(steerAngle)`.
- At zero speed, steering wheel input can animate controls but must not rotate the
  vehicle body.
- Reverse should naturally invert path curvature by using negative signed speed.
- Four-wheel-drive and differential behavior should be represented through traction,
  range, and terrain tuning, not by allowing arcade-style pivot turns.

## Asset Guidelines

- All replaceable images are declared in `src/assets/manifest.ts` and mapped in
  `assets/overrides.json`.
- Real album photos live in `assets/photos/`; AI alternates may remain in `assets/ai/`.
- Crop and compress committed photos. Keep individual JPEGs mobile-sized when possible.
- Use procedural sprites for top-down and side vehicle art where transparency or exact
  orientation matters.
- When new photos are needed, ask for specific album shots only if the current album
  lacks the subject or angle.

## Technical Constraints

- Static site output: TypeScript source in `src/` compiles to vanilla ES modules in
  `js/`; no bundler and no runtime npm dependencies.
- Phaser is vendored locally in `js/vendor/phaser.min.js`.
- Runtime state is localStorage only.
- GitHub Pages deploys from the repo root on pushes to `main`.
- Bug tracking uses the vendored Sentry browser SDK configured for Bugsink.

## Verification Expectations

Before shipping gameplay or layout changes:

- Start a local HTTP server and boot the game in Chromium.
- Confirm every scene loads without page exceptions.
- Verify the changed flow in a mobile-sized landscape viewport before desktop.
- Check Stage 1 closeup dialogs and startup completion.
- Check driving controls: gas, brake, wheel drag, gear selectors, and transfer case.
- Check Stage 5 trailer reversing and jackknife behavior after input changes.
- Check new menu layout on 1280x720 and a mobile-ish viewport.
- Check English and Hebrew render without missing keys.

## Future Work

- Add a committed smoke-test harness for booting all scenes and checking common inputs.
- Improve readability: make text larger in general, and add a user-controlled text
  size option that can enlarge text when it still fits without overflowing.
- Add more album closeups for pedals, parking brake, oil dipstick, coolant fill, and
  tire-pressure placards if available.
- Add light scoring to inspection/gauge stages based on mistakes or ordering.
- Add a small in-game photo credit/source note if required by the album owner.
