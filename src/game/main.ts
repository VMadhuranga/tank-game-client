import { AUTO, Game, Scale, Types } from "phaser";
import { MainGame } from "./scenes/MainGame";
import { MainMenu } from "./scenes/MainMenu";
import { Instructions } from "./scenes/Instructions";
import { GameOver } from "./scenes/GameOver";
import { Boot } from "./scenes/Boot";

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 1024,
  parent: "game-container",
  backgroundColor: "#000",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [Boot, MainMenu, Instructions, MainGame, GameOver],
  physics: {
    default: "arcade",
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
