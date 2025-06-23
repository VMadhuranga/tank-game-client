import { Scene } from "phaser";

export class Instructions extends Scene {
  constructor() {
    super("Instructions");
  }

  create() {
    this.add.text(10, 10, "Instructions").setFontSize(50).setPadding(10);

    this.add
      .text(
        10,
        125,
        `- Press Up arrow key to Go Up
- Press Down arrow key to Go Down
- Press Left arrow key to Go Left
- Press Right arrow key to Go Right
- Press Spacebar to Shoot
- Press Escape key to Exit the Game when playing`
      )
      .setFontSize(40)
      .setWordWrapWidth(1000);

    const backToMainMenuButton = this.add
      .text(10, 475, "Back to Main Menu")
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
