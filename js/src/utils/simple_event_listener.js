/**
 * A simple EventListener!
 *
 * @example
 * ```js
 * const myEventListener = SimpleEventListener();
 *
 * function onHello(who) {
 *   console.log(`Hello, ${who}!`);
 * }
 * myEventListener.addEventListener("hello", onHello);
 * myEventListener.triggerEvent("hello", "world")
 * // => Log "Hello, world!"
 * myEventListener.removeEventListener("hello", onHello);
 * ```
 */
export default function SimpleEventListener() {
  const eventListeners = {};

  return {
    triggerEvent(eventName, payload) {
      const currentListeners = eventListeners[eventName];
      if (currentListeners === undefined) {
        return;
      }
      for (let i = 0; i < currentListeners.length; i++) {
        try {
          currentListeners[i](payload);
        } catch (e) {
          console.error("Event listener failed:", e);
        }
      }
    },

    addEventListener(eventName, eventHandler) {
      let currentListeners = eventListeners[eventName];
      if (currentListeners === undefined) {
        eventListeners[eventName] = currentListeners = [];
      }
      currentListeners.push(eventHandler);
    },

    removeEventListener(eventName, eventHandler) {
      const currentListeners = eventListeners[eventName];
      if (currentListeners === undefined) {
        console.warn(`No listeners currently for the "${eventName}" event.`);
        return;
      }

      let indexOf = currentListeners.indexOf(eventHandler);
      if (indexOf === -1) {
        console.warn(`Listeners not found for the "${eventName}" event.`);
        return;
      }
      currentListeners.splice(indexOf, 1);
      while ((indexOf = currentListeners.indexOf(eventHandler)) !== -1)  {
        currentListeners.splice(indexOf, 1);
      }
      if (currentListeners.length === 0) {
        delete eventListeners[eventName];
      }
    }
  };
}
