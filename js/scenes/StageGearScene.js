import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import { TRANSMISSION, TRANSFER } from "../data/controls.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
import { fitCover } from "./MenuScene.js";

const STEPS = [
  { key: "s2gear_step_neutral", type: "gear", value: "N" },
  { key: "s2gear_step_high_lock", type: "range", value: "HL" },
  { key: "s2gear_step_high", type: "range", value: "H" },
  { key: "s2gear_step_low", type: "range", value: "L", needsNeutral: true },
  { key: "s2gear_step_drive", type: "gear", value: "D" },
];

export default class StageGearScene extends Phaser.Scene {
  constructor() {
    super("StageGearScene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.gear = "P";
    this.range = "H";
    this.stepIndex = 0;
    this.mistakes = 0;

    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("closeup_shifters"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.58).setOrigin(0);

    this.banner = this.dialog.banner(t("s2gear_obj"));
    this.makeBackButton();
    addFullscreenButton(this, GAME_WIDTH - 132, 20);

    this.add
      .text(GAME_WIDTH / 2, 72, t("stage2_title"), {
        fontFamily: FONT,
        fontSize: "40px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.transferCells = this.makeSelector(250, 154, t("transfer_short"), TRANSFER, "range");
    this.transCells = this.makeSelector(880, 118, t("transmission_short"), TRANSMISSION, "gear");

    this.stepText = this.add
      .text(GAME_WIDTH / 2, 620, "", {
        fontFamily: FONT,
        fontSize: "28px",
        color: "#f2ecd8",
        fontStyle: "bold",
        align: "center",
        backgroundColor: "rgba(28,33,20,0.86)",
        padding: { x: 18, y: 10 },
        wordWrap: { width: 920 },
      })
      .setOrigin(0.5)
      .setDepth(900);

    this.sourceText = this.add
      .text(GAME_WIDTH / 2, 688, t("s2gear_source"), {
        fontFamily: FONT,
        fontSize: "15px",
        color: "#c9b98f",
        align: "center",
        wordWrap: { width: 920 },
      })
      .setOrigin(0.5)
      .setDepth(900);

    this.refresh();
  }

  makeBackButton() {
    const b = this.add
      .text(GAME_WIDTH - 24, 20, "‹ " + t("btn_menu"), {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#c9b98f",
        backgroundColor: "rgba(28,33,20,0.7)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0)
      .setDepth(1500)
      .setInteractive({ useHandCursor: true });
    b.on("pointerup", () => this.scene.start("MenuScene"));
  }

  makeSelector(x, y, title, options, type) {
    const cells = {};
    this.add
      .text(x + 92, y - 48, title, {
        fontFamily: FONT,
        fontSize: "27px",
        color: "#f2ecd8",
        fontStyle: "bold",
        backgroundColor: "rgba(28,33,20,0.82)",
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(900);

    options.forEach((opt, i) => {
      const cy = y + i * 58;
      const rect = this.add
        .rectangle(x + 92, cy, 184, 48, COLORS.panel, 0.94)
        .setStrokeStyle(2, COLORS.sandDark)
        .setDepth(900)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(x + 92, cy, opt, {
          fontFamily: FONT,
          fontSize: "25px",
          color: "#f2ecd8",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(901);
      rect.on("pointerup", () => this.select(type, opt));
      cells[opt] = { rect, label };
    });
    return cells;
  }

  select(type, value) {
    if (type === "range" && this.gear !== "N") {
      this.mistakes++;
      this.dialog.toast(t("s2gear_neutral_first"), { color: "#d8a54a", duration: 1600 });
      return;
    }
    if (type === "gear") this.gear = value;
    else this.range = value;

    const step = STEPS[this.stepIndex];
    if (step && step.type === type && step.value === value && (!step.needsNeutral || this.gear === "N")) {
      this.stepIndex++;
      this.dialog.toast(t("s3_correct"), { color: "#6fbf5a", duration: 900 });
      if (this.stepIndex >= STEPS.length) return this.finish();
    } else if (step) {
      this.mistakes++;
      this.dialog.toast(t("s2gear_wrong"), { color: "#d8a54a", duration: 1300 });
    }
    this.refresh();
  }

  refresh() {
    this.paintCells(this.transCells, this.gear);
    this.paintCells(this.transferCells, this.range);
    const step = STEPS[this.stepIndex];
    this.banner.setText(t("s2gear_status", { gear: this.gear, range: this.range }));
    this.stepText.setText(step ? t(step.key) : t("s2gear_complete"));
  }

  paintCells(cells, active) {
    Object.entries(cells).forEach(([opt, { rect, label }]) => {
      const on = opt === active;
      rect.setFillStyle(on ? COLORS.accent : COLORS.panel, on ? 1 : 0.94);
      label.setColor(on ? "#161a10" : "#f2ecd8");
    });
  }

  finish() {
    this.refresh();
    const score = Math.max(0, 100 - this.mistakes * 8);
    this.time.delayedCall(900, () =>
      this.scene.start("StageCompleteScene", { stage: 2, score, nextScene: "StageObstacleScene" })
    );
  }
}
