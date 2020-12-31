import FPSDisplayer from "./components/FPSDisplayer";
import FPSRangeButton from "./components/FPSRangeButton";
import NextFrameButton from "./components/NextFrameButton";
import PlayPauseButton from "./components/PlayPauseButton";
import run from "./engine";

const DEFAULT_HEIGHT = 90;
const DEFAULT_WIDTH = 90;
const DEFAULT_FPS = 5;

const canvas = document.getElementById("game-of-life-canvas");
const engine = run(canvas, DEFAULT_HEIGHT, DEFAULT_WIDTH, DEFAULT_FPS);

const fpsElt = document.getElementById("fps");
const playPauseButtonElt = document.getElementById("play-pause");
const nextFrameButtonElt = document.getElementById("next-frame");
const fpsRangeElt = document.getElementById("fps-range");

FPSRangeButton(fpsRangeElt, engine);
PlayPauseButton(playPauseButtonElt, engine)
NextFrameButton(nextFrameButtonElt, engine);
FPSDisplayer(fpsElt, engine);
