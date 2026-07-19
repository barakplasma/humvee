// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { TRANSMISSION, TRANSFER } from "../data/controls.js";

const GEAR_SPEC = {
  OD: { drive: 1, torque: 0.72, max: 520, idle: 670, redline: 3300 },
  D: { drive: 1, torque: 1, max: 430, idle: 700, redline: 3600 },
  "2": { drive: 1, torque: 1.45, max: 270, idle: 760, redline: 3800 },
  "1": { drive: 1, torque: 2.15, max: 175, idle: 820, redline: 3900 },
  R: { drive: -1, torque: 1.75, max: 145, idle: 780, redline: 3400 },
  N: { drive: 0, torque: 0, max: 0, idle: 650, redline: 1500 },
  P: { drive: 0, torque: 0, max: 0, idle: 650, redline: 1200 },
};

const RANGE_SPEC = {
  H: { torque: 1, speed: 1 },
  HL: { torque: 1.08, speed: 0.92 },
  L: { torque: 2.55, speed: 0.42 },
  N: { torque: 0, speed: 0 },
};

/**
 * On-screen driving controls: a steering wheel (drag or arrow keys), gas/brake
 * pedals, optional transmission + transfer-case selectors, and a HUD readout.
 * The owning scene reads `.steer`, `.throttle`, `.brakeInput`, `.gear`, `.range`
 * each frame and must call `update(dtMs)`.
 */
export default class DriveControls {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opts = opts;

    this.steer = 0; // -1 (left) .. 1 (right)
    this.throttle = 0; // 0 .. 1
    this.brakeInput = 0; // 0 .. 1
    this.gear = opts.gear || "D";
    this.range = opts.range || "H";

    this._gasHeld = false;
    this._brakeHeld = false;
    this._gasPointerId = null;
    this._brakePointerId = null;
    this._dragSteer = 0;
    this._dragPointerId = null;
    this._dragStartX = 0;
    this._dragStartSteer = 0;
    this._dragStartAngle = 0;
    this._pointerDownHandler = null;
    this._pointerMoveHandler = null;
    this._pointerUpHandler = null;

    // Device-tilt steering state (primary control on phones).
    this._tiltActive = false;
    this._tiltSteer = 0;
    this._tiltNeutral = null;
    this._rawTilt = 0;
    this._tiltSmoothed = 0;
    this._tiltPermissionHandler = null;

    // Gamepad steering state. Phaser exposes the same leftStick/buttons API
    // as the Labs gamepad debug sample.
    this._gamepad = null;
    this._gamepadConnectedHandler = null;
    this._gamepadDisconnectedHandler = null;

    this.container = scene.add.container(0, 0).setDepth(600);

    this.buildWheel();
    this.buildPedals();
    if (opts.selectors) this.buildSelectors();
    this.buildHUD();
    this.bindPointerControls();
    this.bindKeyboard();
    this.bindTilt();
    this.bindGamepad();

    scene.events.once("shutdown", () => this.destroy());
  }

  // ---- Steering wheel (bottom-left) ----
  buildWheel() {
    const s = this.scene;
    this.wheelX = 190;
    this.wheelY = GAME_HEIGHT - 150;
    this.wheelR = 100;

    this.wheelGfx = s.add.graphics().setDepth(600);
    this.drawWheel(0);
    this.container.add(this.wheelGfx);

    const zone = s.add
      .circle(this.wheelX, this.wheelY, this.wheelR + 20)
      .setInteractive({ useHandCursor: true })
      .setDepth(601);
    zone.setFillStyle(0xffffff, 0.001);
    this.container.add(zone);

    zone.on("pointerdown", (p) => this.startWheelDrag(p));

    // Hint (useful on phones; harmless elsewhere).
    this.tiltHint = s.add
      .text(this.wheelX, this.wheelY + this.wheelR + 26, t("tilt_hint"), {
        fontFamily: FONT,
        fontSize: "15px",
        color: "#c9b98f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(600);
    this.container.add(this.tiltHint);
  }

  updateSteerFromPointer(p) {
    const dx = p.x - this.wheelX;
    const dy = p.y - this.wheelY;
    const positionSteer = Phaser.Math.Clamp(dx / this.wheelR, -1, 1);
    const swipeSteer = Phaser.Math.Clamp(this._dragStartSteer + (p.x - this._dragStartX) / (this.wheelR * 0.9), -1, 1);
    const angle = Math.atan2(dy, dx);
    const angleDelta = Phaser.Math.Angle.Wrap(angle - this._dragStartAngle);
    const angularSteer = Phaser.Math.Clamp(this._dragStartSteer + angleDelta / 1.15, -1, 1);
    this._dragSteer = Phaser.Math.Clamp(positionSteer * 0.35 + swipeSteer * 0.45 + angularSteer * 0.2, -1, 1);
  }

  startWheelDrag(p) {
    if (this._dragPointerId !== null) return;
    this._dragPointerId = p.id;
    this._dragStartX = p.x;
    this._dragStartSteer = this.steer;
    this._dragStartAngle = Math.atan2(p.y - this.wheelY, p.x - this.wheelX);
    this.recenterTilt(); // tapping the wheel re-centres tilt steering
    this.updateSteerFromPointer(p);
  }

  drawWheel(steer) {
    const g = this.wheelGfx;
    const { wheelX: x, wheelY: y, wheelR: r } = this;
    g.clear();
    const angle = steer * 0.7; // radians of visible rotation
    // Rim.
    g.lineStyle(16, 0x20241a, 1);
    g.strokeCircle(x, y, r);
    g.lineStyle(6, COLORS.sand, 0.8);
    g.strokeCircle(x, y, r);
    // Hub + spokes rotated by steer.
    g.fillStyle(COLORS.panelLight, 1);
    g.fillCircle(x, y, 26);
    g.lineStyle(12, 0x20241a, 1);
    for (let i = 0; i < 3; i++) {
      const a = angle + (i * (Math.PI * 2)) / 3 - Math.PI / 2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      g.strokePath();
    }
    g.fillStyle(COLORS.accent, 1);
    g.fillCircle(x, y, 10);
  }

  // ---- Pedals (bottom-right) ----
  buildPedals() {
    const y = GAME_HEIGHT - 150;
    this.brakePedal = this.makePedal(GAME_WIDTH - 320, y, t("brake"), COLORS.bad, "brake");
    this.gasPedal = this.makePedal(GAME_WIDTH - 150, y, t("gas"), COLORS.good, "gas");
  }

  makePedal(x, y, label, color, kind) {
    const s = this.scene;
    const w = 120;
    const h = 180;
    const cont = s.add.container(x, y).setDepth(600);
    const bg = s.add
      .rectangle(0, 0, w, h, color, 0.85)
      .setStrokeStyle(3, COLORS.sand)
      .setInteractive({ useHandCursor: true });
    const txt = s.add
      .text(0, 0, label, { fontFamily: FONT, fontSize: "26px", color: "#0d0f08", fontStyle: "bold" })
      .setOrigin(0.5);
    cont.add([bg, txt]);
    this.container.add(cont);

    cont._kind = kind;
    cont._hit = { x: x - w / 2, y: y - h / 2, w, h };
    const press = (p) => this.pressPedal(kind, p && p.id);
    const release = (p) => this.releasePedal(kind, p && p.id);
    bg.on("pointerdown", press);
    bg.on("pointerup", release);
    bg.on("pointerupoutside", release);
    return cont;
  }

  pressPedal(kind, pointerId = null) {
    const cont = kind === "gas" ? this.gasPedal : this.brakePedal;
    if (!cont) return;
    cont.setScale(0.94);
    if (kind === "gas") {
      this._gasHeld = true;
      this._gasPointerId = pointerId;
    } else {
      this._brakeHeld = true;
      this._brakePointerId = pointerId;
    }
  }

  releasePedal(kind, pointerId = null) {
    const cont = kind === "gas" ? this.gasPedal : this.brakePedal;
    const activeId = kind === "gas" ? this._gasPointerId : this._brakePointerId;
    if (activeId !== null && pointerId !== null && activeId !== pointerId) return;
    if (cont) cont.setScale(1);
    if (kind === "gas") {
      this._gasHeld = false;
      this._gasPointerId = null;
    } else {
      this._brakeHeld = false;
      this._brakePointerId = null;
    }
  }

  bindPointerControls() {
    const s = this.scene;
    const inCircle = (p, x, y, r) => Phaser.Math.Distance.Between(p.x, p.y, x, y) <= r;
    const inRect = (p, hit) => p.x >= hit.x && p.x <= hit.x + hit.w && p.y >= hit.y && p.y <= hit.y + hit.h;

    this._pointerDownHandler = (p) => {
      // Phaser 4 pointer events are unified for mouse and touch. Using the
      // Scene Input Plugin directly keeps these controls independent of
      // container hit-test edge cases.
      if (this.selectFromPointer(p, inRect)) return;
      if (this.gasPedal && inRect(p, this.gasPedal._hit)) this.pressPedal("gas", p.id);
      else if (this.brakePedal && inRect(p, this.brakePedal._hit)) this.pressPedal("brake", p.id);
      else if (inCircle(p, this.wheelX, this.wheelY, this.wheelR + 28)) this.startWheelDrag(p);
    };
    this._pointerMoveHandler = (p) => {
      if (this._dragPointerId === p.id) this.updateSteerFromPointer(p);
    };
    this._pointerUpHandler = (p) => {
      this.releasePedal("gas", p.id);
      this.releasePedal("brake", p.id);
      if (this._dragPointerId === p.id) this._dragPointerId = null;
    };

    s.input.on("pointerdown", this._pointerDownHandler);
    s.input.on("pointermove", this._pointerMoveHandler);
    s.input.on("pointerup", this._pointerUpHandler);
    s.input.on("pointerupoutside", this._pointerUpHandler);
  }

  // ---- Gear selectors (transmission + transfer case) ----
  buildSelectors() {
    this.transferSelector = this.makeSelector(
      40,
      120,
      t("transfer_short"),
      TRANSFER,
      this.range,
      (v) => {
        this.range = v;
        if (this.opts.onRange) this.opts.onRange(v);
      }
    );
    this.transSelector = this.makeSelector(
      170,
      120,
      t("transmission_short"),
      TRANSMISSION,
      this.gear,
      (v) => {
        this.gear = v;
        if (this.opts.onGear) this.opts.onGear(v);
      }
    );
  }

  makeSelector(x, y, title, options, initial, onSelect) {
    const s = this.scene;
    const cont = s.add.container(x, y).setDepth(650);
    const cellH = 46;
    const w = 96;
    const hitCells = [];

    const titleTxt = s.add
      .text(w / 2, -30, title, {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#c9b98f",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    cont.add(titleTxt);

    const cells = {};
    options.forEach((opt, i) => {
      const cy = i * (cellH + 6);
      const rect = s.add
        .rectangle(w / 2, cy, w, cellH, COLORS.panel, 0.92)
        .setStrokeStyle(2, COLORS.sandDark)
        .setInteractive({ useHandCursor: true });
      const label = s.add
        .text(w / 2, cy, opt, { fontFamily: FONT, fontSize: "22px", color: "#f2ecd8", fontStyle: "bold" })
        .setOrigin(0.5);
      cells[opt] = { rect, label };
      hitCells.push({
        opt,
        hit: { x, y: y + cy - cellH / 2, w, h: cellH },
      });
      cont.add([rect, label]);
    });
    this.container.add(cont);
    this.setSelector(cells, initial);
    cont._cells = cells;
    cont._hitCells = hitCells;
    cont._onSelect = onSelect;
    return cont;
  }

  selectFromPointer(p, inRect) {
    const selectors = [this.transSelector, this.transferSelector];
    for (const selector of selectors) {
      if (!selector || !selector._hitCells) continue;
      const cell = selector._hitCells.find(({ hit }) => inRect(p, hit));
      if (!cell) continue;
      this.setSelector(selector._cells, cell.opt);
      selector._onSelect(cell.opt);
      return true;
    }
    return false;
  }

  setSelector(cells, value) {
    Object.entries(cells).forEach(([opt, { rect, label }]) => {
      const active = opt === value;
      rect.setFillStyle(active ? COLORS.accent : COLORS.panel, active ? 1 : 0.92);
      label.setColor(active ? "#161a10" : "#f2ecd8");
    });
  }

  setGear(v) {
    this.gear = v;
    if (this.transSelector) this.setSelector(this.transSelector._cells, v);
  }

  setRange(v) {
    this.range = v;
    if (this.transferSelector) this.setSelector(this.transferSelector._cells, v);
  }

  // ---- HUD (speed / gear / range) ----
  buildHUD() {
    const s = this.scene;
    this.hud = s.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 34, "", {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#f2ecd8",
        align: "center",
        backgroundColor: "rgba(28,33,20,0.75)",
        padding: { x: 16, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(700);
    this.container.add(this.hud);
    this.setSpeedDisplay(0);
  }

  setSpeedDisplay(kph) {
    const rpm = arguments.length > 1 ? arguments[1] : null;
    const parts = [`${t("hud_speed")} ${Math.round(kph)}`];
    if (rpm !== null) parts.push(`${t("hud_rpm")} ${Math.round(rpm)}`);
    if (this.opts.selectors) {
      parts.push(`${t("hud_gear")} ${this.gear}`);
      parts.push(`${t("hud_range")} ${this.range}`);
    } else {
      parts.push(`${t("hud_gear")} ${this.gear}`);
    }
    if (this.hud) this.hud.setText(parts.join("    "));
  }

  getDriveSpec({ load = 1, terrainDrag = 0 } = {}) {
    const gear = GEAR_SPEC[this.gear] || GEAR_SPEC.N;
    const range = RANGE_SPEC[this.range] || RANGE_SPEC.H;
    const maxSpeed = gear.max * range.speed;
    return {
      dir: gear.drive,
      maxSpeed,
      torque: gear.torque * range.torque / Math.max(0.25, load),
      rollingDrag: 115 + terrainDrag + (this.range === "L" ? 28 : 0) + (this.range === "HL" ? 14 : 0),
      brakeDrag: 680,
      idleRpm: gear.idle,
      redlineRpm: gear.redline,
    };
  }

  getRpm(speed, { load = 0 } = {}) {
    const gear = GEAR_SPEC[this.gear] || GEAR_SPEC.N;
    const range = RANGE_SPEC[this.range] || RANGE_SPEC.H;
    if (gear.drive === 0 || range.speed === 0) return gear.idle + this.throttle * (gear.redline - gear.idle) * 0.35;
    const gearRatio = Math.max(0.12, gear.max * range.speed);
    const speedShare = Phaser.Math.Clamp(Math.abs(speed) / gearRatio, 0, 1.25);
    const throttleLoad = this.throttle * (0.18 + load * 0.22);
    return Phaser.Math.Clamp(gear.idle + (gear.redline - gear.idle) * (speedShare + throttleLoad), gear.idle, gear.redline);
  }

  // ---- Keyboard (desktop + automated tests) ----
  bindKeyboard() {
    if (!this.scene.input.keyboard) return;
    this.keys = this.scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
    });
  }

  // ---- Device-tilt steering (phones) ----
  bindTilt() {
    if (typeof window === "undefined" || !window.DeviceOrientationEvent) return;
    const handler = (e) => {
      if (e.beta === null && e.gamma === null) return;
      const angle =
        (typeof screen !== "undefined" && screen.orientation && screen.orientation.angle) ||
        window.orientation ||
        0;
      let tilt;
      if (angle === 90) tilt = -(e.beta || 0);
      else if (angle === 270 || angle === -90) tilt = e.beta || 0;
      else tilt = e.gamma || 0; // portrait / default
      this._rawTilt = tilt;
      if (this._tiltNeutral === null) this._tiltNeutral = tilt;
      const DEADZONE_DEG = 2.5;
      const MAX_DEG = 34;
      this._tiltSmoothed = Phaser.Math.Linear(this._tiltSmoothed, tilt, 0.18);
      let delta = this._tiltSmoothed - this._tiltNeutral;
      if (Math.abs(delta) < DEADZONE_DEG) delta = 0;
      else delta -= Math.sign(delta) * DEADZONE_DEG;
      this._tiltSteer = Phaser.Math.Clamp(delta / (MAX_DEG - DEADZONE_DEG), -1, 1);
      this._tiltActive = true;
    };
    this._tiltHandler = handler;
    const start = () => window.addEventListener("deviceorientation", handler, true);
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      // iOS: needs a user gesture to grant motion access.
      const once = () => {
        this.scene.input.off("pointerdown", once);
        this._tiltPermissionHandler = null;
        DOE.requestPermission()
          .then((r) => r === "granted" && !this._destroyed && start())
          .catch(() => {});
      };
      this._tiltPermissionHandler = once;
      this.scene.input.on("pointerdown", once);
    } else {
      start();
    }
  }

  recenterTilt() {
    if (this._tiltActive) this._tiltNeutral = this._rawTilt;
  }

  // ---- Gamepad (desktop / controllers) ----
  bindGamepad() {
    const plugin = this.scene.input.gamepad;
    if (!plugin) return;

    this._gamepad = this.getActiveGamepad();
    if (this._gamepad && this._gamepad.setAxisThreshold) this._gamepad.setAxisThreshold(0.12);

    this._gamepadConnectedHandler = (pad) => {
      this._gamepad = pad;
      if (pad && pad.setAxisThreshold) pad.setAxisThreshold(0.12);
    };
    this._gamepadDisconnectedHandler = (pad) => {
      if (this._gamepad === pad) this._gamepad = this.getActiveGamepad(pad);
    };

    plugin.on("connected", this._gamepadConnectedHandler);
    plugin.on("disconnected", this._gamepadDisconnectedHandler);
  }

  getActiveGamepad(excludePad = null) {
    const plugin = this.scene.input.gamepad;
    if (!plugin) return null;
    let pads = plugin.getAll ? plugin.getAll() : [];
    if (!pads.length) pads = [plugin.pad1, plugin.pad2, plugin.pad3, plugin.pad4].filter(Boolean);
    if (!pads.length && plugin.gamepads) pads = plugin.gamepads;
    return pads.find((pad) => pad && pad !== excludePad && pad.connected !== false) || null;
  }

  getGamepadState() {
    const pad = this._gamepad && this._gamepad.connected !== false ? this._gamepad : this.getActiveGamepad();
    this._gamepad = pad;
    if (!pad) return { steer: 0, gas: false, brake: false };

    const leftX =
      (pad.leftStick && Number.isFinite(pad.leftStick.x) && pad.leftStick.x) ||
      this.getGamepadAxisValue(pad, 0);
    const steer = Phaser.Math.Clamp(Math.abs(leftX) < 0.12 ? 0 : leftX, -1, 1);

    const gasValue = Math.max(this.getGamepadButtonValue(pad, 7), this.getGamepadButtonValue(pad, 0));
    const brakeValue = Math.max(this.getGamepadButtonValue(pad, 6), this.getGamepadButtonValue(pad, 1));
    const gas = gasValue > 0.25 || pad.up === true;
    const brake = brakeValue > 0.25 || pad.down === true;

    return { steer, gas, brake };
  }

  getGamepadAxisValue(pad, index) {
    if (!pad.getAxisValue) return 0;
    if (pad.getAxisTotal && index >= pad.getAxisTotal()) return 0;
    return pad.getAxisValue(index) || 0;
  }

  getGamepadButtonValue(pad, index) {
    if (pad.getButtonTotal && index >= pad.getButtonTotal()) return 0;
    if (pad.getButtonValue) return pad.getButtonValue(index) || 0;
    const button = pad.buttons && pad.buttons[index];
    if (!button) return 0;
    return typeof button.value === "number" ? button.value : button.pressed ? 1 : 0;
  }

  // ---- Per-frame update ----
  update(dtMs) {
    const dt = dtMs / 1000;
    const k = this.keys;
    const gp = this.getGamepadState();

    // Steering priority: keyboard > wheel drag > gamepad stick > device tilt > centre.
    let kbSteer = 0;
    if (k) {
      if (k.left.isDown || k.a.isDown) kbSteer -= 1;
      if (k.right.isDown || k.d.isDown) kbSteer += 1;
    }
    let target;
    if (kbSteer !== 0) target = kbSteer;
    else if (this._dragPointerId !== null) target = this._dragSteer;
    else if (gp.steer !== 0) target = gp.steer;
    else if (this._tiltActive) target = this._tiltSteer;
    else target = 0;

    // Ease steering toward target.
    this.steer = Phaser.Math.Linear(this.steer, target, Math.min(1, dt * 8));
    if (Math.abs(this.steer) < 0.01) this.steer = 0;
    this.drawWheel(this.steer);

    // Pedals (button hold or keyboard).
    const gas = this._gasHeld || gp.gas || (k && (k.up.isDown || k.w.isDown));
    const brake = this._brakeHeld || gp.brake || (k && (k.down.isDown || k.s.isDown));
    this.throttle = Phaser.Math.Clamp(this.throttle + (gas ? dt * 2 : -dt * 3), 0, 1);
    this.brakeInput = Phaser.Math.Clamp(this.brakeInput + (brake ? dt * 4 : -dt * 5), 0, 1);
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._pointerDownHandler) this.scene.input.off("pointerdown", this._pointerDownHandler);
    if (this._pointerMoveHandler) this.scene.input.off("pointermove", this._pointerMoveHandler);
    if (this._pointerUpHandler) {
      this.scene.input.off("pointerup", this._pointerUpHandler);
      this.scene.input.off("pointerupoutside", this._pointerUpHandler);
    }
    if (this._tiltPermissionHandler) this.scene.input.off("pointerdown", this._tiltPermissionHandler);
    if (this._gamepadConnectedHandler && this.scene.input.gamepad) {
      this.scene.input.gamepad.off("connected", this._gamepadConnectedHandler);
    }
    if (this._gamepadDisconnectedHandler && this.scene.input.gamepad) {
      this.scene.input.gamepad.off("disconnected", this._gamepadDisconnectedHandler);
    }
    if (this._tiltHandler) window.removeEventListener("deviceorientation", this._tiltHandler, true);
    this.container.destroy();
  }
}
