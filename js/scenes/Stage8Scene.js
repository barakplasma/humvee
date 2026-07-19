import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
import { fitCover } from "./MenuScene.js";

const QUESTIONS = [
  {
    q: "s8_q_name",
    choices: ["s8_a_hmmwv", "s8_a_hummer", "s8_a_mrap", "s8_a_jltv"],
    correct: 0,
    note: "s8_note_name",
  },
  {
    q: "s8_q_maker",
    choices: ["s8_a_am_general", "s8_a_ford", "s8_a_oshkosh", "s8_a_chrysler"],
    correct: 0,
    note: "s8_note_maker",
  },
  {
    q: "s8_q_service",
    choices: ["s8_a_1985", "s8_a_1941", "s8_a_1996", "s8_a_2015"],
    correct: 0,
    note: "s8_note_service",
  },
  {
    q: "s8_q_drive",
    choices: ["s8_a_independent_4x4", "s8_a_tracks", "s8_a_rear_drive", "s8_a_six_wheel"],
    correct: 0,
    note: "s8_note_drive",
  },
  {
    q: "s8_q_fuel",
    choices: ["s8_a_25_gal", "s8_a_10_gal", "s8_a_50_gal", "s8_a_95_gal_us"],
    correct: 0,
    note: "s8_note_fuel",
  },
  {
    q: "s8_q_replacement",
    choices: ["s8_a_jltv_program", "s8_a_hummer_h1", "s8_a_gama_goat", "s8_a_cucv"],
    correct: 0,
    note: "s8_note_replacement",
  },
];

export default class Stage8Scene extends Phaser.Scene {
  constructor() {
    super("Stage8Scene");
  }

  create() {
    this.dialog = new Dialog(this);
    this.index = 0;
    this.correct = 0;
    this.mistakes = 0;
    this.locked = false;
    this.choiceButtons = [];

    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("title_art"));
    fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.52).setOrigin(0);

    this.banner = this.dialog.banner(t("s8_obj"));
    addFullscreenButton(this, GAME_WIDTH - 132, 20);
    const menu = this.add
      .text(GAME_WIDTH - 24, 20, "‹ " + t("btn_menu"), {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#f2ecd8",
        backgroundColor: "rgba(0,0,0,0.35)",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    menu.on("pointerup", () => this.scene.start("MenuScene"));

    this.add
      .rectangle(GAME_WIDTH / 2, 370, 920, 420, COLORS.panel, 0.96)
      .setStrokeStyle(3, COLORS.sand);

    this.progressText = this.add
      .text(GAME_WIDTH / 2, 178, "", {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#d8a54a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.questionText = this.add
      .text(GAME_WIDTH / 2, 235, "", {
        fontFamily: FONT,
        fontSize: "30px",
        color: "#f2ecd8",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5);

    for (let i = 0; i < 4; i++) {
      const x = GAME_WIDTH / 2 + (i % 2 === 0 ? -230 : 230);
      const y = 355 + Math.floor(i / 2) * 82;
      const btn = this.dialog.makeButton(x, y, "", () => this.answer(i), {
        width: 390,
        height: 62,
        fontSize: "20px",
        color: COLORS.panelLight,
      });
      this.choiceButtons.push(btn);
    }

    this.feedback = this.add
      .text(GAME_WIDTH / 2, 546, "", {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#c9b98f",
        align: "center",
        wordWrap: { width: 820 },
      })
      .setOrigin(0.5);

    this.sourceText = this.add
      .text(GAME_WIDTH / 2, 642, t("s8_source"), {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#9c8f68",
        align: "center",
        wordWrap: { width: 860 },
      })
      .setOrigin(0.5);

    this.renderQuestion();
  }

  renderQuestion() {
    const item = QUESTIONS[this.index];
    this.locked = false;
    this.progressText.setText(t("s8_progress", { n: this.index + 1, total: QUESTIONS.length }));
    this.questionText.setText(t(item.q));
    this.feedback.setText("");
    item.choices.forEach((key, i) => {
      this.choiceButtons[i].label.setText(t(key));
      fitButtonLabel(this.choiceButtons[i].label, 372, 52, 13);
      this.choiceButtons[i].bg.setFillStyle(COLORS.panelLight, 1);
    });
  }

  answer(choiceIndex) {
    if (this.locked) return;
    this.locked = true;
    const item = QUESTIONS[this.index];
    const isCorrect = choiceIndex === item.correct;
    if (isCorrect) {
      this.correct++;
      this.choiceButtons[choiceIndex].bg.setFillStyle(0x3f7f38, 1);
      this.feedback.setColor("#6fbf5a").setText(`${t("s8_correct")} ${t(item.note)}`);
    } else {
      this.mistakes++;
      this.choiceButtons[choiceIndex].bg.setFillStyle(0x8f332d, 1);
      this.choiceButtons[item.correct].bg.setFillStyle(0x3f7f38, 1);
      this.feedback.setColor("#d8a54a").setText(`${t("s8_wrong")} ${t(item.note)}`);
    }
    this.time.delayedCall(1800, () => this.next());
  }

  next() {
    this.index++;
    if (this.index >= QUESTIONS.length) {
      const score = Math.max(0, Math.round((this.correct / QUESTIONS.length) * 100) - this.mistakes * 5);
      this.scene.start("StageCompleteScene", { stage: 8, score, nextScene: null });
      return;
    }
    this.renderQuestion();
  }
}

function fitButtonLabel(label, maxW, maxH, minPx) {
  let size = 20;
  label.setFontSize(size);
  while ((label.width > maxW || label.height > maxH) && size > minPx) {
    size -= 1;
    label.setFontSize(size);
  }
}
