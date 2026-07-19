import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "./theme.js";
import BootScene from "./scenes/BootScene.js";
import AboutScene from "./scenes/AboutScene.js";
import MenuScene from "./scenes/MenuScene.js";
import Stage1Scene from "./scenes/Stage1Scene.js";
import StageGearScene from "./scenes/StageGearScene.js";
import StageObstacleScene from "./scenes/StageObstacleScene.js";
import Stage2Scene from "./scenes/Stage2Scene.js";
import Stage3Scene from "./scenes/Stage3Scene.js";
import Stage4Scene from "./scenes/Stage4Scene.js";
import Stage5Scene from "./scenes/Stage5Scene.js";
import Stage6Scene from "./scenes/Stage6Scene.js";
import Stage7Scene from "./scenes/Stage7Scene.js";
import Stage8Scene from "./scenes/Stage8Scene.js";
import StageCompleteScene from "./scenes/StageCompleteScene.js";
import CreditsScene from "./scenes/CreditsScene.js";

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
    // Multi-touch allows steering + pedal together; gamepad enables stick/trigger driving.
    input: { activePointers: 3, gamepad: true },
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    render: { pixelArt: false, antialias: true, roundPixels: true },
    scene: [
      BootScene,
      AboutScene,
      MenuScene,
      Stage1Scene,
      StageGearScene,
      StageObstacleScene,
      Stage2Scene,
      Stage3Scene,
      Stage4Scene,
      Stage5Scene,
      Stage6Scene,
      Stage7Scene,
      Stage8Scene,
      StageCompleteScene,
      CreditsScene,
    ],
  };
}
