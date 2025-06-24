import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  async create() {
    if (!window["WebSocket"]) {
      this.add
        .text(10, 10, "Your browser does not support web socket")
        .setFontSize(50)
        .setPadding(10);

      return;
    }

    let isPlayable = false;
    try {
      const res = await fetch(document.location.origin + "/playable", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      isPlayable = data.playable;
    } catch (error: any) {
      console.error(error.message);
    }

    if (!isPlayable) {
      this.add
        .text(10, 10, "Maximum player connection reached")
        .setFontSize(50)
        .setPadding(10);

      return;
    }

    this.scene.start("MainMenu");
  }
}
