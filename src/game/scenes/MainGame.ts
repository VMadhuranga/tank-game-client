import { Scene, Types } from "phaser";

type Event = {
  type: string;
  payload: any;
};

const EventNewPlayer = "new_player";
const EventAllPlayers = "all_players";
const EventRemovePlayer = "remove_player";
const EventMovePlayer = "move_player";

type Player = {
  id: string;
  pX: number;
  pY: number;
  angle: number;
};

export class MainGame extends Scene {
  players: Map<string, Types.Physics.Arcade.SpriteWithDynamicBody>;
  playerTank: Types.Physics.Arcade.SpriteWithDynamicBody;
  playerID: string;
  lastFired = 0;
  tankSpeed = 3;
  socket;

  constructor() {
    super("MainGame");
    this.socket = new WebSocket(`ws://${document.location.host}/ws`);
  }

  requestNewPlayer() {
    this.socket.send(
      JSON.stringify({ type: EventNewPlayer, payload: null } as Event)
    );
  }

  requestMovePlayer(p: Player) {
    this.socket.send(
      JSON.stringify({
        type: EventMovePlayer,
        payload: p,
      } as Event)
    );
  }

  setPlayerTank() {
    this.playerTank = this.players.get(
      this.playerID
    ) as Types.Physics.Arcade.SpriteWithDynamicBody;
  }

  addToPlayers(p: Player) {
    this.players.set(
      p.id,
      this.physics.add
        .sprite(p.pX, p.pY, "playerTank")
        .setAngle(p.angle)
        .setCollideWorldBounds(true)
    );
  }

  removeFromPlayers(p: Player) {
    this.players.get(p.id)?.disableBody(true, true);
    this.players.delete(p.id);
  }

  movePlayer(p: Player) {
    this.players.get(p.id)?.setPosition(p.pX, p.pY).setAngle(p.angle);
  }

  handleEvents(ev: Event) {
    switch (ev.type) {
      case EventNewPlayer: {
        const player: Player = ev.payload;
        this.addToPlayers(player);

        if (!this.playerID) {
          this.playerID = player.id;
          this.setPlayerTank();
        }
        break;
      }
      case EventAllPlayers: {
        const players: Player[] = ev.payload;
        for (const player of players) {
          this.addToPlayers(player);
        }
        break;
      }
      case EventRemovePlayer: {
        const player: Player = ev.payload;
        this.removeFromPlayers(player);
        break;
      }
      case EventMovePlayer: {
        const player: Player = ev.payload;
        this.movePlayer(player);
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

    this.requestNewPlayer();
    this.socket.addEventListener("message", (ev) => {
      const eventData: Event = JSON.parse(ev.data);
      this.handleEvents(eventData);
    });
  }

  update(time: number, delta: number): void {
    let cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.up.isDown) {
      this.playerTank
        .setPosition(this.playerTank.x, this.playerTank.y - this.tankSpeed)
        .setAngle(-180);
    } else if (cursors?.down.isDown) {
      this.playerTank
        .setPosition(this.playerTank.x, this.playerTank.y + this.tankSpeed)
        .setAngle(0);
    } else if (cursors?.right.isDown) {
      this.playerTank
        .setPosition(this.playerTank.x + this.tankSpeed, this.playerTank.y)
        .setAngle(-90);
    } else if (cursors?.left.isDown) {
      this.playerTank
        .setPosition(this.playerTank.x - this.tankSpeed, this.playerTank.y)
        .setAngle(90);
    } else {
      this.playerTank
        .setPosition(this.playerTank.x, this.playerTank.y)
        .setAngle(this.playerTank.angle);
    }

    if (
      cursors?.up.isDown ||
      cursors?.down.isDown ||
      cursors?.right.isDown ||
      cursors?.left.isDown
    ) {
      this.playerTank.updateDisplayOrigin();
      this.requestMovePlayer({
        id: this.playerID,
        pX: this.playerTank.x,
        pY: this.playerTank.y,
        angle: this.playerTank.angle,
      });
    }

    // if (cursors?.space.isDown && time > this.lastFired) {
    //   const playerTankBulletConfig = {
    //     pX: this.playerTank.x,
    //     pY: this.playerTank.y,
    //     angle: 0,
    //     vX: 0,
    //     vY: 0,
    //   };

    //   if (this.playerTank.angle === -180) {
    //     playerTankBulletConfig.pY -= 35;
    //     playerTankBulletConfig.angle = 0;
    //     playerTankBulletConfig.vX = 0;
    //     playerTankBulletConfig.vY = -300;
    //   } else if (this.playerTank.angle === 0) {
    //     playerTankBulletConfig.pY += 35;
    //     playerTankBulletConfig.angle = -180;
    //     playerTankBulletConfig.vX = 0;
    //     playerTankBulletConfig.vY = 300;
    //   } else if (this.playerTank.angle === -90) {
    //     playerTankBulletConfig.pX += 35;
    //     playerTankBulletConfig.angle = 90;
    //     playerTankBulletConfig.vX = 300;
    //     playerTankBulletConfig.vY = 0;
    //   } else if (this.playerTank.angle === 90) {
    //     playerTankBulletConfig.pX -= 35;
    //     playerTankBulletConfig.angle = -90;
    //     playerTankBulletConfig.vX = -300;
    //     playerTankBulletConfig.vY = 0;
    //   }

    //   const playerTankBullet = this.physics.add.sprite(
    //     playerTankBulletConfig.pX,
    //     playerTankBulletConfig.pY,
    //     "playerTankBullet"
    //   );
    //   playerTankBullet.setAngle(playerTankBulletConfig.angle);
    //   playerTankBullet.setVelocity(
    //     playerTankBulletConfig.vX,
    //     playerTankBulletConfig.vY
    //   );

    //   this.lastFired = time + 300;
    // }
  }
}
