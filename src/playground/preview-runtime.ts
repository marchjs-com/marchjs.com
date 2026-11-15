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

let last: { dispose: () => void; url: string } | null = null;
/** Run `code` (an ES module) and render its default export into `el`; the previous run is removed. */
export async function run(code: string, el: HTMLElement): Promise<void> {
  const url = URL.createObjectURL(new Blob([link(code)], { type: "text/javascript" }));
  let mod: { default?: unknown };
  try { mod = await import(/* @vite-ignore */ url) as { default?: unknown }; }
  catch (e) { URL.revokeObjectURL(url); throw e; }
  stop();
  el.replaceChildren();
  const C = mod.default;
  if (typeof C !== "function") { URL.revokeObjectURL(url); throw new Error("varsayılan dışa aktarım bir bileşen değil"); }
  const dispose = core.render(() => core.h(C as (p: object) => unknown, {}), el);
  last = { dispose, url };
}
/** Remove what the last run rendered. */
export function stop(): void {
  if (!last) return;
  last.dispose();
  URL.revokeObjectURL(last.url);
  last = null;
}
