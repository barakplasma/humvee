import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import { getScore, reset, allComplete } from "../data/progress.js";
import Dialog from "../ui/Dialog.js";
import LangSwitch from "../ui/LangSwitch.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const STAGES = [
  { n: 1, titleKey: "stage1_title", blurbKey: "stage1_blurb", scene: "Stage1Scene" },
  { n: 2, titleKey: "stage2_title", blurbKey: "stage2_blurb", scene: "Stage2Scene" },
  { n: 3, titleKey: "stage3_title", blurbKey: "stage3_blurb", scene: "Stage3Scene" },
  { n: 4, titleKey: "stage4_title", blurbKey: "stage4_blurb", scene: "Stage4Scene" },
  { n: 5, titleKey: "stage5_title", blurbKey: "stage5_blurb", scene: "Stage5Scene" },
];

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.dialog = new Dialog(this);

    // Background hero (photo / AI / procedural).
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("title_art"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35).setOrigin(0);

    // Title.
    this.add
      .text(GAME_WIDTH / 2, 80, t("app_title"), {
        fontFamily: FONT,
        fontSize: "64px",
        color: "#f2ecd8",
        fontStyle: "bold",
        stroke: "#161a10",
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 138, t("app_subtitle"), {
        fontFamily: FONT,
        fontSize: "30px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Language switch (restart scene so everything re-renders in the new direction).
    new LangSwitch(this, 24, 34, () => this.scene.restart());

    // Stage cards (width scales to the number of stages).
    const gap = 18;
    const margin = 28;
    const n = STAGES.length;
    const cardW = Math.floor((GAME_WIDTH - margin * 2 - gap * (n - 1)) / n);
    let x = margin + cardW / 2;
    const y = 380;
    STAGES.forEach((st) => {
      this.makeStageCard(x, y, cardW, st);
      x += cardW + gap;
    });

    // Disclaimer.
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 46, t("disclaimer"), {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#c9b98f",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 260 },
      })
      .setOrigin(0.5);

    // Reset progress (small, top-right corner).
    const resetBtn = this.add
      .text(GAME_WIDTH - 24, 30, t("progress_reset"), {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#9c8f68",
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });
    resetBtn.on("pointerup", () => {
      reset();
      this.scene.restart();
    });

    addFullscreenButton(this, GAME_WIDTH - 24, 58);

    if (allComplete()) {
      this.dialog.toast(t("all_complete_msg"), { color: "#6fbf5a", duration: 3000 });
    }
  }

  makeStageCard(x, y, w, st) {
    const score = getScore(st.n);
    const h = 260;
    const cont = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, w, h, COLORS.panel, 0.95)
      .setStrokeStyle(3, COLORS.sand)
      .setInteractive({ useHandCursor: true });
    cont.add(bg);

    cont.add(
      this.add
        .text(0, -h / 2 + 34, t("stage", { n: st.n }), {
          fontFamily: FONT,
          fontSize: "20px",
          color: "#d8a54a",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );
    cont.add(
      this.add
        .text(0, -h / 2 + 74, t(st.titleKey), {
          fontFamily: FONT,
          fontSize: "23px",
          color: "#f2ecd8",
          fontStyle: "bold",
          align: "center",
          wordWrap: { width: w - 24 },
        })
        .setOrigin(0.5)
    );
    cont.add(
      this.add
        .text(0, 24, t(st.blurbKey), {
          fontFamily: FONT,
          fontSize: "16px",
          color: "#c9b98f",
          align: "center",
          wordWrap: { width: w - 26 },
        })
        .setOrigin(0.5)
    );

    cont.add(
      this.add
        .text(0, h / 2 - 62, score ? t("best_score", { score }) : t("no_score"), {
          fontFamily: FONT,
          fontSize: "17px",
          color: score ? "#d8a54a" : "#9c8f68",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );

    cont.add(
      this.add
        .text(0, h / 2 - 28, "▶ " + t("btn_begin"), {
          fontFamily: FONT,
          fontSize: "22px",
          color: "#6fbf5a",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );

    bg.on("pointerup", () => this.scene.start(st.scene));
  }
}

// Scale an image to cover a box (crop overflow), centred.
export function fitCover(img, boxW, boxH) {
  const scale = Math.max(boxW / img.width, boxH / img.height);
  img.setScale(scale);
}
