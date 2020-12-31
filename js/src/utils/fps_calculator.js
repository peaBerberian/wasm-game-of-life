/**
 * Calculate FPS by considering the time between `tick` calls.
 * @class FPSCalculator
 */
export default class FPSCalculator {
  /**
   * Construct a new FPSCalculator.
   */
  constructor(maxSamples) {
    this._fpsMemory = [];
    this._lastFrameTS = null;
    this._maxSamples = Math.max(maxSamples, 0);

    this._lastSum = 0;
    this._lastMin = undefined;
    this._lastMax = undefined;
  }

  /**
   * Needed before performing the first `tick` to calculate a first base
   * timestamp.
   */
  initialize() {
    this._lastFrameTS = performance.now();
  }

  /**
   * Perform a new FPS calculation by taking in consideration the time since
   * the last tick (or since the initialization if no tick were done before).
   *
   * /!\ The FPSCalculator need to have been initialized first through the
   * `initialize` method.
   * TODO Would we profit from an EWMA implementation here?
   */
  tick() {
    if (this._lastFrameTS === null) {
      throw new Error("The FPSCalculator should be initialized first.");
    }
    const now = performance.now();
    const fps = 1 / (now - this._lastFrameTS) * 1000;
    this._lastFrameTS = now;
    this._fpsMemory.push(fps);
    let sum = this._lastSum + fps;

    while (this._fpsMemory.length > this._maxSamples) {
      const shiftedFps = this._fpsMemory.shift();
      sum -= shiftedFps;
      if (shiftedFps === this._lastMin) {
        this._lastMin = undefined;
      }
      if (shiftedFps === this._lastMax) {
        this._lastMax = undefined;
      }
    }
    this._lastSum = sum;

    if (this._lastMin === undefined || this._lastMax === undefined) {
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < this._fpsMemory.length; i++) {
        min = Math.min(this._fpsMemory[i], min);
        max = Math.max(this._fpsMemory[i], max);
      }
      this._lastMin = min;
      this._lastMax = max;
    } else {
      if (this._lastMin > fps) {
        this._lastMin = fps;
      }
      if (this._lastMax < fps) {
        this._lastMax = fps;
      }
    }
    const samples = this._fpsMemory.length;
    const avg = sum / samples;
    return { last: fps,
             samples,
             avg,
             min: this._lastMin,
             max: this._lastMax }
  }
}
