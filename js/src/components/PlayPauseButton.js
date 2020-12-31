export default function PlayPauseButton(elt, engine) {
  elt.textContent = engine.isPaused() ? "▶" :
                                        "⏸";

  function onClick() {
    if (engine.isPaused()) {
      engine.resume();
    } else {
      engine.pause();
    }
  }

  function onPaused() {
    elt.textContent = "▶";
  }

  function onResumed() {
    elt.textContent = "⏸";
  }

  elt.addEventListener("click", onClick);
  engine.addEventListener("paused", onPaused);
  engine.addEventListener("resumed", onResumed);
  return () => {
    engine.removeEventListener("resumed", onResumed);
    engine.removeEventListener("paused", onPaused);
    elt.removeEventListener("click", onClick);
  };
}

