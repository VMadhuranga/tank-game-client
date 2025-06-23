import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.add.text(10, 10, "Main Menu").setFontSize(50).setPadding(10);

    const playButton = this.add
      .text(10, 125, "Play")
      .setFontSize(40)
      .setBackgroundColor("#2d2d2d")
      .setPadding(10)
      .setInteractive();

    playButton.addListener("pointerover", () => {
      playButton.setBackgroundColor("#8d8d8d");
    });
    playButton.addListener("pointerout", () => {
      playButton.setBackgroundColor("#2d2d2d");
    });
    playButton.addListener("pointerdown", () => {
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
