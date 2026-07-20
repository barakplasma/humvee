---
name: test-phaser-game
description: Test the Humvee Phaser 4 game in a real browser, especially mobile-first Pixel 10 landscape regressions, using the repo CDP/Chromium harness, local static server, canvas measurements, console checks, and Phaser scene inspection.
---

# Test Phaser Game

Use this skill when changing UI layout, scaling, fullscreen behavior, input, scenes,
or anything that must be verified in the browser. This project is mobile first:
Pixel 10 landscape is the primary regression target, desktop is secondary.

## Fast Path

Run compile checks first:

```bash
npm run build
npm run check
```

Run the Pixel 10 menu regression:

```bash
npm run test:pixel10-menu
```

That script:
- serves the static site with `python3 -m http.server`
- launches Chromium headless with CDP
- emulates Pixel 10-like landscape: `980x497`, DPR `2.5`, mobile touch enabled
- starts `MenuScene`
- renders every stage-select page
- fails if stage cards leave the 1280x720 Phaser scene or document overflow appears

Use it after menu/layout changes and whenever a screenshot shows mobile clipping.

## CDP Setup Pattern

If the Chrome DevTools MCP server is available, prefer it for interactive debugging,
screenshots, console inspection, network inspection, and performance traces:
`https://github.com/ChromeDevTools/chrome-devtools-mcp`.

Useful setup references from that project:
- Standard MCP server command: `npx -y chrome-devtools-mcp@latest`
- Codex CLI install form: `codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest`
- Slim/headless basic-browser mode: `npx -y chrome-devtools-mcp@latest --slim --headless`

The project describes Chrome DevTools MCP as an MCP server that lets coding agents
control and inspect a live Chrome browser, including screenshots, console messages,
network requests, automation, and performance traces. It officially supports Google
Chrome and Chrome for Testing; other Chromium browsers may work but are not guaranteed.

If MCP tools are not exposed in the current session, fall back to the repo's direct
CDP script pattern below.

For custom checks, follow the same sequence as `scripts/pixel10-menu-check.mjs`:

1. Start a local HTTP server from repo root. ES modules need `http://`, not `file://`.
2. Launch Chromium with:
   `--headless=new --no-sandbox --disable-gpu --remote-debugging-port=0`.
3. Read the `DevTools listening on ws://...` endpoint from stderr.
4. Use CDP `Target.createTarget` for the game URL.
5. Connect to the page websocket from `/json/list`.
6. Enable `Page` and `Runtime`.
7. Apply mobile emulation before or immediately after navigation:
   `Emulation.setDeviceMetricsOverride` plus `Emulation.setTouchEmulationEnabled`.
8. Wait for `window.__HUMVEE_GAME__?.scene`.
9. Inspect Phaser scenes directly:
   `const scene = game.scene.getScene("MenuScene")`.

Prefer scene-space assertions over screenshots for layout regressions:
`getBounds()` on Phaser objects, canvas `getBoundingClientRect()`, and
`documentElement.scrollWidth/scrollHeight` are stable and diff-friendly.

## Pixel 10 Baseline

Use this viewport to reproduce the known stage-menu clipping screenshot:

```js
{
  width: 980,
  height: 497,
  deviceScaleFactor: 2.5,
  mobile: true
}
```

Expected behavior:
- Phaser canvas fits the browser viewport with letterboxing allowed.
- No document x/y overflow.
- Menu cards fit within 1280x720 scene bounds on every page.
- Footer/disclaimer does not overlap cards or pager controls.
- Stage 1 image teaching-card body text stays inside the popup panel.

## Interactive Browser Check

If automated assertions pass but the change is visual or input-sensitive, also run an
interactive server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, rotate to landscape/mobile emulation, and play the
affected stage. For input work, test at least:
- touch/pointer taps
- hold-to-apply pedals
- wheel drag/thumb swipe steering
- keyboard fallback on desktop
- shifter tap targets and range/gear update text

## Failure Triage

If the CDP script fails to launch:
- set `CHROME=/path/to/chromium` when Chromium is not at `/usr/bin/chromium`
- ensure the local server port is free, or run with `PORT=4174`
- rerun with `VERBOSE=1` to show server/Chromium output

If a scene is unavailable:
- confirm `npm run build` regenerated `js/`
- confirm the scene is registered in `src/config.ts`
- wait for `window.__HUMVEE_GAME__?.scene` before querying scenes

If layout fails only on mobile:
- keep the 1280x720 design coordinate system
- prefer paging, smaller fixed grids, or scroll-free scene-space layout
- do not switch scale mode to crop the scene; Stage 1 hotspots depend on FIT layout
