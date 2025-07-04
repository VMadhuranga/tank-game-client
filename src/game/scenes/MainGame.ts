import { Scene } from "phaser";

type Event = {
  type: string;
  payload: any;
};

const EventNewPlayer = "new_player";
const EventOtherPlayers = "other_players";
const EventRemovePlayer = "remove_player";
const EventMovePlayer = "move_player";
const EventPlayerHit = "player_hit";
const EventBulletHit = "bullet_hit";
const EventShoot = "shoot";

type Player = {
  id: string;
  pX: number;
  pY: number;
  angle: number;
};

type Bullet = {
  id: string;
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
  playerID: string;
  tankSpeed = 3;
  bullets: Map<string, Phaser.Physics.Arcade.Sprite>;
  lastFired = 0;

  constructor() {
    super("MainGame");
  }

  sendEvent(ev: Event) {
    this.socket.send(JSON.stringify(ev));
  }

  sendNewPlayerEvent() {
    this.sendEvent({ type: EventNewPlayer, payload: null });
  }

  sendOtherPlayersEvent() {
    this.sendEvent({ type: EventOtherPlayers, payload: null });
  }

  sendMovePlayerEvent(p: Player) {
    this.sendEvent({ type: EventMovePlayer, payload: p });
  }

  sendPlayerHitEvent(p: Player) {
    this.sendEvent({ type: EventPlayerHit, payload: p });
  }

  sendBulletHitEvent(b: Bullet) {
    this.sendEvent({ type: EventBulletHit, payload: b });
  }

  sendShootEvent(b: Bullet) {
    this.sendEvent({ type: EventShoot, payload: b });
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

  addToBullets(b: Bullet, textureKey: string) {
    this.bullets.set(
      b.id,
      this.physics.add
        .sprite(b.pX, b.pY, textureKey)
        .setAngle(b.angle)
        .setVelocity(b.vX, b.vY)
        .setName(b.id)
    );
  }

  removeFromBullets(b: Bullet) {
    this.bullets.get(b.id)?.destroy(true);
    this.bullets.delete(b.id);
  }

  exitGamePlay(sceneKey: string) {
    this.playerTank.destroy();
    this.playerID = "";
    this.players.clear();
    this.bullets.clear();
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
      case EventPlayerHit: {
        const player: Player = ev.payload;
        this.removeFromPlayers(player);

        if (this.playerID === player.id) {
          this.exitGamePlay("GameOver");
        }

        break;
      }
      case EventBulletHit: {
        const bullet: Bullet = ev.payload;
        this.removeFromBullets(bullet);

        break;
      }
      case EventShoot: {
        const bullet: Bullet = ev.payload;
        this.addToBullets(bullet, "enemyTankBullet");

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
    this.bullets = new Map();

    this.socket = new WebSocket(`wss://${document.location.host}/ws`);
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
      const bullet: Bullet = {
        id: crypto.randomUUID(),
        pX: this.playerTank.x,
        pY: this.playerTank.y,
        angle: 0,
        vX: 0,
        vY: 0,
      };

      if (this.playerTank.angle === -180) {
        bullet.pY -= 35;
        bullet.angle = 0;
        bullet.vX = 0;
        bullet.vY = -300;
      } else if (this.playerTank.angle === 0) {
        bullet.pY += 35;
        bullet.angle = -180;
        bullet.vX = 0;
        bullet.vY = 300;
      } else if (this.playerTank.angle === -90) {
        bullet.pX += 35;
        bullet.angle = 90;
        bullet.vX = 300;
        bullet.vY = 0;
      } else if (this.playerTank.angle === 90) {
        bullet.pX -= 35;
        bullet.angle = -90;
        bullet.vX = -300;
        bullet.vY = 0;
      }

      this.lastFired = time + 300;
      this.addToBullets(bullet, "playerTankBullet");
      this.sendShootEvent(bullet);
    }

    this.physics.overlap(
      [...this.bullets.values()],
      [...this.players.values()],
      (bullet, player) => {
        if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
          bullet.destroy();
          this.sendBulletHitEvent({
            id: bullet.name,
            pX: bullet.x,
            pY: bullet.y,
            angle: bullet.angle,
            vX: 0,
            vY: 0,
          });
        }
        if (player instanceof Phaser.Physics.Arcade.Sprite) {
          player.destroy();
          this.sendPlayerHitEvent({
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

    this.bullets.forEach((bullet) => {
      if (bullet instanceof Phaser.Physics.Arcade.Sprite) {
        if (
          bullet.x < 0 ||
          bullet.x > this.sys.canvas.width ||
          bullet.y < 0 ||
          bullet.y > this.sys.canvas.height
        ) {
          bullet.destroy(true);
        }
      }
    }, this);

    this.exitGamePlayOnEscPress();
  }
}
