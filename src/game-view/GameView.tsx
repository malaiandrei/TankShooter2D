import * as React from "react";
import "./GameStyle.css";
import Phaser from "phaser";

import { BootScene } from "./scenes/boot-scene";
import { MenuScene } from "./scenes/menu-scene";

interface IStateGameView {
  life: number;
  playerNb: number;
}

export default class GameView extends React.Component<any, IStateGameView> {
  constructor(props: any) {
    super(props);
    this.state = {
      playerNb: 0,
      life: 0,
    };
  }

  componentDidMount() {
    this.configPhaser();
  }

  private configPhaser() {
    new Phaser.Game({
      parent: "game-root",
      type: Phaser.AUTO,
      width: 1600,
      height: 1200,
      zoom: 0.6,
      scene: [BootScene, MenuScene],
      input: {
        keyboard: true,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      backgroundColor: "#000000",
      render: { pixelArt: false, antialias: true },
    });
  }

  render() {
    return (
      <div>
        <div id="game-root"></div>
      </div>
    );
  }
}
