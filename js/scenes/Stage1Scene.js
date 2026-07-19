import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import { CONTROLS } from "../data/controls.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
import { fitCover } from "./MenuScene.js";

const STARTUP_STEPS = [
  { key: "startup_step_pbrake", target: "pbrake" },
  { key: "startup_step_park", target: "trans" },
  { key: "startup_step_run", target: "ignition" },
  { key: "startup_step_wait", target: null, auto: true },
  { key: "startup_step_start", target: "ignition" },
  { key: "startup_step_release", target: "pbrake" },
  { key: "startup_step_drive", target: "trans" },
];

export default class Stage1Scene extends Phaser.Scene {
  constructor() {
    super("Stage1Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.phase = "tour";
    this.seen = new Set();

    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("dashboard_panel"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);

    this.banner = this.dialog.banner(t("ctrl_tour_intro"));
    this.makeBackButton();
    addFullscreenButton(this, GAME_WIDTH - 24, 18);

    this.progressText = this.add
      .text(GAME_WIDTH / 2, 30, "", { fontFamily: FONT, fontSize: "22px", color: "#d8a54a", fontStyle: "bold" })
      .setOrigin(0.5)
      .setDepth(900);

    this.hotspots = {};
    CONTROLS.forEach((c) => this.makeHotspot(c));
    this.updateProgress();
  }

  makeBackButton() {
    const b = this.add
      .text(GAME_WIDTH - 24, GAME_HEIGHT - 30, "‹ " + t("btn_menu"), {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#c9b98f",
        backgroundColor: "rgba(28,33,20,0.7)",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(1, 1)
      .setDepth(950)
      .setInteractive({ useHandCursor: true });
    b.on("pointerup", () => this.scene.start("MenuScene"));
  }

  makeHotspot(control) {
    const { x, y } = control.pos;
    const ring = this.add.graphics().setDepth(500);
    const zone = this.add
      .circle(x, y, 40)
      .setInteractive({ useHandCursor: true })
      .setDepth(501);
    zone.setFillStyle(0xffffff, 0.001);

    const icon = this.drawIcon(control.icon, x, y);

    const hs = { control, ring, zone, icon, seen: false, x, y };
    this.hotspots[control.id] = hs;
    this.drawRing(hs);

    // Gentle pulse to invite taps.
    this.tweens.add({
      targets: ring,
      alpha: { from: 1, to: 0.35 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    zone.on("pointerup", () => this.onHotspot(hs));
  }

  drawRing(hs) {
    const g = hs.ring;
    g.clear();
    let color = COLORS.hotspot;
    if (hs.seen) color = COLORS.good;
    if (this.phase === "startup" && this.targetId === hs.control.id) color = COLORS.accent;
    g.lineStyle(4, color, 1);
    g.strokeCircle(hs.x, hs.y, 34);
    if (hs.seen && this.phase === "tour") {
      g.lineStyle(4, COLORS.good, 1);
      g.beginPath();
      g.moveTo(hs.x - 12, hs.y);
      g.lineTo(hs.x - 3, hs.y + 10);
      g.lineTo(hs.x + 14, hs.y - 12);
      g.strokePath();
    }
  }

  // Minimal procedural glyphs so each hotspot reads as a distinct control.
  drawIcon(kind, x, y) {
    const g = this.add.graphics().setDepth(499);
    g.fillStyle(COLORS.panelLight, 0.9);
    g.fillCircle(x, y, 26);
    g.lineStyle(3, COLORS.sand, 1);
    g.strokeCircle(x, y, 26);
    g.lineStyle(3, COLORS.text, 1);
    g.fillStyle(COLORS.text, 1);
    switch (kind) {
      case "wheel":
        g.strokeCircle(x, y, 15);
        g.fillCircle(x, y, 4);
        break;
      case "key":
        g.strokeCircle(x, y - 6, 7);
        g.lineBetween(x, y + 1, x, y + 14);
        g.lineBetween(x, y + 10, x + 6, y + 10);
        break;
      case "pedal":
        g.fillRoundedRect(x - 9, y - 13, 18, 26, 4);
        break;
      case "lever":
        g.lineBetween(x, y + 12, x + 6, y - 12);
        g.fillCircle(x + 6, y - 12, 5);
        break;
      case "gauge":
        g.strokeCircle(x, y, 14);
        g.lineBetween(x, y, x + 8, y - 8);
        break;
      case "panel":
        g.strokeRect(x - 12, y - 9, 24, 18);
        g.lineBetween(x, y - 9, x, y + 9);
        break;
      case "button":
        g.fillCircle(x, y, 9);
        break;
      case "stalk":
      default:
        g.lineBetween(x - 12, y + 8, x + 12, y - 8);
        g.fillCircle(x + 12, y - 8, 5);
        break;
    }
    return g;
  }

  onHotspot(hs) {
    if (this.phase === "tour") {
      // If this tap reviews the final control, begin the start-up sequence only
      // once the player dismisses the card (not on a background timer).
      const isLast = !hs.seen && this.seen.size + 1 === CONTROLS.length;
      this.dialog.showCard({
        title: t(hs.control.nameKey),
        body: t(hs.control.descKey),
        onClose: isLast ? () => this.startStartup() : undefined,
      });
      if (!hs.seen) {
        hs.seen = true;
        this.seen.add(hs.control.id);
        this.drawRing(hs);
        this.updateProgress();
      }
    } else if (this.phase === "startup") {
      this.handleStartupTap(hs);
    }
  }

  updateProgress() {
    this.progressText.setText(`${this.seen.size} / ${CONTROLS.length}`);
  }

  // ---- Start-up sequence phase ----
  startStartup() {
    this.phase = "startup";
    this.stepIndex = 0;
    // Stop pulsing; dim all rings to neutral.
    this.tweens.killAll();
    Object.values(this.hotspots).forEach((hs) => {
      hs.ring.setAlpha(1);
      this.drawRing(hs);
    });
    this.banner.setText(t("startup_intro"));
    this.dialog.toast(t("ctrl_tour_all_seen"), { color: "#6fbf5a", duration: 2600 });

    this.buildChecklist();
    this.setStep(0);
  }

  buildChecklist() {
    const x = 24;
    let y = 90;
    this.add
      .text(x, y, t("startup_title"), { fontFamily: FONT, fontSize: "24px", color: "#d8a54a", fontStyle: "bold" })
      .setDepth(900);
    y += 40;
    this.checkItems = STARTUP_STEPS.map((step, i) => {
      const txt = this.add
        .text(x, y, "○ " + t(step.key), {
          fontFamily: FONT,
          fontSize: "19px",
          color: "#c9b98f",
          backgroundColor: "rgba(28,33,20,0.6)",
          padding: { x: 8, y: 4 },
          wordWrap: { width: 420 },
        })
        .setDepth(900);
      y += txt.height + 8;
      return txt;
    });
  }

  refreshChecklist() {
    this.checkItems.forEach((txt, i) => {
      const step = STARTUP_STEPS[i];
      if (i < this.stepIndex) {
        txt.setText("✓ " + t(step.key)).setColor("#6fbf5a");
      } else if (i === this.stepIndex) {
        txt.setText("▶ " + t(step.key)).setColor("#f2ecd8");
      } else {
        txt.setText("○ " + t(step.key)).setColor("#9c8f68");
      }
    });
  }

  setStep(i) {
    this.stepIndex = i;
    if (i >= STARTUP_STEPS.length) return this.finishStartup();
    const step = STARTUP_STEPS[i];
    this.targetId = step.target;

    // Update highlight rings.
    Object.values(this.hotspots).forEach((hs) => this.drawRing(hs));
    this.refreshChecklist();

    if (step.auto) {
      // WAIT-TO-START glow-plug delay.
      this.showWaitLight(true);
      this.time.delayedCall(2200, () => {
        this.showWaitLight(false);
        this.setStep(i + 1);
      });
    }
  }

  handleStartupTap(hs) {
    const step = STARTUP_STEPS[this.stepIndex];
    if (!step || step.auto) return;
    if (hs.control.id === this.targetId) {
      this.dialog.toast(t("s3_correct"), { color: "#6fbf5a", duration: 900 });
      this.setStep(this.stepIndex + 1);
    } else {
      this.dialog.toast(t("startup_hint_next", { step: t(step.key) }), {
        color: "#d8a54a",
        duration: 1400,
      });
    }
  }

  showWaitLight(on) {
    if (!this.waitLight) {
      this.waitLight = this.add
        .text(GAME_WIDTH / 2, 240, t("startup_wait_light"), {
          fontFamily: FONT,
          fontSize: "26px",
          color: "#d85a4a",
          fontStyle: "bold",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: { x: 14, y: 8 },
        })
        .setOrigin(0.5)
        .setDepth(950);
    }
    this.waitLight.setVisible(on);
    if (on) {
      this.waitTween = this.tweens.add({
        targets: this.waitLight,
        alpha: { from: 1, to: 0.3 },
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    } else if (this.waitTween) {
      this.waitTween.stop();
      this.waitLight.setAlpha(1);
    }
  }

  finishStartup() {
    this.refreshChecklist();
    this.dialog.toast(t("startup_done"), { color: "#6fbf5a", duration: 2200 });
    this.time.delayedCall(1800, () =>
      this.scene.start("StageCompleteScene", { stage: 1, score: 100, nextScene: "Stage2Scene" })
    );
  }
}
