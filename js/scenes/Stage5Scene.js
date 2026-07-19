import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import DriveControls from "../ui/DriveControls.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const WORLD_W = 1600;
const WORLD_H = 1200;

// Trailer geometry (world units).
const WHEELBASE = 55; // tractor front-rear
const HITCH = 10; // hitch behind tractor rear axle
const TLEN = 96; // hitch -> trailer axle

// Parking bay (vertical).
const BAY = { x: 360, y: 280, w: 220, h: 340 };

export default class Stage5Scene extends Phaser.Scene {
  constructor() {
    super("Stage5Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.started = false;
    this.finished = false;
    this.parkTimer = 0;
    this.reverseDistance = 0;

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x4a4d47, 1).setOrigin(0); // lot

    this.makeTrailerTexture();
    this.drawLot();

    // Rig state: tractor rear-axle P + heading th; trailer heading ph.
    this.P = new Phaser.Math.Vector2(900, 900);
    this.th = 0; // pointing up (north)
    this.ph = 0;
    this.v = 0;

    this.tractor = this.add.image(0, 0, assetKey("humvee_topdown")).setDepth(10).setScale(0.5);
    this.trailer = this.add.image(0, 0, "trailer_top").setDepth(9).setScale(0.7);
    this.linkGfx = this.add.graphics().setDepth(8);

    this.cameras.main.startFollow(this.tractor, true, 0.08, 0.08);
    this.cameras.main.setZoom(0.9);
    this.layout();

    this.showIntro();
  }

  makeTrailerTexture() {
    if (this.textures.exists("trailer_top")) return;
    const g = this.add.graphics();
    // Points up; axle at the centre (origin). Tank body + two wheels.
    g.fillStyle(0x8a7a4e, 1);
    g.fillRoundedRect(14, 8, 62, 124, 14);
    g.fillStyle(0x746643, 1);
    g.fillRoundedRect(24, 22, 42, 46, 8); // filler hatch
    g.fillStyle(0x5f553a, 1);
    g.fillRect(20, 92, 50, 8);
    g.fillStyle(0x141414, 1);
    g.fillRoundedRect(0, 52, 16, 36, 5); // left wheel
    g.fillRoundedRect(74, 52, 16, 36, 5); // right wheel
    g.generateTexture("trailer_top", 90, 140);
    g.destroy();
  }

  drawLot() {
    const g = this.add.graphics().setDepth(1);
    // Lane markings.
    g.fillStyle(0x5a5d55, 1);
    for (let x = 60; x < WORLD_W; x += 220) g.fillRect(x, 0, 6, WORLD_H);
    // Parking bay outline (dashed yellow) + fill target (updated live).
    this.bayFill = this.add.rectangle(BAY.x, BAY.y, BAY.w, BAY.h, COLORS.good, 0).setOrigin(0).setDepth(2);
    const bg = this.add.graphics().setDepth(3);
    bg.lineStyle(6, COLORS.roadLine, 1);
    dashRect(bg, BAY.x, BAY.y, BAY.w, BAY.h, 26, 16);
    // Bay opening marker (bottom) + "P".
    this.add
      .text(BAY.x + BAY.w / 2, BAY.y + 30, "P", {
        fontFamily: FONT,
        fontSize: "48px",
        color: "#d8c56a",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);
  }

  showIntro() {
    const cont = this.add.container(0, 0).setDepth(3000).setScrollFactor(0);
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setOrigin(0);
    cont.add(overlay);
    // Real trailer photo.
    const photo = this.add.image(GAME_WIDTH / 2, 232, assetKey("trailer_photo"));
    const pw = 420;
    photo.setScale(pw / photo.width);
    photo.setDepth(3001);
    cont.add(photo);
    cont.add(
      this.add
        .text(GAME_WIDTH / 2, 372, t("s5_intro_title"), {
          fontFamily: FONT,
          fontSize: "32px",
          color: "#d8a54a",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
    );
    cont.add(
      this.add
        .text(GAME_WIDTH / 2, 460, t("s5_intro_body"), {
          fontFamily: FONT,
          fontSize: "21px",
          color: "#f2ecd8",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
    );
    const bx = GAME_WIDTH / 2;
    const by = 600;
    const bw = 240;
    const bh = 56;
    const btnBg = this.add
      .rectangle(bx, by, bw, bh, COLORS.armyGreen, 1)
      .setStrokeStyle(2, COLORS.sand)
      .setScrollFactor(0)
      .setDepth(3001)
      .setInteractive({ useHandCursor: true });
    const btnLabel = this.add
      .text(bx, by, t("btn_begin"), {
        fontFamily: FONT,
        fontSize: "24px",
        color: "#f2ecd8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3002);
    btnBg.on("pointerover", () => btnBg.setFillStyle(COLORS.panelLight, 1));
    btnBg.on("pointerout", () => btnBg.setFillStyle(COLORS.armyGreen, 1));
    btnBg.on("pointerdown", () => {
      btnBg.setScale(0.96);
      btnLabel.setScale(0.96);
    });
    btnBg.on("pointerup", () => {
      cont.destroy();
      btnBg.destroy();
      btnLabel.destroy();
      this.startPlay();
    });
  }

  startPlay() {
    this.started = true;
    this.dc = new DriveControls(this, { selectors: true, gear: "P", range: "H" });
    this.dc.container.setScrollFactor(0);
    this.banner = this.dialog.banner(t("s5_obj"));
    this.dialog.toast(t("s5_hint_reverse"), { color: "#c9b98f", duration: 3200 });
    this.makeBackButton();
    addFullscreenButton(this, this.scale.width - 132, 20);
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

  // Place sprites from the current physics state.
  layout() {
    const fT = new Phaser.Math.Vector2(Math.sin(this.th), -Math.cos(this.th));
    // Tractor body sits ahead of its rear axle.
    const c = this.P.clone().add(fT.clone().scale(34));
    this.tractor.setPosition(c.x, c.y);
    this.tractor.rotation = this.th;

    const hitch = this.P.clone().subtract(fT.clone().scale(HITCH));
    const fTr = new Phaser.Math.Vector2(Math.sin(this.ph), -Math.cos(this.ph));
    const axle = hitch.clone().subtract(fTr.clone().scale(TLEN));
    this.trailer.setPosition(axle.x, axle.y);
    this.trailer.rotation = this.ph;
    this.axle = axle;

    // Drawbar link hitch -> axle.
    const g = this.linkGfx;
    g.clear();
    g.lineStyle(9, 0x2a2a1e, 1);
    g.lineBetween(hitch.x, hitch.y, axle.x, axle.y);
    g.fillStyle(0x111111, 1);
    g.fillCircle(hitch.x, hitch.y, 6);
  }

  update(time, dtMs) {
    if (!this.started || this.finished) return;
    const dt = dtMs / 1000;
    this.dc.update(dtMs);

    const g = this.dc.gear;
    const dir = ["D", "OD", "2", "1"].includes(g) ? 1 : g === "R" ? -1 : 0;
    const maxF = 120;
    const maxR = 90;
    const articulation = Math.abs(Phaser.Math.Angle.Wrap(this.th - this.ph));
    const trailerLoad = 1 + articulation * 0.45;
    const drive = this.dc.getDriveSpec({ load: trailerLoad, terrainDrag: 80 });

    if (dir === 0) {
      this.v = toward(this.v, 0, 300 * dt);
    } else {
      this.v += this.dc.throttle * 180 * drive.torque * dt * dir;
      const fr = (drive.rollingDrag + articulation * 90) * dt + this.dc.brakeInput * drive.brakeDrag * dt;
      this.v = this.v > 0 ? Math.max(0, this.v - fr) : Math.min(0, this.v + fr);
      this.v = Phaser.Math.Clamp(this.v, -Math.min(maxR, drive.maxSpeed), Math.min(maxF, drive.maxSpeed));
    }

    // Bicycle steering of the tractor.
    const steerAngle = (this.dc.steer * 0.55) / (1 + articulation * 0.35);
    const thDot = (this.v / WHEELBASE) * Math.tan(steerAngle);
    this.th += thDot * dt;

    // Advance tractor rear axle.
    const fT = new Phaser.Math.Vector2(Math.sin(this.th), -Math.cos(this.th));
    this.P.add(fT.clone().scale(this.v * dt));
    this.P.x = Phaser.Math.Clamp(this.P.x, 40, WORLD_W - 40);
    this.P.y = Phaser.Math.Clamp(this.P.y, 40, WORLD_H - 40);

    // Trailer articulation.
    const diff = Phaser.Math.Angle.Wrap(this.th - this.ph);
    const phDot = (this.v / TLEN) * Math.sin(diff) - (HITCH / TLEN) * thDot * Math.cos(diff);
    this.ph += phDot * dt;
    if (this.v < -4) this.reverseDistance += Math.abs(this.v) * dt;

    this.layout();
    this.dc.setSpeedDisplay(Math.abs(this.v) * 0.16, this.dc.getRpm(this.v, { load: 0.7 + articulation * 0.4 }));

    this.checkJackknife(diff);
    this.checkParked(dt);
  }

  checkJackknife(diff) {
    if (Math.abs(diff) > 1.35 && !this._jackCooldown) {
      this._jackCooldown = true;
      this.dialog.toast(t("s5_jackknife"), { color: "#d85a4a", duration: 2000 });
      this.time.delayedCall(2400, () => (this._jackCooldown = false));
    }
  }

  checkParked(dt) {
    const m = 26;
    const inBay =
      this.axle.x > BAY.x + m &&
      this.axle.x < BAY.x + BAY.w - m &&
      this.axle.y > BAY.y + m &&
      this.axle.y < BAY.y + BAY.h - m;
    // Aligned with the bay's vertical axis (either direction).
    const deg = ((Phaser.Math.RadToDeg(this.ph) % 180) + 180) % 180;
    const off = Math.min(deg, 180 - deg);
    const aligned = off < 14;
    const stopped = Math.abs(this.v) < 4;
    const reversedEnough = this.reverseDistance > 160;

    this.bayFill.setFillStyle(COLORS.good, inBay ? (aligned ? 0.4 : 0.2) : 0);

    if (inBay && aligned && stopped && reversedEnough) {
      this.parkTimer += dt;
      if (!this._inbayShown) {
        this._inbayShown = true;
        this.dialog.toast(t("s5_inbay"), { color: "#6fbf5a", duration: 1500 });
      }
      if (this.parkTimer > 1.1) this.win();
    } else {
      this.parkTimer = 0;
      this._inbayShown = false;
      if (inBay && !aligned && !this._alignCooldown) {
        this._alignCooldown = true;
        this.dialog.toast(t("s5_align"), { color: "#d8a54a", duration: 1600 });
        this.time.delayedCall(1800, () => (this._alignCooldown = false));
      }
    }
  }

  win() {
    this.finished = true;
    this.dialog.toast(t("s5_parked"), { color: "#6fbf5a", duration: 2200 });
    this.time.delayedCall(1800, () =>
      this.scene.start("StageCompleteScene", { stage: 7, score: 100, nextScene: "Stage6Scene" })
    );
  }
}

function toward(v, target, step) {
  if (v > target) return Math.max(target, v - step);
  if (v < target) return Math.min(target, v + step);
  return v;
}

// Draw a dashed rectangle outline on a graphics object.
function dashRect(g, x, y, w, h, dash, gap) {
  const seg = dash + gap;
  const line = (x0, y0, x1, y1) => {
    const len = Phaser.Math.Distance.Between(x0, y0, x1, y1);
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    for (let d = 0; d < len; d += seg) {
      const e = Math.min(d + dash, len);
      g.lineBetween(x0 + ux * d, y0 + uy * d, x0 + ux * e, y0 + uy * e);
    }
  };
  line(x, y, x + w, y);
  line(x + w, y, x + w, y + h);
  line(x + w, y + h, x, y + h);
  line(x, y + h, x, y);
}
