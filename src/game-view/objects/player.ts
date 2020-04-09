import { Bullet } from "./bullet";
import { RequestType } from "../../shared/RequestType";

export class Player extends Phaser.GameObjects.Image {
  private health!: number;
  private lastShoot!: number;
  private speed!: number;
  public username!: string;
  public ioClient!: any;
  private barrel!: Phaser.GameObjects.Image;
  private usernameView!: Phaser.GameObjects.Text;
  private lifeBar!: Phaser.GameObjects.Graphics;

  private bullets!: Phaser.GameObjects.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private rotateKeyLeft!: Phaser.Input.Keyboard.Key;
  private rotateKeyRight!: Phaser.Input.Keyboard.Key;
  private shootingKey!: Phaser.Input.Keyboard.Key;

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params: any) {
    super(params.scene, params.x, params.y, params.key, params.frame);
    this.username = params.username;
    this.ioClient = params.ioClient;
    this.initImage();

    this.scene.add.existing(this);
  }

  private initImage() {
    this.health = 1;
    this.lastShoot = 0;
    this.speed = 100;

    this.setOrigin(0.5, 0.5);
    this.setDepth(0);
    this.angle = 0;

    this.barrel = this.scene.add.image(this.x, this.y, "barrelBlue");
    this.barrel.setOrigin(0.5, 1);
    this.barrel.setDepth(1);
    this.usernameView = this.scene.add
      .text(0, 0, this.username, {
        fontFamily: '"Roboto Condensed"',
      })
      .setFontSize(25);
    this.usernameView.setOrigin(0.5, -1.8);
    this.usernameView.setDepth(1);

    this.lifeBar = this.scene.add.graphics();
    this.redrawLifebar();

    this.bullets = this.scene.add.group({
      active: true,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.rotateKeyLeft = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A
    );
    this.rotateKeyRight = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.shootingKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.scene.physics.world.enable(this);
    this.ioClient.on(RequestType.UPDATEHEAL, (data: any) => {
      if (data.username === this.username) {
        this.updateHealthByValue(data.health, false);
      }
    });
    this.ioClient.on(RequestType.ADDBULLET, (data: any) => {
      const tempKey =
        this.username === data.username ? "bulletBlue" : "bulletRed";
      this.bullets.add(
        new Bullet({
          scene: this.scene,
          x: data.x,
          y: data.y,
          key: tempKey,
          rotation: data.rotation,
          source: data.username,
        })
      );
    });
  }

  update(): void {
    if (this.active) {
      this.barrel.x = this.x;
      this.barrel.y = this.y;
      this.lifeBar.x = this.x;
      this.lifeBar.y = this.y;
      this.usernameView.x = this.x;
      this.usernameView.y = this.y;
      this.handleInput();
      this.handleShooting();
    } else {
      this.barrel.destroy();
      this.usernameView.destroy();
      this.lifeBar.destroy();
      this.bullets.children.entries.forEach((child) => {
        child.destroy();
      });
      this.bullets.clear();
      this.bullets.clear(true);
      this.destroy();
    }
  }

  private handleInput() {
    const body: Phaser.Physics.Arcade.Body = this
      .body as Phaser.Physics.Arcade.Body;
    if (this.cursors.up && this.cursors.up.isDown) {
      this.scene.physics.velocityFromRotation(
        this.rotation - Math.PI / 2,
        this.speed,
        body.velocity
      );
      this.updatePosition();
    } else if (this.cursors.down && this.cursors.down.isDown) {
      this.scene.physics.velocityFromRotation(
        this.rotation - Math.PI / 2,
        -this.speed,
        body.velocity
      );
      this.updatePosition();
    } else {
      body.setVelocity(0, 0);
    }

    if (this.cursors.left && this.cursors.left.isDown) {
      this.rotation -= 0.02;
      this.updateRotation();
    } else if (this.cursors.right && this.cursors.right.isDown) {
      this.rotation += 0.02;
      this.updateRotation();
    }

    if (this.rotateKeyLeft.isDown) {
      this.barrel.rotation -= 0.05;
      this.updateRotation();
    } else if (this.rotateKeyRight.isDown) {
      this.barrel.rotation += 0.05;
      this.updateRotation();
    }
  }
  private updateRotation() {
    this.ioClient.emit(RequestType.CHANGEROTATION, {
      rotationTank: this.rotation,
      rotationTun: this.barrel.rotation,
      username: this.username,
    });
  }
  private updatePosition() {
    this.ioClient.emit(RequestType.CHANGEPOSITION, {
      x: this.x,
      y: this.y,
      username: this.username,
    });
  }
  private handleShooting(): void {
    if (this.shootingKey.isDown && this.scene.time.now > this.lastShoot) {
      this.scene.cameras.main.shake(20, 0.005);
      this.scene.tweens.add({
        targets: this,
        props: { alpha: 0.8 },
        delay: 0,
        duration: 5,
        ease: "Power1",
        easeParams: undefined,
        hold: 0,
        repeat: 0,
        repeatDelay: 0,
        yoyo: true,
        paused: false,
      });

      this.ioClient.emit(RequestType.ADDBULLET, {
        x: this.barrel.x,
        y: this.barrel.y,
        rotation: this.barrel.rotation,
        username: this.username,
      });

      this.lastShoot = this.scene.time.now + 200;
    }
  }

  private redrawLifebar(): void {
    this.lifeBar.clear();
    this.lifeBar.fillStyle(0xe66a28, 1);
    this.lifeBar.fillRect(
      -this.width / 2,
      this.height / 2,
      this.width * this.health,
      15
    );
    this.lifeBar.lineStyle(2, 0xffffff);
    this.lifeBar.strokeRect(-this.width / 2, this.height / 2, this.width, 15);
    this.lifeBar.setDepth(1);
  }

  public updateHealth(): void {
    this.updateHealthByValue(this.health - 0.05, true);
  }

  private updateHealthByValue(health: number, updateAll: boolean) {
    if (this.health > 0) {
      this.health = health;
      this.redrawLifebar();
      if (updateAll)
        this.ioClient.emit(RequestType.UPDATEHEAL, {
          health: this.health,
          username: this.username,
        });
    } else {
      this.health = 0;
      this.active = false;
      this.ioClient.emit(RequestType.KILLPLAYER, { username: this.username });
    }
  }
}
