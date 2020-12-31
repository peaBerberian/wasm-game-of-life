import { Universe } from "wasm-game-of-life";
import SimpleEventListener from "./utils/simple_event_listener";
import { init, render } from "./render";

/**
 * Run game of life, provide functions to control it and trigger events to
 * notify updates.
 * @param {HTMLCanvasElement} canvas
 * @param {number} heigth
 * @param {number} width
 * @param {number} defaultFps
 * @returns {Object}
 */
export default function run(canvas, heigth, width, defaultFps) {
  const universe = Universe.new(heigth, width);
  const ctx = init(canvas, universe);

  let animationId = null;
  let currentFps = defaultFps;
  let timeOfLastTick = performance.now();

  render(ctx, universe);

  const eventListener = SimpleEventListener();

  function tick() {
    eventListener.triggerEvent("beforeTick");
    let now = performance.now();
    if (now - timeOfLastTick < (1000 / currentFps)) {
      animationId = requestAnimationFrame(tick);
      return;
    }
    timeOfLastTick = now;

    console.time("tick");
    universe.tick();
    console.timeEnd("tick");
    console.time("render");
    render(ctx, universe);
    console.timeEnd("render");
    animationId = requestAnimationFrame(tick);
    eventListener.triggerEvent("afterTick");
  }

  return {
    resume() {
      if (animationId === null) {
        tick();
        eventListener.triggerEvent("resumed");
      }
    },

    pause() {
      cancelAnimationFrame(animationId);
      animationId = null;
      eventListener.triggerEvent("paused");
    },

    isPaused() {
      return animationId === null;
    },

    getFps() {
      return currentFps;
    },

    updateFps(newFps) {
      currentFps = newFps;
      eventListener.triggerEvent("fpsUpdate", newFps);
    },

    goToNextFrame() {
      this.pause();
      timeOfLastTick = performance.now();
      universe.tick();
      render(ctx, universe);
    },

    addEventListener(eventName, eventHandler) {
      eventListener.addEventListener(eventName, eventHandler);
    },

    removeEventListener(eventName, eventHandler) {
      eventListener.removeEventListener(eventName, eventHandler);
    }
  };
}
