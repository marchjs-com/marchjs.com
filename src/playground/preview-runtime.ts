// The playground's preview runtime (playground/preview.js + preview.css, bundled at build time and loaded by
// /playground only): March and its components, and `run(code, el)`, which runs the code the playground builds and
// renders its default export into the preview's stage. The bundle's `import … from "march/…"` lines are turned
// into this runtime's own modules; the module is imported from a blob: URL (the showcase's CSP allows script-src
// blob: — the showcase is served from its own domain, with no sessions).
import * as core from "../../../../src/index.ts";
import { dicts } from "../../../../src/core/i18n.ts";
import * as ui from "../../../../src/ui/index.ts";
import * as icons from "../../../../src/icons/index.ts";
import * as theme from "../../../../src/theme/index.ts";
import * as motion from "../../../../src/motion/index.ts";
import * as props from "../../../../src/props/index.ts";
const { withParts, mProps, registerMProp } = props;
import { packIcon } from "../../../../src/icons/pack-paint.ts";
// layers opened by the preview's code (dialogs, drawers, menus) find the scope around it (OverlayScope's lookup); a
// component drawn open (a bare <Dialog open>) gets that scope as its context: it opens in the preview, not on the page
import { OverlayScopeContext } from "../../../../src/components/layout/overlay-scope/index.ts";
import * as testing from "../../../../src/testing/index.ts";

// the playground's helpers for a quick try (import { instrument, run } from "march/playground"): debug a piece of
// code in the preview with your own Debugger. `instrument` writes the debugger's calls in (the page's TypeScript worker,
// given by setHost), `run` runs the files it gave, each as a module (blob: URL, no eval), in order:
//   const r = await instrument({ "app.ts": $code }); session.begin(r.metas); await run(r.files)
type Instrumented = { files: Record<string, string>; metas: unknown[] };
let host: { instrument?: (files: Record<string, string>) => Promise<Instrumented> } = {};
/** What the page lends the preview: the instrumenter (its TypeScript service's). */
export function setHost(next: typeof host): void { host = next; }
const playground = {
  /** The files with the debugger's calls written in: `{ files, metas }` (metas go to `session.begin`). */
  instrument(files: Record<string, string>): Promise<Instrumented> {
    if (!host.instrument) return Promise.reject(new Error("instrument: the playground's TypeScript is not ready"));
    return host.instrument(files);
  },
  /** Run the files (instrumented or not) as modules, one after the other; an error is written to the console and stops the rest. */
  async run(files: Record<string, string>): Promise<void> {
    for (const [path, code] of Object.entries(files)) {
      await loadPacks(code);
      const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
      try { await import(/* @vite-ignore */ url); }
      catch (e) { console.error(`${path}: ${(e as Error)?.message ?? e}`); return; }
      finally { URL.revokeObjectURL(url); }
    }
  },
};
// ---- the reactivity inspector (MarchIDE's Tepki tab): the code's signals (named by the IDE's build: "count@App.tsx:4"),
// its effects and computeds, and the preview's DOM updates, counted. The code's `march` is March with signal, effect and
// computed wrapped to count (the core is not touched: nothing of this is in an app).
export interface Probe { id: number; kind: "signal" | "computed" | "effect"; name: string; at: { line: number; column: number } | null; count: number; value?: unknown; last: number }
const probes = new Map<number, Probe>();
let probeSeq = 0, probeCb: ((p: Probe[], dom: [string, number][]) => void) | null = null, probeQueued = false;
const domCounts = new Map<string, number>();
const notifyProbes = (): void => {
  if (!probeCb || probeQueued) return;
  probeQueued = true;
  setTimeout(() => { probeQueued = false; probeCb?.([...probes.values()].map((p) => ({ ...p })), [...domCounts].sort((a, b) => b[1] - a[1])); }, 60); // the tab at most ~16 times a second
};
/** Where in the code (its blob module) a signal, an effect or a computed was made: the bundle's line and column. */
const madeAt = (): { line: number; column: number } | null => {
  const l = (new Error().stack ?? "").split("\n").find((x) => /blob:/.test(x));
  const m = l ? /:(\d+):(\d+)\)?\s*$/.exec(l) : null;
  return m ? { line: Number(m[1]), column: Number(m[2]) - 1 } : null;
};
/** A probe leaves the list with what owns it (a component drawn again makes new signals). */
const leave = (p: Probe): void => { if (core.getOwner()) core.onCleanup(() => { probes.delete(p.id); notifyProbes(); }); };
const traced = {
  ...core,
  signal: <T,>(v: T, o?: { name?: string }) => {
    const s = core.signal(v, o as never) as ReturnType<typeof core.signal<T>>;
    if (!o?.name || !probeCb) return s;
    const p: Probe = { id: ++probeSeq, kind: "signal", name: o.name, at: null, count: 0, value: v, last: 0 };
    probes.set(p.id, p);
    leave(p);
    const set = s.set;
    (s as { set: (x: T) => T }).set = (x: T) => { const r = set(x); p.count++; p.value = s.peek(); p.last = performance.now(); notifyProbes(); return r; };
    notifyProbes();
    return s;
  },
  effect: (fn: () => void) => {
    if (!probeCb || !/blob:/.test(new Error().stack ?? "")) return core.effect(fn);
    const p: Probe = { id: ++probeSeq, kind: "effect", name: "effect", at: madeAt(), count: 0, last: 0 };
    probes.set(p.id, p);
    leave(p);
    return core.effect(() => { p.count++; p.last = performance.now(); notifyProbes(); fn(); });
  },
  computed: <T,>(fn: (prev: T | undefined) => T, o?: object) => {
    if (!probeCb || !/blob:/.test(new Error().stack ?? "")) return core.computed(fn, o as never);
    const p: Probe = { id: ++probeSeq, kind: "computed", name: "computed", at: madeAt(), count: 0, last: 0 };
    probes.set(p.id, p);
    leave(p);
    return core.computed((prev: T | undefined) => { p.count++; p.last = performance.now(); const v = fn(prev); p.value = v; notifyProbes(); return v; }, o as never);
  },
};
let domWatch: MutationObserver | null = null;
/** Starts counting: `cb` gets the probes and the DOM updates per written place ("App.tsx:12"), at most ~16 times a second. */
export function onProbes(cb: (p: Probe[], dom: [string, number][]) => void, root: Element): void {
  probeCb = cb;
  domWatch?.disconnect();
  domWatch = new MutationObserver((list) => {
    for (const m of list) {
      const el = (m.target instanceof Element ? m.target : m.target.parentElement)?.closest?.("[data-m-src]");
      const key = el?.getAttribute("data-m-src");
      if (key) domCounts.set(key, (domCounts.get(key) ?? 0) + 1);
    }
    notifyProbes();
  });
  domWatch.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "value", "checked", "disabled", "aria-pressed", "aria-busy", "hidden"] });
}
/** The counters back to zero (the probes stay). */
export function resetProbes(): void { for (const p of probes.values()) p.count = 0; domCounts.clear(); notifyProbes(); }
/** A new run: its own signals and effects. */
const newRun = (): void => { probes.clear(); domCounts.clear(); };

// ---- the Tests tab: a test file's `test("…", fn)` cases run here, one after the other, each in a hidden box (its
// renderTest screens are disposed after it); `expect` is a small assertion set. "march/testing" is March's testing
// module with these added.
export interface TestResult { name: string; ok: boolean; ms: number; error?: { message: string; stack: string } }
type Case = { name: string; fn: () => unknown };
let cases: Case[] = [], screens: { dispose(): void }[] = [], testHost: HTMLElement | null = null;
const show = (v: unknown): string => { try { return typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v) ?? String(v) } catch { return String(v) } };
const same = (a: unknown, b: unknown): boolean => { try { return JSON.stringify(a) === JSON.stringify(b) } catch { return a === b } };
/** `expect(value)`: toBe, toEqual, toBeTruthy, toBeFalsy, toContain, toBeGreaterThan, toThrow; `.not` turns each one. */
function expect(actual: unknown) {
  const make = (not: boolean) => {
    const check = (pass: boolean, what: string): void => { if (pass === not) throw new Error(`Beklenen: ${not ? "değil " : ""}${what} · gelen: ${show(actual)}`); };
    return {
      toBe: (x: unknown) => check(Object.is(actual, x), show(x)),
      toEqual: (x: unknown) => check(same(actual, x), show(x)),
      toBeTruthy: () => check(!!actual, "doğru (truthy)"),
      toBeFalsy: () => check(!actual, "yanlış (falsy)"),
      toContain: (x: unknown) => check(typeof actual === "string" ? actual.includes(String(x)) : Array.isArray(actual) && actual.some((y) => same(y, x)), `${show(x)} içeren`),
      toBeGreaterThan: (x: number) => check(typeof actual === "number" && actual > x, `${x}'den büyük`),
      toThrow: () => { let threw = false; try { (actual as () => unknown)(); } catch { threw = true; } check(threw, "hata atan bir işlev"); },
    };
  };
  return { ...make(false), not: make(true) };
}
const testApi = {
  ...testing,
  test: (name: string, fn: () => unknown) => { cases.push({ name, fn }); },
  it: (name: string, fn: () => unknown) => { cases.push({ name, fn }); },
  expect,
  /** renderTest in the tests' hidden box; disposed after the test. */
  renderTest: (fn: () => unknown, o: testing.RenderTestOptions = {}) => {
    const box = document.createElement("div");
    testHost!.append(box);
    // the screen looks only in the test's box (the preview on the page has the same texts); the box is an overlay
    // scope, so the dialogs and toasts the test opens stay in it
    box.classList.add("m-overlay-scope");
    const s = testing.renderTest(fn, { container: box, root: box, ...o });
    screens.push({ dispose: () => { s.dispose(); box.remove(); } });
    return s;
  },
};
/** Runs a test file's bundle: every case, in order; what each did. */
export async function runTests(code: string): Promise<TestResult[]> {
  await loadPacks(code);
  cases = [];
  testHost ??= Object.assign(document.body.appendChild(document.createElement("div")), { className: "sc-test-host" });
  testHost.setAttribute("aria-hidden", "true");
  testHost.style.setProperty("position", "fixed"); testHost.style.setProperty("inset-inline-start", "-10000px"); testHost.style.setProperty("inline-size", "800px");
  const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
  try { await import(/* @vite-ignore */ url); } finally { URL.revokeObjectURL(url); }
  const out: TestResult[] = [];
  for (const c of cases) {
    const t0 = performance.now();
    try { await c.fn(); out.push({ name: c.name, ok: true, ms: performance.now() - t0 }); }
    catch (e) { out.push({ name: c.name, ok: false, ms: performance.now() - t0, error: { message: String((e as Error)?.message ?? e), stack: String((e as Error)?.stack ?? "") } }); }
    finally { for (const s of screens) { try { s.dispose(); } catch { /* gone */ } } screens = []; }
  }
  return out;
}

const MODULES: Record<string, unknown> = { "march": traced, "march/testing": testApi, "march/ui": ui, "march/icons": icons, "march/theme": theme, "march/motion": motion, "march/props": props, "march/playground": playground };
// any other subpath of the components (march/actions…) is in the ui barrel too
(globalThis as Record<string, unknown>)["__marchPreview"] = new Proxy(MODULES, { get: (m, k: string) => m[k] ?? (k.startsWith("march/") ? ui : undefined) });

// an icon pack the code imports (march/icons/lucide…, also what icon="lucide:heart" compiles to): its icons from the
// gallery's JSON (icon-packs/<id>.json beside playground/, the same data the Icons page draws), loaded once before the
// code runs
type PackJson = { vb: string; sw?: number; fill?: boolean; icons: [name: string, exp: string, d: string[], flags?: number, eo?: number[]][] };
const packLoads = new Map<string, Promise<void>>();
// the components kept out of the ui barrel (meta.barrel === false: DataGrid, Scheduler…): the code imports them from
// march/components/<folder>; each is read on its first import, like an icon pack
const OWN_PARTS: Record<string, () => Promise<unknown>> = {
  "data-grid": () => import("../../../../src/components/data/data-grid/index.ts"),
  "tree-view": () => import("../../../../src/components/data/tree-view/index.ts"),
  "scheduler": () => import("../../../../src/components/data/scheduler/index.ts"),
  "gantt": () => import("../../../../src/components/data/gantt/index.ts"),
  "wizard": () => import("../../../../src/components/composite/wizard/index.ts"),
  "consent-banner": () => import("../../../../src/components/composite/consent-banner/index.ts"),
  "theme-editor": () => import("../../../../src/components/composite/theme-editor/index.ts"),
};
const loadOwn = (code: string): Promise<unknown> => Promise.all([...new Set([...code.matchAll(/from\s*["']march\/components\/([a-z][a-z0-9-]*)["']/g)].map((m) => m[1]!))]
  .filter((f) => OWN_PARTS[f] && !(`march/components/${f}` in MODULES)).map((f) => OWN_PARTS[f]!().then((m) => { MODULES[`march/components/${f}`] = m })));
async function loadPacks(code: string): Promise<void> {
  // march/landing is not in the ui barrel (its own lazy chunk): loaded once, when the code imports it
  if (!MODULES["march/landing"] && /["']march\/landing["']/.test(code)) MODULES["march/landing"] = await import("../../../../src/components/landing/index.ts");
  await loadOwn(code);
  const ids = [...new Set([...code.matchAll(/from\s*["']march\/icons\/([a-z][a-z0-9-]*)["']/g)].map((m) => m[1]!))]
    .filter((id) => !(`march/icons/${id}` in MODULES) && !["packs", "catalog", "pack-paint"].includes(id));
  await Promise.all(ids.map((id) => {
    let p = packLoads.get(id);
    if (!p) {
      p = fetch(new URL(`../icon-packs/${id}.json`, import.meta.url)).then((r) => { if (!r.ok) throw new Error(`march/icons/${id}: ${r.status}`); return r.json() as Promise<PackJson> })
        .then((pk) => { MODULES[`march/icons/${id}`] = Object.fromEntries(pk.icons.map(([name, exp, d, flags = 0, eo]) => [exp, packIcon(name, d, {
          vb: pk.vb, ...(pk.sw ? { sw: pk.sw } : {}), ...(pk.fill || flags & 2 ? { fill: true } : {}), ...(flags & 1 ? { rtl: true } : {}), ...(eo ? { eo } : {}),
        })])) })
      p.catch(() => packLoads.delete(id))
      packLoads.set(id, p)
    }
    return p
  }));
}

// the preview code's console: every method (log, info, warn, error, debug, assert, table, dir, trace, count, time,
// group, clear) goes to MarchIDE's Console too, as an event it draws (a table as a table, a group indented, a count with
// its number, a timer with its time). A call is the code's when it comes from one of its modules (they run from blob:
// URLs: their stack says so); the page's own calls stay where they were. The browser's console still gets every call.
type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";
/** What the Console is told: a line (its level and arguments), a table (its data and columns), or "clear". */
export type ConsoleEvent = { kind: ConsoleLevel; args: unknown[]; depth: number; uncaught?: boolean } | { kind: "table"; data: unknown; columns?: string[]; depth: number } | { kind: "clear" };
let consoleCb: ((e: ConsoleEvent) => void) | null = null;
let consoleHooked = false, depth = 0;
const counts = new Map<string, number>(), timers = new Map<string, number>();
const fromCode = (): boolean => /\bblob:/.test(new Error().stack ?? "");
const hookConsole = (): void => {
  if (consoleHooked) return;
  consoleHooked = true;
  const c = console as unknown as Record<string, (...a: unknown[]) => void>;
  const say = (e: ConsoleEvent): void => { try { consoleCb?.(e) } catch { /* the Console's own trouble */ } };
  const line = (kind: ConsoleLevel, args: unknown[]): void => say({ kind, args, depth });
  const ms = (t: number): string => `${(performance.now() - t).toFixed(1)} ms`;
  const wrap = (name: string, mine: (...a: unknown[]) => void): void => {
    const own = c[name]?.bind(console);
    if (!own) return;
    c[name] = (...args: unknown[]) => { own(...args); if (consoleCb && fromCode()) mine(...args); };
  };
  for (const level of ["log", "info", "warn", "error", "debug"] as const) wrap(level, (...a) => line(level, a));
  wrap("assert", (cond, ...a) => { if (!cond) line("error", ["Doğrulama başarısız:", ...(a.length ? a : ["console.assert"])]); });
  wrap("table", (data, columns) => say({ kind: "table", data, ...(Array.isArray(columns) ? { columns: columns.map(String) } : {}), depth }));
  wrap("dir", (v) => line("log", [v]));
  wrap("dirxml", (...a) => line("log", a));
  wrap("trace", (...a) => {
    const where = (new Error().stack ?? "").split("\n").filter((l) => /blob:/.test(l)).slice(1, 4).map((l) => l.trim().replace(/blob:[^\s)]+\//, "").replace(/^at /, ""));
    line("log", ["Trace:", ...a, ...(where.length ? [`\n  ${where.join("\n  ")}`] : [])]);
  });
  wrap("count", (label = "default") => { const k = String(label), n = (counts.get(k) ?? 0) + 1; counts.set(k, n); line("log", [`${k}: ${n}`]); });
  wrap("countReset", (label = "default") => { counts.set(String(label), 0); });
  wrap("time", (label = "default") => { timers.set(String(label), performance.now()); });
  wrap("timeLog", (label = "default", ...a) => { const t = timers.get(String(label)); line("log", t === undefined ? [`Zamanlayıcı yok: ${String(label)}`] : [`${String(label)}: ${ms(t)}`, ...a]); });
  wrap("timeEnd", (label = "default") => { const k = String(label), t = timers.get(k); timers.delete(k); line("log", [t === undefined ? `Zamanlayıcı yok: ${k}` : `${k}: ${ms(t)} (bitti)`]); });
  wrap("group", (...a) => { line("log", a.length ? a : ["grup"]); depth++; });
  wrap("groupCollapsed", (...a) => { line("log", a.length ? a : ["grup"]); depth++; });
  wrap("groupEnd", () => { depth = Math.max(0, depth - 1); });
  wrap("clear", () => { depth = 0; say({ kind: "clear" }); });
  // what the code throws and does not catch (and promises it leaves rejected) is an error line too
  // (March re-throws what no <Try> caught from its own module: the error's stack, not the event's file, says it is the code's)
  globalThis.addEventListener?.("error", (e: ErrorEvent) => { if (consoleCb && (/^blob:/.test(e.filename ?? "") || /blob:/.test(String((e.error as Error)?.stack ?? "")))) say({ kind: "error", args: [e.error ?? e.message], depth, uncaught: true }); });
  globalThis.addEventListener?.("unhandledrejection", (e: PromiseRejectionEvent) => { const st = String((e.reason as Error)?.stack ?? ""); if (consoleCb && /\bblob:/.test(st)) say({ kind: "error", args: [e.reason], depth, uncaught: true }); });
};
/** Called with each console event of the preview's code (a line, a table, a clear). */
export function onConsole(cb: (e: ConsoleEvent) => void): void { consoleCb = cb; hookConsole(); }
/** A new run: counters, timers and groups start again. */
export function resetConsole(): void { counts.clear(); timers.clear(); depth = 0; }

// where each element is written (MarchIDE's build marks them: the compiler's sourceMarks): a component's usage line on
// its root elements (m:src), over the line of its definition
registerMProp("src", (el, v) => { if (v) el.setAttribute("data-m-src", String(v)); });
/** The element the code wrote at a place of the preview (Alt+click): its file and line. */
export function sourceAt(node: Node | null): { file: string; line: number } | null {
  const el = (node instanceof Element ? node : node?.parentElement)?.closest?.("[data-m-src]");
  const m = el ? /^(.*):(\d+)$/.exec(el.getAttribute("data-m-src") ?? "") : null;
  return m ? { file: m[1]!, line: Number(m[2]) } : null;
}
/** The elements the code wrote on a line of a file (the editor's caret line): to outline them. */
export function elementsAt(root: Element, file: string, line: number): Element[] {
  return [...root.querySelectorAll(`[data-m-src="${CSS.escape(`${file}:${line}`)}"]`)];
}

/** `import { a as b, c } from "march/x";` → `const { a: b, c } = __marchPreview["march/x"];` (and `* as x`). */
export function link(code: string): string {
  const mod = (path: string): string => `globalThis.__marchPreview[${JSON.stringify(path)}]`;
  return code
    .replace(/import\s*\{([^}]*)\}\s*from\s*["'](march(?:\/[^"']*)?)["'];?/g, (_, names: string, path: string) => `const {${names.replace(/\s+as\s+/g, ": ")}} = ${mod(path)};`)
    .replace(/import\s*\*\s*as\s+([\w$]+)\s*from\s*["'](march(?:\/[^"']*)?)["'];?/g, (_, name: string, path: string) => `const ${name} = ${mod(path)};`)
    .replace(/import\s*["']march(?:\/[^"']*)?["'];?/g, "");
}

// the props of what is rendered: a channel. setProps draws the already loaded component again with the new props
// (milliseconds: no build, no new module). A redraw rather than a live update, so every kind of prop takes effect,
// also the ones a component reads only once (Button's block, an icon…). `parts` are the props of the components drawn
// inside it, by name (m:parts: { Spinner: { size: "sm" } }).
/** Props as given → props a component takes: an icon prop comes as the icon's name ("plus" or "icon:plus"). */
const resolve = (props: Record<string, unknown>): Record<string, unknown> => Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)
  .map(([k, v]) => {
    const name = typeof v === "string" ? (v.startsWith("icon:") ? v.slice(5) : /icon/i.test(k) ? v : "") : "";
    return [k, name && name in icons ? (icons as Record<string, unknown>)[name] : v];
  }));
type Parts = Record<string, Record<string, unknown>>;
type Props = Record<string, unknown>;
type Comp = (p: object) => unknown;
const draw = (C: Comp, el: HTMLElement, props: Props, parts: Parts, cell = ""): (() => void) => {
  el.replaceChildren();
  const { children, ...rest } = props;
  // m:color, m:theme… (the common props) go on what the component draws, as the compiler writes them
  const common: Record<string, unknown> = {};
  for (const k of Object.keys(rest)) if (k.startsWith("m:")) { if (rest[k] !== undefined) common[k.slice(2)] = rest[k]; delete rest[k]; }
  // sx: its classes on the component's root, as the compiler sends a component's sx
  if ("sx" in rest) { if (rest["sx"] !== undefined) common["sx"] = rest["sx"]; delete rest["sx"]; }
  const own = resolve(rest);
  // m:parts: the components by themselves (this runtime's ui), each with its props
  const map = new Map<unknown, Record<string, unknown>>();
  for (const [name, p] of Object.entries(parts)) { const comp = (ui as Record<string, unknown>)[name] ?? (MODULES["march/landing"] as Record<string, unknown> | undefined)?.[name]; if (typeof comp === "function" && Object.keys(p).length) map.set(comp, resolve(p)); }
  const bare = (): unknown => (children === undefined || children === "" ? core.h(C, own) : core.h(C, own, children));
  const make = (): unknown => (Object.keys(common).length ? mProps(bare(), common) : bare());
  // the cell is the root of its instances' keys (Hierarchy): counted afresh on every draw, so a key stays the same
  const scope = el.closest<HTMLElement>(".m-overlay-scope");
  const stopDraw = core.render(() => { core.provide(PARENT, { id: 0, key: cell, counts: new Map() }); if (scope) core.provide(OverlayScopeContext, scope); return map.size ? withParts(map as never, make) : make() }, el);
  // a drawing (the first, or again with new props) is no update of the reactivity: the inspector does not count it
  domWatch?.takeRecords();
  return stopDraw;
};
// every component the module exports has a cell of its own: the preview is split into as many cells
interface Cell { C: Comp; el: HTMLElement; dispose: () => void }
let last: { url: string; cells: Map<string, Cell> } | null = null;
// the module's data (its signals and computed values, exported by the playground as __marchData): watched, and set
let data: Record<string, unknown> = {}, dataStop: (() => void) | null = null, onDataCb: ((values: Record<string, unknown>) => void) | null = null;
const isSignal = (v: unknown): v is ((() => unknown) & { set: (x: unknown) => void }) => typeof v === "function" && typeof (v as { set?: unknown }).set === "function";
/** Called with the current values of the module's data whenever one of them changes. */
export function onData(cb: (values: Record<string, unknown>) => void): void { onDataCb = cb; }
/** Set a signal of the module (the preview follows at once). */
export function setData(name: string, value: unknown): void { const s = data[name]; if (isSignal(s)) s.set(value); }
const watchData = (): void => {
  dataStop?.(); dataStop = null;
  if (!Object.keys(data).length) { onDataCb?.({}); return; }
  dataStop = core.createRoot((dispose) => {
    core.effect(() => { const snap: Record<string, unknown> = {}; for (const [k, v] of Object.entries(data)) snap[k] = typeof v === "function" ? (v as () => unknown)() : v; onDataCb?.(snap); });
    return dispose;
  });
};
// the language: the code is built with i18n (what it shows goes through March's _tr), so a language is March's own:
// its texts are registered as that locale's messages and the locale is switched. Only the shown texts are written
// again; nothing is drawn again and the components keep their state. The default is the code's own texts (the page's
// own locale, whose library texts stay as they are).
const ownLocale = core.locale.peek();
let userTexts: { code: string; keys: string[] } | null = null;
let lastProps: Record<string, Props> = {}, lastParts: Record<string, Parts> = {};
/** The preview's language: its code and dictionary (the code's text → its translation), or null for the code's own
 *  texts. What is shown is written in it in place: the components keep their state. */
export function setLanguage(code: string | null, next: Record<string, string> | null): void {
  // the previous language's texts go (a text removed from its file must not stay translated)
  if (userTexts) {
    const d = dicts.get(userTexts.code);
    if (d) for (const k of userTexts.keys) delete d[k];
    core.messages(userTexts.code, {}); // what is shown follows (also when the locale stays the same)
    userTexts = null;
  }
  if (!code || !next) { core.locale.set(ownLocale); return; }
  core.messages(code, next);
  userTexts = { code, keys: Object.keys(next) };
  core.locale.set(code);
}
/** Send new props (and parts) to the rendered components, by name (the Properties panel calls it on every change). */
export function setProps(props: Record<string, Props>, parts: Record<string, Parts> = {}): void {
  lastProps = props; lastParts = parts;
  if (!last) return;
  for (const [name, cell] of last.cells) { cell.dispose(); cell.dispose = draw(cell.C, cell.el, props[name] ?? {}, parts[name] ?? {}, name); }
}
/**
 * Run `code` (an ES module) and render every component it exports (a name with a capital letter) into a cell of
 * `el`, each with its `props` and `parts` by name (then setProps); the previous run is removed. Returns the names.
 */
export async function run(code: string, el: HTMLElement, props: Record<string, Props> = {}, parts: Record<string, Parts> = {}): Promise<string[]> {
  await loadPacks(code);
  resetConsole();
  newRun();
  const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
  // the extensions the previous run registered (extend / intercept at the module's top) go with it
  core.extensions.clear();
  watchTree();
  let mod: Record<string, unknown>;
  try { mod = await import(/* @vite-ignore */ url) as Record<string, unknown>; }
  catch (e) { URL.revokeObjectURL(url); throw e; }
  const comps = Object.entries(mod).filter(([k, v]) => /^[A-Z]/.test(k) && typeof v === "function") as [string, Comp][];
  if (!comps.length) { URL.revokeObjectURL(url); throw new Error("dışa aktarılan bir bileşen yok"); }
  stop();
  lastProps = props; lastParts = parts;
  el.replaceChildren();
  el.dataset["cells"] = String(comps.length);
  const cells = new Map<string, Cell>();
  for (const [name, C] of comps) {
    const box = document.createElement("section");
    box.className = "sc-pv-cell";
    box.dataset["pv"] = name;
    box.setAttribute("aria-label", name);
    const tag = document.createElement("span");
    tag.className = "sc-pv-name";
    // a top-level element of the file (CodeEditor_1): its tag and its number
    tag.textContent = name.replace(/_(\d+)$/, " #$1");
    const stage = document.createElement("div");
    stage.className = "sc-pv-stage";
    box.append(tag, stage);
    el.append(box);
    cells.set(name, { C, el: stage, dispose: draw(C, stage, props[name] ?? {}, parts[name] ?? {}, name) });
  }
  // what the code puts on "the page" stays in the preview: the preview is an overlay scope (its fixed layers cover it,
  // not the page) and has a toast stack of its own (toast() then opens none on the page)
  el.classList.add("m-overlay-scope");
  el.style.setProperty("position", "relative");
  el.style.setProperty("contain", "layout");
  const toasts = document.createElement("div");
  toasts.className = "sc-pv-toasts";
  toasts.style.setProperty("display", "contents");
  el.append(toasts);
  toastStop = core.render(() => core.h(ui.ToastHost as never, {}), toasts);
  last = { url, cells };
  data = (mod["__marchData"] as Record<string, unknown> | undefined) ?? {};
  watchData();
  // the first drawing is no update: what the observer holds of it goes
  domWatch?.takeRecords(); domCounts.clear(); notifyProbes();
  return [...cells.keys()];
}
/**
 * Run a line of JavaScript the Terminal was given, in the running preview: the module's data (its signals and
 * computed values: `count`, `count.set(5)`), March's modules (`march`, `ui`, `icons`, `theme`, `motion`) and what the
 * page gives in `scope` ($el, $props…) are in scope. An expression gives its value (awaited); a line of statements runs
 * (nothing is kept between lines). Like the build, the line is a module imported from a blob: URL (no eval).
 */
export async function evaluate(line: string, scope: Record<string, unknown> = {}): Promise<unknown> {
  const all: Record<string, unknown> = { march: core, ui, icons, theme, motion, ...data, ...scope };
  const names = Object.keys(all).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k));
  (globalThis as Record<string, unknown>)["__marchEval"] = all;
  // the module marks that it ran: an error after that is the line's own (a JSON.parse…), not a line that is no expression
  const head = `globalThis.__marchEvalRan = true;\nconst { ${names.join(", ")} } = globalThis.__marchEval;\n`;
  const g = globalThis as Record<string, unknown>;
  g["__marchEvalRan"] = false;
  const load = async (body: string): Promise<unknown> => {
    const url = URL.createObjectURL(new Blob([link(head + body)], { type: "text/javascript" }));
    try { return ((await import(/* @vite-ignore */ url)) as { default: unknown }).default; }
    finally { URL.revokeObjectURL(url); }
  };
  const src = line.trim().replace(/;+$/, "");
  let first: unknown;
  try { return await load(`export default await (async () => (\n${src}\n))();\n`); }
  catch (e) { if (!(e instanceof SyntaxError) || g["__marchEvalRan"]) throw e; first = e; }
  // statements whose last one is an expression (const x = 2; x * 10): that one's value
  const cut = src.lastIndexOf(";");
  if (cut > 0) {
    try { return await load(`export default await (async () => {\n${src.slice(0, cut + 1)}\nreturn (\n${src.slice(cut + 1)}\n);\n})();\n`); }
    catch (e) { if (!(e instanceof SyntaxError) || g["__marchEvalRan"]) throw e; }
  }
  // not an expression: statements; when they do not parse either, the expression's error is the one to read
  try { return await load(`export default await (async () => {\n${src}\n})();\n`); }
  catch (e) { throw e instanceof SyntaxError && !g["__marchEvalRan"] ? first : e; }
}
/** What the playground's Extensions tab shows: the extensions the code registered (this runtime's March), the props
 * they add to each named component, and what they did to the components drawn in the preview. */
export interface ExtensionInfo {
  list: ReturnType<typeof core.extensions.list>;
  props: Record<string, { extension: string; props: Record<string, { type?: string; default?: unknown; doc?: string; values?: readonly unknown[] }> }[]>;
  traces: { cell: string; component: string; steps: { name: string; did: string[]; before?: Record<string, unknown>; after?: Record<string, unknown> }[] }[];
}
let named = false;
export function extensionInfo(names: readonly string[]): ExtensionInfo {
  const ext = core.extensions;
  // names survive the build's minifying: March's components by their export names, the code's by its own
  if (!named) { named = true; ext.name(ui as unknown as Record<string, unknown>); }
  if (last) ext.name(Object.fromEntries([...last.cells].map(([n, c]) => [n, c.C])));
  const comp = (n: string): unknown => last?.cells.get(n)?.C ?? (ui as Record<string, unknown>)[n];
  const props: ExtensionInfo["props"] = {};
  for (const n of names) { const c = comp(n); if (typeof c === "function") props[n] = ext.propsOf(c as never); }
  const traces: ExtensionInfo["traces"] = [];
  for (const [cell, c] of last?.cells ?? []) for (const t of ext.within(c.el)) traces.push({ cell, ...t });
  // MarchIDE's own recorder (the Hierarchy) is not one of the code's extensions
  const mine = (x: { name?: unknown }): boolean => x.name === "march-ide-hierarchy";
  return { list: core.untrack(() => ext.list()).filter((x) => !mine(x as { name?: unknown })), props, traces: traces.map((t) => ({ ...t, steps: t.steps.filter((x) => !mine(x)) })).filter((t) => t.steps.length) };
}
// MarchIDE's Hierarchy: every component instance the preview draws, with the instance that drew it. A path test makes
// March run each instance under an owner of its own (dom/extend.ts), so an instance provides its id to what it creates,
// now or later (a list's new row, an If's branch). Control flow (If, For…) is plumbing, not a component of the page.
export interface TreeItem { id: number; parent: number; name: string; key: string; elId: string; text: string }
// where an instance stands: its id, its key (the cell, then each instance down to it with its place among the ones of
// the same name: "SaveBar/SaveBar:0/Button:1") and how many of each name it has made so far
interface Place { id: number; key: string; counts: Map<string, number> }
const PARENT: { id: symbol; defaultValue: Place } = { id: Symbol("ide.parent"), defaultValue: { id: 0, key: "", counts: new Map() } };
const HIDDEN: Place = { id: -1, key: "", counts: new Map() }, OWN = new Set(["ToastHost"]);
const PLUMBING = new Set(["If", "Else", "For", "Switch", "Match", "Await", "Dynamic", "Portal", "Try", "Fragment", "Show"]);
const instances = new Map<number, { id: number; parent: number; name: string; key: string; roots: () => Element[] }>();
let instSeq = 0, treeCb: (() => void) | null = null, treeQueued = false;
const treeChanged = (): void => { if (treeQueued || !treeCb) return; treeQueued = true; queueMicrotask(() => { treeQueued = false; treeCb?.() }) };
// props given to one instance (by its key) in MarchIDE's Properties: over its own, on that instance only
let instProps: Record<string, Props> = {};
const over = (p: Props, extra: Props): Props => {
  const o = Object.defineProperties({}, Object.getOwnPropertyDescriptors(p)) as Props;
  for (const [k, v] of Object.entries(resolve(extra))) Object.defineProperty(o, k, { value: v, enumerable: true, configurable: true, writable: true });
  return o;
};
const HIERARCHY = core.defineExtension({
  name: "march-ide-hierarchy", order: -1000,
  render: (next, p, ctx) => {
    const name = ctx.info.name, parent = core.useContext(PARENT);
    if (!name || PLUMBING.has(name)) return next(p);
    // the preview's own parts (its toast stack and the toasts in it) are not the page's: neither they nor what they
    // draw are listed (HIDDEN is passed down)
    if (parent === HIDDEN || OWN.has(name)) { core.provide(PARENT, HIDDEN); return next(p); }
    const n = parent.counts.get(name) ?? 0;
    parent.counts.set(name, n + 1);
    const id = ++instSeq, key = `${parent.key}/${name}:${n}`;
    core.provide(PARENT, { id, key, counts: new Map() });
    instances.set(id, { id, parent: parent.id, name, key, roots: () => [] });
    core.onCleanup(() => { instances.delete(id); treeChanged() });
    treeChanged();
    const extra = instProps[key];
    // an instance that throws while drawing (IconButton without its label, before the Properties' values arrive) is
    // not on screen and its cleanup never runs: it leaves the Hierarchy here, or every such draw would stay listed
    try { return next(extra ? over(p, extra) : p); } catch (e) { instances.delete(id); treeChanged(); throw e; }
  },
  setup: (ctx) => { const inst = instances.get(core.useContext(PARENT).id); if (inst && inst.name === ctx.info.name) inst.roots = ctx.roots; },
});
/** Registers the recorder (again after a run clears the code's extensions), with March's components named: the
 * bundle's function names are shortened. A test that reads the path turns on an owner per instance. */
const watchTree = (): void => {
  core.extensions.name(ui as Record<string, unknown>);
  core.extend({ test: (_c: unknown, _i: unknown, path: readonly unknown[]) => path.length >= 0 }, HIERARCHY);
};
watchTree();
/** Called when instances come or go (once per change, after it). */
export function onTree(cb: () => void): void { treeCb = cb; }
/** The instances on screen now, in the order they were made: name, the root element's id and its text. */
export function componentTree(): TreeItem[] {
  const all = [...instances.values()];
  // every instance's root: a parent's text leaves out what its child instances show (a Row of Buttons has no text of
  // its own; the Buttons' words are on their own rows)
  const roots = new Set<Node>(all.map((x) => x.roots()[0]).filter((el): el is Element => !!el));
  const ownText = (el: Element): string => {
    let out = "";
    const walk = (n: Node): void => {
      for (let c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) out += ` ${c.nodeValue ?? ""}`;
        else if (c.nodeType === 1 && !roots.has(c)) walk(c);
        if (out.length > 200) return;
      }
    };
    walk(el);
    return out.replace(/\s+/g, " ").trim().slice(0, 60);
  };
  // two instances on one root (a Row whose first box is its first Button's): the text is the inner one's (made later)
  const inner = new Map<Node, number>();
  for (const x of all) { const el = x.roots()[0]; if (el && (inner.get(el) ?? -1) < x.id) inner.set(el, x.id); }
  return all.map((x) => {
    const el = x.roots()[0];
    return { id: x.id, parent: x.parent, name: x.name, key: x.key, elId: el?.id ?? "", text: el && inner.get(el) === x.id ? ownText(el) : "" };
  });
}
/** The instance an element of the preview belongs to: the nearest one whose root holds it (of two with the same root,
 * the inner one, made later); 0 for none. */
export function instanceAt(node: Node | null): number {
  const byRoot = new Map<Element, number>();
  for (const x of instances.values()) { const el = x.roots()[0]; if (el) byRoot.set(el, x.id); }
  for (let n: Node | null = node; n; n = n.parentNode) { const id = n instanceof Element ? byRoot.get(n) : undefined; if (id) return id; }
  return 0;
}
/** Props for single instances, by key (the Hierarchy's choice in Properties): the preview is drawn again with them. */
export function setInstanceProps(map: Record<string, Props>): void {
  if (JSON.stringify(map) === JSON.stringify(instProps)) return;
  instProps = map;
  setProps(lastProps, lastParts);
}
/** Points at an instance in the preview: its root element flashes and comes into view. */
export function highlight(id: number): void {
  const el = instances.get(id)?.roots()[0] as HTMLElement | undefined;
  if (!el) return;
  el.scrollIntoView({ block: "nearest", inline: "nearest" });
  el.setAttribute("data-ide-hl", "");
  setTimeout(() => el.removeAttribute("data-ide-hl"), 900);
}

/** The untrack of this runtime's March (the debugger reads the code's values without subscribing to them). */
export const untrack = core.untrack;
/** Remove what the last run rendered. */
let toastStop: (() => void) | null = null;
export function stop(): void {
  dataStop?.(); dataStop = null;
  // the preview's toasts go with it
  ui.toast.clear(); toastStop?.(); toastStop = null;
  if (!last) return;
  for (const cell of last.cells.values()) cell.dispose();
  URL.revokeObjectURL(last.url);
  last = null;
}
