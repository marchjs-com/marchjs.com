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
import { genAll } from "../../tools/gen-all.mjs";
import { writeGallery } from "../../cli/icons.js";
import { filesOver } from "../../cli/perf.js";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const cli = join(here, "..", "..", "cli", "march.js");
export const CSP = "default-src 'none'; script-src 'self' blob: 'wasm-unsafe-eval'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; media-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types march-worker";

const args = process.argv.slice(2);
const release = args.includes("--release");
const watching = !release && args.includes("--watch");
const serve = args.includes("--serve");
const extra = args.filter((a) => ["--timing", "--no-minify", "--analyze"].includes(a));

if (!serve || !existsSync(dist) || watching) {
  const t0 = performance.now();
  // the service worker only for the local preview: the published showcase must not leave a worker registered
  const env = { ...process.env, MARCH_SHOWCASE_SW: serve ? "1" : "0" };
  // generated sources (registry, API reference, icons, themes…): the release build regenerates all of them
  try { genAll({ force: release, log: (l) => console.log(l) }); } catch (e) { console.error(`✖ ${e.message}`); process.exit(1); }
  // the home page numbers (components, exports, icons, tests …) from their sources: none is typed by hand
  execFileSync(process.execPath, [join(here, "..", "..", "tools", "gen-home-stats.js")], { stdio: "inherit" });
  // the command palette's section index (Ctrl+K finds a demo inside a page and jumps to it)
  execFileSync(process.execPath, [join(here, "..", "..", "tools", "gen-sections.js")], { stdio: "inherit" });
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
    const packs = writeGallery(join(here, "..", "..", "src", "icons", "packs"), join(dist, "icon-packs"));
    console.log(`✔ icon packs: ${packs.length} (dist/icon-packs)`);
    // the spray theme wave's paint worklet: a plain script the page loads from its own origin (CSP script-src 'self')
    writeFileSync(join(dist, "spray-worklet.js"), readFileSync(join(here, "..", "..", "src", "motion", "spray-worklet.js")));
    // the playground's build tools, loaded only by /playground: esbuild-wasm (its ESM browser build and the wasm; CSP
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
async function writePlaygroundTools(out) {
  const { mkdirSync, copyFileSync } = await import("node:fs");
  const esbuild = await import("esbuild");
  const root = join(here, "..", "..");
  mkdirSync(out, { recursive: true });
  copyFileSync(join(root, "node_modules", "esbuild-wasm", "esm", "browser.min.js"), join(out, "esbuild.js"));
  copyFileSync(join(root, "node_modules", "esbuild-wasm", "esbuild.wasm"), join(out, "esbuild.wasm"));
  // the TypeScript language service: its worker (march-app-ui), the compiler and the lib .d.ts files it reads on demand
  copyFileSync(join(root, "src", "components", "composite", "app-ui", "ts-worker.js"), join(out, "ts-worker.js"));
  copyFileSync(join(root, "src", "components", "composite", "app-ui", "instrument.js"), join(out, "instrument.js"));
  const tsLib = join(root, "node_modules", "typescript", "lib");
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
  const sx = join(root, "src", "core", "sx.ts").split("\\").join("/");
  await esbuild.build({
    entryPoints: [join(root, "compiler", "index.js")], bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true,
    outfile: join(out, "march-compiler.js"), logLevel: "error",
    plugins: [{ name: "browser-load-ts", setup(b) {
      b.onResolve({ filter: /\/load-ts\.js$/ }, () => ({ path: "load-ts", namespace: "march-browser" }));
      b.onLoad({ filter: /.*/, namespace: "march-browser" }, () => ({ contents: `import * as sx from ${JSON.stringify(sx)}; export const importTs = async () => sx;`, loader: "js", resolveDir: root }));
    } }],
  });
  // the preview runtime (loaded by /playground only): March and its components bundled once, and run(code, el), which
  // imports the playground's build from a blob: URL (CSP script-src blob:) and renders it in the preview's stage
  const { march } = await import(pathToFileURL(join(root, "compiler", "esbuild.js")).href);
  await esbuild.build({
    entryPoints: [join(here, "src", "playground", "preview-runtime.ts")], bundle: true, format: "esm", platform: "browser", target: "es2022", minify: true,
    outdir: out, entryNames: "preview", assetNames: "[name]", logLevel: "error", loader: { ".woff2": "file", ".svg": "file", ".png": "file" },
    plugins: [march({ dev: false, cssSplit: false, deepImports: false })],
  });
  console.log("✔ playground tools (esbuild-wasm, March compiler, TypeScript, preview runtime)");
}
if (serve) {
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  createServer((req, res) => {
    let p = resolve(dist, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(dist) || !existsSync(p) || statSync(p).isDirectory()) p = join(dist, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream", "content-security-policy": CSP });
    res.end(readFileSync(p));
  }).listen(5181, "127.0.0.1", () => console.log("showcase: http://127.0.0.1:5181/"));
}
