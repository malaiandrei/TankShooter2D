import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import GameView from "./game-view/GameView";

ReactDOM.render(<GameView />, document.getElementById("root"));
serviceWorker.unregister();
