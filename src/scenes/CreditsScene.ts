// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
import { fitCover } from "./MenuScene.js";

const REPO_URL = "https://github.com/barakplasma/humvee";
const ISSUES_URL = "https://github.com/barakplasma/humvee/issues";
const PROFILE_URL = "https://github.com/barakplasma";

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super("CreditsScene");
  }

  create() {
    this.dialog = new Dialog(this);

    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("title_art"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0);

    this.add
      .text(GAME_WIDTH / 2, 70, t("credits_title"), {
        fontFamily: FONT,
        fontSize: "54px",
        color: "#f2ecd8",
        fontStyle: "bold",
        stroke: "#161a10",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .rectangle(GAME_WIDTH / 2, 350, 900, 430, COLORS.panel, 0.96)
      .setStrokeStyle(3, COLORS.sand);

    const body = this.add
      .text(GAME_WIDTH / 2, 175, t("credits_body"), {
        fontFamily: FONT,
        fontSize: "24px",
        color: "#f2ecd8",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: 780 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(GAME_WIDTH / 2, body.y + body.height + 26, t("credits_contrib"), {
        fontFamily: FONT,
        fontSize: "21px",
        color: "#d8a54a",
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: 780 },
      })
      .setOrigin(0.5, 0);

    const y = 520;
    this.dialog.makeButton(GAME_WIDTH / 2 - 260, y, t("credits_repo"), () => openExternal(REPO_URL), {
      width: 230,
      height: 54,
      fontSize: "19px",
      color: COLORS.armyGreen,
    });
    this.dialog.makeButton(GAME_WIDTH / 2, y, t("credits_issues"), () => openExternal(ISSUES_URL), {
      width: 230,
      height: 54,
      fontSize: "19px",
      color: COLORS.armyGreen,
    });
    this.dialog.makeButton(GAME_WIDTH / 2 + 260, y, t("credits_profile"), () => openExternal(PROFILE_URL), {
      width: 230,
      height: 54,
      fontSize: "19px",
      color: COLORS.armyGreen,
    });

    this.add
      .text(GAME_WIDTH / 2, 604, t("credits_license"), {
        fontFamily: FONT,
        fontSize: "17px",
        color: "#c9b98f",
        align: "center",
        wordWrap: { width: 850 },
      })
      .setOrigin(0.5);

    addFullscreenButton(this, GAME_WIDTH - 132, 20);
    const menu = this.add
      .text(GAME_WIDTH - 24, 20, "‹ " + t("btn_menu"), {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#f2ecd8",
        backgroundColor: "rgba(0,0,0,0.35)",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    menu.on("pointerup", () => this.scene.start("MenuScene"));
  }
}

function openExternal(url) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
