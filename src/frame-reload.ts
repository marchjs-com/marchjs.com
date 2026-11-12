// Inside an iframe (a published artifact, an embed) a reload loads the frame's own src again (the start page), not the
// address pushState gave it. The showcase notes the address when the page goes away and, on a reload that landed on
// the start page, puts it back before the router starts (no extra history entry). Outside a frame: nothing.
import { appBase } from "hadi-march/base";

const KEY = "sc.frame.last";

export function restoreFrameRoute(): void {
  if (globalThis.top === globalThis.self) return;
  try {
    const l = location, base = appBase();
    addEventListener("pagehide", () => { try { sessionStorage.setItem(KEY, `${l.pathname}${l.search}${l.hash}`); } catch { /* storage blocked */ } });
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const last = sessionStorage.getItem(KEY);
    const atStart = l.pathname.slice(base.length).replace(/index\.html?$/, "") === "/" && !l.search && !l.hash;
    if (nav?.type === "reload" && atStart && last && last.startsWith(`${base}/`) && last !== l.pathname) history.replaceState(history.state, "", last);
  } catch { /* an opaque origin: no storage, and the router uses #/ addresses that a reload keeps anyway */ }
}
