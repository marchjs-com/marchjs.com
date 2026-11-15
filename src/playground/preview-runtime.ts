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
// also the ones a component reads only once (Button's block, an icon…).
let last: { dispose: () => void; url: string; C: (p: object) => unknown; el: HTMLElement } | null = null;
const draw = (C: (p: object) => unknown, el: HTMLElement, props: Record<string, unknown>): (() => void) => {
  el.replaceChildren();
  const { children, ...rest } = props;
  // an icon prop comes as the icon's name ("plus"): the icon itself is taken from this runtime's icons
  const own = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      const name = typeof v === "string" ? (v.startsWith("icon:") ? v.slice(5) : /icon/i.test(k) ? v : "") : "";
      return [k, name && name in icons ? (icons as Record<string, unknown>)[name] : v];
    }));
  return core.render(() => (children === undefined || children === "" ? core.h(C, own) : core.h(C, own, children)), el);
};
/** Send new props to the rendered component (the Properties panel calls it on every change). */
export function setProps(props: Record<string, unknown>): void {
  if (!last) return;
  last.dispose();
  last.dispose = draw(last.C, last.el, props);
}
/** Run `code` (an ES module) and render its default export into `el` with `props` (then setProps); the previous run is removed. */
export async function run(code: string, el: HTMLElement, props: Record<string, unknown> = {}): Promise<void> {
  const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
  let mod: { default?: unknown };
  try { mod = await import(/* @vite-ignore */ url) as { default?: unknown }; }
  catch (e) { URL.revokeObjectURL(url); throw e; }
  const C = mod.default;
  if (typeof C !== "function") { URL.revokeObjectURL(url); throw new Error("varsayılan dışa aktarım bir bileşen değil"); }
  stop();
  last = { C: C as (p: object) => unknown, el, url, dispose: draw(C as (p: object) => unknown, el, props) };
}
/** Remove what the last run rendered. */
export function stop(): void {
  if (!last) return;
  last.dispose();
  URL.revokeObjectURL(last.url);
  last = null;
}
