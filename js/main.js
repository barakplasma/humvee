// @ts-nocheck
import { createConfig } from "./config.js";
import { initBugTracking } from "./bug-tracking.js";
import { initLocaleFromStorage } from "./i18n/i18n.js";
initBugTracking();
// Restore the player's saved language before any scene draws text.
initLocaleFromStorage();
// eslint-disable-next-line no-new
window.addEventListener("load", () => {
    // Guard: if the Phaser CDN script failed (offline first load), show a message.
    if (typeof Phaser === "undefined") {
        document.getElementById("game").innerHTML =
            '<p style="color:#c9b98f;padding:24px;font-family:sans-serif">' +
                "Could not load the game engine. Check your connection and reload.</p>";
        return;
    }
    const game = new Phaser.Game(createConfig());
    // Expose for debugging / automated smoke tests.
    window.__HUMVEE_GAME__ = game;
});
