import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";

const LIMITS = {
  gradePct: 60,
  sidePct: 40,
  stepIn: 18,
  trenchIn: 30,
  logIn: 10,
};

const TYPES = ["grade", "side", "step", "trench", "log"];
const QUESTIONS = 8;

export default class StageObstacleScene extends Phaser.Scene {
  constructor() {
    super("StageObstacleScene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.index = 0;
    this.correct = 0;
    this.current = null;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.armyGreenDark, 1).setOrigin(0);
    this.makeBackButton();
    addFullscreenButton(this, GAME_WIDTH - 132, 20);

    this.title = this.add
      .text(GAME_WIDTH / 2, 58, t("stage3_title"), {
        fontFamily: FONT,
        fontSize: "40px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.banner = this.dialog.banner(t("s3obs_obj"));
    this.diagram = this.add.graphics().setDepth(10);
    this.truckLayer = this.add.container(0, 0).setDepth(11);
    this.prompt = this.add
      .text(GAME_WIDTH / 2, 560, "", {
        fontFamily: FONT,
        fontSize: "28px",
        color: "#f2ecd8",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 960 },
      })
      .setOrigin(0.5);
    this.source = this.add
      .text(GAME_WIDTH / 2, 678, t("s3obs_source"), {
        fontFamily: FONT,
        fontSize: "15px",
        color: "#c9b98f",
        align: "center",
        wordWrap: { width: 960 },
      })
      .setOrigin(0.5);

    this.passBtn = this.dialog.makeButton(GAME_WIDTH / 2 - 155, 620, t("s3obs_passable"), () => this.answer(true), {
      width: 280,
      height: 56,
      color: COLORS.good,
    });
    this.failBtn = this.dialog.makeButton(GAME_WIDTH / 2 + 155, 620, t("s3obs_impassable"), () => this.answer(false), {
      width: 280,
      height: 56,
      color: COLORS.bad,
    });
    this.nextQuestion();
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

  nextQuestion() {
    this.current = makeQuestion(TYPES[Phaser.Math.Between(0, TYPES.length - 1)]);
    this.index++;
    this.drawQuestion();
  }

  drawQuestion() {
    this.diagram.clear();
    this.truckLayer.removeAll(true);
    this.drawBase();
    const q = this.current;
    if (q.type === "grade") this.drawGrade(q.value);
    else if (q.type === "side") this.drawSideSlope(q.value);
    else if (q.type === "step") this.drawStep(q.value);
    else if (q.type === "trench") this.drawTrench(q.value);
    else this.drawLog(q.value);
    this.prompt.setText(t("s3obs_prompt", { n: this.index, total: QUESTIONS, label: t(q.labelKey), value: q.text }));
  }

  drawBase() {
    this.diagram.fillStyle(0x26311d, 1);
    this.diagram.fillRoundedRect(170, 132, 940, 360, 8);
    this.diagram.lineStyle(3, COLORS.sandDark, 1);
    this.diagram.strokeRoundedRect(170, 132, 940, 360, 8);
  }

  drawGrade(pct) {
    const angle = Math.atan(pct / 100);
    const x0 = 260;
    const y0 = 430;
    const x1 = 1010;
    const y1 = y0 - Math.tan(angle) * 430;
    this.diagram.fillStyle(0x6b5636, 1);
    this.diagram.beginPath();
    this.diagram.moveTo(x0, y0);
    this.diagram.lineTo(x1, y1);
    this.diagram.lineTo(x1, 492);
    this.diagram.lineTo(x0, 492);
    this.diagram.closePath();
    this.diagram.fillPath();
    this.drawTruck((x0 + x1) / 2, (y0 + y1) / 2 - 36, -angle, 1);
  }

  drawSideSlope(pct) {
    const angle = Math.atan(pct / 100);
    this.diagram.fillStyle(0x6b5636, 1);
    this.diagram.beginPath();
    this.diagram.moveTo(245, 432);
    this.diagram.lineTo(1035, 432 - Math.tan(angle) * 320);
    this.diagram.lineTo(1035, 492);
    this.diagram.lineTo(245, 492);
    this.diagram.closePath();
    this.diagram.fillPath();
    this.drawTruck(640, 342, -angle, 1.15, true);
  }

  drawStep(inches) {
    const h = inches * 5.6;
    this.diagram.fillStyle(0x6b5636, 1);
    this.diagram.fillRect(240, 420, 320, 72);
    this.diagram.fillRect(560, 420 - h, 470, h + 72);
    this.diagram.lineStyle(5, COLORS.accent, 1);
    this.diagram.lineBetween(560, 420, 560, 420 - h);
    this.drawTruck(430, 376, 0, 1);
  }

  drawTrench(inches) {
    const w = inches * 7;
    this.diagram.fillStyle(0x6b5636, 1);
    this.diagram.fillRect(230, 420, 800, 72);
    this.diagram.fillStyle(0x15120d, 1);
    this.diagram.fillRect(640 - w / 2, 420, w, 72);
    this.diagram.lineStyle(5, COLORS.accent, 1);
    this.diagram.strokeRect(640 - w / 2, 420, w, 72);
    this.drawTruck(418, 376, 0, 1);
  }

  drawLog(inches) {
    const r = inches * 4.2;
    this.diagram.fillStyle(0x6b5636, 1);
    this.diagram.fillRect(230, 420, 800, 72);
    this.diagram.fillStyle(0x5a321f, 1);
    this.diagram.fillCircle(640, 418, r);
    this.diagram.lineStyle(4, 0x2f1a11, 1);
    this.diagram.strokeCircle(640, 418, r);
    this.drawTruck(420, 376, 0, 1);
  }

  drawTruck(x, y, rot, scale, rear = false) {
    const w = rear ? 190 : 260;
    const h = rear ? 116 : 98;
    this.diagram.fillStyle(0x15180f, 0.38);
    this.diagram.fillEllipse(x, y + 64 * scale, w * 1.06 * scale, 42 * scale);
    const body = this.add.graphics();
    body.fillStyle(COLORS.armyGreen, 1);
    body.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    body.fillStyle(0x0f120c, 1);
    body.fillRoundedRect(-w / 2 + 22, h / 2 - 14, 54, 28, 6);
    body.fillRoundedRect(w / 2 - 76, h / 2 - 14, 54, 28, 6);
    body.lineStyle(4, COLORS.sand, 1);
    body.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    const cont = this.add.container(x, y, [body]).setRotation(rot).setScale(scale);
    this.truckLayer.add(cont);
  }

  answer(passable) {
    const ok = passable === this.current.passable;
    if (ok) this.correct++;
    this.dialog.toast(ok ? t("s3obs_correct") : t("s3obs_wrong"), {
      color: ok ? "#6fbf5a" : "#d85a4a",
      duration: 900,
    });
    if (this.index >= QUESTIONS) {
      const score = Math.round((this.correct / QUESTIONS) * 100);
      this.time.delayedCall(900, () =>
        this.scene.start("StageCompleteScene", { stage: 3, score, nextScene: "Stage2Scene" })
      );
    } else {
      this.time.delayedCall(600, () => this.nextQuestion());
    }
  }
}

function makeQuestion(type) {
  if (type === "grade") {
    const value = randInt(35, 78);
    return { type, value, passable: value <= LIMITS.gradePct, labelKey: "s3obs_grade", text: `${value}%` };
  }
  if (type === "side") {
    const value = randInt(24, 55);
    return { type, value, passable: value <= LIMITS.sidePct, labelKey: "s3obs_side", text: `${value}%` };
  }
  if (type === "step") {
    const value = randInt(8, 30);
    return { type, value, passable: value <= LIMITS.stepIn, labelKey: "s3obs_step", text: `${value} in` };
  }
  if (type === "trench") {
    const value = randInt(16, 42);
    return { type, value, passable: value <= LIMITS.trenchIn, labelKey: "s3obs_trench", text: `${value} in` };
  }
  const value = randInt(5, 18);
  return { type, value, passable: value <= LIMITS.logIn, labelKey: "s3obs_log", text: `${value} in` };
}

function randInt(min, max) {
  return Phaser.Math.Between(min, max);
}
