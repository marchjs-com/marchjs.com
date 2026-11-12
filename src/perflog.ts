// Showcase network log: records every file loaded since start (PerformanceObserver › resource) with the page it was
// loaded on, when, its size and where it came from (network, HTTP cache, service worker, preload). The Speed page shows
// it live. Data only: no inline styles, no innerHTML.
import { signal } from "hadi-march";
import { appBase, appBaseUrl } from "hadi-march/base";
import { measured, wireBytes, reportKey, type Timing } from "./netsize.ts";

export interface NetEntry extends Timing {
  /** Path relative to the app base, no `?v=` (key of march-report.json › files). */
  key: string;
  t: number;
  route: string;
  file: string;
  kind: "js" | "css" | "font" | "json" | "diğer";
  /** Measured bytes on the wire (0 when not measurable or from a cache: use resolveSize with the report). */
  bytes: number;
  source: "ağ" | "önbellek" | "service worker";
  preload: boolean;
  ms: number;
}

// the route of the address: /motion under the app's base, or #/motion where the router falls back to hash addresses
const here = (): string => (/^#\//.test(location.hash) ? location.hash.slice(1).split("?")[0] ?? "/" : location.pathname.slice(appBase().length).replace(/\/(index\.html?)?$/, "").replace(/\/+$/, "")) || "/";
const routes: Array<{ t: number; route: string }> = [{ t: 0, route: here() }];
// the router navigates with history.pushState (no event): the Navigation API sees every change, popstate /
// hashchange are the fallback
const noteRoute = (): void => { const route = here(); if (routes[routes.length - 1]!.route !== route) routes.push({ t: performance.now(), route }); };
const nav = (globalThis as { navigation?: EventTarget }).navigation;
if (nav) nav.addEventListener("currententrychange", noteRoute);
addEventListener("hashchange", noteRoute);
addEventListener("popstate", noteRoute);
const routeAt = (t: number): string => { let r = "/"; for (const x of routes) if (x.t <= t + 1) r = x.route; return r; };

export const netLog = signal<NetEntry[]>([]);

const kindOf = (name: string): NetEntry["kind"] => (/\.js(\?|$)/.test(name) ? "js" : /\.css(\?|$)/.test(name) ? "css" : /\.woff2?(\?|$)/.test(name) ? "font" : /\.json(\?|$)/.test(name) ? "json" : "diğer");

// files fetched ahead of time by March (<link data-march-preload> / rel=prefetch), not by an import
const preloaded = (href: string): boolean => [...document.querySelectorAll<HTMLLinkElement>("link[data-march-preload]")].some((l) => l.href === href);

function add(list: PerformanceEntryList): void {
  const rows: NetEntry[] = [];
  for (const e of list as PerformanceResourceTiming[]) {
    const url = new URL(e.name);
    // the app's own files; a published copy may serve /assets from another origin (no Timing-Allow-Origin there)
    if (url.origin !== location.origin && !/\/assets\//.test(url.pathname)) continue;
    const sw = e.workerStart > 0 && e.transferSize === 0;
    const cached = !sw && e.transferSize === 0 && measured(e);
    rows.push({
      t: Math.round(e.startTime), route: routeAt(e.startTime), file: url.pathname.split("/").pop() || url.pathname, kind: kindOf(url.pathname),
      key: reportKey(e.name, appBaseUrl()?.href ?? document.baseURI), transferSize: e.transferSize, encodedBodySize: e.encodedBodySize, decodedBodySize: e.decodedBodySize, workerStart: e.workerStart,
      bytes: measured(e) ? wireBytes(e) : 0, source: sw ? "service worker" : cached ? "önbellek" : "ağ",
      preload: preloaded(e.name), ms: Math.round(e.duration),
    });
  }
  if (rows.length) netLog.update((x) => [...x, ...rows]);
}

if (typeof PerformanceObserver === "function") {
  try { new PerformanceObserver((l) => add(l.getEntries())).observe({ type: "resource", buffered: true }); } catch { add(performance.getEntriesByType("resource")); }
}

export const clearNetLog = (): void => netLog.set([]);
