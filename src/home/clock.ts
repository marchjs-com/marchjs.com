// A repeat on the motion clock for the home page's live demos: it follows the global speed and pause, and a hidden tab
// does not pile up ticks (setInterval would).
import { onFrame } from "march/motion";

/** Run `fn` every `ms`; returns stop. */
export function every(ms: number, fn: () => void): () => void {
  let waited = 0
  return onFrame((_t: number, dt: number) => { waited += Math.min(dt, 100); if (waited >= ms) { waited = 0; fn() } })
}
