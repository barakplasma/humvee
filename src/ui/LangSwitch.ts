// @ts-nocheck
import { LOCALES, getLocale, setLocale } from "../i18n/i18n.js";
import { COLORS, FONT } from "../theme.js";

/**
 * A small language toggle (EN / עברית ...). Lives in the top corner of a scene.
 * On selection it calls setLocale() and invokes onChange (scenes typically
 * restart themselves so all text re-renders in the new language + direction).
 */
export default class LangSwitch {
  constructor(scene, x, y, onChange) {
    this.scene = scene;
    this.container = scene.add.container(x, y).setDepth(1000);
    const codes = Object.keys(LOCALES);
    const current = getLocale();

    let offset = 0;
    const pad = 14;
    codes.forEach((code, i) => {
      if (i > 0) {
        const sep = scene.add
          .text(offset, 0, "|", { fontFamily: FONT, fontSize: "22px", color: "#9c8f68" })
          .setOrigin(0, 0.5);
        this.container.add(sep);
        offset += sep.width + pad;
      }
      const active = code === current;
      const label = scene.add
        .text(offset, 0, LOCALES[code].name, {
          fontFamily: FONT,
          fontSize: "22px",
          color: active ? "#f2ecd8" : "#9c8f68",
          fontStyle: active ? "bold" : "normal",
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });
      label.on("pointerup", () => {
        if (code === getLocale()) return;
        setLocale(code);
        if (onChange) onChange(code);
      });
      this.container.add(label);
      offset += label.width + pad;
    });

    // A subtle backing plate so it stays legible over any background.
    const bg = scene.add
      .rectangle(-10, 0, offset + 10, 40, COLORS.panel, 0.55)
      .setOrigin(0, 0.5);
    this.container.addAt(bg, 0);
    this.width = offset;
  }

  destroy() {
    this.container.destroy();
  }
}
