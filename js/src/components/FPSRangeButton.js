const MIN_FPS = 1;
const MAX_FPS = 101;

export default function FPSRangeButton(fpsRangeElt, engine) {
  fpsRangeElt.min = MIN_FPS;
  fpsRangeElt.max = MAX_FPS;
  fpsRangeElt.step = 1;
  fpsRangeElt.value = String(engine.getFps());
  function onInput() {
    const newValue = parseInt(fpsRangeElt.value, 10);
    if (newValue > 100) {
      engine.updateFps(Infinity);
    } else {
      engine.updateFps(newValue);
    }
  }
  fpsRangeElt.addEventListener("input", onInput);
  return () => {
    fpsRangeElt.removeEventListener("input", onInput);
  };
}
