// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../theme.js";
import { ASSETS, OVERRIDES_URL, resolved } from "../assets/manifest.js";

/**
 * Loads any real photo / AI images that exist, then resolves each replaceable
 * asset id to the winning source or a procedurally-drawn fallback so the game
 * always has every texture it needs.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // A tiny loading label (system font, no assets needed).
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Loading…", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        color: "#c9b98f",
      })
      .setOrigin(0.5);
  }

  async create() {
    // Read the override manifest (one request; a real photo / AI image per id).
    let found = {};
    try {
      const r = await fetch(OVERRIDES_URL, { cache: "no-cache" });
      if (r.ok) {
        const map = await r.json();
        ASSETS.forEach((a) => {
          if (typeof map[a.id] === "string") found[a.id] = map[a.id];
        });
      }
    } catch (_) {
      /* no manifest — everything falls back to procedural art */
    }

    const finish = () => {
      ASSETS.forEach((a) => {
        // If a real/AI file didn't load into its texture, draw the fallback.
        if (!this.textures.exists(a.id)) this[`gen_${a.proc}`](a.id);
        resolved[a.id] = a.id;
      });
      this.scene.start("AboutScene");
    };

    const toLoad = ASSETS.filter((a) => found[a.id]);
    if (toLoad.length === 0) {
      finish();
      return;
    }
    // Load the discovered files under their canonical id keys.
    toLoad.forEach((a) => this.load.image(a.id, found[a.id]));
    this.load.once("complete", finish);
    this.load.start();
  }

  // ---- Procedural fallbacks (drawn once into named textures) ----

  gen_title(key) {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const g = this.add.graphics();
    // Desert sky gradient.
    g.fillGradientStyle(0xe9c982, 0xe9c982, 0xcaa25a, 0xcaa25a, 1);
    g.fillRect(0, 0, w, h * 0.62);
    // Distant dunes.
    g.fillStyle(0xbf9a56, 1);
    g.fillEllipse(w * 0.3, h * 0.62, w * 1.1, h * 0.35);
    g.fillStyle(0xa9843f, 1);
    g.fillEllipse(w * 0.8, h * 0.64, w * 0.9, h * 0.3);
    // Ground.
    g.fillStyle(0x8c6d34, 1);
    g.fillRect(0, h * 0.62, w, h * 0.38);
    // Sun.
    g.fillStyle(0xfff2cf, 0.9);
    g.fillCircle(w * 0.8, h * 0.2, 70);
    // Humvee silhouette centred low.
    this.drawHumveeSilhouette(g, w * 0.5, h * 0.66, 3.0, 0x2a2418);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  gen_dashboard(key) {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    const g = this.add.graphics();
    // Windshield view (desert horizon).
    g.fillGradientStyle(0xbcd3e0, 0xbcd3e0, 0xdcc79a, 0xdcc79a, 1);
    g.fillRect(0, 0, w, h * 0.42);
    g.fillStyle(0xc2a266, 1);
    g.fillRect(0, h * 0.38, w, h * 0.08);
    // A-pillars.
    g.fillStyle(0x2f3a1f, 1);
    g.fillTriangle(0, 0, 120, 0, 60, h * 0.46);
    g.fillTriangle(w, 0, w - 120, 0, w - 60, h * 0.46);
    // Dashboard body.
    g.fillStyle(COLORS.panel, 1);
    g.fillRect(0, h * 0.44, w, h * 0.56);
    g.fillStyle(COLORS.panelLight, 1);
    g.fillRoundedRect(w * 0.5 - 220, h * 0.4, 440, 150, 20); // gauge binnacle
    // Centre console.
    g.fillStyle(0x161a10, 1);
    g.fillRoundedRect(w * 0.5 - 160, h * 0.78, 320, 220, 16);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  gen_humveeTop(key) {
    const g = this.add.graphics();
    const w = 120;
    const h = 200;
    // Wheels first (dark), at the four corners.
    g.fillStyle(0x1a1a1a, 1);
    [
      [8, 26],
      [w - 32, 26],
      [8, h - 66],
      [w - 32, h - 66],
    ].forEach(([x, y]) => g.fillRoundedRect(x, y, 24, 42, 6));
    // Body (tan), pointing up (north).
    g.fillStyle(0x9c8a5a, 1);
    g.fillRoundedRect(16, 10, w - 32, h - 20, 14);
    // Hood/cabin detail.
    g.fillStyle(0x86764c, 1);
    g.fillRoundedRect(24, 60, w - 48, 90, 8); // cabin
    g.fillStyle(0x6f6340, 1);
    g.fillRoundedRect(28, 22, w - 56, 30, 6); // hood
    // Windshield.
    g.fillStyle(0x2b3540, 1);
    g.fillRoundedRect(28, 58, w - 56, 22, 5);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  gen_humveeSide(key) {
    const g = this.add.graphics();
    const w = 300;
    const h = 150;
    this.drawHumveeSilhouette(g, w / 2, h - 28, 1.0, 0x9c8a5a, true);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  gen_trailerPhoto(key) {
    const w = 640;
    const h = 400;
    const g = this.add.graphics();
    g.fillStyle(0x6b7360, 1);
    g.fillRect(0, 0, w, h); // yard
    g.fillStyle(0x8a7a4e, 1);
    g.fillRoundedRect(180, 150, 300, 120, 16); // tank body
    g.fillStyle(0x746643, 1);
    g.fillRoundedRect(210, 165, 90, 40, 8);
    g.fillStyle(0x141414, 1);
    g.fillCircle(250, 285, 34);
    g.fillCircle(410, 285, 34);
    g.lineStyle(10, 0x3a3a2a, 1);
    g.beginPath();
    g.moveTo(180, 210);
    g.lineTo(90, 250);
    g.strokePath(); // drawbar
    g.generateTexture(key, w, h);
    g.destroy();
  }

  gen_trail(key) {
    const s = 256;
    const g = this.add.graphics();
    g.fillStyle(COLORS.dirt, 1);
    g.fillRect(0, 0, s, s);
    // Speckle for texture.
    for (let i = 0; i < 400; i++) {
      const x = Phaser.Math.Between(0, s);
      const y = Phaser.Math.Between(0, s);
      const shade = Phaser.Math.Between(0, 1)
        ? 0x5a4830
        : 0x7c6440;
      g.fillStyle(shade, Phaser.Math.FloatBetween(0.3, 0.7));
      g.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }
    g.generateTexture(key, s, s);
    g.destroy();
  }

  // Shared side-profile Humvee shape, used by title + side sprite.
  drawHumveeSilhouette(g, cx, baseY, scale, color, detailed = false) {
    const s = scale;
    const bodyW = 220 * s;
    const bodyH = 60 * s;
    const left = cx - bodyW / 2;
    const top = baseY - bodyH;
    g.fillStyle(color, 1);
    // Lower body.
    g.fillRoundedRect(left, top, bodyW, bodyH, 8 * s);
    // Cabin / roof.
    g.fillRoundedRect(left + 60 * s, top - 46 * s, 110 * s, 50 * s, 8 * s);
    // Slanted windshield + hood wedge.
    g.fillTriangle(
      left + 60 * s,
      top,
      left + 60 * s,
      top - 44 * s,
      left + 20 * s,
      top
    );
    if (detailed) {
      g.fillStyle(0x2b3540, 1);
      g.fillRoundedRect(left + 68 * s, top - 40 * s, 44 * s, 34 * s, 4 * s); // window
      g.fillRoundedRect(left + 120 * s, top - 40 * s, 44 * s, 34 * s, 4 * s);
    }
    // Wheels.
    g.fillStyle(0x161616, 1);
    const wr = 26 * s;
    g.fillCircle(left + 46 * s, baseY, wr);
    g.fillCircle(left + bodyW - 46 * s, baseY, wr);
    if (detailed) {
      g.fillStyle(0x555555, 1);
      g.fillCircle(left + 46 * s, baseY, wr * 0.45);
      g.fillCircle(left + bodyW - 46 * s, baseY, wr * 0.45);
    }
  }
}
