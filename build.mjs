#!/usr/bin/env node
// Builds the showcase as static files: dist/ opens from anywhere (relative paths, hash routing). Usage: node examples/showcase/build.mjs
// Then locally: node examples/showcase/build.mjs --serve (http://127.0.0.1:5181, with a strict CSP header).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
export const CSP = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; media-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types 'none'";

if (!process.argv.includes("--serve") || !existsSync(dist)) {
  execFileSync(process.execPath, [join(here, "..", "..", "cli", "march.js"), "build"], { cwd: here, stdio: "inherit", env: { ...process.env, MARCH_SHOWCASE_SW: process.argv.includes("--serve") ? "1" : "0" } });
  // index.html: root-absolute paths → relative (hosting in a subfolder or from files)
  const html = join(dist, "index.html");
  writeFileSync(html, readFileSync(html, "utf8").replace(/(src|href)="\/(?!\/)/g, '$1="./'));
  const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
  // the compared third-party libraries of /bench (march.config.js › budget.parts, each its own lazy chunk): their
  // runtimes carry HTML-string code paths (React's <script> creation, Vue's static content…) that the benchmark apps
  // never reach and the CSP's Trusted Types would refuse; only those chunk files skip this check
  const manifest = JSON.parse(readFileSync(html, "utf8").match(/id="march-manifest">([^<]*)</)?.[1] ?? "{}");
  const parts = Object.keys((await import(pathToFileURL(join(here, "march.config.js")).href)).default.budget?.parts ?? {});
  const thirdParty = new Set(parts.flatMap((k) => (manifest[k] ?? []).slice(0, 1)).map((f) => resolve(dist, f.split("?")[0])));
  const bad = walk(dist).filter((p) => /\.(js|css|html)$/.test(p) && !thirdParty.has(p)).filter((p) => /innerHTML\s*=|insertAdjacentHTML|document\.write\(/.test(readFileSync(p, "utf8")));
  if (bad.length) { console.error("✖ forbidden pattern:", bad); process.exit(1); }
  console.log(`✔ showcase: ${dist}`);
}
if (process.argv.includes("--serve")) {
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  createServer((req, res) => {
    let p = resolve(dist, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(dist) || !existsSync(p) || statSync(p).isDirectory()) p = join(dist, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream", "content-security-policy": CSP });
    res.end(readFileSync(p));
  }).listen(5181, "127.0.0.1", () => console.log("showcase: http://127.0.0.1:5181/"));
}
