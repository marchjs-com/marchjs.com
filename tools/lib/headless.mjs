// Headless Chromium (Edge / Chrome) over CDP for the site's browser checks (from March's tools/lib/headless.mjs): serves
// dist/ (unless a base URL is given), starts the browser with a throwaway profile and returns small helpers.
//
//   const b = await openHeadless({ base, serve, prefix, files, csp, args })   b.base, b.send(method, params), b.ev(expr), b.errs,
//                                                                   b.load(route, w), b.urlOf(route)
//   await b.close()
// Browser: $BROWSER_PATH, else Edge / Chrome in the usual places.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** `--name value` from argv, or the default. */
export const flag = (argv, k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

/** The built showcase (MARCH_SHOWCASE_DIST: another built copy, so an audit can run while the showcase is built again). */
export function showcaseDist() {
  const dist = resolve(process.env.MARCH_SHOWCASE_DIST ?? join(ROOT, "dist"));
  if (!existsSync(dist)) { console.error("✖ dist/ is missing: run node build.mjs first"); process.exit(2); }
  return dist;
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".jpg": "image/jpeg", ".webm": "video/webm" };

/**
 * A static host for dist/, the way real ones behave: a file is served as is; a folder serves its index.html (without
 * the trailing slash it redirects to it first, as GitHub Pages, Cloudflare Pages and S3 do); any other address gets
 * 404.html — with status 404 ("static": GitHub Pages, S3, a plain file server) or 200 ("rewrite": the `/* /404.html 200`
 * rule of Cloudflare Pages / Netlify). `prefix` serves dist/ in a sub-folder ("/march": devs.example.com/march/).
 */
export function serveDist(dist, { mode = "static", prefix = "", policy = null } = {}) {
  const send = (res, status, file) => { res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream", ...(policy ? { "content-security-policy": policy } : {}) }); res.end(readFileSync(file)); };
  return createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    let path = decodeURIComponent(u.pathname);
    if (prefix) {
      if (path === prefix) { res.writeHead(301, { location: `${prefix}/${u.search}` }); return res.end(); }
      if (!path.startsWith(`${prefix}/`)) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("outside the app"); }
      path = path.slice(prefix.length);
    }
    const p = resolve(dist, `.${path}`);
    if (p.startsWith(dist) && existsSync(p)) {
      if (!statSync(p).isDirectory()) return send(res, 200, p);
      if (!u.pathname.endsWith("/")) { res.writeHead(301, { location: `${u.pathname}/${u.search}` }); return res.end(); }
      if (existsSync(join(p, "index.html"))) return send(res, 200, join(p, "index.html"));
    }
    const nf = join(dist, "404.html");
    if (existsSync(nf)) return send(res, mode === "rewrite" ? 200 : 404, nf);
    // the dev build (build.mjs --dev) writes no page folders and no 404.html: the app's index.html routes every page
    const app = join(dist, "index.html");
    if (!extname(path) && existsSync(app)) return send(res, 200, app);
    res.writeHead(404, { "content-type": "text/plain" }); res.end("not found");
  });
}

/**
 * Headless Edge / Chrome on the built showcase. `serve`: "static" (default) | "rewrite" (see serveDist), `prefix` a
 * sub-folder, or `files: true` to open dist/ from files (file://; module scripts allowed from files). A `base` URL
 * skips the local server. `csp`: serve with the showcase's strict CSP header (build.mjs); `args`: extra browser flags.
 */
export async function openHeadless({ base = null, serve = "static", prefix = "", files = false, csp = false, args = [] } = {}) {
  let server;
  // the published showcase's CSP, read from build.mjs (importing it would start a build)
  const policy = csp ? readFileSync(join(ROOT, "build.mjs"), "utf8").match(/export const CSP = "([^"]+)"/)?.[1] : null;
  if (files) base = pathToFileURL(showcaseDist()).href.replace(/\/$/, "");
  else if (!base) {
    server = serveDist(showcaseDist(), { mode: serve, prefix, policy });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${server.address().port}${prefix}`;
  }
  const CANDIDATES = [process.env.BROWSER_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/microsoft-edge"].filter(Boolean);
  const exe = CANDIDATES.find((p) => existsSync(p));
  if (!exe) { console.error("✖ Edge/Chrome not found (set BROWSER_PATH)"); process.exit(2); }
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "march-audit-"));
  const browser = spawn(exe, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-extensions", "--hide-scrollbars", ...(process.env.CI ? ["--no-sandbox"] : []), ...(files ? ["--allow-file-access-from-files"] : []), ...args, "about:blank"], { stdio: "ignore" });
  let target;
  for (let i = 0; i < 80 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); } catch { await sleep(200); } }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const wait = new Map(); const errs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && wait.has(d.id)) { wait.get(d.id)(d); wait.delete(d.id); }
    else if (d.method === "Runtime.exceptionThrown") errs.push(d.params.exceptionDetails?.exception?.description?.split("\n")[0]);
    else if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") errs.push(d.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
    // an alert / confirm / prompt (or a beforeunload ask) would block every later evaluate: dismiss it
    else if (d.method === "Page.javascriptDialogOpening") send("Page.handleJavaScriptDialog", { accept: d.params.type === "beforeunload" });
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  /** Evaluate in the page; undefined (and an entry in errs) when it does not settle within `ms`. */
  const ev = async (e, ms = 30000) => {
    let timer;
    const late = new Promise((r) => { timer = setTimeout(() => { errs.push(`evaluate timed out after ${ms} ms: ${e.slice(0, 80).replace(/\s+/g, " ")}`); r(undefined); }, ms); });
    const out = await Promise.race([send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }).then((d) => d.result?.result?.value), late]);
    clearTimeout(timer);
    return out;
  };
  await send("Page.enable"); await send("Runtime.enable");
  /** The address of a showcase route: a normal path under the base (from files: the route's own index.html). */
  const urlOf = (route) => (files ? `${base}${route === "/" ? "" : route}/index.html` : `${base}${route}`);
  /** Open a showcase route at a width, from a fresh reload. */
  const load = async (route, w = 1440) => {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
    await send("Page.navigate", { url: urlOf(route) }); await sleep(250); await send("Page.reload"); await sleep(1800);
  };
  const close = async () => { ws.close(); browser.kill(); server?.close(); await sleep(300); try { rmSync(profile, { recursive: true, force: true }); } catch {} };
  return { base, send, ev, errs, load, close, urlOf };
}
