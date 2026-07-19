import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const CHECKS = [
  { key: "tire", title: "s6_tire_title", body: "s6_tire_body", image: "inspection_tire" },
  { key: "oil", title: "s6_oil_title", body: "s6_oil_body", image: "inspection_engine" },
  { key: "fluids", title: "s6_fluids_title", body: "s6_fluids_body", image: "inspection_fluids" },
  { key: "belts", title: "s6_belts_title", body: "s6_belts_body", image: "inspection_engine" },
  { key: "air", title: "s6_air_title", body: "s6_air_body", image: "inspection_engine" },
  { key: "post_leaks", title: "s6_post_leaks_title", body: "s6_post_leaks_body", image: "inspection_engine" },
  { key: "post_tires", title: "s6_post_tires_title", body: "s6_post_tires_body", image: "inspection_tire" },
];

export default class Stage6Scene extends Phaser.Scene {
  constructor() {
    super("Stage6Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.done = new Set();

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.armyGreenDark, 1).setOrigin(0);
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("inspection_engine"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    bg.setAlpha(0.38);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35).setOrigin(0);

    this.banner = this.dialog.banner(t("s6_obj"));
    this.makeBackButton();
    addFullscreenButton(this, GAME_WIDTH - 132, 20);

    this.add
      .text(GAME_WIDTH / 2, 86, t("stage6_title"), {
        fontFamily: FONT,
        fontSize: "38px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.cards = {};
    CHECKS.forEach((check, i) => this.makeCheckCard(check, i));
    this.updateProgress();
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

  makeCheckCard(check, i) {
    const cols = 3;
    const w = 330;
    const h = 154;
    const gapX = 34;
    const gapY = 28;
    const x = GAME_WIDTH / 2 - (w + gapX) + (i % cols) * (w + gapX);
    const y = 232 + Math.floor(i / cols) * (h + gapY);
    const cont = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, w, h, COLORS.panel, 0.95)
      .setStrokeStyle(3, COLORS.sand)
      .setInteractive({ useHandCursor: true });
    const img = this.add.image(-w / 2 + 72, 0, assetKey(check.image));
    img.setScale(Math.min(112 / img.width, 108 / img.height));
    const title = this.add
      .text(-w / 2 + 142, -44, t(check.title), {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#f2ecd8",
        fontStyle: "bold",
        wordWrap: { width: 170 },
      })
      .setOrigin(0, 0);
    const body = this.add
      .text(-w / 2 + 142, 20, t("tap_to_continue"), {
        fontFamily: FONT,
        fontSize: "15px",
        color: "#c9b98f",
      })
      .setOrigin(0, 0.5);
    cont.add([bg, img, title, body]);
    bg.on("pointerup", () => this.reviewCheck(check));
    this.cards[check.key] = { bg, title, body };
  }

  reviewCheck(check) {
    this.dialog.showCard({
      title: t(check.title),
      body: t(check.body),
      imageKey: assetKey(check.image),
      onClose: () => {
        this.done.add(check.key);
        this.updateProgress();
        if (this.done.size === CHECKS.length) this.finish();
      },
    });
  }

  updateProgress() {
    CHECKS.forEach((check) => {
      const card = this.cards[check.key];
      if (!card) return;
      const done = this.done.has(check.key);
      card.bg.setFillStyle(done ? COLORS.good : COLORS.panel, done ? 0.95 : 0.95);
      card.title.setColor(done ? "#161a10" : "#f2ecd8");
      card.body.setText(done ? "✓" : t("tap_to_continue"));
      card.body.setColor(done ? "#161a10" : "#c9b98f");
    });
    this.banner.setText(t("s6_progress", { done: this.done.size, total: CHECKS.length }));
  }

  finish() {
    this.time.delayedCall(900, () =>
      this.scene.start("StageCompleteScene", { stage: 6, score: 100, nextScene: "Stage7Scene" })
    );
  }
}

function fitCover(img, boxW, boxH) {
  const scale = Math.max(boxW / img.width, boxH / img.height);
  img.setScale(scale);
}
