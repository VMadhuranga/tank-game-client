import { Scene, Types } from "phaser";

type Event = {
  type: string;
  payload: any;
};

type Player = {
  id: string;
  pX: number;
  pY: number;
};

export class MainGame extends Scene {
  playerTank: Types.Physics.Arcade.SpriteWithDynamicBody;
  players: Map<string, Types.Physics.Arcade.SpriteWithDynamicBody>;
  lastFired: number = 0;
  socket;

  constructor() {
    super("MainGame");
    this.socket = new WebSocket(`ws://${document.location.host}/ws`);
  }

  requestNewPlayer() {
    this.socket.send(
      JSON.stringify({ type: "new_player", payload: null } as Event)
    );
  }

  addToPlayers(p: Player) {
    this.players.set(p.id, this.physics.add.sprite(p.pX, p.pY, "playerTank"));
  }

  removeFromPlayers(p: Player) {
    this.players.get(p.id)?.disableBody(true, true);
    this.players.delete(p.id);
  }

  handleEvents(ev: Event) {
    switch (ev.type) {
      case "new_player": {
        const player: Player = ev.payload;
        this.addToPlayers(player);
        break;
      }
      case "all_players": {
        const players: Player[] = ev.payload;
        for (const player of players) {
          this.addToPlayers(player);
        }
        break;
      }
      case "remove_player": {
        const player: Player = ev.payload;
        this.removeFromPlayers(player);
        break;
      }
      default:
        break;
    }
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("playerTank", "tank_blue.png");
    this.load.image("enemyTank", "tank_sand.png");
    this.load.image("playerTankBullet", "bulletBlue2_outline.png");
  }

  create() {
    this.players = new Map();
    // this.playerTank = this.physics.add.sprite(300, 300, "playerTank");
    // this.playerTank.setCollideWorldBounds(true);
    // this.players.set("1", this.physics.add.sprite(300, 300, "playerTank"));

    this.requestNewPlayer();
    this.socket.addEventListener("message", (ev) => {
      const eventData: Event = JSON.parse(ev.data);
      this.handleEvents(eventData);
    });
  }

  // update(time: number): void {
  //   let cursors = this.input.keyboard?.createCursorKeys();

  //   if (cursors?.up.isDown) {
  //     this.playerTank.setAngle(-180);
  //     this.playerTank.setVelocity(0, -200);
  //   } else if (cursors?.down.isDown) {
  //     this.playerTank.setAngle(0);
  //     this.playerTank.setVelocity(0, 200);
  //   } else if (cursors?.right.isDown) {
  //     this.playerTank.setAngle(-90);
  //     this.playerTank.setVelocity(200, 0);
  //   } else if (cursors?.left.isDown) {
  //     this.playerTank.setAngle(90);
  //     this.playerTank.setVelocity(-200, 0);
  //   } else {
  //     this.playerTank.setVelocity(0, 0);
  //     this.playerTank.setAngle(this.playerTank.angle);
  //   }

  //   if (cursors?.space.isDown && time > this.lastFired) {
  //     const playerTankBulletConfig = {
  //       pX: this.playerTank.x,
  //       pY: this.playerTank.y,
  //       angle: 0,
  //       vX: 0,
  //       vY: 0,
  //     };

  //     if (this.playerTank.angle === -180) {
  //       playerTankBulletConfig.pY -= 35;
  //       playerTankBulletConfig.angle = 0;
  //       playerTankBulletConfig.vX = 0;
  //       playerTankBulletConfig.vY = -300;
  //     } else if (this.playerTank.angle === 0) {
  //       playerTankBulletConfig.pY += 35;
  //       playerTankBulletConfig.angle = -180;
  //       playerTankBulletConfig.vX = 0;
  //       playerTankBulletConfig.vY = 300;
  //     } else if (this.playerTank.angle === -90) {
  //       playerTankBulletConfig.pX += 35;
  //       playerTankBulletConfig.angle = 90;
  //       playerTankBulletConfig.vX = 300;
  //       playerTankBulletConfig.vY = 0;
  //     } else if (this.playerTank.angle === 90) {
  //       playerTankBulletConfig.pX -= 35;
  //       playerTankBulletConfig.angle = -90;
  //       playerTankBulletConfig.vX = -300;
  //       playerTankBulletConfig.vY = 0;
  //     }

  //     const playerTankBullet = this.physics.add.sprite(
  //       playerTankBulletConfig.pX,
  //       playerTankBulletConfig.pY,
  //       "playerTankBullet"
  //     );
  //     playerTankBullet.setAngle(playerTankBulletConfig.angle);
  //     playerTankBullet.setVelocity(
  //       playerTankBulletConfig.vX,
  //       playerTankBulletConfig.vY
  //     );

  //     this.lastFired = time + 300;
  //   }
  // }
}
