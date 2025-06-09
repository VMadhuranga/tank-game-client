import { Scene, Types } from "phaser";

export class MainGame extends Scene {
  playerTank: Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor() {
    super("MainGame");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("playerTank", "tank_blue.png");
  }

  create() {
    this.playerTank = this.physics.add.sprite(300, 300, "playerTank");
    this.playerTank.setCollideWorldBounds(true);
  }

  update(): void {
    let cursors = this.input.keyboard?.createCursorKeys();

    if (cursors?.up.isDown) {
      this.playerTank.setAngle(180);
      this.playerTank.setVelocity(0, -200);
    } else if (cursors?.down.isDown) {
      this.playerTank.setAngle(0);
      this.playerTank.setVelocity(0, 200);
    } else if (cursors?.left.isDown) {
      this.playerTank.setAngle(90);
      this.playerTank.setVelocity(-200, 0);
    } else if (cursors?.right.isDown) {
      this.playerTank.setAngle(270);
      this.playerTank.setVelocity(200, 0);
    } else {
      this.playerTank.setVelocity(0, 0);
      this.playerTank.setAngle(this.playerTank.angle);
    }
  }
}
