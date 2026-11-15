// The playground's preview runtime (playground/preview.js + preview.css, bundled at build time and loaded by
// /playground only): March and its components, and `run(code, el)`, which runs the code the playground builds and
// renders its default export into the preview's stage. The bundle's `import … from "hadi-march/…"` lines are turned
// into this runtime's own modules; the module is imported from a blob: URL (the showcase's CSP allows script-src
// blob: — the showcase is served from its own domain, with no sessions).
import * as core from "../../../../src/index.ts";
import * as ui from "../../../../src/ui/index.ts";
import * as icons from "../../../../src/icons/index.ts";
import * as theme from "../../../../src/theme/index.ts";
import * as motion from "../../../../src/motion/index.ts";
import { withParts, mProps } from "../../../../src/props/index.ts";

const MODULES: Record<string, unknown> = { "hadi-march": core, "hadi-march/ui": ui, "hadi-march/icons": icons, "hadi-march/theme": theme, "hadi-march/motion": motion };
// any other subpath of the components (hadi-march/actions…) is in the ui barrel too
(globalThis as Record<string, unknown>)["__marchPreview"] = new Proxy(MODULES, { get: (m, k: string) => m[k] ?? (k.startsWith("hadi-march/") ? ui : undefined) });

/** `import { a as b, c } from "hadi-march/x";` → `const { a: b, c } = __marchPreview["hadi-march/x"];` (and `* as x`). */
export function link(code: string): string {
  const mod = (path: string): string => `globalThis.__marchPreview[${JSON.stringify(path)}]`;
  return code
    .replace(/import\s*\{([^}]*)\}\s*from\s*["'](hadi-march[^"']*)["'];?/g, (_, names: string, path: string) => `const {${names.replace(/\s+as\s+/g, ": ")}} = ${mod(path)};`)
    .replace(/import\s*\*\s*as\s+([\w$]+)\s*from\s*["'](hadi-march[^"']*)["'];?/g, (_, name: string, path: string) => `const ${name} = ${mod(path)};`)
    .replace(/import\s*["']hadi-march[^"']*["'];?/g, "");
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
const draw = (C: Comp, el: HTMLElement, props: Props, parts: Parts): (() => void) => {
  el.replaceChildren();
  const { children, ...rest } = props;
  // m:color, m:theme… (the common props) go on what the component draws, as the compiler writes them
  const common: Record<string, unknown> = {};
  for (const k of Object.keys(rest)) if (k.startsWith("m:")) { if (rest[k] !== undefined) common[k.slice(2)] = rest[k]; delete rest[k]; }
  const own = resolve(rest);
  // m:parts: the components by themselves (this runtime's ui), each with its props
  const map = new Map<unknown, Record<string, unknown>>();
  for (const [name, p] of Object.entries(parts)) { const comp = (ui as Record<string, unknown>)[name]; if (typeof comp === "function" && Object.keys(p).length) map.set(comp, resolve(p)); }
  const bare = (): unknown => (children === undefined || children === "" ? core.h(C, own) : core.h(C, own, children));
  const make = (): unknown => (Object.keys(common).length ? mProps(bare(), common) : bare());
  return core.render(() => (map.size ? withParts(map as never, make) : make()), el);
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
// the language: the drawn texts (and title / placeholder / aria-label / alt) that are keys of the chosen language's
// dictionary are written in it; what is drawn later is translated as it comes; the default draws the code's own texts
let dict: Record<string, string> | null = null;
const ATTRS = ["title", "placeholder", "aria-label", "alt", "label"];
const translate = (root: Node): void => {
  if (!dict) return;
  const d = dict;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n: Node | null = root; n; n = walk.nextNode()) {
    if (n.nodeType === 3) {
      const text = n.nodeValue ?? "", key = text.trim(), to = d[key];
      if (key && to !== undefined && to !== key) n.nodeValue = text.replace(key, to);
    } else if (n.nodeType === 1) {
      for (const a of ATTRS) { const v = (n as Element).getAttribute(a)?.trim(); const to = v ? d[v] : undefined; if (v && to !== undefined && to !== v) (n as Element).setAttribute(a, to); }
    }
  }
};
const watchers = new Map<HTMLElement, MutationObserver>();
const follow = (el: HTMLElement): void => {
  watchers.get(el)?.disconnect();
  const mo = new MutationObserver((list) => { for (const m of list) { if (m.type === "characterData") translate(m.target); else m.addedNodes.forEach((n) => translate(n)); } });
  mo.observe(el, { childList: true, subtree: true, characterData: true });
  watchers.set(el, mo);
  translate(el);
};
let lastProps: Record<string, Props> = {}, lastParts: Record<string, Parts> = {};
/** The preview's language: its dictionary (text → text), or null for the code's own texts. Everything is drawn again. */
export function setLanguage(next: Record<string, string> | null): void {
  dict = next && Object.keys(next).length ? next : null;
  setProps(lastProps, lastParts);
}
/** Send new props (and parts) to the rendered components, by name (the Properties panel calls it on every change). */
export function setProps(props: Record<string, Props>, parts: Record<string, Parts> = {}): void {
  lastProps = props; lastParts = parts;
  if (!last) return;
  for (const [name, cell] of last.cells) { cell.dispose(); cell.dispose = draw(cell.C, cell.el, props[name] ?? {}, parts[name] ?? {}); if (dict) follow(cell.el); else watchers.get(cell.el)?.disconnect(); }
}
/**
 * Run `code` (an ES module) and render every component it exports (a name with a capital letter) into a cell of
 * `el`, each with its `props` and `parts` by name (then setProps); the previous run is removed. Returns the names.
 */
export async function run(code: string, el: HTMLElement, props: Record<string, Props> = {}, parts: Record<string, Parts> = {}): Promise<string[]> {
  const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
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
    tag.textContent = name;
    const stage = document.createElement("div");
    stage.className = "sc-pv-stage";
    box.append(tag, stage);
    el.append(box);
    cells.set(name, { C, el: stage, dispose: draw(C, stage, props[name] ?? {}, parts[name] ?? {}) });
    if (dict) follow(stage);
  }
  last = { url, cells };
  data = (mod["__marchData"] as Record<string, unknown> | undefined) ?? {};
  watchData();
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
/** The untrack of this runtime's March (the debugger reads the code's values without subscribing to them). */
export const untrack = core.untrack;
/** Remove what the last run rendered. */
export function stop(): void {
  dataStop?.(); dataStop = null;
  for (const mo of watchers.values()) mo.disconnect();
  watchers.clear();
  if (!last) return;
  for (const cell of last.cells.values()) cell.dispose();
  URL.revokeObjectURL(last.url);
  last = null;
}
