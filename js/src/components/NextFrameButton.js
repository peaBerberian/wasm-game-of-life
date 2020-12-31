export default function NextFrameButton(elt, engine) {
  elt.textContent = "Go To Next Frame";

  function onClick() {
    engine.goToNextFrame();
  }
  elt.addEventListener("click", onClick);
  return () => {
    elt.removeEventListener("click", onClick);
  };
}

