import { RequestType } from "../../shared/RequestType";

export class Enemy extends Phaser.GameObjects.Image {
  private health!: number;
  public username!: string;
  public ioClient!: any;

  private barrel!: Phaser.GameObjects.Image;
  private usernameView!: Phaser.GameObjects.Text;
  private lifeBar!: Phaser.GameObjects.Graphics;

  private bullets!: Phaser.GameObjects.Group;

  public getBarrel(): Phaser.GameObjects.Image {
    return this.barrel;
  }

  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params: any) {
    super(params.scene, params.x, params.y, params.key, params.frame);
    this.username = params.username;
    this.ioClient = params.ioClient;
    this.initContainer();
    this.scene.add.existing(this);
  }

  private initContainer() {
    this.health = 1;
    this.setDepth(0);

    this.barrel = this.scene.add.image(0, 0, "barrelRed");
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
    this.scene.physics.world.enable(this);
    this.ioClient.on(RequestType.UPDATEHEAL, (data: any) => {
      if (data.username === this.username) {
        this.updateHealthByValue(data.health, false);
      }
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
    } else {
      this.barrel.destroy();
      this.lifeBar.destroy();
      this.usernameView.destroy();
      this.destroy();
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
      if (updateAll) {
        this.ioClient.emit(RequestType.UPDATEHEAL, {
          health: this.health,
          username: this.username,
        });
      }
    } else {
      this.health = 0;
      this.ioClient.emit(RequestType.KILLPLAYER, { username: this.username });
      this.active = false;
    }
  }
}
