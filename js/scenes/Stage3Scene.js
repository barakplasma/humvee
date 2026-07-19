import { COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import DriveControls from "../ui/DriveControls.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const WORLD_W = 1000;
const WORLD_H = 2600;
const TRAIL_X = 500;
const TRAIL_HALF = 180;
const WHEELBASE = 115;
const MAX_STEER_ANGLE = 0.5;

export default class Stage3Scene extends Phaser.Scene {
  constructor() {
    super("Stage3Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.finished = false;
    this.wrong = 0;
    this._sawR = false;

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x4a3d24, 1).setOrigin(0);

    // Trail with tinted terrain sections.
    this.buildTrail();

    // Gates: each blocks the trail until the correct gears are selected.
    this.gates = [
      {
        y: 2200,
        promptKey: "s3_prompt_reverse",
        hintKey: "s3_wrong_reverse",
        check: (dc) => this._sawR && ["D", "OD", "2", "1"].includes(dc.gear),
      },
      {
        y: 1700,
        promptKey: "s3_prompt_cruise",
        hintKey: "s3_wrong_cruise",
        check: (dc) => dc.range === "H" && (dc.gear === "D" || dc.gear === "OD"),
      },
      {
        y: 1200,
        promptKey: "s3_prompt_slippery",
        hintKey: "s3_wrong_slippery",
        check: (dc) => dc.range === "HL",
      },
      {
        y: 700,
        promptKey: "s3_prompt_climb",
        hintKey: "s3_wrong_climb",
        check: (dc) => dc.range === "L" && dc.gear === "1",
      },
    ];
    this.gateGfx = this.add.graphics().setDepth(6);
    this.currentGate = 0;
    this.gates.forEach((g) => (g.passed = false));

    // Finish line.
    this.finishY = 260;
    this.add.rectangle(TRAIL_X, this.finishY, TRAIL_HALF * 2, 14, COLORS.good).setDepth(5);
    this.add.text(TRAIL_X, this.finishY - 40, "🏁", { fontSize: "48px" }).setOrigin(0.5).setDepth(6);

    // Vehicle starts near the bottom, facing up.
    this.vehicle = this.add.image(TRAIL_X, 2420, assetKey("humvee_topdown")).setDepth(10).setScale(0.7);
    this.vehicle.rotation = 0;
    this.speed = 0;
    this.lastRange = "H";
    this.cameras.main.startFollow(this.vehicle, true, 0.08, 0.08);

    this.dc = new DriveControls(this, {
      selectors: true,
      gear: "P",
      range: "H",
      onGear: (v) => {
        if (v === "R") this._sawR = true;
      },
      onRange: (v) => {
        if (Math.abs(this.speed) > 5 || this.dc.gear !== "N") {
          this.dc.setRange(this.lastRange);
          this.dialog.toast(t("s3_range_shift_stop"), { color: "#d8a54a", duration: 1700 });
          return;
        }
        this.lastRange = v;
      },
    });
    this.dc.container.setScrollFactor(0);

    this.banner = this.dialog.banner(t("s3_obj"));
    this.makeBackButton();
    addFullscreenButton(this, this.scale.width - 132, 20);
    this.showGatePrompt();
  }

  buildTrail() {
    const g = this.add.graphics().setDepth(1);
    // Base trail (dirt texture as a tiled strip).
    const tex = this.add
      .tileSprite(TRAIL_X, WORLD_H / 2, TRAIL_HALF * 2, WORLD_H, assetKey("trail_bg"))
      .setDepth(1);
    tex.setAlpha(0.9);
    // Section tints (bottom→top): staging, firm, slippery mud, rocky climb.
    const sections = [
      { y0: 1900, y1: 2600, color: 0x000000, a: 0.0 }, // staging (plain)
      { y0: 1400, y1: 1900, color: 0x6b5a30, a: 0.25 }, // firm
      { y0: 950, y1: 1400, color: 0x38506b, a: 0.35 }, // slippery mud
      { y0: 300, y1: 950, color: 0x5a4636, a: 0.45 }, // rocky climb
    ];
    sections.forEach((s) => {
      g.fillStyle(s.color, s.a);
      g.fillRect(TRAIL_X - TRAIL_HALF, s.y0, TRAIL_HALF * 2, s.y1 - s.y0);
    });
    // Trail edges.
    g.fillStyle(0x2e2718, 1);
    g.fillRect(TRAIL_X - TRAIL_HALF - 16, 0, 16, WORLD_H);
    g.fillRect(TRAIL_X + TRAIL_HALF, 0, 16, WORLD_H);
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

  showGatePrompt() {
    const gate = this.gates[this.currentGate];
    if (!gate) return;
    this.banner.setText(t(gate.promptKey));
  }

  onTrail(x) {
    return x > TRAIL_X - TRAIL_HALF && x < TRAIL_X + TRAIL_HALF;
  }

  update(time, dtMs) {
    if (this.finished) return;
    const dt = dtMs / 1000;
    this.dc.update(dtMs);

    // Direction from transmission gear.
    const forward = ["D", "OD", "2", "1"].includes(this.dc.gear);
    const reverse = this.dc.gear === "R";
    const dir = forward ? 1 : reverse ? -1 : 0;

    const onTrail = this.onTrail(this.vehicle.x);
    const drive = this.dc.getDriveSpec({ terrainDrag: onTrail ? 0 : 170 });
    const maxSpeed = onTrail ? drive.maxSpeed : Math.min(90, drive.maxSpeed);

    if (dir === 0) {
      this.speed = toward(this.speed, 0, (drive.rollingDrag + this.dc.brakeInput * drive.brakeDrag) * dt);
    } else {
      this.speed += this.dc.throttle * 330 * drive.torque * dt;
      this.speed = toward(this.speed, 0, drive.rollingDrag * dt);
      this.speed = toward(this.speed, 0, this.dc.brakeInput * drive.brakeDrag * dt);
    }
    this.speed = Phaser.Math.Clamp(this.speed, 0, onTrail ? maxSpeed : 90);

    // Kinematic bicycle steering. Direction comes from the transmission, but
    // heading only changes while rolling, not from steering input alone.
    const signedSpeed = this.speed * dir;
    if (Math.abs(signedSpeed) > 4) {
      const steerAngle = this.dc.steer * MAX_STEER_ANGLE;
      this.vehicle.rotation += (signedSpeed / WHEELBASE) * Math.tan(steerAngle) * dt;
    }

    // Move (forward vector = up at rotation 0).
    const fx = Math.sin(this.vehicle.rotation);
    const fy = -Math.cos(this.vehicle.rotation);
    let ny = this.vehicle.y + fy * this.speed * dt * dir;
    let nx = this.vehicle.x + fx * this.speed * dt * dir;

    // Locked gate acts as a barrier the vehicle cannot pass upward.
    const gate = this.gates[this.currentGate];
    if (gate && !gate.passed && ny < gate.y + 30) {
      ny = gate.y + 30;
      this.speed = 0;
      this.evaluateGate(gate);
    }

    this.vehicle.x = Phaser.Math.Clamp(nx, TRAIL_X - TRAIL_HALF, TRAIL_X + TRAIL_HALF);
    this.vehicle.y = Phaser.Math.Clamp(ny, 100, 2500);

    this.dc.setSpeedDisplay(this.speed * 0.12, this.dc.getRpm(this.speed, { load: onTrail ? 0.25 : 0.65 }));
    this.drawGates();
    this.checkFinish();
  }

  evaluateGate(gate) {
    if (gate.check(this.dc)) {
      gate.passed = true;
      this.dialog.toast(t("s3_correct"), { color: "#6fbf5a", duration: 1200 });
      this.currentGate++;
      if (this.currentGate < this.gates.length) {
        this.time.delayedCall(300, () => this.showGatePrompt());
      } else {
        this.banner.setText(t("s3_complete"));
      }
    } else if (!this._hintCooldown) {
      this._hintCooldown = true;
      this.wrong++;
      this.dialog.toast(t(gate.hintKey), { color: "#d8a54a", duration: 2400 });
      this.time.delayedCall(2400, () => (this._hintCooldown = false));
    }
  }

  drawGates() {
    const g = this.gateGfx;
    g.clear();
    this.gates.forEach((gate) => {
      if (gate.passed) return;
      g.fillStyle(0x7a2a20, 1);
      g.fillRect(TRAIL_X - TRAIL_HALF, gate.y, TRAIL_HALF * 2, 18);
      // Rock knobs.
      g.fillStyle(0x5a3a2a, 1);
      for (let x = TRAIL_X - TRAIL_HALF + 20; x < TRAIL_X + TRAIL_HALF; x += 46) {
        g.fillCircle(x, gate.y + 9, 12);
      }
    });
  }

  checkFinish() {
    if (this.vehicle.y <= this.finishY + 20 && this.gates.every((g) => g.passed)) {
      this.finished = true;
      this.dialog.toast(t("s3_section_done"), { color: "#6fbf5a", duration: 1600 });
      const score = Math.max(0, 100 - this.wrong * 10);
      this.time.delayedCall(1400, () =>
        this.scene.start("StageCompleteScene", { stage: 5, score, nextScene: "Stage4Scene" })
      );
    }
  }
}
