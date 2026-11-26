#!/usr/bin/env node
// Showcase › Hız › Karşılaştırma: data the benchmark page fetches on demand (never part of a JS chunk).
//   public/bench/sources.json   each library's benchmark app source (the Code section shows what is measured)
//   public/bench/licenses.json  license texts of the packaged libraries
//   public/bench/sizes.json     each app bundled on its own with its library (esbuild, minified): raw and gzip bytes,
//                               the "İndirilen (gzip)" column. The values follow the library sources, so --check only
//                               asks that every library has one (a core change elsewhere must not fail the test).
//   src/bench/apps/*.gen.js     compiled apps, as each library's own build step would make them: Vue's template
//                               compiler, the Svelte compiler (fragments: "tree"), babel-preset-solid,
//                               babel-plugin-inferno, ivi's template compiler, Marko's compiler and Angular's AOT
//                               compiler (ngtsc, then the Angular linker and a minified bundle, as Angular's CLI does).
//                               The CSP's Trusted Types refuse HTML strings, so the string templates of Solid, ivi and
//                               Marko become DOM-built ones (built once, cloned per row, like the original).
// `node tools/gen-bench.mjs --check` fails when a written file is out of date (test/bench-libs.test.js).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// the site (its bench apps and scenarios) and March, the installed package
const SC = ROOT;
const MARCH = join(ROOT, "node_modules", "march");
const check = process.argv.includes("--check");
// --only <scenario>: compile just that scenario folder's Vue/Svelte/Solid files (while writing a new scenario)
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";

/** Library id → source files (shown in the Code section), npm packages (licenses) and, when it is not the first source,
 * the file bundled for the size column (keep in step with src/bench/libs.ts). */
export const APPS = {
  vanilla: { src: ["src/bench/apps/vanilla.ts"], pkgs: [] },
  march: { src: ["src/bench/apps/march.tsx"], pkgs: [] },
  react: { src: ["src/bench/apps/react.ts"], pkgs: ["react", "react-dom", "scheduler"] },
  preact: { src: ["src/bench/apps/preact.ts"], pkgs: ["preact"] },
  vue: { src: ["src/bench/apps/vue.ts", "src/bench/apps/vue.template.html"], pkgs: ["vue", "@vue/runtime-dom", "@vue/runtime-core", "@vue/reactivity", "@vue/shared"] },
  svelte: { src: ["src/bench/apps/svelte.svelte", "src/bench/apps/svelte.ts", "src/bench/apps/svelte-app.ts", "src/bench/apps/no-tt.ts"], pkgs: ["svelte"], entry: "src/bench/apps/svelte.ts" },
  solid: { src: ["src/bench/apps/solid.jsx"], pkgs: ["solid-js"], entry: "src/bench/apps/solid.gen.js" },
  lit: { src: ["src/bench/apps/lit.ts", "src/bench/apps/lit-app.ts", "src/bench/apps/no-tt.ts"], pkgs: ["lit", "lit-html", "lit-element", "@lit/reactive-element"] },
  marko: { src: ["src/bench/apps/marko.marko", "src/bench/apps/marko.ts"], pkgs: ["marko"], entry: "src/bench/apps/marko.ts" },
  inferno: { src: ["src/bench/apps/inferno.jsx"], pkgs: ["inferno", "inferno-vnode-flags"], entry: "src/bench/apps/inferno.gen.js" },
  ivi: { src: ["src/bench/apps/ivi.ts"], pkgs: ["ivi"], entry: "src/bench/apps/ivi.gen.js" },
  mithril: { src: ["src/bench/apps/mithril.ts"], pkgs: ["mithril"] },
  alpine: { src: ["src/bench/apps/alpine.ts"], pkgs: ["@alpinejs/csp"] },
  angular: { src: ["src/bench/apps/angular-app.ts", "src/bench/apps/angular.ts", "src/bench/apps/no-tt.ts"], pkgs: ["@angular/core", "@angular/platform-browser", "@angular/common", "rxjs", "tslib"], entry: "src/bench/apps/angular.ts" },
};

/** A small HTML parser for the compiler's own templates (elements, attributes, text, comments) → DOM-building code,
 * one expression per root node. */
export function htmlToDomNodes(html) {
  const re = /<!--([\s\S]*?)-->|<!>|<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[\w:-]+(?:="[^"]*"|='[^']*'|=[^\s>]+)?)*)\s*(\/?)>|([^<]+)/g;
  const root = { kids: [] }, stack = [root];
  for (const m of html.matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[0] === "<!>" || m[1] !== undefined) top.kids.push({ comment: m[1] ?? "" });
    else if (m[2]) { if (stack.length > 1) stack.pop(); }
    else if (m[3]) {
      const attrs = [...(m[4] ?? "").matchAll(/([\w:-]+)(?:="([^"]*)"|='([^']*)'|=([^\s>]+))?/g)].map((a) => [a[1], a[2] ?? a[3] ?? a[4] ?? ""]);
      const el = { tag: m[3], attrs, kids: [] };
      top.kids.push(el);
      if (!m[5] && !/^(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)$/i.test(m[3])) stack.push(el);
    } else if (m[6]) top.kids.push({ text: m[6].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'") });
  }
  const code = (n) => n.tag ? `_$el(${JSON.stringify(n.tag)}, ${JSON.stringify(n.attrs)}${n.kids.map((k) => `, ${code(k)}`).join("")})` : n.text !== undefined ? `document.createTextNode(${JSON.stringify(n.text)})` : `document.createComment(${JSON.stringify(n.comment)})`;
  return root.kids.map(code);
}
/** htmlToDomNodes for a template with exactly one root (Solid, ivi). */
export function htmlToDom(html) {
  const nodes = htmlToDomNodes(html);
  if (nodes.length !== 1) throw new Error(`template must have one root: ${html}`);
  return nodes[0];
}
const DOM_TEMPLATE = `// DOM-built templates (tools/gen-bench.mjs): same contract as solid-js/web template(): built once, then cloned
const _$el = (tag, attrs, ...kids) => { const e = document.createElement(tag); for (const [k, v] of attrs) e.setAttribute(k, v); e.append(...kids); return e };
const _$tpl = (build) => { let node; const fn = () => (node ??= build()).cloneNode(true); fn.cloneNode = fn; return fn };
`;
const NL = String.fromCharCode(10);
const HEAD = (from) => `// GENERATED by tools/gen-bench.mjs from ${from} — do not edit.${NL}`;

async function compileVue(rel) {
  const { compileTemplate } = await import("vue/compiler-sfc");
  const name = rel.split("/").pop();
  const vue = compileTemplate({ source: readFileSync(join(SC, rel), "utf8"), filename: name, id: "bench", compilerOptions: { mode: "module", hoistStatic: true, cacheHandlers: true, prefixIdentifiers: true } });
  if (vue.errors.length) throw new Error(`vue ${rel}: ${vue.errors.join("; ")}`);
  if (/createStaticVNode|innerHTML/.test(vue.code)) throw new Error(`vue ${rel}: HTML-string static content in the compiled template`);
  return HEAD(name) + vue.code.trim() + NL;
}
async function compileSvelte(rel) {
  const { compile } = await import("svelte/compiler");
  const name = rel.split("/").pop();
  const sv = compile(readFileSync(join(SC, rel), "utf8"), { filename: name, generate: "client", fragments: "tree", runes: true, dev: false });
  if (/from_html|\$\.html\(|innerHTML/.test(sv.js.code)) throw new Error(`svelte ${rel}: HTML-string templates in the compiled output`);
  return HEAD(name) + sv.js.code.trim() + NL;
}
async function compileSolid(rel) {
  const babel = await import("@babel/core");
  const name = rel.split("/").pop();
  const solid = await babel.transformAsync(readFileSync(join(SC, rel), "utf8"), { filename: name, babelrc: false, configFile: false, presets: [[join(ROOT, "node_modules/babel-preset-solid/index.js"), { generate: "dom", hydratable: false, omitNestedClosingTags: false, omitLastClosingTag: false, omitQuotes: false }]] });
  let n = 0;
  let code = solid.code.replace(/_\$template\(`([^`]*)`(?:,[^)]*)?\)/g, (_m, html) => { n++; return `_$tpl(() => ${htmlToDom(html)})`; });
  if (!n || /_\$template\(|innerHTML/.test(code)) throw new Error(`solid ${rel}: string templates left in the compiled output`);
  code = code.replace(/import \{ template as _\$template \} from "solid-js\/web";\r?\n/, "");
  return HEAD(name) + DOM_TEMPLATE + code.trim() + NL;
}
async function compileInferno(rel) {
  const babel = await import("@babel/core");
  const name = rel.split("/").pop();
  const out = await babel.transformAsync(readFileSync(join(SC, rel), "utf8"), { filename: name, babelrc: false, configFile: false, plugins: [[join(ROOT, "node_modules/babel-plugin-inferno/lib/index.js"), { imports: true }]] });
  return HEAD(name) + out.code.trim() + NL;
}
async function compileIvi(rel) {
  const { TemplateCompiler } = await import("@ivi/compiler");
  const { transform } = await import("esbuild");
  const name = rel.split("/").pop();
  // as @ivi/rollup-plugin runs it, with the string table written into each template (no bundle-wide pass)
  const ivi = await new TemplateCompiler({ dedupeStrings: false, oveo: false }).transform(readFileSync(join(SC, rel), "utf8"), "tsx");
  let { code } = await transform(ivi.code, { loader: "ts", format: "esm", target: "esnext" });
  let n = 0;
  // _hN("<tr>…</tr>") parses the string with innerHTML once; _hN(node) clones the given node (ivi's own API)
  code = code.replace(/_hN\(`([^`]*)`\)/g, (_m, html) => { n++; return `_hN(${htmlToDom(html)})`; });
  if (!n || /_[hs]N\(`|innerHTML/.test(code)) throw new Error(`ivi ${rel}: string templates left in the compiled output`);
  return HEAD(name) + DOM_TEMPLATE + code.trim() + NL;
}
/** Marko 6, compiled for the browser by Marko's compiler, then bundled with Marko's DOM runtime. The runtime parses each
 * template string once with innerHTML (refused by Trusted Types); here the compiled templates are functions that build
 * the same nodes with DOM calls, and the runtime's parser calls them (one added line, checked below). The runtime then
 * clones them per instance exactly as before. */
async function compileMarko(rel) {
  const { compileFileSync } = await import("@marko/compiler");
  const babel = await import("@babel/core");
  const { build } = await import("esbuild");
  const name = rel.split("/").pop();
  const marko = compileFileSync(join(SC, rel), { output: "dom", optimize: true, sourceMaps: false, modules: "esm", babelConfig: { babelrc: false, configFile: false } });
  let n = 0;
  const domTemplates = ({ template }) => ({ visitor: { StringLiteral(p) {
    if (!/^</.test(p.node.value)) return;
    n++;
    p.replaceWith(template.expression.ast(`() => _$frag(${htmlToDomNodes(p.node.value).join(", ")})`));
  } } });
  const app = (await babel.transformAsync(marko.code, { filename: name, babelrc: false, configFile: false, plugins: [domTemplates] })).code;
  if (!n) throw new Error(`marko ${rel}: no templates found in the compiled output`);
  let patched = 0;
  const runtime = { name: "marko-dom-templates", setup(b) {
    b.onLoad({ filter: /[\\/]marko[\\/]dist[\\/]dom-[\w-]+\.mjs$/ }, (x) => {
      const src = readFileSync(x.path, "utf8");
      const at = "function parseHTML(html, ns) {";
      if (src.split(at).length !== 2) throw new Error("marko: parseHTML not found once in the runtime");
      patched++;
      return { contents: src.replace(at, `${at}\n\tif (typeof html === "function") return html(); // DOM-built template (tools/gen-bench.mjs)`), loader: "js" };
    });
  } };
  const r = await build({ stdin: { contents: DOM_TEMPLATE + "const _$frag = (...nodes) => { const f = new DocumentFragment(); f.append(...nodes); return f };\n" + app + "\n// run(): renders what is queued at once (the benchmark wrapper flushes its own calls with it)\nexport { run } from \"marko/dom\";\n", resolveDir: join(SC, dirname(rel)), sourcefile: name, loader: "js" },
    bundle: true, format: "esm", write: false, absWorkingDir: SC, logLevel: "error", legalComments: "inline", charset: "utf8", plugins: [runtime] });
  if (patched !== 1) throw new Error("marko: the DOM runtime was not bundled");
  return HEAD(name) + r.outputFiles[0].text.replace(/\r\n/g, "\n").trim() + NL;
}
/** Angular: AOT as `ng build` does it. ngtsc compiles the component (template → instructions); Angular's build
 * (@angular/build's JavaScriptTransformer) links the framework's partially compiled packages and applies its
 * tree-shaking passes to every file; esbuild bundles and minifies with the options of Angular's application builder
 * (production conditions, ngDevMode / ngJitMode / ngServerMode off, forwardRef pure). */
async function compileAngular(rel) {
  const ts = (await import("typescript")).default;
  const ngc = await import("@angular/compiler-cli");
  const { JavaScriptTransformer } = await import("@angular/build/private");
  const { build } = await import("esbuild");
  const name = rel.split("/").pop();
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, skipLibCheck: true, lib: ["lib.es2022.d.ts", "lib.dom.d.ts"], types: [], sourceMap: false, noEmitOnError: true, useDefineForClassFields: false, compilationMode: "full", strictTemplates: true };
  const host = ngc.createCompilerHost({ options });
  let js = "";
  host.writeFile = (out, text) => { if (out.endsWith(".js")) js = text; };
  const r = ngc.performCompilation({ rootNames: [join(SC, rel)], options, host });
  const errors = r.diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length || !js) throw new Error(`angular ${rel}: ${errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ") || "no output"}`);
  const transformer = new JavaScriptTransformer({ sourcemap: false, thirdPartySourcemaps: false, advancedOptimizations: true, jit: false, maxConcurrency: 1 });
  const text = (bytes) => Buffer.from(bytes).toString("utf8");
  // a package's "sideEffects": false lets the transformer mark its top level pure, as Angular's build does
  const pkgSideEffects = (path) => {
    const m = /^(.*[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?[^\\/]+)[\\/]/.exec(path);
    const pkg = m ? JSON.parse(readFileSync(join(m[1], "package.json"), "utf8")) : {};
    return async () => (pkg.sideEffects === false ? false : undefined);
  };
  const entry = join(SC, rel.replace(/\.ts$/, ".js"));
  const ng = { name: "angular-build", setup(b) {
    b.onResolve({ filter: /^angular-app-entry$/ }, () => ({ path: entry }));
    b.onLoad({ filter: /\.[cm]?js$/ }, async (x) => (x.path === entry
      ? { contents: text(await transformer.transformData(x.path, js, { skipLinker: true, sideEffects: async () => false })), loader: "js", resolveDir: join(SC, dirname(rel)) }
      : { contents: text(await transformer.transformFile(x.path, { sideEffects: pkgSideEffects(x.path) })), loader: "js" }));
  } };
  let bundle;
  try {
    bundle = await build({ entryPoints: ["angular-app-entry"], bundle: true, format: "esm", minify: true, write: false, absWorkingDir: SC, logLevel: "error", legalComments: "eof", charset: "utf8", target: "es2022",
      conditions: ["module", "production"], resolveExtensions: [".ts", ".tsx", ".mjs", ".js", ".cjs"], pure: ["forwardRef"],
      define: { ngDevMode: "false", ngJitMode: "false", ngServerMode: "false", ngHmrMode: "false" }, plugins: [ng] });
  } finally { await transformer.close(); }
  const code = bundle.outputFiles[0].text.replace(/\r\n/g, "\n");
  if (/ɵɵngDeclare|new Function|\beval\(/.test(code)) throw new Error(`angular ${rel}: JIT code or unlinked declarations left in the bundle`);
  return HEAD(name) + code.trim() + NL;
}
/** Realistic scenarios: src/bench/scenarios/<scenario>/ holds one app per library. */
const SCEN = "src/bench/scenarios";
export const scenarioDirs = () => readdirSync(join(SC, SCEN), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
/** Library id → the source files shown in the Code section for a scenario folder. */
const scenarioSources = (dir) => {
  const files = readdirSync(join(SC, SCEN, dir)).filter((f) => !f.includes(".gen.")).sort();
  const pick = (re) => files.filter((f) => re.test(f)).map((f) => `${SCEN}/${dir}/${f}`);
  return { vanilla: pick(/^vanilla\.ts$/), march: pick(/^march\.tsx$/), react: pick(/^react\.ts$/), preact: pick(/^preact\.ts$/), vue: pick(/^vue.*\.(ts|html)$/), svelte: pick(/^svelte\.(svelte|ts)$/), solid: pick(/^solid\.jsx$/), lit: pick(/^lit.*\.ts$/) };
};

async function compiled() {
  const out = {};
  if (!only) {
    out["src/bench/apps/vue.render.gen.js"] = await compileVue("src/bench/apps/vue.template.html");
    out["src/bench/apps/svelte.gen.js"] = await compileSvelte("src/bench/apps/svelte.svelte");
    out["src/bench/apps/solid.gen.js"] = await compileSolid("src/bench/apps/solid.jsx");
    out["src/bench/apps/inferno.gen.js"] = await compileInferno("src/bench/apps/inferno.jsx");
    out["src/bench/apps/ivi.gen.js"] = await compileIvi("src/bench/apps/ivi.ts");
    out["src/bench/apps/marko.gen.js"] = await compileMarko("src/bench/apps/marko.marko");
    out["src/bench/apps/angular.gen.js"] = await compileAngular("src/bench/apps/angular-app.ts");
  }
  for (const dir of scenarioDirs()) {
    if (only && dir !== only) continue;
    const base = `${SCEN}/${dir}`;
    for (const f of readdirSync(join(SC, base))) {
      if (f.endsWith(".template.html")) out[`${base}/${f.replace(/\.template\.html$/, ".render.gen.js")}`] = await compileVue(`${base}/${f}`);
      else if (f === "svelte.svelte") out[`${base}/svelte.gen.js`] = await compileSvelte(`${base}/${f}`);
      else if (f === "solid.jsx") out[`${base}/solid.gen.js`] = await compileSolid(`${base}/${f}`);
    }
  }
  return out;
}

const licenseText = (pkg) => {
  const dir = join(ROOT, "node_modules", pkg);
  const f = readdirSync(dir).find((n) => /^licen[cs]e(\.md|\.txt)?$/i.test(n));
  return f ? readFileSync(join(dir, f), "utf8").replace(/\r\n/g, "\n").trim() : "";
};
const json = (x) => JSON.stringify(x, null, 1) + "\n";

/** Every app bundled alone (its library included, minified) → raw and gzip (level 9) bytes. */
async function sizes() {
  const { build } = await import("esbuild");
  const { march } = await import(pathToFileURL(join(MARCH, "compiler", "esbuild.js")).href);
  const { gzipSync } = await import("node:zlib");
  const out = {};
  for (const [id, a] of Object.entries(APPS)) {
    const entry = a.entry ?? a.src[0];
    const r = await build({
      entryPoints: [join(SC, entry)], bundle: true, minify: true, format: "esm", write: false, absWorkingDir: SC, logLevel: "error",
      alias: { "march": join(MARCH, "src") },
      define: { "process.env.NODE_ENV": '"production"', __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false", __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false" },
      // the canonical app alone: the realistic scenarios riding in the same chunk are left out of this column
      plugins: [{ name: "no-scenarios", setup: (b) => { b.onResolve({ filter: /scenarios\/\w+\.ts$/ }, (x) => (x.importer.includes("apps") ? { path: x.path, namespace: "no-scen" } : undefined)); b.onLoad({ filter: /.*/, namespace: "no-scen" }, () => ({ contents: "export const scenarios = {}", loader: "js" })); } }, march({ components: join(SC, "src/components"), cssSplit: false })], loader: { ".css": "empty" },
    });
    const js = r.outputFiles.filter((f) => !f.path.endsWith(".css")).map((f) => f.contents);
    const raw = js.reduce((s, b) => s + b.length, 0);
    const gzip = js.reduce((s, b) => s + gzipSync(b, { level: 9 }).length, 0);
    out[id] = { raw, gzip };
  }
  return out;
}

const gen = await compiled();
// the Code section: every source file of an app, one after another
const sources = Object.fromEntries(Object.entries(APPS).map(([id, a]) => [id, a.src.map((f) => (a.src.length > 1 ? `// ── ${f.split("/").pop()}\n` : "") + readFileSync(join(SC, f), "utf8").replace(/\r\n/g, "\n").trim()).join("\n\n") + "\n"]));
const march = JSON.parse(readFileSync(join(MARCH, "package.json"), "utf8"));
const licenses = [{ name: "March", version: march.version, license: march.license, text: readFileSync(join(MARCH, "LICENSE"), "utf8").replace(/\r\n/g, "\n").trim() }];
for (const pkg of [...new Set(Object.values(APPS).flatMap((a) => a.pkgs))]) {
  const p = JSON.parse(readFileSync(join(ROOT, "node_modules", pkg, "package.json"), "utf8"));
  licenses.push({ name: pkg, version: p.version, license: p.license, text: licenseText(pkg) });
}

const scenSources = Object.fromEntries(scenarioDirs().map((dir) => [dir, Object.fromEntries(Object.entries(scenarioSources(dir)).map(([id, fs]) => [id, fs.map((f) => (fs.length > 1 ? `// ── ${f.split("/").pop()}\n` : "") + readFileSync(join(SC, f), "utf8").replace(/\r\n/g, "\n").trim()).join("\n\n") + "\n"]))]));
const files = only ? gen : { "public/bench/scenario-sources.json": json(scenSources), "public/bench/sources.json": json(sources), "public/bench/licenses.json": json(licenses), ...gen };
let stale = [];
// sizes follow the library sources: --check only asks that every library has a size
const SIZES = "public/bench/sizes.json";
if (check && !only) {
  const p = join(SC, SIZES);
  const have = existsSync(p) ? Object.keys(JSON.parse(readFileSync(p, "utf8"))) : [];
  if (Object.keys(APPS).some((id) => !have.includes(id))) stale.push(SIZES);
}
const write = (all) => {
  for (const [name, text] of Object.entries(all)) {
    const path = join(SC, name);
    const old = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (old === text) continue;
    if (check) stale.push(name);
    else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); console.log(`wrote ${name}`); }
  }
};
write(files);
// the sizes bundle the compiled apps, so they are measured after those are written
if (!check && !only) write({ [SIZES]: json(await sizes()) });
if (stale.length) { console.error(`out of date: ${stale.join(", ")} (node tools/gen-bench.mjs)`); process.exit(1); }
