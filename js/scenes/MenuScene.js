// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t } from "../i18n/i18n.js";
import { assetKey } from "../assets/manifest.js";
import { getScore, reset, allComplete } from "../data/progress.js";
import Dialog from "../ui/Dialog.js";
import LangSwitch from "../ui/LangSwitch.js";
import { addFullscreenButton } from "../ui/fullscreen.js";
const STAGES = [
    { n: 1, titleKey: "stage1_title", blurbKey: "stage1_blurb", scene: "Stage1Scene" },
    { n: 2, titleKey: "stage2_title", blurbKey: "stage2_blurb", scene: "StageGearScene" },
    { n: 3, titleKey: "stage3_title", blurbKey: "stage3_blurb", scene: "StageObstacleScene" },
    { n: 4, titleKey: "stage4_title", blurbKey: "stage4_blurb", scene: "Stage2Scene" },
    { n: 5, titleKey: "stage5_title", blurbKey: "stage5_blurb", scene: "Stage3Scene" },
    { n: 6, titleKey: "stage6_title", blurbKey: "stage6_blurb", scene: "Stage4Scene" },
    { n: 7, titleKey: "stage7_title", blurbKey: "stage7_blurb", scene: "Stage5Scene" },
    { n: 8, titleKey: "stage8_title", blurbKey: "stage8_blurb", scene: "Stage6Scene" },
    { n: 9, titleKey: "stage9_title", blurbKey: "stage9_blurb", scene: "Stage7Scene" },
    { n: 10, titleKey: "stage10_title", blurbKey: "stage10_blurb", scene: "Stage8Scene" },
];
const PAGE_SIZE = 4;
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }
    create() {
        this.dialog = new Dialog(this);
        this.page = 0;
        // Background hero (photo / AI / procedural).
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, assetKey("title_art"));
        fitCover(bg, GAME_WIDTH, GAME_HEIGHT);
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35).setOrigin(0);
        // Title.
        this.add
            .text(GAME_WIDTH / 2, 80, t("app_title"), {
            fontFamily: FONT,
            fontSize: "64px",
            color: "#f2ecd8",
            fontStyle: "bold",
            stroke: "#161a10",
            strokeThickness: 6,
        })
            .setOrigin(0.5);
        this.add
            .text(GAME_WIDTH / 2, 138, t("app_subtitle"), {
            fontFamily: FONT,
            fontSize: "30px",
            color: "#d8a54a",
            fontStyle: "bold",
        })
            .setOrigin(0.5);
        // Language switch (restart scene so everything re-renders in the new direction).
        new LangSwitch(this, 24, 34, () => this.scene.restart());
        this.cardLayer = this.add.container(0, 0);
        this.pagerLayer = this.add.container(0, 0);
        this.renderStagePage();
        // Disclaimer.
        this.add
            .text(GAME_WIDTH / 2, GAME_HEIGHT - 46, t("disclaimer"), {
            fontFamily: FONT,
            fontSize: "16px",
            color: "#c9b98f",
            align: "center",
            wordWrap: { width: GAME_WIDTH - 260 },
        })
            .setOrigin(0.5);
        // Reset progress (small, top-right corner).
        const resetBtn = this.add
            .text(GAME_WIDTH - 24, 30, t("progress_reset"), {
            fontFamily: FONT,
            fontSize: "18px",
            color: "#9c8f68",
        })
            .setOrigin(1, 0.5)
            .setInteractive({ useHandCursor: true });
        resetBtn.on("pointerup", () => {
            reset();
            this.scene.restart();
        });
        addFullscreenButton(this, GAME_WIDTH - 24, 58);
        const creditsBtn = this.add
            .text(GAME_WIDTH - 24, 92, t("credits_title"), {
            fontFamily: FONT,
            fontSize: "18px",
            color: "#f2ecd8",
            backgroundColor: "rgba(0,0,0,0.35)",
            padding: { x: 10, y: 5 },
        })
            .setOrigin(1, 0.5)
            .setInteractive({ useHandCursor: true });
        creditsBtn.on("pointerup", () => this.scene.start("CreditsScene"));
        if (allComplete()) {
            this.dialog.toast(t("all_complete_msg"), { color: "#6fbf5a", duration: 3000 });
        }
    }
    renderStagePage() {
        this.cardLayer.removeAll(true);
        this.pagerLayer.removeAll(true);
        const pages = Math.ceil(STAGES.length / PAGE_SIZE);
        this.page = Phaser.Math.Clamp(this.page, 0, pages - 1);
        const start = this.page * PAGE_SIZE;
        const items = STAGES.slice(start, start + PAGE_SIZE);
        const cols = 2;
        const gapX = 34;
        const gapY = 26;
        const cardW = 390;
        const cardH = 158;
        const rowCount = Math.ceil(items.length / cols);
        const gridW = cols * cardW + (cols - 1) * gapX;
        const gridH = rowCount * cardH + (rowCount - 1) * gapY;
        const top = 212;
        const left = GAME_WIDTH / 2 - gridW / 2;
        items.forEach((st, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const rowItems = row === rowCount - 1 && items.length % cols !== 0 ? items.length % cols : cols;
            const rowW = rowItems * cardW + (rowItems - 1) * gapX;
            const rowLeft = GAME_WIDTH / 2 - rowW / 2;
            const x = (rowItems === cols ? left : rowLeft) + col * (cardW + gapX) + cardW / 2;
            const y = top + row * (cardH + gapY) + cardH / 2;
            this.cardLayer.add(this.makeStageCard(x, y, cardW, st, cardH, true));
        });
        const pageText = this.add
            .text(GAME_WIDTH / 2, top + gridH + 42, t("menu_page", { n: this.page + 1, total: pages }), {
            fontFamily: FONT,
            fontSize: "18px",
            color: "#c9b98f",
            align: "center",
        })
            .setOrigin(0.5);
        this.pagerLayer.add(pageText);
        if (pages <= 1)
            return;
        const prev = this.dialog.makeButton(GAME_WIDTH / 2 - 180, top + gridH + 42, "‹ " + t("btn_prev"), () => {
            this.page = (this.page + pages - 1) % pages;
            this.renderStagePage();
        }, { width: 130, height: 46, fontSize: "18px", color: COLORS.panelLight });
        const next = this.dialog.makeButton(GAME_WIDTH / 2 + 180, top + gridH + 42, t("btn_next") + " ›", () => {
            this.page = (this.page + 1) % pages;
            this.renderStagePage();
        }, { width: 130, height: 46, fontSize: "18px", color: COLORS.panelLight });
        this.pagerLayer.add([prev, next]);
    }
    makeStageCard(x, y, w, st, h = 260, compact = false) {
        const score = getScore(st.n);
        const cont = this.add.container(x, y);
        const bg = this.add
            .rectangle(0, 0, w, h, COLORS.panel, 0.95)
            .setStrokeStyle(3, COLORS.sand)
            .setInteractive({ useHandCursor: true });
        cont.add(bg);
        cont.add(this.add
            .text(0, -h / 2 + 34, t("stage", { n: st.n }), {
            fontFamily: FONT,
            fontSize: compact ? "18px" : "20px",
            color: "#d8a54a",
            fontStyle: "bold",
        })
            .setOrigin(0.5));
        cont.add(this.add
            .text(0, -h / 2 + 74, t(st.titleKey), {
            fontFamily: FONT,
            fontSize: compact ? "20px" : "23px",
            color: "#f2ecd8",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: w - 24 },
        })
            .setOrigin(0.5));
        cont.add(this.add
            .text(0, compact ? 12 : 24, t(st.blurbKey), {
            fontFamily: FONT,
            fontSize: compact ? "14px" : "16px",
            color: "#c9b98f",
            align: "center",
            wordWrap: { width: w - 26 },
        })
            .setOrigin(0.5));
        cont.add(this.add
            .text(0, h / 2 - (compact ? 50 : 62), score ? t("best_score", { score }) : t("no_score"), {
            fontFamily: FONT,
            fontSize: compact ? "15px" : "17px",
            color: score ? "#d8a54a" : "#9c8f68",
            fontStyle: "bold",
        })
            .setOrigin(0.5));
        cont.add(this.add
            .text(0, h / 2 - (compact ? 22 : 28), "▶ " + t("btn_begin"), {
            fontFamily: FONT,
            fontSize: compact ? "20px" : "22px",
            color: "#6fbf5a",
            fontStyle: "bold",
        })
            .setOrigin(0.5));
        bg.on("pointerup", () => this.scene.start(st.scene));
        return cont;
    }
}
// Scale an image to cover a box (crop overflow), centred.
export function fitCover(img, boxW, boxH) {
    const scale = Math.max(boxW / img.width, boxH / img.height);
    img.setScale(scale);
}
