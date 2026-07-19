import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { TRANSMISSION, TRANSFER } from "../data/controls.js";

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
    this._steerTarget = 0;
    this._dragPointerId = null;

    this.container = scene.add.container(0, 0).setDepth(600);

    this.buildWheel();
    this.buildPedals();
    if (opts.selectors) this.buildSelectors();
    this.buildHUD();
    this.bindKeyboard();
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

    zone.on("pointerdown", (p) => {
      this._dragPointerId = p.id;
      this.updateSteerFromPointer(p);
    });
    s.input.on("pointermove", (p) => {
      if (this._dragPointerId === p.id) this.updateSteerFromPointer(p);
    });
    const release = (p) => {
      if (this._dragPointerId === p.id) this._dragPointerId = null;
    };
    s.input.on("pointerup", release);
    s.input.on("pointerupoutside", release);
  }

  updateSteerFromPointer(p) {
    const dx = p.x - this.wheelX;
    this._steerTarget = Phaser.Math.Clamp(dx / this.wheelR, -1, 1);
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

    const press = () => {
      cont.setScale(0.94);
      if (kind === "gas") this._gasHeld = true;
      else this._brakeHeld = true;
    };
    const release = () => {
      cont.setScale(1);
      if (kind === "gas") this._gasHeld = false;
      else this._brakeHeld = false;
    };
    bg.on("pointerdown", press);
    bg.on("pointerup", release);
    bg.on("pointerout", release);
    bg.on("pointerupoutside", release);
    return cont;
  }

  // ---- Gear selectors (transmission + transfer case) ----
  buildSelectors() {
    this.transSelector = this.makeSelector(
      40,
      120,
      t("transmission_short"),
      TRANSMISSION,
      this.gear,
      (v) => {
        this.gear = v;
        if (this.opts.onGear) this.opts.onGear(v);
      }
    );
    this.transferSelector = this.makeSelector(
      170,
      120,
      t("transfer_short"),
      TRANSFER,
      this.range,
      (v) => {
        this.range = v;
        if (this.opts.onRange) this.opts.onRange(v);
      }
    );
  }

  makeSelector(x, y, title, options, initial, onSelect) {
    const s = this.scene;
    const cont = s.add.container(x, y).setDepth(650);
    const cellH = 46;
    const w = 96;

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
      rect.on("pointerup", () => {
        this.setSelector(cells, opt);
        onSelect(opt);
      });
      cells[opt] = { rect, label };
      cont.add([rect, label]);
    });
    this.container.add(cont);
    this.setSelector(cells, initial);
    cont._cells = cells;
    return cont;
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
    const parts = [`${t("hud_speed")} ${Math.round(kph)}`];
    if (this.opts.selectors) {
      parts.push(`${t("hud_gear")} ${this.gear}`);
      parts.push(`${t("hud_range")} ${this.range}`);
    } else {
      parts.push(`${t("hud_gear")} ${this.gear}`);
    }
    if (this.hud) this.hud.setText(parts.join("    "));
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

  // ---- Per-frame update ----
  update(dtMs) {
    const dt = dtMs / 1000;
    const k = this.keys;

    // Keyboard steering overrides drag target.
    let kbSteer = 0;
    if (k) {
      if (k.left.isDown || k.a.isDown) kbSteer -= 1;
      if (k.right.isDown || k.d.isDown) kbSteer += 1;
    }
    if (kbSteer !== 0) this._steerTarget = kbSteer;
    else if (this._dragPointerId === null) this._steerTarget = 0; // auto-centre

    // Ease steering toward target.
    this.steer = Phaser.Math.Linear(this.steer, this._steerTarget, Math.min(1, dt * 8));
    if (Math.abs(this.steer) < 0.01) this.steer = 0;
    this.drawWheel(this.steer);

    // Pedals (button hold or keyboard).
    const gas = this._gasHeld || (k && (k.up.isDown || k.w.isDown));
    const brake = this._brakeHeld || (k && (k.down.isDown || k.s.isDown));
    this.throttle = Phaser.Math.Clamp(this.throttle + (gas ? dt * 2 : -dt * 3), 0, 1);
    this.brakeInput = Phaser.Math.Clamp(this.brakeInput + (brake ? dt * 4 : -dt * 5), 0, 1);
  }

  destroy() {
    this.container.destroy();
  }
}
