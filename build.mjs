#!/usr/bin/env node
// Builds the showcase as static files: dist/ opens from anywhere (relative paths; normal addresses, docs/hosting.md).
//   node examples/showcase/build.mjs            fast build (= --dev): generators only when their inputs changed, one esbuild
//                                               pass, no chunk planning, no prerender, budgets only warn — for development
//                                               and checks (docs/internal/workflow.md)
//   node examples/showcase/build.mjs --watch    the fast build, then incremental rebuilds on every change
//   node examples/showcase/build.mjs --release  the published build: every generator, chunk planning with the 10 KB floor,
//                                               budgets as errors, prerender (publishing and CI use this)
// Then locally: node examples/showcase/build.mjs --serve (http://127.0.0.1:5181, with a strict CSP header); --serve
// builds first only when dist/ is missing (add --release / --watch as needed). --timing prints the time of each phase.
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join, dirname, extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { marchVersion, dataFile, dataFiles, fetchText } from "./tools/march.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
// March: always the newest release (cdn.marchjs.com's latest). The site is compiled with that release's sources (its
// compiler, demos, MarchIDE files) and reads that release's data from the CDN, so code and data are the same version.
// Its sources are installed from March's tag v<latest> (package.json is not changed) when node_modules holds another one.
const MARCH = join(here, "node_modules", "march");
// read once here and handed to the generators (tools/march.mjs reads MARCH_VERSION), so all of them use the same release
const MARCH_VERSION = await marchVersion();
process.env.MARCH_VERSION = MARCH_VERSION;
const MARCH_REF = `v${MARCH_VERSION}`;
{
  const mark = join(here, "node_modules", ".cache", "march-ref");
  if (!existsSync(join(MARCH, "package.json")) || (existsSync(mark) ? readFileSync(mark, "utf8") : "") !== MARCH_REF) {
    console.log(`March ${MARCH_REF} (latest): installing its sources`);
    execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install", "--no-save", "--no-audit", "--no-fund", `github:marchjs-com/march#${MARCH_REF}`], { cwd: here, stdio: "inherit", shell: process.platform === "win32" });
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dirname(mark), { recursive: true });
    writeFileSync(mark, MARCH_REF);
  }
}
const cli = join(MARCH, "cli", "march.js");
const { writeGallery } = await import(pathToFileURL(join(MARCH, "cli", "icons.js")).href);
const { filesOver } = await import(pathToFileURL(join(MARCH, "cli", "perf.js")).href);
export const CSP = "default-src 'none'; script-src 'self' blob: 'wasm-unsafe-eval'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; media-src 'self'; connect-src 'self' https://cdn.jsdelivr.net https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com https://api.deepseek.com https://api.moonshot.ai https://api.mistral.ai https://api.groq.com https://openrouter.ai https://api.meta.ai https://api.x.ai https://dashscope-intl.aliyuncs.com https://api.z.ai https://api.together.xyz https://api.fireworks.ai https://api.cerebras.ai https://api.perplexity.ai http://localhost:11434 http://localhost:1234; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types march-worker";

const args = process.argv.slice(2);
const release = args.includes("--release");
const watching = !release && args.includes("--watch");
const serve = args.includes("--serve");
const extra = args.filter((a) => ["--timing", "--no-minify", "--analyze"].includes(a));

if (!serve || !existsSync(dist) || watching) {
  const t0 = performance.now();
  // the service worker only for the local preview: the published showcase must not leave a worker registered
  const env = { ...process.env, MARCH_SHOWCASE_SW: serve ? "1" : "0" };
  // the site's generated sources, from its pages and the release's data (cdn.marchjs.com/<version>/data/): the section
  // index (the API reference links to it), the topic pages' start-up titles, MarchIDE's texts and page list, the API
  // examples index, the API reference, the components' prop tables and the home numbers; the benchmark data (each
  // library bundled) on --release only
  const gens = ["gen-sections.js", "gen-topic-titles.mjs", "gen-ide-texts.js", "api-examples.js", "api-data.mjs", "march-data.mjs", ...(release ? ["gen-bench.mjs"] : [])];
  for (const g of gens) {
    try { execFileSync(process.execPath, [join(here, "tools", g)], { cwd: here, stdio: "inherit" }); }
    catch { console.error(`✖ tools/${g} failed`); process.exit(1); }
  }
  const tGen = performance.now() - t0;
  if (watching) {
    // stays running: march build --watch rebuilds on change (serve alongside with --serve)
    const p = spawn(process.execPath, [cli, "build", "--watch", ...extra], { cwd: here, stdio: "inherit", env });
    p.on("exit", (c) => process.exit(c ?? 0));
  } else {
    execFileSync(process.execPath, [cli, "build", release ? "--release" : "--dev", ...extra], { cwd: here, stdio: "inherit", env });
    // index.html: root-absolute paths → relative (hosting in a subfolder or from files)
    const html = join(dist, "index.html");
    writeFileSync(html, readFileSync(html, "utf8").replace(/(src|href)="\/(?!\/)/g, '$1="./'));
    const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
    // the compared third-party libraries of /bench (march.config.js › THIRD_PARTY, each its own lazy chunk): their
    // runtimes carry HTML-string code paths (React's <script> creation, Vue's static content…) that the benchmark apps
    // never reach and the CSP's Trusted Types would refuse; only those chunk files skip this check
    const manifest = JSON.parse(readFileSync(html, "utf8").match(/id="march-manifest">([^<]*)</)?.[1] ?? "{}");
    const parts = (await import(pathToFileURL(join(here, "march.config.js")).href)).THIRD_PARTY ?? [];
    const thirdParty = new Set(parts.flatMap((k) => (manifest[k] ?? []).slice(0, 1)).map((f) => resolve(dist, f.split("?")[0])));
    const bad = walk(dist).filter((p) => /\.(js|css|html)$/.test(p) && !thirdParty.has(p)).filter((p) => /innerHTML\s*=|insertAdjacentHTML|document\.write\(/.test(readFileSync(p, "utf8")));
    if (bad.length) { console.error("✖ forbidden pattern:", bad); process.exit(1); }
    // icon packs for the Icons page: plain JSON fetched when a pack is opened (no JavaScript bundle grows)
    const packs = writeGallery(join(MARCH, "src", "icons", "packs"), join(dist, "icon-packs"));
    console.log(`✔ icon packs: ${packs.length} (dist/icon-packs)`);
    // the spray theme wave's paint worklet: a plain script the page loads from its own origin (CSP script-src 'self')
    writeFileSync(join(dist, "spray-worklet.js"), readFileSync(join(MARCH, "src", "motion", "spray-worklet.js")));
    // the playground's build tools, loaded only by MarchIDE (/ide): esbuild-wasm (its ESM browser build and the wasm; CSP
    // allows 'wasm-unsafe-eval') and the March compiler bundled for the browser (its node-only loader replaced by the
    // runtime's own sx module)
    await writePlaygroundTools(join(dist, "playground"));
    // the whole published folder (pages, chunks, public files, icon packs) against budget.maxFiles
    const maxFiles = (await import(pathToFileURL(join(here, "march.config.js")).href)).default.budget?.maxFiles;
    const tooMany = release ? filesOver(dist, maxFiles) : null;
    if (tooMany) { console.error(`✖ ${tooMany}`); process.exit(1); }
    console.log(`✔ showcase (${release ? "release" : "dev"}): ${dist} in ${((performance.now() - t0) / 1000).toFixed(1)} s (generators ${(tGen / 1000).toFixed(1)} s)`);
  }
}
/**
 * Files of the data cdn.marchjs.com publishes for March's version (<version>/data/, see data/index.json): the ones
 * `want` names (a path or a test), from tools/march.mjs's cache, copied into `out` without the `strip` prefix.
 */
async function cdnData(want, out, strip = "") {
  const { mkdirSync, copyFileSync } = await import("node:fs");
  const files = (await dataFiles()).filter((f) => want.some((w) => (typeof w === "function" ? w(f) : w === f)));
  await Promise.all(files.map(async (f) => {
    const to = join(out, f.slice(strip.length));
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(await dataFile(f), to);
  }));
  return files.length;
}

async function writePlaygroundTools(out) {
  const { mkdirSync, copyFileSync } = await import("node:fs");
  const esbuild = await import("esbuild");
  const root = MARCH;
  mkdirSync(out, { recursive: true });
  copyFileSync(join(here, "node_modules", "esbuild-wasm", "esm", "browser.min.js"), join(out, "esbuild.js"));
  copyFileSync(join(here, "node_modules", "esbuild-wasm", "esbuild.wasm"), join(out, "esbuild.wasm"));
  // the TypeScript language service: its worker (march-app-ui), the compiler and the lib .d.ts files it reads on demand
  copyFileSync(join(root, "src", "components", "composite", "app-ui", "ts-worker.js"), join(out, "ts-worker.js"));
  copyFileSync(join(root, "src", "components", "composite", "app-ui", "instrument.js"), join(out, "instrument.js"));
  // March's guide for AI assistants: MarchIDE's AI reads it as its instructions (fetched on the first message); it is not
  // part of the package, so it comes from March's repository at the pinned tag
  writeFileSync(join(out, "ai-instructions.md"), await fetchText(`https://raw.githubusercontent.com/marchjs-com/march/${MARCH_REF}/AI_INSTRUCTIONS.md`));
  const tsLib = join(here, "node_modules", "typescript", "lib");
  mkdirSync(join(out, "ts"), { recursive: true });
  copyFileSync(join(tsLib, "typescript.js"), join(out, "ts", "typescript.js"));
  for (const f of readdirSync(tsLib)) if (/^lib\..*\.d\.ts$/.test(f)) copyFileSync(join(tsLib, f), join(out, "ts", f));
  // its messages in other languages (the worker loads the page's one: tr/diagnosticMessages.generated.json…)
  for (const d of readdirSync(tsLib)) {
    const msgs = join(tsLib, d, "diagnosticMessages.generated.json");
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(d) && existsSync(msgs)) { mkdirSync(join(out, "ts", d), { recursive: true }); copyFileSync(msgs, join(out, "ts", d, "diagnosticMessages.generated.json")); }
  }
  // the JS / DOM API's documentation in other languages (march-app-ui lib-docs/<locale>/*.json, data, not code): one
  // file per language beside the messages, read by the worker on the first description asked in that language
  const libDocs = join(root, "src", "components", "composite", "app-ui", "lib-docs");
  for (const loc of existsSync(libDocs) ? readdirSync(libDocs) : []) {
    const merged = {};
    for (const f of readdirSync(join(libDocs, loc)).filter((f) => f.endsWith(".json")).sort()) Object.assign(merged, JSON.parse(readFileSync(join(libDocs, loc, f), "utf8")));
    mkdirSync(join(out, "ts", loc), { recursive: true });
    writeFileSync(join(out, "ts", loc, "lib-docs.json"), JSON.stringify(merged));
  }
  // March's own types for the worker (march-types.json and the icon packs' declarations): the data cdn.marchjs.com
  // publishes with the version (data/ide/), kept in node_modules/.cache per version, copied beside the lib files
  await cdnData(["ide/march-types.json", (f) => f.startsWith("ide/march-icons/")], join(out, "ts"), "ide/");
  const sx = join(root, "src", "core", "sx.ts").split("\\").join("/");
  await esbuild.build({
    entryPoints: [join(root, "compiler", "index.js")], bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true,
    outfile: join(out, "march-compiler.js"), logLevel: "error",
    plugins: [{ name: "browser-load-ts", setup(b) {
      b.onResolve({ filter: /\/load-ts\.js$/ }, () => ({ path: "load-ts", namespace: "march-browser" }));
      b.onLoad({ filter: /.*/, namespace: "march-browser" }, () => ({ contents: `import * as sx from ${JSON.stringify(sx)}; export const importTs = async () => sx;`, loader: "js", resolveDir: root }));
    } }],
  });
  // the preview runtime (loaded by MarchIDE only): March and its components bundled once, and run(code, el), which
  // imports the playground's build from a blob: URL (CSP script-src blob:) and renders it in the preview's stage
  const { march } = await import(pathToFileURL(join(root, "compiler", "esbuild.js")).href);
  await esbuild.build({
    entryPoints: [join(here, "src", "playground", "preview-runtime.ts")], bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true,
    outdir: out, entryNames: "preview", assetNames: "[name]", logLevel: "error", loader: { ".woff2": "file", ".svg": "file", ".png": "file" },
    // one file with all of March: March under node_modules is side-effect free by its package.json, and in a bundle
    // without splitting esbuild then drops the initializer of a module that is both re-exported and imported lazily
    // (Drawer: through march/ui and through Dialog), so it runs uninitialized. Nothing is shaken out here anyway.
    ignoreAnnotations: true,
    plugins: [march({ dev: false, cssSplit: false, deepImports: false })],
  });
  console.log("✔ playground tools (esbuild-wasm, March compiler, TypeScript, preview runtime)");
}
// the port: 5181, or --port <n> / PORT (several checkouts serving side by side)
const portArg = args.indexOf("--port");
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT) || 5181;
if (serve) {
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    let p = resolve(dist, "." + decodeURIComponent(url.pathname));
    if (!p.startsWith(dist) || !existsSync(p) || statSync(p).isDirectory()) {
      // an address of the app (/buttons/button): to the start page with ?m-path=, which the router puts back, as the
      // published 404.html does (index.html's files are relative: from a deeper address they would not load)
      if (url.pathname !== "/" && !extname(url.pathname)) { res.writeHead(302, { location: `/?m-path=${encodeURIComponent(url.pathname + url.search)}` }); res.end(); return; }
      // a missing file is a 404 (not the page, which would load as the wrong kind of file)
      if (url.pathname !== "/") { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); res.end("not found"); return; }
      p = join(dist, "index.html");
    }
    // a build running beside the server rewrites dist/: a file gone for that moment is a 503, not a crash of the server
    let body;
    try { body = readFileSync(p); } catch { res.writeHead(503, { "content-type": "text/plain; charset=utf-8", "retry-after": "1" }); res.end("building"); return; }
    res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream", "content-security-policy": CSP });
    res.end(body);
  }).listen(port, "127.0.0.1", () => console.log(`showcase: http://127.0.0.1:${port}/`));
}
