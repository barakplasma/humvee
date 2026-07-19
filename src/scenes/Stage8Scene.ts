// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import Dialog from "../ui/Dialog.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
import { fitCover } from "./MenuScene.js";

const SESSION_SIZE = 16;
const QUESTIONS = [
  {
    q: "s8_q_name",
    choices: ["s8_a_hmmwv", "s8_a_hummer", "s8_a_mrap", "s8_a_jltv"],
    correct: 0,
    note: "s8_note_name",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_maker",
    choices: ["s8_a_am_general", "s8_a_ford", "s8_a_oshkosh", "s8_a_chrysler"],
    correct: 0,
    note: "s8_note_maker",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_service",
    choices: ["s8_a_1985", "s8_a_1941", "s8_a_1996", "s8_a_2015"],
    correct: 0,
    note: "s8_note_service",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_drive",
    choices: ["s8_a_independent_4x4", "s8_a_tracks", "s8_a_rear_drive", "s8_a_six_wheel"],
    correct: 0,
    note: "s8_note_drive",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_fuel",
    choices: ["s8_a_25_gal", "s8_a_10_gal", "s8_a_50_gal", "s8_a_95_gal_us"],
    correct: 0,
    note: "s8_note_fuel",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_replacement",
    choices: ["s8_a_jltv_program", "s8_a_hummer_h1", "s8_a_gama_goat", "s8_a_cucv"],
    correct: 0,
    note: "s8_note_replacement",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_role",
    choices: ["s8_a_light_utility", "s8_a_main_battle_tank", "s8_a_self_propelled_artillery", "s8_a_attack_helicopter"],
    correct: 0,
    note: "s8_note_role",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_predecessor",
    choices: ["s8_a_jeep_family", "s8_a_m1_abrams", "s8_a_black_hawk", "s8_a_sherman"],
    correct: 0,
    note: "s8_note_predecessor",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_civilian",
    choices: ["s8_a_hummer_h1", "s8_a_honda_civic", "s8_a_ford_bronco", "s8_a_toyota_hilux"],
    correct: 0,
    note: "s8_note_civilian",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_layout",
    choices: ["s8_a_four_wheel_drive", "s8_a_front_wheel_drive", "s8_a_tracks", "s8_a_two_wheel_motorcycle"],
    correct: 0,
    note: "s8_note_layout",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_engine",
    choices: ["s8_a_v8_diesel", "s8_a_inline_three_gas", "s8_a_turboshaft", "s8_a_electric_only"],
    correct: 0,
    note: "s8_note_engine",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_transmission",
    choices: ["s8_a_automatic", "s8_a_manual_only", "s8_a_no_transmission", "s8_a_single_speed_bicycle"],
    correct: 0,
    note: "s8_note_transmission",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_width",
    choices: ["s8_a_wide_track", "s8_a_narrow_motorcycle", "s8_a_rail_only", "s8_a_foldable"],
    correct: 0,
    note: "s8_note_width",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_variants",
    choices: ["s8_a_many_variants", "s8_a_one_variant", "s8_a_only_civilian", "s8_a_only_boat"],
    correct: 0,
    note: "s8_note_variants",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_armor",
    choices: ["s8_a_armor_added", "s8_a_always_tank_armor", "s8_a_no_military_use", "s8_a_canvas_only"],
    correct: 0,
    note: "s8_note_armor",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_airlift",
    choices: ["s8_a_air_transportable", "s8_a_submarine_only", "s8_a_rail_gauge_only", "s8_a_cannot_transport"],
    correct: 0,
    note: "s8_note_airlift",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_hebrew_name",
    choices: ["s8_a_hummer_hebrew", "s8_a_tank_hebrew", "s8_a_jeep_hebrew", "s8_a_truck_hebrew"],
    correct: 0,
    note: "s8_note_hebrew_name",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_jltv_maker",
    choices: ["s8_a_oshkosh", "s8_a_am_general", "s8_a_chrysler", "s8_a_ford"],
    correct: 0,
    note: "s8_note_jltv_maker",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_m998",
    choices: ["s8_a_cargo_troop", "s8_a_fighter_jet", "s8_a_main_battle_tank", "s8_a_submarine"],
    correct: 0,
    note: "s8_note_m998",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_purpose",
    choices: ["s8_a_replace_multiple_trucks", "s8_a_replace_aircraft", "s8_a_replace_ships", "s8_a_replace_satellites"],
    correct: 0,
    note: "s8_note_purpose",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_weight_class",
    choices: ["s8_a_light_truck", "s8_a_heavy_tank", "s8_a_motor_scooter", "s8_a_locomo"],
    correct: 0,
    note: "s8_note_weight_class",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_crew",
    choices: ["s8_a_crew_plus_payload", "s8_a_one_pilot", "s8_a_ship_crew", "s8_a_no_driver"],
    correct: 0,
    note: "s8_note_crew",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_common_name",
    choices: ["s8_a_humvee", "s8_a_stryker", "s8_a_paladin", "s8_a_chinook"],
    correct: 0,
    note: "s8_note_common_name",
    source: "s8_source_wikipedia",
  },
  {
    q: "s8_q_not_source",
    choices: ["s8_a_no_operator_limits", "s8_a_official_pmcs", "s8_a_official_tire_pressure", "s8_a_official_startup_order"],
    correct: 0,
    note: "s8_note_not_source",
    source: "s8_source_wikipedia",
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
    this.queue = buildSession();

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
    const item = this.queue[this.index];
    this.locked = false;
    this.progressText.setText(t("s8_progress", { n: this.index + 1, total: this.queue.length }));
    this.questionText.setText(t(item.q));
    this.feedback.setText("");
    item.shuffledChoices.forEach((key, i) => {
      this.choiceButtons[i].label.setText(t(key));
      fitButtonLabel(this.choiceButtons[i].label, 372, 52, 13);
      this.choiceButtons[i].bg.setFillStyle(COLORS.panelLight, 1);
    });
  }

  answer(choiceIndex) {
    if (this.locked) return;
    this.locked = true;
    const item = this.queue[this.index];
    const isCorrect = item.shuffledChoices[choiceIndex] === item.choices[item.correct];
    if (isCorrect) {
      this.correct++;
      this.choiceButtons[choiceIndex].bg.setFillStyle(0x3f7f38, 1);
      this.feedback.setColor("#6fbf5a").setText(`${t("s8_correct")} ${t(item.note)}\n${t(item.source)}`);
    } else {
      this.mistakes++;
      this.choiceButtons[choiceIndex].bg.setFillStyle(0x8f332d, 1);
      const correctIndex = item.shuffledChoices.indexOf(item.choices[item.correct]);
      if (correctIndex >= 0) this.choiceButtons[correctIndex].bg.setFillStyle(0x3f7f38, 1);
      this.feedback.setColor("#d8a54a").setText(`${t("s8_wrong")} ${t(item.note)}\n${t(item.source)}`);
      if (!item.review && this.queue.length < SESSION_SIZE + 5) {
        this.queue.push({ ...item, shuffledChoices: shuffle([...item.choices]), review: true });
      }
    }
    this.time.delayedCall(1800, () => this.next());
  }

  next() {
    this.index++;
    if (this.index >= this.queue.length) {
      const score = Math.max(0, Math.round((this.correct / this.queue.length) * 100) - this.mistakes * 4);
      this.scene.start("StageCompleteScene", { stage: 10, score, nextScene: null });
      return;
    }
    this.renderQuestion();
  }
}

function buildSession() {
  return shuffle([...QUESTIONS])
    .slice(0, SESSION_SIZE)
    .map((item) => ({ ...item, shuffledChoices: shuffle([...item.choices]), review: false }));
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Phaser.Math.Between(0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function fitButtonLabel(label, maxW, maxH, minPx) {
  let size = 20;
  label.setFontSize(size);
  while ((label.width > maxW || label.height > maxH) && size > minPx) {
    size -= 1;
    label.setFontSize(size);
  }
}
