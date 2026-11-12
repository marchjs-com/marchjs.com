#!/usr/bin/env node
// Builds the showcase as static files: dist/ opens from anywhere (relative paths, hash routing).
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
import { fileURLToPath } from "node:url";
import { genAll } from "../../tools/gen-all.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const cli = join(here, "..", "..", "cli", "march.js");
export const CSP = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; media-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types 'none'";

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
    const bad = walk(dist).filter((p) => /\.(js|css|html)$/.test(p)).filter((p) => /innerHTML\s*=|insertAdjacentHTML|document\.write\(/.test(readFileSync(p, "utf8")));
    if (bad.length) { console.error("✖ forbidden pattern:", bad); process.exit(1); }
    console.log(`✔ showcase (${release ? "release" : "dev"}): ${dist} in ${((performance.now() - t0) / 1000).toFixed(1)} s (generators ${(tGen / 1000).toFixed(1)} s)`);
  }
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
