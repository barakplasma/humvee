// @ts-nocheck
import { FONT } from "../theme.js";

/**
 * Adds a fullscreen toggle button to a scene. Fullscreen must be triggered by a
 * user gesture (pointerup), which this satisfies. Works on Android Chrome and
 * desktop; on iOS Safari the Phaser scale manager falls back gracefully.
 * Returns the text object so callers can reposition if needed.
 */
export function addFullscreenButton(scene, x, y, origin = { x: 1, y: 0 }) {
  const label = () => (scene.scale.isFullscreen ? "⛶ ▣" : "⛶");
  const btn = scene.add
    .text(x, y, label(), {
      fontFamily: FONT,
      fontSize: "22px",
      color: "#c9b98f",
      backgroundColor: "rgba(28,33,20,0.7)",
      padding: { x: 10, y: 5 },
    })
    .setOrigin(origin.x, origin.y)
    .setScrollFactor(0)
    .setDepth(1600)
    .setInteractive({ useHandCursor: true });

  btn.on("pointerup", () => {
    if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
    else scene.scale.startFullscreen();
  });
  scene.scale.on("fullscreenchange", () => btn.setText(label()));
  scene.events.once("shutdown", () => scene.scale.off("fullscreenchange"));
  return btn;
}
