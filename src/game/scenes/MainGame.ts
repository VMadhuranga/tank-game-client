import { Scene, Types } from "phaser";

export class MainGame extends Scene {
  playerTank: Types.Physics.Arcade.SpriteWithDynamicBody;
  lastFired: number = 0;

  constructor() {
    super("MainGame");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("playerTank", "tank_blue.png");
    this.load.image("playerTankBullet", "bulletBlue2_outline.png");
  }

  create() {
    this.playerTank = this.physics.add.sprite(300, 300, "playerTank");
    this.playerTank.setCollideWorldBounds(true);
  }

  update(time: number): void {
    let cursors = this.input.keyboard?.createCursorKeys();

    if (cursors?.up.isDown) {
      this.playerTank.setAngle(-180);
      this.playerTank.setVelocity(0, -200);
    } else if (cursors?.down.isDown) {
      this.playerTank.setAngle(0);
      this.playerTank.setVelocity(0, 200);
    } else if (cursors?.right.isDown) {
      this.playerTank.setAngle(-90);
      this.playerTank.setVelocity(200, 0);
    } else if (cursors?.left.isDown) {
      this.playerTank.setAngle(90);
      this.playerTank.setVelocity(-200, 0);
    } else {
      this.playerTank.setVelocity(0, 0);
      this.playerTank.setAngle(this.playerTank.angle);
    }

    if (cursors?.space.isDown && time > this.lastFired) {
      const playerTankBulletConfig = {
        pX: this.playerTank.x,
        pY: this.playerTank.y,
        angle: 0,
        vX: 0,
        vY: 0,
      };

      if (this.playerTank.angle === -180) {
        playerTankBulletConfig.pY -= 35;
        playerTankBulletConfig.angle = 0;
        playerTankBulletConfig.vX = 0;
        playerTankBulletConfig.vY = -300;
      } else if (this.playerTank.angle === 0) {
        playerTankBulletConfig.pY += 35;
        playerTankBulletConfig.angle = -180;
        playerTankBulletConfig.vX = 0;
        playerTankBulletConfig.vY = 300;
      } else if (this.playerTank.angle === -90) {
        playerTankBulletConfig.pX += 35;
        playerTankBulletConfig.angle = 90;
        playerTankBulletConfig.vX = 300;
        playerTankBulletConfig.vY = 0;
      } else if (this.playerTank.angle === 90) {
        playerTankBulletConfig.pX -= 35;
        playerTankBulletConfig.angle = -90;
        playerTankBulletConfig.vX = -300;
        playerTankBulletConfig.vY = 0;
      }

      const playerTankBullet = this.physics.add.sprite(
        playerTankBulletConfig.pX,
        playerTankBulletConfig.pY,
        "playerTankBullet"
      );
      playerTankBullet.setAngle(playerTankBulletConfig.angle);
      playerTankBullet.setVelocity(
        playerTankBulletConfig.vX,
        playerTankBulletConfig.vY
      );

      this.lastFired = time + 300;
    }
  }
}
