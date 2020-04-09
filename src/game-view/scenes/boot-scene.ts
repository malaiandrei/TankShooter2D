import levelMap1 from "../assets/maps/levelMap.json";

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({
      key: "BootScene",
    });
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(0x000000);
    this.createLoadingGraphics();

    this.load.on(
      "progress",
      (value: any) => {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x88e453, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      "complete",
      () => {
        this.progressBar.destroy();
        this.loadingBar.destroy();
      },
      this
    );

    const levelMap: any = levelMap1;
    this.load.tilemapTiledJSON("levelMap", levelMap);

    const tankBlue = "../assets/sprites/tank-blue.png";
    const tankRed = "../assets/sprites/tank-red.png";
    const barrelBlue = "../assets/sprites/barrel-blue.png";
    const barrelRed = "../assets/sprites/barrel-red.png";
    const bulletBlue = "../assets/sprites/bullet-blue.png";
    const bulletRed = "../assets/sprites/bullet-red.png";
    const tiles = "../assets/tiles/tiles.png";
    const barrelGreyTop = "../assets/obstacles/barrel-grey-top.png";
    const barrelGreySideRust = "../assets/obstacles/barrel-grey-side-rust.png";
    const barrelGreySide = "../assets/obstacles/barrel-grey-side.png";
    const barrelRedTop = "../assets/obstacles/barrel-red-top.png";
    const barrelRedSide = "../assets/obstacles/barrel-red-side.png";
    const treeSmall = "../assets/obstacles/tree-small.png";
    const treeLarge = "../assets/obstacles/tree-large.png";

    this.load.image("tankBlue", tankBlue);
    this.load.image("tankRed", tankRed);
    this.load.image("barrelBlue", barrelBlue);
    this.load.image("barrelRed", barrelRed);
    this.load.image("bulletBlue", bulletBlue);
    this.load.image("tiles", tiles);
    this.load.image("barrelGreyTop", barrelGreyTop);
    this.load.image("bulletRed", bulletRed);
    this.load.image("barrelGreySideRust", barrelGreySideRust);
    this.load.image("barrelGreySide", barrelGreySide);
    this.load.image("treeSmall", treeSmall);
    this.load.image("barrelRedSide", barrelRedSide);
    this.load.image("treeLarge", treeLarge);
    this.load.image("barrelRedTop", barrelRedTop);
  }

  update(): void {
    this.scene.start("MenuScene");
  }

  private createLoadingGraphics(): void {
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0xffffff, 1);
    this.loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }
}
