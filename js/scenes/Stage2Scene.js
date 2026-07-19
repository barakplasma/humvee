import { COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import DriveControls from "../ui/DriveControls.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const WORLD_W = 2000;
const WORLD_H = 1500;

// Road segments (axis-aligned rectangles) forming an "L": up, then right.
const ROADS = [
  { x: 300, y: 150, w: 200, h: 1200 }, // vertical
  { x: 300, y: 150, w: 1450, h: 200 }, // horizontal
];

export default class Stage2Scene extends Phaser.Scene {
  constructor() {
    super("Stage2Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.penalty = 0;
    this.finished = false;

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x5b6b3a, 1).setOrigin(0); // grass

    this.drawRoads();
    this.decorate();

    // Traffic light on the vertical road; player travels upward (decreasing y).
    this.light = { x: 400, y: 780, stopLine: 820, state: "green", timer: 0 };
    this.lightGfx = this.add.graphics().setDepth(5);
    this.drawStopLine(400, 820, true);

    // Stop sign on the horizontal road; player travels right (increasing x).
    this.sign = { x: 1050, stopLine: 1000, passed: false, stopped: false };
    this.drawStopSign(1050, 250);
    this.drawStopLine(1000, 250, false);

    // Destination marker.
    this.dest = { x: 1650, y: 250, r: 60 };
    this.destGfx = this.add.circle(this.dest.x, this.dest.y, this.dest.r, COLORS.good, 0.35).setDepth(4);
    this.add.circle(this.dest.x, this.dest.y, this.dest.r, COLORS.good).setDepth(4).setStrokeStyle(4, 0xffffff).setFillStyle(0, 0);
    this.add.text(this.dest.x, this.dest.y, "🏁", { fontSize: "44px" }).setOrigin(0.5).setDepth(6);

    // Vehicle.
    this.vehicle = this.add.image(400, 1250, assetKey("humvee_topdown")).setDepth(10);
    this.vehicle.setScale(0.7);
    this.vehicle.rotation = 0; // texture points up
    this.speed = 0;
    this.cameras.main.startFollow(this.vehicle, true, 0.1, 0.1);

    this.lightPassed = false;

    // Controls (fixed in Drive; city driving). HUD/pedals stay on screen.
    this.dc = new DriveControls(this, { gear: "D" });
    this.dc.container.setScrollFactor(0);

    this.banner = this.dialog.banner(t("s2_obj"));
    this.dialog.toast(t("s2_reminder_drive"), { color: "#c9b98f", duration: 2600 });
    this.makeBackButton();
    addFullscreenButton(this, this.scale.width - 132, 20);
  }

  drawRoads() {
    const g = this.add.graphics().setDepth(1);
    ROADS.forEach((r) => {
      g.fillStyle(COLORS.road, 1);
      g.fillRect(r.x, r.y, r.w, r.h);
    });
    // Lane dashes.
    g.fillStyle(COLORS.roadLine, 0.9);
    for (let y = 200; y < 1350; y += 70) g.fillRect(396, y, 8, 36); // vertical centre
    for (let x = 350; x < 1750; x += 70) g.fillRect(x, 246, 36, 8); // horizontal centre
  }

  decorate() {
    // A few "buildings" off the road for context.
    const spots = [
      [700, 600, 200, 160],
      [750, 900, 160, 220],
      [900, 550, 180, 120],
      [1300, 600, 220, 200],
      [150, 500, 120, 260],
    ];
    const g = this.add.graphics().setDepth(1);
    spots.forEach(([x, y, w, h]) => {
      g.fillStyle(0x746a4a, 1);
      g.fillRect(x, y, w, h);
      g.fillStyle(0x8a7d55, 1);
      g.fillRect(x + 8, y + 8, w - 16, 24);
    });
  }

  drawStopLine(x, y, vertical) {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0xffffff, 0.9);
    if (vertical) g.fillRect(x - 100, y, 200, 10);
    else g.fillRect(x, y - 100, 10, 200);
  }

  drawStopSign(x, y) {
    this.add.circle(x, y - 120, 26, COLORS.bad).setDepth(6).setStrokeStyle(3, 0xffffff);
    this.add.text(x, y - 120, "STOP", { fontFamily: FONT, fontSize: "13px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(7);
  }

  makeBackButton() {
    const b = this.add
      .text(this.scale.width - 24, 20, "‹ " + t("btn_menu"), {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#c9b98f",
        backgroundColor: "rgba(28,33,20,0.7)",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1500)
      .setInteractive({ useHandCursor: true });
    b.on("pointerup", () => this.scene.start("MenuScene"));
  }

  isOnRoad(x, y) {
    return ROADS.some((r) => x >= r.x - 10 && x <= r.x + r.w + 10 && y >= r.y - 10 && y <= r.y + r.h + 10);
  }

  update(time, dtMs) {
    if (this.finished) return;
    const dt = dtMs / 1000;
    this.dc.update(dtMs);

    // Speed dynamics.
    const ACCEL = 320;
    const BRAKE = 620;
    const ROLL = 120;
    const MAX = 430;
    this.speed += this.dc.throttle * ACCEL * dt;
    this.speed -= this.dc.brakeInput * BRAKE * dt;
    this.speed -= ROLL * dt;

    const onRoad = this.isOnRoad(this.vehicle.x, this.vehicle.y);
    if (!onRoad) {
      this.speed -= 400 * dt; // heavy drag off-road
      if (!this._offroadWarn) {
        this._offroadWarn = true;
        this.dialog.toast(t("s2_offroad"), { color: "#d8a54a", duration: 1200 });
        this.time.delayedCall(1500, () => (this._offroadWarn = false));
      }
    }
    this.speed = Phaser.Math.Clamp(this.speed, 0, onRoad ? MAX : 140);

    // Steering (more effective with speed, but usable when crawling).
    const steerFactor = 0.4 + 0.6 * Phaser.Math.Clamp(this.speed / 200, 0, 1);
    this.vehicle.rotation += this.dc.steer * 2.4 * steerFactor * dt;

    // Move along heading (texture points up → forward = (sin, -cos)).
    const fx = Math.sin(this.vehicle.rotation);
    const fy = -Math.cos(this.vehicle.rotation);
    this.vehicle.x += fx * this.speed * dt;
    this.vehicle.y += fy * this.speed * dt;
    this.vehicle.x = Phaser.Math.Clamp(this.vehicle.x, 0, WORLD_W);
    this.vehicle.y = Phaser.Math.Clamp(this.vehicle.y, 0, WORLD_H);

    this.dc.setSpeedDisplay(this.speed * 0.11);

    this.updateTrafficLight(dt);
    this.checkStopSign();
    this.checkArrival();
  }

  updateTrafficLight(dt) {
    const L = this.light;
    L.timer += dt;
    if (L.state === "green" && L.timer > 6) {
      L.state = "red";
      L.timer = 0;
    } else if (L.state === "red" && L.timer > 4) {
      L.state = "green";
      L.timer = 0;
    }

    const g = this.lightGfx;
    g.clear();
    g.fillStyle(0x111111, 1);
    g.fillRoundedRect(L.x + 60, L.y - 60, 40, 100, 8);
    g.fillStyle(L.state === "red" ? COLORS.bad : 0x3a1a1a, 1);
    g.fillCircle(L.x + 80, L.y - 34, 15);
    g.fillStyle(L.state === "green" ? COLORS.good : 0x1a3a1a, 1);
    g.fillCircle(L.x + 80, L.y + 14, 15);

    // Violation: crossed the stop line (upward) while red and moving.
    if (!this.lightPassed && this.vehicle.y < L.stopLine) {
      this.lightPassed = true;
      if (L.state === "red" && this.speed > 40) {
        this.penalty += 25;
        this.dialog.toast(t("s2_ran_light"), { color: "#d85a4a", duration: 2200 });
      }
    }
    // Approaching red prompt.
    if (!this.lightPassed && L.state === "red" && Math.abs(this.vehicle.y - L.stopLine) < 220 && this.vehicle.y > L.stopLine) {
      if (!this._redPrompt) {
        this._redPrompt = true;
        this.dialog.toast(t("s2_light_red"), { color: "#d85a4a", duration: 1400 });
        this.time.delayedCall(1600, () => (this._redPrompt = false));
      }
    }
  }

  checkStopSign() {
    const S = this.sign;
    if (S.passed) return;
    // Near the stop line and slow → counts as a proper stop.
    if (Math.abs(this.vehicle.x - S.stopLine) < 130 && this.vehicle.y < 380 && this.speed < 20) {
      S.stopped = true;
    }
    if (this.vehicle.x > S.stopLine + 10 && this.vehicle.y < 380) {
      S.passed = true;
      if (!S.stopped) {
        this.penalty += 20;
        this.dialog.toast(t("s2_stopsign"), { color: "#d85a4a", duration: 2000 });
      }
    }
  }

  checkArrival() {
    const d = Phaser.Math.Distance.Between(this.vehicle.x, this.vehicle.y, this.dest.x, this.dest.y);
    if (d < this.dest.r) {
      this.finished = true;
      this.dialog.toast(t("s2_arrived"), { color: "#6fbf5a", duration: 1600 });
      const score = Math.max(0, 100 - this.penalty);
      this.time.delayedCall(1400, () =>
        this.scene.start("StageCompleteScene", { stage: 2, score, nextScene: "Stage3Scene" })
      );
    }
  }
}
