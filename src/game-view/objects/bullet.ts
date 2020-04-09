export class Bullet extends Phaser.GameObjects.Image {
  private bulletSpeed!: number;
  public source!: string;
  constructor(params: any) {
    super(params.scene, params.x, params.y, params.key);
    this.source = params.source;
    this.rotation = params.rotation;
    this.initImage();
    this.scene.add.existing(this);
  }

  private initImage(): void {
    this.bulletSpeed = 1000;

    this.setOrigin(0.5, 0.5);
    this.setDepth(2);

    this.scene.physics.world.enable(this);
    const body: Phaser.Physics.Arcade.Body = this
      .body as Phaser.Physics.Arcade.Body;
    this.scene.physics.velocityFromRotation(
      this.rotation - Math.PI / 2,
      this.bulletSpeed,
      body.velocity
    );
  }

  update(): void {}
}
