import { Launch } from "@lightningjs/sdk";

import App from "./App";

const app = Launch(
  App,
  {
    stage: {},
    debug: false,
    enablePointer: false,
    keys: {
      38: "Up",
      40: "Down",
      37: "Left",
      39: "Right",
      13: "Enter",
      8: "Back",
      27: "Exit",
    },
  },
  {}
);

const canvas = app.stage.getCanvas();
document.body.appendChild(canvas);
