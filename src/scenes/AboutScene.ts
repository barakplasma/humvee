// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import LangSwitch from "../ui/LangSwitch.js";
import { fitCover } from "./MenuScene.js";

export default class AboutScene extends Phaser.Scene {
  constructor() {
    super("AboutScene");
  }

  create() {
    this.dialog = new Dialog(this);

    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("title_art"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.58).setOrigin(0);

    new LangSwitch(this, 24, 34, () => this.scene.restart());

    this.add
      .text(GAME_WIDTH / 2, 82, t("app_title"), {
        fontFamily: FONT,
        fontSize: "64px",
        color: "#f2ecd8",
        fontStyle: "bold",
        stroke: "#161a10",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 142, t("about_title"), {
        fontFamily: FONT,
        fontSize: "30px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .rectangle(GAME_WIDTH / 2, 350, 850, 330, COLORS.panel, 0.96)
      .setStrokeStyle(3, COLORS.sand);

    this.add
      .text(GAME_WIDTH / 2, 225, t("about_body"), {
        fontFamily: FONT,
        fontSize: "24px",
        color: "#f2ecd8",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(GAME_WIDTH / 2, 362, t("about_safety"), {
        fontFamily: FONT,
        fontSize: "19px",
        color: "#c9b98f",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(GAME_WIDTH / 2, 458, t("about_sources"), {
        fontFamily: FONT,
        fontSize: "17px",
        color: "#9c8f68",
        align: "center",
        lineSpacing: 6,
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    this.dialog.makeButton(GAME_WIDTH / 2, 545, t("about_continue"), () => this.continue(), {
      width: 360,
      height: 64,
      fontSize: "24px",
      color: COLORS.armyGreen,
    });
  }

  continue() {
    if (!this.scale.isFullscreen) {
      try {
        this.scale.startFullscreen();
      } catch (_) {
        /* Browser denied fullscreen; the in-game fullscreen button remains available. */
      }
    }
    this.scene.start("MenuScene");
  }
}
