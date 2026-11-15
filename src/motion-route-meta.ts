// Route meta of the /motion/* pages (kept tiny: the router reads it before the page loads). The page transition
// variants page (/motion/pages/<variant>) picks its transition per route: the variant in the path, the chosen speed.
import { signal } from "march";

/** Page transition demo settings (the page's Playground writes them, the next navigation reads them). */
export const pageFx = { duration: signal(720) };

export function motionTransition(p: { rest?: string }): unknown {
  const r = p.rest ?? "";
  return r.startsWith("pages/") ? { type: r.slice(6), duration: pageFx.duration.peek(), easing: "in-out" } : null;
}
