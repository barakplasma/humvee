import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const GAUGES = [
  { key: "oil", title: "s7_oil_title", body: "s7_oil_body", x: 166, y: 74 },
  { key: "temp", title: "s7_temp_title", body: "s7_temp_body", x: 545, y: 82 },
  { key: "fuel", title: "s7_fuel_title", body: "s7_fuel_body", x: 176, y: 269 },
  { key: "speed", title: "s7_speed_title", body: "s7_speed_body", x: 371, y: 248 },
  { key: "volt", title: "s7_volt_title", body: "s7_volt_body", x: 526, y: 280 },
];

export default class Stage7Scene extends Phaser.Scene {
  constructor() {
    super("Stage7Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.seen = new Set();

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.armyGreenDark, 1).setOrigin(0);
    this.banner = this.dialog.banner(t("s7_obj"));
    this.makeBackButton();
    addFullscreenButton(this, GAME_WIDTH - 132, 20);

    this.photo = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, assetKey("closeup_gauges"));
    this.photo.setScale(Math.min(980 / this.photo.width, 570 / this.photo.height));
    this.add
      .text(GAME_WIDTH / 2, 66, t("stage7_title"), {
        fontFamily: FONT,
        fontSize: "38px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.hotspots = {};
    GAUGES.forEach((gauge) => this.makeHotspot(gauge));
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

  makeHotspot(gauge) {
    const scale = this.photo.scaleX;
    const x = this.photo.x - (this.photo.width * scale) / 2 + gauge.x * scale;
    const y = this.photo.y - (this.photo.height * scale) / 2 + gauge.y * scale;
    const ring = this.add.graphics().setDepth(20);
    const zone = this.add.circle(x, y, 46).setDepth(21).setInteractive({ useHandCursor: true });
    zone.setFillStyle(0xffffff, 0.001);
    this.hotspots[gauge.key] = { gauge, ring, x, y };
    this.drawRing(gauge.key);
    zone.on("pointerup", () => this.reviewGauge(gauge));
  }

  drawRing(key) {
    const hs = this.hotspots[key];
    const done = this.seen.has(key);
    hs.ring.clear();
    hs.ring.lineStyle(5, done ? COLORS.good : COLORS.hotspot, 1);
    hs.ring.strokeCircle(hs.x, hs.y, 42);
    if (done) {
      hs.ring.lineStyle(5, COLORS.good, 1);
      hs.ring.beginPath();
      hs.ring.moveTo(hs.x - 14, hs.y);
      hs.ring.lineTo(hs.x - 4, hs.y + 12);
      hs.ring.lineTo(hs.x + 18, hs.y - 14);
      hs.ring.strokePath();
    }
  }

  reviewGauge(gauge) {
    this.dialog.showCard({
      title: t(gauge.title),
      body: t(gauge.body),
      imageKey: assetKey("closeup_gauges"),
      onClose: () => {
        this.seen.add(gauge.key);
        this.drawRing(gauge.key);
        this.updateProgress();
        if (this.seen.size === GAUGES.length) this.finish();
      },
    });
  }

  updateProgress() {
    this.banner.setText(t("s7_progress", { done: this.seen.size, total: GAUGES.length }));
  }

  finish() {
    this.time.delayedCall(900, () =>
      this.scene.start("StageCompleteScene", { stage: 7, score: 100, nextScene: null })
    );
  }
}
