// Speed › Comparison (/bench): the compared libraries stay in step everywhere they are named.
//   node --test test/bench-libs.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const pkg = JSON.parse(read("package.json"));
const dev = pkg.devDependencies;
// LIBS rows of src/bench/libs.ts: { id, name, version, src }
const LIBS = [...read("src/bench/libs.ts").matchAll(/\{ id: "([^"]+)", name: "([^"]+)", version: "([^"]*)", src: "([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2], version: m[3], src: m[4] }));
// the APPS map of tools/gen-bench.mjs (read as text: importing the tool would run it)
const GEN = read("tools/gen-bench.mjs").replace(/\r\n/g, "\n");
const APPS = [...GEN.slice(GEN.indexOf("export const APPS")).split("\n};")[0].matchAll(/^ {2}(\w+): \{/gm)].map((m) => m[1]);
const { THIRD_PARTY, default: config } = await import(pathToFileURL(join(ROOT, "march.config.js")).href);
const { BASELINE } = { BASELINE: /export const BASELINE = "(\w+)"/.exec(read("src/bench/libs.ts"))[1] };

// the npm package whose version a library's LIBS row shows
const MAIN_PKG = { react: "react", preact: "preact", vue: "vue", svelte: "svelte", solid: "solid-js", lit: "lit", marko: "marko", inferno: "inferno", ivi: "ivi", mithril: "mithril", alpine: "@alpinejs/csp", angular: "@angular/core" };

test("every library has a LIBS row; pure JavaScript is the baseline", () => {
  assert.equal(BASELINE, "vanilla");
  const ids = LIBS.map((l) => l.id);
  for (const id of ["vanilla", "march", ...Object.keys(MAIN_PKG)]) assert.ok(ids.includes(id), `LIBS has ${id}`);
  assert.equal(new Set(ids).size, ids.length, "ids are unique");
});

test("every compared library's version is its exact devDependency", () => {
  for (const l of LIBS) {
    if (l.id === "vanilla" || l.id === "march") continue;
    const name = MAIN_PKG[l.id];
    assert.ok(name, `${l.id}: its npm package is named in this test`);
    assert.ok(dev[name], `${name} is a devDependency`);
    assert.match(dev[name], /^\d+\.\d+\.\d+$/, `${name} is pinned to an exact version`);
    assert.equal(l.version, dev[name], `${l.id}: LIBS says ${l.version}, package.json ${dev[name]}`);
  }
  for (const [name, v] of Object.entries(dev)) assert.match(v, /^\d+\.\d+\.\d+$/, `${name} is pinned to an exact version`);
});

test("every library has an app, a size and a license", () => {
  const sizes = JSON.parse(read("public/bench/sizes.json"));
  const licenses = JSON.parse(read("public/bench/licenses.json")).map((l) => l.name);
  const sources = JSON.parse(read("public/bench/sources.json"));
  for (const l of LIBS) {
    assert.ok(existsSync(join(ROOT, l.src)), `${l.id}: ${l.src} exists`);
    assert.ok(sizes[l.id]?.gzip > 0, `${l.id} has a size`);
    assert.ok(sources[l.id], `${l.id} has its source in the Code section`);
    if (MAIN_PKG[l.id]) assert.ok(licenses.includes(MAIN_PKG[l.id]), `${MAIN_PKG[l.id]}'s license is listed`);
  }
});

test("every third-party library is its own lazy chunk, exempt only as a benchmark app", () => {
  for (const k of THIRD_PARTY) assert.match(k, /^src\/bench\/apps\//, `${k}: only benchmark apps are exempt`);
  for (const l of LIBS) {
    if (l.id === "vanilla" || l.id === "march") continue;
    assert.ok(THIRD_PARTY.includes(l.src), `${l.id}: its chunk ${l.src} is in THIRD_PARTY`);
  }
  for (const [k, v] of Object.entries(config.budget.parts)) if (k.startsWith("src/bench/apps/")) {
    assert.ok(THIRD_PARTY.includes(k), `${k}: a part limit only for a third-party chunk`);
    assert.ok(v.limit > 25 * 1024 && v.why, `${k}: an argued limit above the default`);
  }
  const libs = read("src/bench/libs.ts");
  for (const l of LIBS) assert.match(libs, new RegExp(`load: \\(\\) => import\\("\\./apps/[\\w.-]+"\\)`), `${l.id} loads lazily`);
  assert.doesNotMatch(libs, /^import (?!type)/m, "libs.ts imports no app statically");
});

test("compiled apps hand no HTML string to the DOM (Trusted Types)", () => {
  for (const f of ["solid.gen.js", "ivi.gen.js", "inferno.gen.js", "svelte.gen.js", "vue.render.gen.js"]) {
    assert.doesNotMatch(read(`src/bench/apps/${f}`), /innerHTML|_\$template\(`|_hN\(`/, f);
  }
  // Marko: its runtime keeps the string parser as a fallback; every compiled template is DOM-built and goes first
  const marko = read("src/bench/apps/marko.gen.js");
  assert.match(marko, /function parseHTML\(html, ns\) \{\n\s*if \(typeof html === "function"\) return html\(\);/);
  assert.doesNotMatch(marko, /"</, "Marko: no HTML-string template left (app and scenarios)");
  assert.doesNotMatch(read("src/bench/apps/angular.gen.js"), /ɵɵngDeclare|new Function/, "Angular: AOT, linked, no JIT");
  // Angular renders with DOM calls; its runtime names innerHTML only for an [innerHTML] binding, which no app uses
  for (const p of ["src/bench/apps/angular-app.ts", ...SCENARIO_DIRS().map((d) => `src/bench/scenarios/${d}/angular.ts`)]) assert.doesNotMatch(read(p), /innerHTML|innerHtml/i, p);
  for (const dir of SCENARIOS) for (const f of ["solid.gen.js", "ivi.gen.js", "inferno.gen.js", "svelte.gen.js"]) {
    const p = `src/bench/scenarios/${dir}/${f}`;
    if (existsSync(join(ROOT, p))) assert.doesNotMatch(read(p), /innerHTML|_\$template\(`|_hN\(`/, p);
  }
});

// the realistic scenarios: every compared library runs every scenario, its apps riding in its own chunk
const SCENARIO_DIRS = () => readdirSync(join(ROOT, "src/bench/scenarios"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const SCENARIOS = SCENARIO_DIRS();
const SCEN_FILE = { vanilla: "vanilla.ts", march: "march.tsx", react: "react.ts", preact: "preact.ts", vue: "vue.ts", svelte: "svelte.svelte", solid: "solid.jsx", lit: "lit.ts", marko: "marko.marko", inferno: "inferno.jsx", ivi: "ivi.ts", mithril: "mithril.ts", alpine: "alpine.ts", angular: "angular.ts" };
test("every library has an app for every realistic scenario, registered in its chunk", () => {
  const reg = read("src/bench/scenarios/libs.ts");
  const sources = JSON.parse(read("public/bench/scenario-sources.json"));
  for (const l of LIBS) {
    assert.match(reg, new RegExp(`^  ${l.id}: \\(\\) =>`, "m"), `${l.id} is in SCENARIO_LIBS`);
    const file = SCEN_FILE[l.id];
    assert.ok(file, `${l.id}: its scenario file name is known to this test`);
    for (const dir of SCENARIOS) {
      assert.ok(existsSync(join(ROOT, "src/bench/scenarios", dir, file)), `${l.id}: ${dir}/${file}`);
      assert.ok(sources[dir]?.[l.id], `${l.id}: ${dir} is in the Code section`);
    }
    if (l.id === "vanilla" || l.id === "march") continue;
    // its scenario apps are imported through its benchmark app (one chunk for the runtime and its apps)
    const agg = read(`src/bench/scenarios/${l.id}.ts`);
    for (const dir of SCENARIOS) assert.match(agg, new RegExp(`\\b${dir}\\b`), `${l.id}: ${dir} is in scenarios/${l.id}.ts`);
  }
});

test("generated benchmark files are up to date", () => {
  assert.deepEqual([...APPS].sort(), LIBS.map((l) => l.id).sort(), "tools/gen-bench.mjs APPS lists every library");
  execFileSync(process.execPath, [join(ROOT, "tools/gen-bench.mjs"), "--check"], { cwd: ROOT, stdio: "pipe" });
});
