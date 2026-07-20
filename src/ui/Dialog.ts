// @ts-nocheck
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from "../theme.js";
import { t, isRTL } from "../i18n/i18n.js";

// Reusable teaching cards, toasts and objective banners. One instance per scene.
export default class Dialog {
  constructor(scene) {
    this.scene = scene;
  }

  align() {
    return isRTL() ? "right" : "left";
  }

  /**
   * Modal teaching card with a title, body and a dismiss button.
   * Returns nothing; calls onClose when dismissed.
   */
  showCard({ title, body, button, onClose, imageKey, choices, correctIndex, onAnswer }) {
    const s = this.scene;
    const cont = s.add.container(0, 0).setDepth(2000).setScrollFactor(0);

    const overlay = s.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setOrigin(0)
      .setInteractive();
    cont.add(overlay);

    const hasImage = Boolean(imageKey);
    const hasChoices = Array.isArray(choices) && choices.length > 0;
    const cw = hasImage ? 860 : 720;
    const ch = hasImage || hasChoices ? 520 : 360;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const panel = s.add
      .rectangle(cx, cy, cw, ch, COLORS.panel, 0.98)
      .setStrokeStyle(3, COLORS.sand);
    cont.add(panel);

    const titleText = s.add
      .text(cx, cy - ch / 2 + 40, title, {
        fontFamily: FONT,
        fontSize: "34px",
        color: "#d8a54a",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: cw - 60 },
      })
      .setOrigin(0.5, 0);
    cont.add(titleText);
    fitText(titleText, cw - 60, 76, 24);

    const panelLeft = cx - cw / 2;
    const panelRight = cx + cw / 2;
    const panelPad = 52;
    let bodyX = cx;
    let bodyY = titleText.y + titleText.height + 24;
    let bodyWidth = cw - 80;
    if (hasImage) {
      const imageMaxW = 360;
      const gap = 44;
      const imageLeft = panelLeft + panelPad;
      const imageX = imageLeft + imageMaxW / 2;
      const textLeft = imageLeft + imageMaxW + gap;
      const textRight = panelRight - panelPad;
      const photo = s.add.image(imageX, cy + 10, imageKey);
      const maxW = 360;
      const maxH = hasChoices ? 210 : 250;
      photo.setScale(Math.min(maxW / photo.width, maxH / photo.height));
      cont.add(photo);
      bodyX = textLeft;
      bodyY = cy - 170;
      bodyWidth = Math.max(220, textRight - textLeft);
    }

    const bodyText = s.add
      .text(bodyX, bodyY, body, {
        fontFamily: FONT,
        fontSize: hasImage ? "21px" : "23px",
        color: "#f2ecd8",
        align: this.align(),
        lineSpacing: 6,
        wordWrap: { width: bodyWidth },
      })
      .setOrigin(hasImage ? 0 : 0.5, 0);
    cont.add(bodyText);
    const choicesTop = cy + ch / 2 - (hasChoices ? 142 : 0);
    const bodyMaxH = (hasChoices ? choicesTop - 18 : cy + ch / 2 - 98) - bodyY;
    fitText(bodyText, bodyWidth, bodyMaxH, hasImage ? 15 : 16);

    if (hasChoices) {
      choices.forEach((choice, i) => {
        const bx = cx + (i % 2 === 0 ? -190 : 190);
        const by = choicesTop + Math.floor(i / 2) * 58;
        const choiceBtn = this.makeButton(
          bx,
          by,
          choice,
          () => {
            cont.destroy();
            if (onAnswer) onAnswer(i === correctIndex, i);
          },
          { width: 350, height: 50, fontSize: "18px", color: COLORS.panelLight }
        );
        cont.add(choiceBtn);
      });
      return cont;
    }

    const btn = this.makeButton(cx, cy + ch / 2 - 44, button || t("btn_got_it"), () => {
      cont.destroy();
      if (onClose) onClose();
    });
    cont.add(btn);
    return cont;
  }

  /** Transient banner near the top; auto-fades. */
  toast(text, { color = "#f2ecd8", bg = COLORS.panel, duration = 2200 } = {}) {
    const s = this.scene;
    const y = 90;
    const label = s.add
      .text(GAME_WIDTH / 2, y, text, {
        fontFamily: FONT,
        fontSize: "26px",
        color,
        align: "center",
        backgroundColor: "rgba(0,0,0,0.001)",
        padding: { x: 18, y: 10 },
        wordWrap: { width: GAME_WIDTH - 200 },
      })
      .setOrigin(0.5)
      .setDepth(1800)
      .setScrollFactor(0);
    const plate = s.add
      .rectangle(GAME_WIDTH / 2, y, label.width + 36, label.height + 20, bg, 0.9)
      .setDepth(1799)
      .setScrollFactor(0);
    s.tweens.add({
      targets: [label, plate],
      alpha: 0,
      delay: duration,
      duration: 500,
      onComplete: () => {
        label.destroy();
        plate.destroy();
      },
    });
    return label;
  }

  /** Persistent objective banner at the top-left (or top-right in RTL). */
  banner(text) {
    const s = this.scene;
    const rtl = isRTL();
    const x = rtl ? GAME_WIDTH - 24 : 24;
    const label = s.add
      .text(x, 20, text, {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#f2ecd8",
        align: this.align(),
        wordWrap: { width: 560 },
      })
      .setOrigin(rtl ? 1 : 0, 0)
      .setDepth(900)
      .setScrollFactor(0);
    const plate = s.add
      .rectangle(
        rtl ? GAME_WIDTH - 12 : 12,
        12,
        label.width + 24,
        label.height + 16,
        COLORS.panel,
        0.7
      )
      .setOrigin(rtl ? 1 : 0, 0)
      .setDepth(899)
      .setScrollFactor(0);
    return {
      setText: (str) => {
        label.setText(str);
        plate.setSize(label.width + 24, label.height + 16);
      },
      destroy: () => {
        label.destroy();
        plate.destroy();
      },
    };
  }

  /** A rounded pill button as a container; returns it so callers can position/add. */
  makeButton(x, y, text, onClick, opts = {}) {
    const s = this.scene;
    const w = opts.width || 240;
    const h = opts.height || 56;
    const cont = s.add.container(x, y).setScrollFactor(0);
    const bg = s.add
      .rectangle(0, 0, w, h, opts.color || COLORS.armyGreen, 1)
      .setStrokeStyle(2, COLORS.sand)
      .setInteractive({ useHandCursor: true });
    const label = s.add
      .text(0, 0, text, {
        fontFamily: FONT,
        fontSize: opts.fontSize || "24px",
        color: "#f2ecd8",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: w - 18 },
      })
      .setOrigin(0.5);
    fitText(label, w - 18, h - 10, 13);
    cont.add([bg, label]);
    bg.on("pointerover", () => bg.setFillStyle(COLORS.panelLight, 1));
    bg.on("pointerout", () => bg.setFillStyle(opts.color || COLORS.armyGreen, 1));
    bg.on("pointerdown", () => cont.setScale(0.96));
    bg.on("pointerup", () => {
      cont.setScale(1);
      if (onClick) onClick();
    });
    cont.setSize(w, h);
    cont.bg = bg;
    cont.label = label;
    return cont;
  }
}

function fitText(text, maxW, maxH, minPx) {
  let size = parseInt(text.style.fontSize, 10) || 18;
  while ((text.width > maxW || text.height > maxH) && size > minPx) {
    size -= 1;
    text.setFontSize(size);
  }
}
