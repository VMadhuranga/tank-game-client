import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  create() {
    if (!window["WebSocket"]) {
      this.add
        .text(10, 10, "Your browser does not support web socket")
        .setFontSize(50)
        .setPadding(10);
    } else {
      this.scene.start("MainMenu");
    }
  }
}
