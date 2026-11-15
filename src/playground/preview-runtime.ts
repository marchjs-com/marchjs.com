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
/** Send new props (and parts) to the rendered components, by name (the Properties panel calls it on every change). */
export function setProps(props: Record<string, Props>, parts: Record<string, Parts> = {}): void {
  if (!last) return;
  for (const [name, cell] of last.cells) { cell.dispose(); cell.dispose = draw(cell.C, cell.el, props[name] ?? {}, parts[name] ?? {}); }
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
  }
  last = { url, cells };
  return [...cells.keys()];
}
/** Remove what the last run rendered. */
export function stop(): void {
  if (!last) return;
  for (const cell of last.cells.values()) cell.dispose();
  URL.revokeObjectURL(last.url);
  last = null;
}
