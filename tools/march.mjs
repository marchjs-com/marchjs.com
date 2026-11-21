// March for the site's build and tools: which release (cdn.marchjs.com's latest, or MARCH_VERSION) and that release's
// data files from the CDN (<version>/data/, listed in data/index.json), cached in node_modules/.cache/march-data/.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** The installed package: its sources, CLI and compiler. */
export const MARCH = join(SITE, "node_modules", "march");
export const CDN = "https://cdn.marchjs.com";

/** A text over HTTPS. */
export async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.text();
}

let version = null;
/** The release the site uses: MARCH_VERSION, else the CDN's latest (read once per process). */
export async function marchVersion() {
  version ??= process.env.MARCH_VERSION || JSON.parse(await fetchText(`${CDN}/versions.json?t=${Date.now()}`)).latest;
  return version;
}

/** The path of one of the release's data files (data/<rel>), downloaded into the cache the first time. */
export async function dataFile(rel) {
  const v = await marchVersion();
  const cache = join(SITE, "node_modules", ".cache", "march-data", v);
  const at = join(cache, rel);
  if (!existsSync(at)) { mkdirSync(dirname(at), { recursive: true }); writeFileSync(at, await fetchText(`${CDN}/${v}/data/${rel}`)); }
  return at;
}

/** The release's data file list (data/index.json › files). */
export async function dataFiles() {
  return JSON.parse(readFileSync(await dataFile("index.json"), "utf8")).files;
}
