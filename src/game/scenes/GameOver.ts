import { Scene } from "phaser";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    this.add.text(10, 10, "Game Over").setFontSize(50).setPadding(10);

    const backToMainMenuButton = this.add
      .text(10, 125, "Back to Main Menu")
      .setFontSize(40)
      .setBackgroundColor("#2d2d2d")
      .setPadding(10)
      .setInteractive();

    backToMainMenuButton.addListener("pointerover", () => {
      backToMainMenuButton.setBackgroundColor("#8d8d8d");
    });
    backToMainMenuButton.addListener("pointerout", () => {
      backToMainMenuButton.setBackgroundColor("#2d2d2d");
    });
    backToMainMenuButton.addListener("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
