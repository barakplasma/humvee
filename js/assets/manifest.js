// @ts-nocheck
// Replaceable art assets. Each id resolves at load time with priority:
//   real photo / AI image (listed in assets/overrides.json)  ->  procedural drawing
// The game always runs: if an id has no file, BootScene draws a procedural texture.
//
// assets/overrides.json maps an asset id to an image path, e.g.
//   { "title_art": "assets/ai/title_art.png" }
// To use a real museum photo, drop the file into assets/photos/ and point the id
// at it in overrides.json (a real photo overrides the AI image for that id).
//
// `proc` names the procedural generator in js/scenes/BootScene.js used as fallback.
export const ASSETS = [
    { id: "title_art", proc: "title", fit: "cover" },
    { id: "dashboard_panel", proc: "dashboard", fit: "cover" },
    { id: "closeup_steering", proc: "dashboard", fit: "cover" },
    { id: "closeup_gauges", proc: "dashboard", fit: "cover" },
    { id: "closeup_panel", proc: "dashboard", fit: "cover" },
    { id: "closeup_switch", proc: "dashboard", fit: "cover" },
    { id: "closeup_turn", proc: "dashboard", fit: "cover" },
    { id: "closeup_wipers", proc: "dashboard", fit: "cover" },
    { id: "closeup_horn", proc: "dashboard", fit: "cover" },
    { id: "closeup_shifters", proc: "dashboard", fit: "cover" },
    { id: "closeup_pbrake", proc: "dashboard", fit: "cover" },
    { id: "closeup_pedals", proc: "dashboard", fit: "cover" },
    { id: "inspection_engine", proc: "dashboard", fit: "cover" },
    { id: "inspection_tire", proc: "dashboard", fit: "cover" },
    { id: "inspection_fluids", proc: "dashboard", fit: "cover" },
    { id: "humvee_topdown", proc: "humveeTop", fit: "contain" },
    { id: "humvee_side", proc: "humveeSide", fit: "contain" },
    { id: "trail_bg", proc: "trail", fit: "cover" },
    { id: "trailer_photo", proc: "trailerPhoto", fit: "cover" },
];
// Single manifest of available override images (kept clean: one request, no 404 spam).
export const OVERRIDES_URL = "assets/overrides.json";
// id -> the Phaser texture key that actually got used. Populated by BootScene.
export const resolved = {};
// Everywhere else in the game, reference art through this so the winning
// source (photo / AI / procedural) is used transparently.
export function assetKey(id) {
    return resolved[id] || id;
}
