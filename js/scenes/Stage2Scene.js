import { COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import DriveControls from "../ui/DriveControls.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const WORLD_W = 2000;
const WORLD_H = 1500;
const WHEELBASE = 115;
const MAX_STEER_ANGLE = 0.48;
const ROAD_HALF = 96;

// Curved road centerline. The course still teaches a red light and stop sign,
// but avoids the old right-angle geometry.
const ROAD_PATH = [
  [410, 1260],
  [390, 1040],
  [420, 830],
  [510, 640],
  [650, 500],
  [830, 390],
  [1060, 310],
  [1320, 262],
  [1640, 250],
];

export default class Stage2Scene extends Phaser.Scene {
  constructor() {
    super("Stage2Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.penalty = 0;
    this.finished = false;
    this.offroadTimer = 0;

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x5b6b3a, 1).setOrigin(0); // grass

    this.drawRoads();
    this.decorate();

    // Traffic light on the vertical road; player travels upward (decreasing y).
    this.light = { x: 455, y: 780, stopLine: 820, state: "green", timer: 0 };
    this.lightGfx = this.add.graphics().setDepth(5);
    this.drawStopLine(400, 820, true);

    // Stop sign on the horizontal road; player travels right (increasing x).
    this.sign = { x: 1080, stopLine: 1030, passed: false, stopped: false };
    this.drawStopSign(1080, 292);
    this.drawStopLine(1030, 302, false);

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
    this.dc = new DriveControls(this, { selectors: true, gear: "D", range: "H" });
    this.dc.container.setScrollFactor(0);

    this.banner = this.dialog.banner(t("s2_obj"));
    this.dialog.toast(t("s2_reminder_drive"), { color: "#c9b98f", duration: 2600 });
    this.makeBackButton();
    addFullscreenButton(this, this.scale.width - 132, 20);
  }

  drawRoads() {
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(ROAD_HALF * 2 + 14, 0x25252a, 0.8);
    g.beginPath();
    ROAD_PATH.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.strokePath();

    g.lineStyle(ROAD_HALF * 2, COLORS.road, 1);
    g.beginPath();
    ROAD_PATH.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
    g.strokePath();

    g.lineStyle(8, COLORS.roadLine, 0.9);
    for (let i = 0; i < ROAD_PATH.length - 1; i++) {
      const [x0, y0] = ROAD_PATH[i];
      const [x1, y1] = ROAD_PATH[i + 1];
      const len = Phaser.Math.Distance.Between(x0, y0, x1, y1);
      for (let d = 18; d < len; d += 74) {
        const a = d / len;
        const b = Math.min((d + 34) / len, 1);
        g.lineBetween(Phaser.Math.Linear(x0, x1, a), Phaser.Math.Linear(y0, y1, a), Phaser.Math.Linear(x0, x1, b), Phaser.Math.Linear(y0, y1, b));
      }
    }
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
    return this.distanceToRoad(x, y) <= ROAD_HALF + 12;
  }

  distanceToRoad(x, y) {
    let best = Infinity;
    for (let i = 0; i < ROAD_PATH.length - 1; i++) {
      const [x0, y0] = ROAD_PATH[i];
      const [x1, y1] = ROAD_PATH[i + 1];
      best = Math.min(best, pointSegmentDistance(x, y, x0, y0, x1, y1));
    }
    return best;
  }

  update(time, dtMs) {
    if (this.finished) return;
    const dt = dtMs / 1000;
    this.dc.update(dtMs);

    const drive = this.dc.getDriveSpec();
    if (drive.dir === 0) {
      this.speed = toward(this.speed, 0, (drive.rollingDrag + this.dc.brakeInput * drive.brakeDrag) * dt);
    } else {
      this.speed += this.dc.throttle * 350 * drive.torque * drive.dir * dt;
      this.speed = toward(this.speed, 0, drive.rollingDrag * dt);
      this.speed = toward(this.speed, 0, this.dc.brakeInput * drive.brakeDrag * dt);
    }

    const onRoad = this.isOnRoad(this.vehicle.x, this.vehicle.y);
    if (!onRoad) {
      this.offroadTimer += dt;
      this.speed = toward(this.speed, 0, 210 * dt); // heavy drag off-road, but still recoverable under throttle
      if (!this._offroadWarn) {
        this._offroadWarn = true;
        this.dialog.toast(t("s2_offroad"), { color: "#d8a54a", duration: 1200 });
        this.time.delayedCall(1500, () => (this._offroadWarn = false));
      }
      if (this.offroadTimer > 2.2 || this.distanceToRoad(this.vehicle.x, this.vehicle.y) > 260) this.failOffroad();
    } else {
      this.offroadTimer = 0;
    }
    const max = onRoad ? drive.maxSpeed : Math.min(130, drive.maxSpeed);
    this.speed = Phaser.Math.Clamp(this.speed, -max, max);

    // Kinematic bicycle steering: only the front wheels steer, and the body only
    // yaws when the vehicle is moving. This prevents pivoting in place.
    if (Math.abs(this.speed) > 4) {
      const steerAngle = this.dc.steer * MAX_STEER_ANGLE;
      this.vehicle.rotation += (this.speed / WHEELBASE) * Math.tan(steerAngle) * dt;
    }

    // Move along heading (texture points up → forward = (sin, -cos)).
    const fx = Math.sin(this.vehicle.rotation);
    const fy = -Math.cos(this.vehicle.rotation);
    this.vehicle.x += fx * this.speed * dt;
    this.vehicle.y += fy * this.speed * dt;
    this.vehicle.x = Phaser.Math.Clamp(this.vehicle.x, 0, WORLD_W);
    this.vehicle.y = Phaser.Math.Clamp(this.vehicle.y, 0, WORLD_H);

    this.dc.setSpeedDisplay(Math.abs(this.speed) * 0.11, this.dc.getRpm(this.speed, { load: onRoad ? 0.15 : 0.55 }));

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
        this.scene.start("StageCompleteScene", { stage: 4, score, nextScene: "Stage3Scene" })
      );
    }
  }

  failOffroad() {
    this.finished = true;
    this.penalty += 30;
    this.dialog.toast(t("s2_failed_offroad"), { color: "#d85a4a", duration: 2200 });
    this.time.delayedCall(1600, () => this.scene.restart());
  }
}

function pointSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq === 0 ? 0 : Phaser.Math.Clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  const x = ax + dx * t;
  const y = ay + dy * t;
  return Phaser.Math.Distance.Between(px, py, x, y);
}

function toward(v, target, step) {
  if (v > target) return Math.max(target, v - step);
  if (v < target) return Math.min(target, v + step);
  return v;
}
