#!/usr/bin/env node
// Every MarchIDE page in a headless browser, on the built site (dist/) served with its CSP: /ide/components/<name> for
// each page with an ide.json in the examples (src/playground/ide-list.gen.ts). A page passes when its files load (from
// marchjs-com/examples through jsDelivr), every file's type check leaves no Problems, and its Lab tests (a *.test.tsx
// file) pass.
//   node tools/check-ide.mjs                    every page
//   node tools/check-ide.mjs --shard 3/10       the 3rd of 10 equal parts (CI runs the parts side by side)
//   node tools/check-ide.mjs alert button       those pages
// Browser: $BROWSER_PATH, else Edge / Chrome in the usual places (tools/lib/headless.mjs).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { openHeadless, sleep, flag, ROOT } from "./lib/headless.mjs";

const argv = process.argv.slice(2);
const all = JSON.parse(/IDE_COMPONENTS: readonly string\[\] = (\[[^\]]*\])/.exec(readFileSync(join(ROOT, "src/playground/ide-list.gen.ts"), "utf8"))[1]);
const shard = flag(argv, "--shard", "");
const named = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--shard");
let pages = named.length ? named : all;
if (shard) {
  const [k, n] = shard.split("/").map(Number);
  if (!(k >= 1 && k <= n)) { console.error(`✖ --shard ${shard}: expected k/n with 1 ≤ k ≤ n`); process.exit(2); }
  pages = pages.filter((_, i) => i % n === k - 1);
}

const CI = !!process.env.GITHUB_ACTIONS;
// the code tabs: one per file of the ide.json
const TABS = `[...document.querySelectorAll('[role="tab"]')].filter((t) => /^[\\w.-]+\\.tsx?$/.test(t.textContent.trim()))`;
const text = () => b.ev(`document.body.innerText`).then((s) => s ?? "");

const b = await openHeadless({ csp: true });
await b.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const failed = [];
const t0 = performance.now();
for (const name of pages) {
  const route = `/ide/components/${name}`, t1 = performance.now();
  const why = [];
  // the start page with ?m-path= (as the published 404.html sends any address): index.html's files are relative. No
  // reload after it (b.load's): the router has moved to the page's own address, which has no index.html beside it
  await b.send("Page.navigate", { url: `${b.base}/?m-path=${encodeURIComponent(route)}` });
  let tabs = [];
  for (let k = 0; k < 30 && !tabs.length; k++) { await sleep(1000); tabs = (await b.ev(`${TABS}.map((t) => t.textContent.trim())`)) ?? []; }
  if (!tabs.length) {
    const body = await text();
    // MarchIDE's message (march-ide.tsx: "… bulunamadı", "… okunamadı (url)"), else just that it has no files
    why.push(/[^\n]*(bulunamadı|okunamadı|geçerli bir JSON değil|ide\.json:)[^\n]*/.exec(body)?.[0] ?? "no file tabs");
  } else {
    // opening a file starts its type check: every file once
    for (const tab of tabs) { await b.ev(`${TABS}.find((t) => t.textContent.trim() === ${JSON.stringify(tab)})?.click()`); await sleep(2000); }
    if (tabs.some((t) => /\.test\.tsx?$/.test(t))) {
      let tests = "";
      // the Tests panel's summary (tests-panel.tsx): "4 geçti 4 test · 202 ms", or "1 kaldı 4 test · …"
      for (let k = 0; k < 45 && !tests; k++) { tests = /\d+ (geçti|kaldı) \d+ test · \d+ ms/.exec(await text())?.[0] ?? ""; if (!tests) await sleep(1000); }
      if (!tests) why.push("tests did not run");
      else if (/kaldı/.test(tests)) why.push(`tests: ${tests}`);
    }
    await sleep(2500);
    const probs = await b.ev(`(() => { const t = [...document.querySelectorAll('[role="tab"]')].find((x) => x.textContent.trim().startsWith("Problemler")); if (!t) return ""; t.click(); return t.textContent.trim() })()`);
    if (probs) { await sleep(800); why.push(`${probs}: ${((await b.ev(`document.querySelector(".sc-problems")?.innerText ?? ""`)) ?? "").slice(0, 300).replace(/\s+/g, " ")}`); }
  }
  const s = ((performance.now() - t1) / 1000).toFixed(1);
  if (why.length) {
    failed.push(name);
    console.log(`✖ ${route} (${s} s): ${why.join(" · ")}`);
    if (CI) console.log(`::error title=MarchIDE ${route}::${why.join(" · ").replace(/\n/g, " ")}`);
  } else console.log(`✔ ${route} (${tabs.length} files, ${s} s)`);
}
await b.close();
console.log(`${pages.length - failed.length}/${pages.length} MarchIDE pages pass${shard ? ` (shard ${shard})` : ""} in ${((performance.now() - t0) / 1000).toFixed(0)} s${failed.length ? `; failing: ${failed.join(" ")}` : ""}`);
process.exit(failed.length ? 1 : 0);
