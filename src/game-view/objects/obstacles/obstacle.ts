export class Obstacle extends Phaser.GameObjects.Image {
  constructor(params: any) {
    super(params.scene, params.x, params.y, params.key);

    this.initImage();
    this.scene.add.existing(this);
  }

  private initImage(): void {
    this.setOrigin(0, 0);
    this.scene.physics.world.enable(this);
    const body: Phaser.Physics.Arcade.Body = this
      .body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
  }

  update(): void {}
}
