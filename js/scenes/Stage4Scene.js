// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import DriveControls from "../ui/DriveControls.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
const WORLD_W = 4650;
const START_X = 700; // spawn with camera headroom + runway before the first obstacle
// Terrain profile control points [x, y] (screen y: smaller = higher ground).
const PTS = [
    [0, 500],
    [1500, 500],
    [1850, 300], // steep climb
    [2200, 300], // crest
    [2600, 500], // descent
    [3100, 500],
    [3170, 468], // rocky (3-wheel) bumps
    [3260, 522],
    [3360, 466],
    [3460, 520],
    [3560, 500],
    [3600, 560], // water dip
    [3850, 560],
    [3910, 500],
    [WORLD_W, 500],
];
const ZONES = [
    { x0: 1500, x1: 2200, type: "climb", hint: "s4_hint_climb", reset: 1480 },
    { x0: 2200, x1: 2600, type: "descend", hint: "s4_hint_descend", reset: 2200 },
    { x0: 2600, x1: 3100, type: "sideslope", hint: "s4_hint_sideslope", reset: 2580 },
    { x0: 3100, x1: 3560, type: "threewheel", hint: "s4_hint_3wheel", reset: 3080 },
    { x0: 3600, x1: 3850, type: "ford", hint: "s4_hint_ford", reset: 3580 },
];
export default class Stage4Scene extends Phaser.Scene {
    constructor() {
        super("Stage4Scene");
    }
    create() {
        this.dialog = new Dialog(this);
        this.finished = false;
        this.penalty = 0;
        this.pts = PTS;
        this.stallTimer = 0;
        this.currentZoneType = null;
        // Sky.
        const sky = this.add.graphics().setScrollFactor(0);
        sky.fillGradientStyle(0xbcd3e0, 0xbcd3e0, 0xdcc79a, 0xdcc79a, 1);
        sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_W, GAME_HEIGHT);
        this.drawTerrain();
        // Vehicle (side profile).
        this.vehicle = this.add.image(START_X, 0, assetKey("humvee_side")).setDepth(10).setScale(0.62);
        this.vehicle.setOrigin(0.5, 0.8);
        this.carX = START_X;
        this.speed = 0;
        this.placeVehicle();
        this.cameras.main.startFollow(this.vehicle, true, 0.1, 0); // horizontal only
        this.cameras.main.setScroll(START_X - GAME_WIDTH / 2, 0); // centre the vehicle at once
        this.dc = new DriveControls(this, { selectors: true, gear: "D", range: "H" });
        this.dc.container.setScrollFactor(0);
        this.buildSideSlopeCamera();
        this.buildIndicators();
        this.banner = this.dialog.banner(t("s4_obj"));
        this.makeBackButton();
        addFullscreenButton(this, this.scale.width - 132, 20);
        // Finish flag.
        this.finishX = 4480;
        this.add.text(this.finishX, this.terrainY(this.finishX) - 70, "🏁", { fontSize: "52px" }).setOrigin(0.5).setDepth(9);
    }
    terrainY(x) {
        const pts = this.pts;
        if (x <= pts[0][0])
            return pts[0][1];
        for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i];
            const [x1, y1] = pts[i + 1];
            if (x >= x0 && x <= x1) {
                const tt = (x - x0) / (x1 - x0);
                return y0 + (y1 - y0) * tt;
            }
        }
        return pts[pts.length - 1][1];
    }
    slopeAt(x) {
        const d = 8;
        return (this.terrainY(x + d) - this.terrainY(x - d)) / (2 * d);
    }
    drawTerrain() {
        const g = this.add.graphics().setDepth(1);
        g.fillStyle(COLORS.dirt, 1);
        g.beginPath();
        g.moveTo(0, GAME_HEIGHT);
        for (let x = 0; x <= WORLD_W; x += 10)
            g.lineTo(x, this.terrainY(x));
        g.lineTo(WORLD_W, GAME_HEIGHT);
        g.closePath();
        g.fillPath();
        // Grass/topsoil line.
        g.lineStyle(6, 0x5a6b34, 1);
        g.beginPath();
        g.moveTo(0, this.terrainY(0));
        for (let x = 0; x <= WORLD_W; x += 10)
            g.lineTo(x, this.terrainY(x));
        g.strokePath();
        // Water pool in the dip.
        const wg = this.add.graphics().setDepth(2);
        wg.fillStyle(COLORS.water, 0.8);
        wg.fillRect(3600, 505, 250, 120);
        wg.lineStyle(3, 0x8fd0e0, 0.6);
        wg.strokeRect(3600, 505, 250, 2);
        // Zone flags.
        ZONES.forEach((z) => {
            this.add.rectangle(z.x0, this.terrainY(z.x0) - 6, 4, 40, 0xffffff, 0.5).setOrigin(0.5, 1).setDepth(3);
        });
    }
    placeVehicle() {
        this.vehicle.x = this.carX;
        this.vehicle.y = this.terrainY(this.carX);
        this.vehicle.rotation = Math.atan2(this.terrainY(this.carX + 8) - this.terrainY(this.carX - 8), 16);
    }
    buildIndicators() {
        const s = this;
        this.pitchTxt = s.add
            .text(GAME_WIDTH / 2, 24, "", { fontFamily: FONT, fontSize: "20px", color: "#f2ecd8", backgroundColor: "rgba(28,33,20,0.7)", padding: { x: 10, y: 5 } })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(1400);
        // Roll bar.
        this.rollBarBg = s.add.rectangle(GAME_WIDTH / 2, 70, 220, 18, COLORS.panel, 0.8).setScrollFactor(0).setDepth(1400);
        this.rollBar = s.add.rectangle(GAME_WIDTH / 2 - 108, 70, 4, 14, COLORS.good).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1401);
        this.rollLabel = s.add
            .text(GAME_WIDTH / 2, 92, t("s4_roll"), { fontFamily: FONT, fontSize: "14px", color: "#c9b98f" })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(1400);
    }
    buildSideSlopeCamera() {
        this.sideCam = this.add.container(0, 0).setScrollFactor(0).setDepth(420).setVisible(false).setAlpha(0);
        this.sideCamBg = this.add.graphics();
        this.sideCamTrail = this.add.graphics();
        this.sideCamTruck = this.add.container(0, 0);
        this.sideCamTruckBody = this.add.graphics();
        this.sideCamTruck.add(this.sideCamTruckBody);
        this.sideCamLabel = this.add
            .text(GAME_WIDTH / 2, 128, t("s4_rear_camera"), {
            fontFamily: FONT,
            fontSize: "23px",
            color: "#f2ecd8",
            fontStyle: "bold",
            align: "center",
            backgroundColor: "rgba(28,33,20,0.72)",
            padding: { x: 14, y: 7 },
            wordWrap: { width: 650 },
        })
            .setOrigin(0.5, 0);
        this.sideCam.add([this.sideCamBg, this.sideCamTrail, this.sideCamTruck, this.sideCamLabel]);
        this.drawRearTruck();
    }
    setSideSlopeCamera(active) {
        if (active === this.sideCamActive)
            return;
        this.sideCamActive = active;
        this.vehicle.setVisible(!active);
        this.sideCam.setVisible(true);
        this.tweens.killTweensOf(this.sideCam);
        this.tweens.add({
            targets: this.sideCam,
            alpha: active ? 1 : 0,
            duration: 180,
            onComplete: () => {
                if (!active)
                    this.sideCam.setVisible(false);
            },
        });
    }
    updateSideSlopeCamera(zone, roll) {
        const progress = zone ? Phaser.Math.Clamp((this.carX - zone.x0) / (zone.x1 - zone.x0), 0, 1) : 0;
        const slopeAngle = -0.28;
        const dangerLean = Phaser.Math.Clamp(roll, 0, 1) * -0.2;
        const truckAngle = slopeAngle + dangerLean;
        const cx = GAME_WIDTH / 2;
        const baseY = 535;
        const bg = this.sideCamBg;
        bg.clear();
        bg.fillGradientStyle(0x98b7c9, 0x98b7c9, 0xd9c28c, 0xb59b68, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        bg.fillStyle(0x5f6f3a, 1);
        bg.beginPath();
        bg.moveTo(0, 640);
        bg.lineTo(0, 456);
        bg.lineTo(GAME_WIDTH, 205);
        bg.lineTo(GAME_WIDTH, GAME_HEIGHT);
        bg.lineTo(0, GAME_HEIGHT);
        bg.closePath();
        bg.fillPath();
        const trail = this.sideCamTrail;
        trail.clear();
        trail.lineStyle(7, 0x3c3020, 0.55);
        for (let i = 0; i < 7; i++) {
            const y = 265 + i * 58 + progress * 28;
            trail.beginPath();
            trail.moveTo(cx - 500 + i * 42, y + 108);
            trail.lineTo(cx - 74, baseY - 22);
            trail.lineTo(cx + 74, baseY - 58);
            trail.lineTo(cx + 510 - i * 42, y - 126);
            trail.strokePath();
        }
        trail.lineStyle(5, 0xf2ecd8, 0.55);
        trail.lineBetween(cx - 440, baseY + 80, cx + 445, baseY - 165);
        trail.lineStyle(5, roll > 0.8 ? COLORS.bad : COLORS.accent, 0.95);
        trail.lineBetween(cx - 80, baseY - 24, cx + 80, baseY - 68);
        this.sideCamTruck.setPosition(cx, baseY - 54);
        this.sideCamTruck.setRotation(truckAngle);
    }
    drawRearTruck() {
        const truck = this.sideCamTruckBody;
        truck.clear();
        truck.fillStyle(0x1a2114, 0.5);
        truck.fillEllipse(0, 86, 350, 44);
        truck.fillStyle(COLORS.armyGreenDark, 1);
        truck.fillRoundedRect(-190, -95, 380, 128, 12);
        truck.fillStyle(COLORS.armyGreen, 1);
        truck.fillRoundedRect(-152, -156, 304, 86, 10);
        truck.lineStyle(5, 0x14180f, 1);
        truck.strokeRoundedRect(-190, -95, 380, 128, 12);
        truck.strokeRoundedRect(-152, -156, 304, 86, 10);
        truck.fillStyle(0x192026, 1);
        truck.fillRoundedRect(-130, -140, 92, 54, 5);
        truck.fillRoundedRect(38, -140, 92, 54, 5);
        truck.fillStyle(0x0d0f0c, 1);
        truck.fillCircle(-142, 54, 52);
        truck.fillCircle(142, 54, 52);
        truck.fillStyle(0x32382b, 1);
        truck.fillCircle(-142, 54, 28);
        truck.fillCircle(142, 54, 28);
        truck.fillStyle(0xa58b4d, 1);
        truck.fillCircle(-118, -24, 14);
        truck.fillCircle(118, -24, 14);
        truck.lineStyle(6, COLORS.accent, 1);
        truck.lineBetween(-180, 88, 180, 88);
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
    zoneAt(x) {
        return ZONES.find((z) => x >= z.x0 && x <= z.x1) || null;
    }
    update(time, dtMs) {
        if (this.finished)
            return;
        const dt = dtMs / 1000;
        this.dc.update(dtMs);
        const zone = this.zoneAt(this.carX);
        if (zone && zone.type !== this.currentZoneType) {
            this.currentZoneType = zone.type;
            this.dialog.toast(t(zone.hint), { color: "#d8a54a", duration: 2600 });
        }
        else if (!zone) {
            this.currentZoneType = null;
        }
        // Drive direction / torque from gears.
        const forward = ["D", "OD", "2", "1"].includes(this.dc.gear);
        const reverse = this.dc.gear === "R";
        const dir = forward ? 1 : reverse ? -1 : 0;
        let torque = (this.dc.range === "L" ? 2.35 : this.dc.range === "HL" ? 1.08 : 1) *
            ({ "1": 1.4, "2": 1.1, D: 1, OD: 0.8, R: 1 }[this.dc.gear] || 0);
        // A steep climb needs low range for real torque.
        if (zone && zone.type === "climb" && this.dc.range !== "L")
            torque *= 0.32;
        const slope = this.slopeAt(this.carX); // >0 downhill, <0 uphill (screen y-down)
        const grade = slope * 900; // resistance uphill / assist downhill
        if (this.dc.gear === "P") {
            // Park: hold position — coast any residual motion to a stop, no rolling.
            const d = 600 * dt;
            this.speed = this.speed > 0 ? Math.max(0, this.speed - d) : Math.min(0, this.speed + d);
        }
        else if (this.dc.gear === "N") {
            // Neutral: no drive, but gravity + drag still act (can roll on a slope).
            this.speed += grade * dt;
            const drag = (100 + this.dc.brakeInput * 700) * dt;
            this.speed = this.speed > 0 ? Math.max(0, this.speed - drag) : Math.min(0, this.speed + drag);
        }
        else {
            this.speed += this.dc.throttle * 380 * torque * dt * dir;
            this.speed += grade * dt; // gravity along slope
            this.speed -= 100 * dt * Math.sign(this.speed || 1); // friction
            this.speed -= this.dc.brakeInput * 700 * dt * Math.sign(this.speed || 1);
        }
        // Engine braking in low gears caps descent speed.
        const descentCap = this.dc.gear === "1" ? 180 : this.dc.gear === "2" ? 240 : 520;
        this.speed = Phaser.Math.Clamp(this.speed, -160, descentCap);
        this.carX += this.speed * dt;
        this.carX = Phaser.Math.Clamp(this.carX, 60, WORLD_W - 40);
        // Sit on terrain, tilt to slope.
        this.vehicle.x = this.carX;
        this.vehicle.y = this.terrainY(this.carX);
        this.vehicle.rotation = Math.atan2(this.terrainY(this.carX + 10) - this.terrainY(this.carX - 10), 20);
        this.updateIndicators(slope, zone);
        this.handleZone(zone, dt);
        this.dc.setSpeedDisplay(Math.abs(this.speed) * 0.14, this.dc.getRpm(this.speed, { load: zone ? 0.55 : 0.2 }));
        if (this.carX >= this.finishX)
            this.finish();
    }
    updateIndicators(slope, zone) {
        const pitchDeg = Math.round(-Math.atan(slope) * (180 / Math.PI));
        this.pitchTxt.setText(`${t("s4_pitch")}: ${pitchDeg}°`);
        // Roll rises with speed in the side-slope zone.
        let roll = 0;
        if (zone && zone.type === "sideslope")
            roll = Phaser.Math.Clamp(Math.abs(this.speed) / 230, 0, 1.2);
        this.setSideSlopeCamera(Boolean(zone && zone.type === "sideslope"));
        if (zone && zone.type === "sideslope")
            this.updateSideSlopeCamera(zone, roll);
        const w = Phaser.Math.Clamp(roll, 0, 1) * 210;
        this.rollBar.width = Math.max(4, w);
        this.rollBar.fillColor = roll > 0.8 ? COLORS.bad : roll > 0.5 ? COLORS.accent : COLORS.good;
        this._roll = roll;
    }
    handleZone(zone, dt) {
        if (!zone) {
            this.stallTimer = 0;
            return;
        }
        if (zone.type === "climb") {
            // Stalled on the up-slope with the wrong setup.
            if (this.carX < 1900 && this.slopeAt(this.carX) < -0.1 && Math.abs(this.speed) < 4) {
                this.stallTimer += dt;
                if (this.stallTimer > 0.8)
                    this.fail("s4_stalled", zone.reset);
            }
            else
                this.stallTimer = 0;
        }
        else if (zone.type === "sideslope") {
            if (this._roll >= 1)
                this.fail("s4_rolled", zone.reset);
        }
        else if (zone.type === "threewheel") {
            if (Math.abs(this.speed) < 3) {
                this.stallTimer += dt;
                if (this.stallTimer > 1.4)
                    this.fail("s4_stalled", zone.reset);
            }
            else
                this.stallTimer = 0;
        }
        else if (zone.type === "ford") {
            if (Math.abs(this.speed) < 3) {
                this.stallTimer += dt;
                if (this.stallTimer > 1.4)
                    this.fail("s4_flooded", zone.reset);
            }
            else
                this.stallTimer = 0;
            if (this.speed > 210 && !this._fordWarn) {
                this._fordWarn = true;
                this.dialog.toast(t("s4_hint_ford"), { color: "#d8a54a", duration: 1600 });
                this.time.delayedCall(1800, () => (this._fordWarn = false));
            }
        }
    }
    fail(msgKey, resetX) {
        this.penalty += 15;
        this.stallTimer = 0;
        this.speed = 0;
        this.carX = resetX;
        this.currentZoneType = null;
        this.placeVehicle();
        this.dialog.toast(t(msgKey), { color: "#d85a4a", duration: 2400 });
    }
    finish() {
        this.finished = true;
        this.dialog.toast(t("s4_complete"), { color: "#6fbf5a", duration: 2000 });
        const score = Math.max(0, 100 - this.penalty);
        this.time.delayedCall(1600, () => this.scene.start("StageCompleteScene", { stage: 6, score, nextScene: "Stage5Scene" }));
    }
}
