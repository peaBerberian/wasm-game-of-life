import FPSCalculator from "../utils/fps_calculator"

const DEFAULT_MAX_SAMPLES = 100;

export default function FPSDisplayer(elt, engine) {
  const titleElt = document.createElement("span");
  const targetElt = document.createElement("span");
  const currInfoElt = document.createElement("span");

  elt.appendChild(titleElt);
  elt.appendChild(document.createElement("br"));
  elt.appendChild(targetElt);
  elt.appendChild(document.createElement("br"));
  elt.appendChild(currInfoElt);

  function getFpsTarget() {
    const currentFps = engine.getFps();
    return !isFinite(currentFps) ? "Maximum" :
                                   String(currentFps);
  }

  titleElt.innerText = "Frames per Second";
  targetElt.innerText = `
Target: ${getFpsTarget()}
  `.trim();

  let fpsCalculator = new FPSCalculator(DEFAULT_MAX_SAMPLES);
  let isInitialized = false;
  function onAfterTick() {
    if (!isInitialized) {
      fpsCalculator.initialize();
      isInitialized = true;
      return;
    }
    const metrics = fpsCalculator.tick();
    currInfoElt.textContent = `
Latest = ${metrics.last.toFixed(2)}
Average of last ${metrics.samples} = ${metrics.avg.toFixed(2)}
Minimum of last ${metrics.samples} = ${metrics.min.toFixed(2)}
Maximum of last ${metrics.samples} = ${metrics.max.toFixed(2)}
    `.trim();
  }

  function resetCalculator() {
    fpsCalculator = new FPSCalculator(DEFAULT_MAX_SAMPLES);
    isInitialized = false;
  }

  function onPaused() {
    resetCalculator();
  }

  function onFpsUpdate() {
    targetElt.innerText = `
Target: ${getFpsTarget()}
    `.trim();
    currInfoElt.textContent = "";
    resetCalculator();
  }

  engine.addEventListener("paused", onPaused);
  engine.addEventListener("afterTick", onAfterTick);
  engine.addEventListener("fpsUpdate", onFpsUpdate);

  return () => {
    engine.removeEventListener("paused", onPaused);
    engine.removeEventListener("afterTick", onAfterTick);
    engine.removeEventListener("fpsUpdate", onFpsUpdate);
    elt.innerHTML = "";
  };
}
