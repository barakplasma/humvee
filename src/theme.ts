// @ts-nocheck
// Shared visual constants used across scenes and UI so the look stays consistent.
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const COLORS = {
  armyGreen: 0x3d4a2a,
  armyGreenDark: 0x2a331d,
  panel: 0x1c2114,
  panelLight: 0x2f3a1f,
  sand: 0xc9b98f,
  sandDark: 0x9c8f68,
  text: 0xf2ecd8,
  accent: 0xd8a54a, // amber (warning lights, highlights)
  good: 0x6fbf5a,
  bad: 0xd85a4a,
  road: 0x3a3a40,
  roadLine: 0xd8c56a,
  dirt: 0x6b5636,
  water: 0x2f5a6b,
  hotspot: 0xffd24a,
};

// CSS hex helpers for DOM/HTML string colors.
export const CSS = {
  sand: "#c9b98f",
  text: "#f2ecd8",
  accent: "#d8a54a",
};

// Font family. We use the device's system fonts, which cover both Latin and
// Hebrew glyphs on Android/iOS/desktop — no external webfont, fully self-contained.
export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Hebrew", Arial, sans-serif';
