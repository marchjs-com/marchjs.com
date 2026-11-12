// Showcase network log: records every file loaded since start (PerformanceObserver › resource) with the page it was
// loaded on, when, its size and where it came from (network, HTTP cache, service worker, preload). The Speed page shows
// it live. Data only: no inline styles, no innerHTML.
import { signal } from "hadi-march";

export interface NetEntry {
  t: number;
  route: string;
  file: string;
  kind: "js" | "css" | "font" | "json" | "diğer";
  bytes: number;
  source: "ağ" | "önbellek" | "service worker";
  preload: boolean;
  ms: number;
}

const routes: Array<{ t: number; route: string }> = [{ t: 0, route: location.hash.slice(1) || "/" }];
addEventListener("hashchange", () => routes.push({ t: performance.now(), route: location.hash.slice(1) || "/" }));
const routeAt = (t: number): string => { let r = "/"; for (const x of routes) if (x.t <= t + 1) r = x.route; return r; };

export const netLog = signal<NetEntry[]>([]);

const kindOf = (name: string): NetEntry["kind"] => (/\.js(\?|$)/.test(name) ? "js" : /\.css(\?|$)/.test(name) ? "css" : /\.woff2?(\?|$)/.test(name) ? "font" : /\.json(\?|$)/.test(name) ? "json" : "diğer");

// files fetched ahead of time by March (<link data-march-preload> / rel=prefetch), not by an import
const preloaded = (href: string): boolean => [...document.querySelectorAll<HTMLLinkElement>("link[data-march-preload]")].some((l) => l.href === href);

function add(list: PerformanceEntryList): void {
  const rows: NetEntry[] = [];
  for (const e of list as PerformanceResourceTiming[]) {
    const url = new URL(e.name);
    if (url.origin !== location.origin) continue;
    const sw = e.workerStart > 0 && e.transferSize === 0;
    const cached = !sw && e.transferSize === 0 && e.decodedBodySize > 0;
    rows.push({
      t: Math.round(e.startTime), route: routeAt(e.startTime), file: url.pathname.split("/").pop() || url.pathname, kind: kindOf(url.pathname),
      bytes: e.transferSize || e.encodedBodySize, source: sw ? "service worker" : cached ? "önbellek" : "ağ",
      preload: preloaded(e.name), ms: Math.round(e.duration),
    });
  }
  if (rows.length) netLog.update((x) => [...x, ...rows]);
}

if (typeof PerformanceObserver === "function") {
  try { new PerformanceObserver((l) => add(l.getEntries())).observe({ type: "resource", buffered: true }); } catch { add(performance.getEntriesByType("resource")); }
}

export const clearNetLog = (): void => netLog.set([]);
