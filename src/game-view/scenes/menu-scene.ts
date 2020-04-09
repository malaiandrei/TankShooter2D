import { GameScene } from "./game-scene";

export class MenuScene extends Phaser.Scene {
  private startKey!: Phaser.Input.Keyboard.Key;
  constructor() {
    super({
      key: "MenuScene",
    });
  }

  init(): void {
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.startKey.isDown = false;
  }

  create(): void {
    this.add
      .text(
        this.sys.canvas.width / 2 - 120,
        this.sys.canvas.height / 2,
        "PRESS S TO PLAY",
        { fontFamily: '"Roboto Condensed"' }
      )
      .setFontSize(30);
    this.add
      .text(
        this.sys.canvas.width / 2 - 120,
        this.sys.canvas.height / 2 - 100,
        "TANK",
        { fontFamily: '"Roboto Condensed"' }
      )
      .setFontSize(100);
  }

  update(): void {
    if (this.startKey.isDown) {
      if (!this.scene.get("GameScene"))
        this.scene.add("GameScene", GameScene, true);
    }
  }
}
