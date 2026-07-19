import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "./theme.js";
import BootScene from "./scenes/BootScene.js";
import MenuScene from "./scenes/MenuScene.js";
import Stage1Scene from "./scenes/Stage1Scene.js";
import Stage2Scene from "./scenes/Stage2Scene.js";
import Stage3Scene from "./scenes/Stage3Scene.js";
import Stage4Scene from "./scenes/Stage4Scene.js";
import Stage5Scene from "./scenes/Stage5Scene.js";
import StageCompleteScene from "./scenes/StageCompleteScene.js";

export function createConfig() {
  return {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: COLORS.armyGreenDark,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    // Multi-touch: allow up to 3 pointers so steering + pedal can be pressed together.
    input: { activePointers: 3 },
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    render: { pixelArt: false, antialias: true, roundPixels: true },
    scene: [
      BootScene,
      MenuScene,
      Stage1Scene,
      Stage2Scene,
      Stage3Scene,
      Stage4Scene,
      Stage5Scene,
      StageCompleteScene,
    ],
  };
}
