import { Player } from "../objects/player";
import { Enemy } from "../objects/enemy";
import { Obstacle } from "../objects/obstacles/obstacle";
import { RequestType } from "../../shared/RequestType";

export class GameScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private layer!: Phaser.Tilemaps.StaticTilemapLayer;
  private textConnPlayers!: Phaser.GameObjects.Text;

  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private obstacles!: Phaser.GameObjects.Group;

  private target!: Phaser.Math.Vector2;

  constructor() {
    super({
      key: "GameScene",
    });
  }

  init(): void {}

  create() {
    this.map = this.make.tilemap({ key: "levelMap" });
    this.tileset = this.map.addTilesetImage("tiles");
    this.layer = this.map.createStaticLayer("tileLayer", this.tileset, 0, 0);
    this.layer.setCollisionByProperty({ collide: true });
    this.obstacles = this.add.group({
      runChildUpdate: true,
    });
    this.enemies = this.add.group({});

    this.textConnPlayers = this.add
      .text(0, 0, "", {
        fontFamily: "Roboto Condensed",
      })
      .setFontSize(40);
    this.convertObjects();
    this.connectToSocket();
  }

  private createAfterGetData() {
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.player, this.obstacles);

    this.physics.add.collider(
      this.player.getBullets(),
      this.layer,
      this.bulletHitLayer,
      undefined,
      this
    );

    this.physics.add.collider(
      this.player.getBullets(),
      this.obstacles,
      this.bulletHitObstacles,
      undefined,
      this
    );
    this.enemies.children.each((enemy: any) => {
      this.physics.add.overlap(
        this.player.getBullets(),
        this.player,
        this.playerBulletHitEnemy,
        undefined,
        this
      );
      this.physics.add.overlap(
        this.player.getBullets(),
        enemy,
        this.playerBulletHitEnemy,
        undefined,
        this
      );
      this.physics.add.overlap(
        enemy.getBullets(),
        this.player,
        this.enemyBulletHitPlayer,
        undefined
      );

      this.physics.add.collider(
        enemy.getBullets(),
        this.obstacles,
        this.bulletHitObstacles,
        undefined
      );
      this.physics.add.collider(
        enemy.getBullets(),
        this.layer,
        this.bulletHitLayer,
        undefined
      );
    }, this);
    this.cameras.main.startFollow(this.player);
  }

  update(): void {
    if (this.player) {
      this.player.update();
    }
    if (this.enemies) {
      this.enemies.children.each((enemy: any) => {
        enemy.update();
      }, this);
    }
    if (this.textConnPlayers && this.player) {
      this.textConnPlayers.x = this.player.x;
      this.textConnPlayers.y = this.player.y;
      this.textConnPlayers.setOrigin(1.9, 13);
      this.textConnPlayers.setDepth(1);
    }
  }

  private convertObjects(): void {
    const objects = this.map.getObjectLayer("objects").objects as any[];
    objects.forEach((object) => {
      let obstacle = new Obstacle({
        scene: this,
        x: object.x,
        y: object.y - 40,
        key: object.type,
      });
      this.obstacles.add(obstacle);
    });
  }

  private bulletHitLayer(bullet: any): void {
    bullet.destroy();
  }

  private bulletHitObstacles(bullet: any, obstacle: any): void {
    bullet.destroy();
  }

  private enemyBulletHitPlayer(bullet: any, player: any): void {
    if (player.username !== bullet.source) {
      bullet.destroy();
      player.updateHealth();
    }
  }

  private playerBulletHitEnemy(bullet: any, enemy: any): void {
    if (enemy.username !== bullet.source) {
      bullet.destroy();
      enemy.updateHealth();
    }
  }

  private existUsername() {
    alert("this name exist!");
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  username: string = "guest" + this.getRandomInt(10000);
  connectedPlayers: number = 0;
  private connectToSocket() {
    const io = require("socket.io-client"),
      ioClient = io.connect("http://localhost:8000");
    const x = this.getRandomInt(1600);
    const y = this.getRandomInt(1200);
    ioClient.emit(RequestType.SETUSERNAME, {
      username: this.username,
      x: x,
      y: y,
    });
    ioClient.on(RequestType.USERNAMEEXIST, () => this.existUsername());

    ioClient.on(RequestType.GETCONNECTEDPLAYERS, (playerNb: number) => {
      this.connectedPlayers = playerNb;
      this.textConnPlayers.setText(
        "Connected players:" + this.connectedPlayers
      );
    });
    this.createPlayer(ioClient);
  }

  private createPlayer(ioClient: any) {
    ioClient.emit(RequestType.GETPLAYERS);

    ioClient.on(RequestType.SENDPLAYERS, (data: any[]) => {
      this.enemies = this.add.group({});
      data.forEach((elem) => {
        if (elem.username === this.username) {
          if (this.player) {
            this.player.x = elem.x;
            this.player.y = elem.y;
          } else {
            this.player = new Player({
              ioClient: ioClient,
              scene: this,
              x: elem.x,
              y: elem.y,
              key: "tankBlue",
              username: elem.username,
            });
          }
        } else {
          let enemy = new Enemy({
            scene: this,
            x: elem.x,
            y: elem.y,
            key: "tankRed",
            username: elem.username,
            ioClient: ioClient,
          });
          this.enemies.add(enemy);
        }
      });
      this.createAfterGetData();
    });

    ioClient.on(RequestType.SENDROTATION, (data: any) => {
      const rotationTank = data.rotationTank;
      const rotationTun = data.rotationTun;
      const username = data.username;
      if (this.enemies) {
        this.enemies.children.iterate((enemy: any) => {
          if (enemy.username === username) {
            enemy.getBarrel().angle = rotationTun * Phaser.Math.RAD_TO_DEG;
            enemy.angle = rotationTank * Phaser.Math.RAD_TO_DEG;
          }
        });
      }
    });

    ioClient.on(RequestType.KILLPLAYER, (data: any) => {
      const username = data.username;
      if (this.player.username === username) {
        this.physics.world.colliders.destroy();
        this.events.destroy();
        this.player.active = false;
        this.scene.remove("GameScene");
        this.scene.start("MenuScene");
      }
    });

    ioClient.on(RequestType.DISCONNECT, (data: any) => {
      const username = data.username;
      this.disconnectEnemy(username);
    });

    ioClient.on(RequestType.SENDPOSITION, (data: any) => {
      const x = data.x;
      const y = data.y;
      const username = data.username;
      if (this.enemies) {
        this.enemies.children.iterate((enemy: any) => {
          if (enemy.username === username) {
            enemy.x = x;
            enemy.y = y;
          }
        });
      }
    });
  }

  disconnectEnemy(username: string) {
    if (this.enemies) {
      this.enemies.children.iterate((enemy: any) => {
        if (enemy.username === username) {
          enemy.active = false;
        }
      });
    }
  }
}
