// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { completeStage, allComplete } from "../data/progress.js";
import Dialog from "../ui/Dialog.js";
export default class StageCompleteScene extends Phaser.Scene {
    constructor() {
        super("StageCompleteScene");
    }
    init(data) {
        this.stage = data.stage;
        this.score = data.score || 0;
        this.nextScene = data.nextScene || null;
    }
    create() {
        // Record progress (unlocks the next stage).
        completeStage(this.stage, this.score);
        const dialog = new Dialog(this);
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.armyGreenDark, 1).setOrigin(0);
        const finishedAll = allComplete() && !this.nextScene;
        this.add
            .text(GAME_WIDTH / 2, 200, finishedAll ? t("all_complete_title") : t("stage_complete"), {
            fontFamily: FONT,
            fontSize: "56px",
            color: "#d8a54a",
            fontStyle: "bold",
        })
            .setOrigin(0.5);
        this.add
            .text(GAME_WIDTH / 2, 290, finishedAll ? t("all_complete_msg") : t("well_done"), {
            fontFamily: FONT,
            fontSize: "28px",
            color: "#f2ecd8",
            align: "center",
            wordWrap: { width: GAME_WIDTH - 300 },
        })
            .setOrigin(0.5);
        this.add
            .text(GAME_WIDTH / 2, 360, t("score", { score: this.score }), {
            fontFamily: FONT,
            fontSize: "30px",
            color: "#6fbf5a",
            fontStyle: "bold",
        })
            .setOrigin(0.5);
        if (this.nextScene) {
            dialog
                .makeButton(GAME_WIDTH / 2, 470, t("btn_next_stage"), () => this.scene.start(this.nextScene), {
                width: 300,
                color: COLORS.armyGreen,
            });
        }
        dialog.makeButton(GAME_WIDTH / 2, this.nextScene ? 545 : 480, t("btn_menu"), () => this.scene.start("MenuScene"));
    }
}
