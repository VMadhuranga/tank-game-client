import { Scene } from "phaser";

type Event = {
  type: string;
  payload: any;
};

const EventNewPlayer = "new_player";
const EventOtherPlayers = "other_players";
const EventRemovePlayer = "remove_player";
const EventMovePlayer = "move_player";
const EventBulletHit = "bullet_hit";
const EventShoot = "shoot";

type Player = {
  id: string;
  pX: number;
  pY: number;
  angle: number;
};

type Bullet = {
  pX: number;
  pY: number;
  angle: number;
  vX: number;
  vY: number;
};

export class MainGame extends Scene {
  socket: WebSocket;
  players: Map<string, Phaser.Physics.Arcade.Sprite>;
  playerTank: Phaser.Physics.Arcade.Sprite;
  playerBullets: Phaser.Physics.Arcade.Group;
  enemyBullets: Phaser.Physics.Arcade.Group;
  playerID: string;
  lastFired = 0;
  tankSpeed = 3;

  constructor() {
    super("MainGame");
  }

  sendNewPlayerEvent() {
    this.socket.send(
      JSON.stringify({ type: EventNewPlayer, payload: null } as Event)
    );
  }

  sendOtherPlayersEvent() {
    this.socket.send(
      JSON.stringify({ type: EventOtherPlayers, payload: null } as Event)
    );
  }

  sendMovePlayerEvent(p: Player) {
    this.socket.send(
      JSON.stringify({
        type: EventMovePlayer,
        payload: p,
      } as Event)
    );
  }

  sendBulletHitEvent(p: Player) {
    this.socket.send(
      JSON.stringify({
        type: EventBulletHit,
        payload: p,
      } as Event)
    );
  }

  sendShootEvent(b: Bullet) {
    this.socket.send(
      JSON.stringify({
        type: EventShoot,
        payload: b,
      } as Event)
    );
  }

  setPlayerTank() {
    this.playerTank = this.players
      .get(this.playerID)
      ?.setTexture("playerTank") as Phaser.Physics.Arcade.Sprite;
  }

  addToPlayers(p: Player) {
    this.players.set(
      p.id,
      this.physics.add
        .sprite(p.pX, p.pY, "enemyTank")
        .setAngle(p.angle)
        .setCollideWorldBounds(true)
        .setName(p.id)
    );
  }

  removeFromPlayers(p: Player) {
    this.players.get(p.id)?.destroy(true);
    this.players.delete(p.id);
  }

  movePlayer(p: Player) {
    this.players.get(p.id)?.setPosition(p.pX, p.pY).setAngle(p.angle);
  }

  exitGamePlay(sceneKey: string) {
    this.players.clear();
    this.playerTank.destroy();
    this.playerBullets.destroy(true);
    this.enemyBullets.destroy(true);
    this.playerID = "";
    this.socket.close();
    this.scene.start(sceneKey);
  }

  exitGamePlayOnEscPress() {
    const escKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    if (escKey?.isDown) {
      this.exitGamePlay("MainMenu");
    }
  }

  handleEvents(ev: Event) {
    switch (ev.type) {
      case EventNewPlayer: {
        const player: Player = ev.payload;
        this.addToPlayers(player);

        if (!this.playerID) {
          this.playerID = player.id;
          this.setPlayerTank();
          this.sendOtherPlayersEvent();
        }

        break;
      }
      case EventOtherPlayers: {
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
      case EventBulletHit: {
        const player: Player = ev.payload;
        this.removeFromPlayers(player);
        if (this.playerID === player.id) {
          this.exitGamePlay("GameOver");
        }

        break;
      }
      case EventShoot: {
        const bullet: Bullet = ev.payload;

        const enemyTankBullet = this.physics.add.sprite(
          bullet.pX,
          bullet.pY,
          "enemyTankBullet"
        );
        this.enemyBullets.add(enemyTankBullet);

        enemyTankBullet
          .setAngle(bullet.angle)
          .setVelocity(bullet.vX, bullet.vY);

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
    this.load.image("enemyTankBullet", "bulletSand2_outline.png");
  }

  create() {
    this.players = new Map();
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.socket = new WebSocket(`ws://${document.location.host}/ws`);
    this.socket.addEventListener("open", () => {
      this.sendNewPlayerEvent();
    });
    this.socket.addEventListener("message", (ev) => {
      const eventData: Event = JSON.parse(ev.data);
      this.handleEvents(eventData);
    });
  }

  update(time: number): void {
    let cursors = this.input.keyboard?.createCursorKeys();
    if (cursors?.up.isDown) {
      this.playerTank
        ?.setPosition(this.playerTank.x, this.playerTank.y - this.tankSpeed)
        .setAngle(-180);
    } else if (cursors?.down.isDown) {
      this.playerTank
        ?.setPosition(this.playerTank.x, this.playerTank.y + this.tankSpeed)
        .setAngle(0);
    } else if (cursors?.right.isDown) {
      this.playerTank
        ?.setPosition(this.playerTank.x + this.tankSpeed, this.playerTank.y)
        .setAngle(-90);
    } else if (cursors?.left.isDown) {
      this.playerTank
        ?.setPosition(this.playerTank.x - this.tankSpeed, this.playerTank.y)
        .setAngle(90);
    } else {
      this.playerTank
        ?.setPosition(this.playerTank.x, this.playerTank.y)
        .setAngle(this.playerTank.angle);
    }

    if (
      cursors?.up.isDown ||
      cursors?.down.isDown ||
      cursors?.right.isDown ||
      cursors?.left.isDown
    ) {
      this.sendMovePlayerEvent({
        id: this.playerID,
        pX: this.playerTank.x,
        pY: this.playerTank.y,
        angle: this.playerTank.angle,
      });
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
      this.playerBullets.add(playerTankBullet);

      playerTankBullet
        .setAngle(playerTankBulletConfig.angle)
        .setVelocity(playerTankBulletConfig.vX, playerTankBulletConfig.vY);

      this.lastFired = time + 300;
      this.sendShootEvent({
        pX: playerTankBulletConfig.pX,
        pY: playerTankBulletConfig.pY,
        angle: playerTankBulletConfig.angle,
        vX: playerTankBulletConfig.vX,
        vY: playerTankBulletConfig.vY,
      });
    }

    this.physics.collide(
      this.playerBullets,
      [...this.players.values()],
      (player, bullet) => {
        bullet.destroy();

        if (player instanceof Phaser.Physics.Arcade.Sprite) {
          this.sendBulletHitEvent({
            id: player.name,
            pX: player.x,
            pY: player.y,
            angle: player.angle,
          });
        }
      },
      undefined,
      this
    );

    this.physics.collide(
      this.enemyBullets,
      [...this.players.values()],
      (player, bullet) => {
        bullet.destroy();

        if (player instanceof Phaser.Physics.Arcade.Sprite) {
          this.sendBulletHitEvent({
            id: player.name,
            pX: player.x,
            pY: player.y,
            angle: player.angle,
          });
        }
      },
      undefined,
      this
    );

    this.playerBullets.children.iterate((bullet) => {
      if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
        if (
          bullet.x < 0 ||
          bullet.x > this.sys.canvas.width ||
          bullet.y < 0 ||
          bullet.y > this.sys.canvas.height
        ) {
          bullet.destroy();
        }
      }
      return true;
    }, this);

    this.enemyBullets.children.iterate((bullet) => {
      if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
        if (
          bullet.x < 0 ||
          bullet.x > this.sys.canvas.width ||
          bullet.y < 0 ||
          bullet.y > this.sys.canvas.height
        ) {
          bullet.destroy();
        }
      }
      return true;
    }, this);

    this.exitGamePlayOnEscPress();
  }
}
