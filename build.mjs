#!/usr/bin/env node
// Vitrini statik derler: dist/ her yerden açılabilir (göreli yollar, hash yönlendirme). Kullanım: node examples/showcase/build.mjs
// Sonra yerelde: node examples/showcase/build.mjs --serve (http://127.0.0.1:5181, sıkı CSP başlığıyla).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { join, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
export const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types 'none'";

if (!process.argv.includes("--serve") || !existsSync(dist)) {
  execFileSync(process.execPath, [join(here, "..", "..", "cli", "march.js"), "build"], { cwd: here, stdio: "inherit" });
  // index.html: kökten mutlak yollar → göreli (alt klasörde ya da dosyadan barındırma)
  const html = join(dist, "index.html");
  writeFileSync(html, readFileSync(html, "utf8").replace(/(src|href)="\/(?!\/)/g, '$1="./'));
  const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const bad = walk(dist).filter((p) => /\.(js|css|html)$/.test(p)).filter((p) => /innerHTML\s*=|insertAdjacentHTML|document\.write\(/.test(readFileSync(p, "utf8")));
  if (bad.length) { console.error("✖ yasak desen:", bad); process.exit(1); }
  console.log(`✔ vitrin: ${dist}`);
}
if (process.argv.includes("--serve")) {
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
  createServer((req, res) => {
    let p = resolve(dist, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(dist) || !existsSync(p) || statSync(p).isDirectory()) p = join(dist, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream", "content-security-policy": CSP });
    res.end(readFileSync(p));
  }).listen(5181, "127.0.0.1", () => console.log("vitrin: http://127.0.0.1:5181/"));
}
