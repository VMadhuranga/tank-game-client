import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.add.text(10, 10, "Main Menu").setFontSize(50).setPadding(10);

    const startButton = this.add
      .text(10, 125, "Start")
      .setFontSize(40)
      .setBackgroundColor("#2d2d2d")
      .setPadding(10)
      .setInteractive();

    startButton.addListener("pointerover", () => {
      startButton.setBackgroundColor("#8d8d8d");
    });
    startButton.addListener("pointerout", () => {
      startButton.setBackgroundColor("#2d2d2d");
    });
    startButton.addListener("pointerdown", () => {
      this.scene.start("MainGame");
    });

    const instructionsButton = this.add
      .text(10, 200, "Instructions")
      .setFontSize(40)
      .setBackgroundColor("#2d2d2d")
      .setPadding(10)
      .setInteractive();

    instructionsButton.addListener("pointerover", () => {
      instructionsButton.setBackgroundColor("#8d8d8d");
    });
    instructionsButton.addListener("pointerout", () => {
      instructionsButton.setBackgroundColor("#2d2d2d");
    });
    instructionsButton.addListener("pointerdown", () => {
      this.scene.start("Instructions");
    });
  }
}
