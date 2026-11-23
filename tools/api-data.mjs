#!/usr/bin/env node
// The API reference's data (public/api/: index.en.json, index.tr.json, docs-<n>.json) from the data March publishes
// with the release (cdn.marchjs.com/<version>/data/api/), with the site's own links added: an export's `demo` is the
// page that draws its component (the component's section, from src/sections.gen.ts), else a page that uses the
// component (src/pages), else the page that shows its card (src/catalog/showcase.json).
//   node tools/api-data.mjs            write public/api/
//   node tools/api-data.mjs --check    exit 1 when public/api/ is out of date
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, dataFile, dataFiles, marchVersion } from "./march.mjs";

const OUT = join(SITE, "public", "api");

/** Component name → the page and section that draw its demo (src/sections.gen.ts: ids c-<category>-<folder>). */
function sectionLinks(components) {
  const file = join(SITE, "src", "sections.gen.ts");
  const sections = existsSync(file) ? JSON.parse(/SECTIONS: Section\[\] = (\[.*\]);/s.exec(readFileSync(file, "utf8"))?.[1] ?? "[]") : [];
  const out = new Map();
  for (const c of components) {
    const id = `c-${c.category}-${c.name}`;
    const own = sections.find((x) => x.id === id);
    if (own && c.meta?.name) out.set(c.meta.name, `${own.path}#${id}`);
  }
  return out;
}

/** Component → a page that uses it, from the page sources (src/pages/<page>.tsx). */
function pageLinks() {
  const out = new Map();
  const dir = join(SITE, "src", "pages");
  const walk = (d, pre) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name), `${pre}${e.name}/`) : e.name.endsWith(".tsx") ? [[join(d, e.name), `/${pre}${e.name.replace(/\.tsx$/, "")}`]] : []));
  for (const [file, path] of walk(dir, "")) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/<([A-Z][\w$]*)[\s/>]/g)) if (!out.has(m[1]) && m[1] !== "Demo" && m[1] !== "Section") out.set(m[1], path === "/home" ? "/" : path);
  }
  return out;
}

export async function generate() {
  const files = (await dataFiles()).filter((f) => f.startsWith("api/"));
  const components = JSON.parse(readFileSync(await dataFile("components.json"), "utf8")).components;
  const sections = sectionLinks(components), pages = pageLinks();
  const showcase = JSON.parse(readFileSync(join(SITE, "src", "catalog", "showcase.json"), "utf8"));
  const cards = new Map(components.filter((c) => c.meta?.name && showcase[c.folder]).map((c) => [c.meta.name, showcase[c.folder].page]));
  const out = {};
  for (const rel of files) {
    const name = rel.slice("api/".length);
    const text = readFileSync(await dataFile(rel), "utf8");
    if (!/^docs-\d+\.json$/.test(name)) { out[name] = text; continue; }
    const docs = JSON.parse(text);
    for (const d of Object.values(docs)) d.demo = sections.get(d.name) || pages.get(d.name) || cards.get(d.name) || "";
    out[name] = JSON.stringify(docs);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const files = await generate();
  mkdirSync(OUT, { recursive: true });
  let stale = false;
  for (const [name, text] of Object.entries(files)) {
    const p = join(OUT, name);
    if ((existsSync(p) ? readFileSync(p, "utf8") : "") === text) continue;
    stale = true;
    if (check) console.error(`✖ public/api/${name} is out of date: node tools/api-data.mjs`); else writeFileSync(p, text);
  }
  for (const name of readdirSync(OUT).filter((n) => n.endsWith(".json") && !(n in files))) {
    stale = true;
    if (check) console.error(`✖ public/api/${name} is no longer published`); else unlinkSync(join(OUT, name));
  }
  console.log(`api data (March ${await marchVersion()}): ${Object.keys(files).length} files${check ? (stale ? ", out of date" : ", up to date") : ""}`);
  if (check && stale) process.exit(1);
}
