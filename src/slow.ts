// "Slow 3G" simulation for the showcase: every lazy component and page chunk waits SLOW_MS before it loads (March's
// setLoadDelay), so skeletons, the progress line and the crossfade can be seen. Kept for the tab (sessionStorage).
import { signal, effect, createRoot } from "hadi-march";
import { setLoadDelay } from "hadi-march/lazy";

export const SLOW_MS = 1600;
const KEY = "sc.slow3g";
const stored = (): boolean => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };

/** On / off; a Toggle can bind to it directly (`<Toggle value={slow} />`). */
export const slow = signal(stored());

createRoot(() => effect(() => {
  const on = slow();
  setLoadDelay(on ? SLOW_MS : 0);
  try { if (on) sessionStorage.setItem(KEY, "1"); else sessionStorage.removeItem(KEY); } catch { /* storage off */ }
}));
