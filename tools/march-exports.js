// March's package exports, read from the installed package (node_modules/march): every "exports" subpath, its runtime
// exports with their kind and declaration. From March's tools/api-coverage.js (its functions; the site does not write
// api.gen.ts or check the Turkish summaries: March does). tools/api-examples.js uses packageApis, packageEntries and
// runtimeExports.
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

// March: the installed package (its package.json exports and its sources)
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)), "node_modules", "march");
const OUT = "";
/** The Turkish summary catalog. */
export const TR = "docs/api.tr.json";
/** Languages with their own summaries (English is the JSDoc itself). */
const LANGS = ["en", "tr"];
/** Raw bytes of data per lazy part at most (~50 KB of text is ~18 KB gzip: over the 10 KB part floor, under the 25 KB budget). */
const PART_BYTES = 55_000;
const cache = new Map();
const read = (p) => { if (!cache.has(p)) cache.set(p, existsSync(p) ? readFileSync(p, "utf8") : ""); return cache.get(p); };
const DECL = String.raw`(?:export\s+)?(?:declare\s+)?(?:async\s+)?(function\*?|const|let|var|class|enum)\s+`;
const esc = (s) => s.replace(/[$]/g, "\\$&");

/** Runtime exports of a module: name → { file, local } where `local` is the declared name in that file. */
export function runtimeExports(file, seen = new Set()) {
  const out = new Map();
  if (seen.has(file) || !existsSync(file)) return out;
  seen.add(file);
  const src = read(file).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/^export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|enum)\s+([A-Za-z_$][\w$]*)/gm)) out.set(m[1], { file, local: m[1] });
  for (const m of src.matchAll(/^export\s+(?!type\b)\{([^}]*)\}(?:\s*from\s*["']([^"']+)["'])?/gm)) {
    const from = m[2] ? resolve(dirname(file), m[2]) : null;
    for (const part of m[1].split(",")) {
      const p = part.trim();
      if (!p || p.startsWith("type ")) continue;
      const [orig, alias] = p.split(/\s+as\s+/).map((s) => s.trim());
      const name = alias ?? orig;
      if (name === "default") continue;
      if (from) out.set(name, runtimeExports(from, new Set()).get(orig) ?? { file: from, local: orig });
      else out.set(name, imported(file, src, orig) ?? { file, local: orig });
    }
  }
  for (const m of src.matchAll(/^export\s+\*\s+from\s+["']([^"']+)["']/gm)) {
    for (const [n, v] of runtimeExports(resolve(dirname(file), m[1]), seen)) if (!out.has(n)) out.set(n, v);
  }
  return out;
}

/** `export { x }` of a name the file imports: where x really lives. */
function imported(file, src, local) {
  if (new RegExp(String.raw`^` + DECL + esc(local) + String.raw`\b`, "m").test(src)) return null;
  for (const m of src.matchAll(/^import\s+(?!type\b)\{([^}]*)\}\s*from\s*["']([^"']+)["']/gm)) {
    for (const part of m[1].split(",")) {
      const [orig, alias] = part.trim().split(/\s+as\s+/).map((s) => s.trim());
      if ((alias ?? orig) !== local) continue;
      const from = resolve(dirname(file), m[2]);
      return runtimeExports(from, new Set()).get(orig) ?? { file: from, local: orig };
    }
  }
  return null;
}

/** The JSDoc summary (first sentence) and kind of a declaration. */
export function describe({ file, local }) {
  const src = read(file);
  // top-level declaration (no indentation: a nested helper of the same name does not count)
  const m = new RegExp(String.raw`(?:/\*\*((?:(?!\*/)[\s\S])*)\*/\s*)?^` + DECL + esc(local) + String.raw`\b(.{0,60})`, "m").exec(src);
  if (!m) return { kind: "const", summary: "" };
  const head = m[3] ?? "";
  const kind = m[2].startsWith("function") ? (/^[A-Z]/.test(local) ? "component" : "function")
    : m[2] === "class" ? "class" : /^\s*(?::[^=]*)?=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*(?::[^=]*)?=>/.test(head) ? (/^[A-Z]/.test(local) ? "component" : "function") : "const";
  // JSDoc, else the // comment lines right above the declaration
  const lines = [];
  for (const l of src.slice(0, m.index).split("\n").reverse().slice(1)) { const c = /^\s*\/\/\s?(.*)$/.exec(l); if (!c) break; lines.unshift(c[1]); }
  const doc = (m[1] ?? lines.join("\n")).split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim()).filter((l) => l && !l.startsWith("@")).join(" ").trim();
  const summary = doc.replace(/\{@link\s+([^}]+)\}/g, "$1").replace(/\s+/g, " ");
  return { kind, summary: summary.length > 220 ? summary.slice(0, 217).replace(/\s+\S*$/, "") + " …" : summary };
}

/** Summary of a manager's standard trio, from the folder name (src/managers/<folder>/). */
function managerSummary(name, file) {
  const label = file.split("/")[2].replace(/-/g, " ");
  if (/^configure[A-Z]/.test(name)) return `Global options of the ${label} manager (a live instance restarts with them).`;
  if (/^dispose[A-Z]/.test(name)) return `Shut the ${label} manager down (listeners removed); the next use starts it again.`;
  if (/Manager$/.test(name)) return `The ${label} manager itself: get(), configure(), dispose(), alive().`;
  return "";
}

/** Entries of package.json "exports" that are code: [subpath key ("./ui"), target file ("./src/ui/index.ts")]. The
 *  component wildcard ("./components/*") is opened to the component folders (src/components/<category>/<name>/) that
 *  have a runtime export no named entry gives: a large component kept out of its category barrel (meta.barrel === false)
 *  is imported from march/components/<category>/<name> and is listed under that subpath. Other wildcards (CSS
 *  files, icon packs) are not app APIs of their own. */
export function packageEntries(root = ROOT) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const out = [];
  for (const [sub, target] of Object.entries(pkg.exports)) {
    if (typeof target !== "string" || sub.includes("*") || !/\.(ts|js)$/.test(target)) continue;
    out.push([sub, target]);
  }
  const wild = pkg.exports["./components/*"];
  if (typeof wild !== "string" || !wild.includes("*")) return out;
  const key = (at, name) => `${at.file}#${name}`;
  const given = new Set(out.flatMap(([, target]) => [...runtimeExports(join(root, target))].map(([name, at]) => key(at, name))));
  const [before, after] = wild.split("*");
  const base = join(root, before);
  const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : []);
  for (const cat of dirs(base)) for (const name of dirs(join(base, cat))) {
    const target = `${before}${cat}/${name}${after}`;
    const file = join(root, target);
    if (!existsSync(file) || out.some(([, t]) => join(root, t) === file)) continue;
    if ([...runtimeExports(file)].some(([n, at]) => !given.has(key(at, n)))) out.push([`./components/${cat}/${name}`, target]);
  }
  return out;
}

/** Subpaths with their runtime exports (CSS, compiler and testing entries are tools, not app APIs). */
export function packageApis(root = ROOT) {
  const out = [];
  for (const [sub, target] of packageEntries(root)) {
    if (/^\.\/(compiler|esbuild|register|testing)$/.test(sub)) continue;
    const names = [...runtimeExports(join(root, target))].sort(([a], [b]) => a.localeCompare(b, "en"));
    out.push({
      subpath: sub === "." ? "march" : `march/${sub.slice(2)}`,
      items: names.map(([name, at]) => {
        const file = relative(root, at.file).replace(/\\/g, "/");
        // single icons: one SVG path set each, shown on the Icons page; their summary is their name
        if (file.startsWith("src/icons/glyphs/")) return { name, kind: "icon", summary: `Icon: ${name}`, file };
        const d = describe(at);
        // the manager pattern (defineManager): configureX / disposeX / xManager say the same thing for every manager
        const mgr = file.startsWith("src/managers/") && !d.summary && managerSummary(name, file);
        return { name, ...d, ...(mgr ? { summary: mgr } : {}), file };
      }),
    });
  }
  return out;
}

/** The generated files. A name re-exported by several subpaths is described once, under its first subpath, and listed
 *  as "also in" there. The data is split per language into balanced lazy parts (each under the part budget); loadApi(lang) loads them. */
export function generate(root = ROOT) {
  const apis = packageApis(root);
  const first = new Map();
  for (const a of apis) for (const i of a.items) { const k = `${i.file}#${i.name}`; if (!first.has(k)) first.set(k, a.subpath); }
  // icons are one name each: a space-separated list per subpath keeps the parts small
  const rows = apis.map((a) => {
    const own = a.items.filter((i) => first.get(`${i.file}#${i.name}`) === a.subpath);
    return {
      subpath: a.subpath,
      items: own.filter((i) => i.kind !== "icon").map((i) => [i.name, i.kind, i.summary,
        apis.filter((b) => b.subpath !== a.subpath && b.items.some((j) => j.name === i.name && j.file === i.file)).map((b) => b.subpath)]),
      ...(own.some((i) => i.kind === "icon") ? { icons: own.filter((i) => i.kind === "icon").map((i) => i.name).join(" ") } : {}),
    };
  }).filter((a) => a.items.length || a.icons);
  // balanced parts per language: a big subpath may be cut between two parts (loadApi joins the pieces back by subpath)
  const trPath = join(root, TR);
  const tr = existsSync(trPath) ? JSON.parse(readFileSync(trPath, "utf8")) : {};
  const trMissing = [];
  const inLang = (lang) => rows.map((r) => ({ ...r, items: r.items.map((i) => {
    if (lang !== "tr") return i;
    const text = tr[r.subpath]?.[i[0]];
    if (!text) trMissing.push(`${r.subpath} › ${i[0]}`);
    return [i[0], i[1], text || i[2], i[3]];
  }) }));
  for (const l of LANGS) inLang(l); // fills trMissing (the showcase data itself: tools/api-docs.js)
  // catalog entries for names that are not (or no longer) listed under that subpath
  const listed = new Set(rows.flatMap((r) => r.items.map((i) => `${r.subpath} › ${i[0]}`)));
  const trStale = Object.entries(tr).flatMap(([sub, names]) => Object.keys(names).map((n) => `${sub} › ${n}`)).filter((k) => !listed.has(k));
  const files = {};
  const missing = apis.flatMap((a) => a.items.filter((i) => !i.summary).map((i) => `${a.subpath} › ${i.name}  (${i.file})`));
  return { files, missing: [...new Set(missing)], trMissing, trStale, count: rows.reduce((s, a) => s + a.items.length, 0) };
}
