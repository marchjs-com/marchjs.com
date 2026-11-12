// Icon pack gallery data for the Icons page: plain JSON in dist/icon-packs/ (build.mjs writes it with
// `march icons gallery`), fetched when a pack is opened and kept for the visit. No JavaScript bundle carries icon data.
import type { IconDef } from "hadi-march/icons";
import { packIcon } from "hadi-march/icons/packs";

/** [name, export name, shapes, flags?, evenOdd?] — flags: 1 mirrors in RTL, 2 filled; evenOdd: shapes filled even-odd. */
export type PackRow = [name: string, exp: string, d: string[], flags?: number, eo?: number[]];
interface Paint { vb: string; sw?: number; fill?: boolean }
export interface PackInfo extends Paint {
  id: string; name: string; license: string; count: number; version: string | null; home: string; mode: "stroke" | "fill";
  samples: [name: string, d: string[], flags?: number, eo?: number[]][];
}
export interface PackData extends Paint { id: string; icons: PackRow[] }

const memo = new Map<string, Promise<unknown>>();
function json<T>(file: string): Promise<T> {
  let p = memo.get(file) as Promise<T> | undefined;
  if (!p) {
    p = fetch(`icon-packs/${file}`).then((r) => { if (!r.ok) throw new Error(`${file}: ${r.status}`); return r.json() as Promise<T> });
    memo.set(file, p);
    p.catch(() => memo.delete(file)); // a failed load may be retried
  }
  return p;
}

/** Every pack (name, license, count, three samples). */
export const loadIndex = (): Promise<PackInfo[]> => json<PackInfo[]>("index.json");
/** Icon names of every pack, for search across packs: { id: "name name …" }. */
export const loadNames = (): Promise<Record<string, string>> => json<Record<string, string>>("names.json");
/** One pack's icons. */
export const loadPack = (id: string): Promise<PackData> => json<PackData>(`${id}.json`);

/** Gallery row → icon definition, drawn by the packs' shared layer (grid, stroke width or fill, RTL, even-odd). */
export const toDef = (p: Paint, name: string, d: string[], flags = 0, eo?: number[]): IconDef => packIcon(name, d, {
  vb: p.vb, ...(p.sw ? { sw: p.sw } : {}), ...(p.fill || flags & 2 ? { fill: true } : {}), ...(flags & 1 ? { rtl: true } : {}), ...(eo ? { eo } : {}),
});

/** What a click copies: the imports and the icon at the chosen size. */
export function importLine(pack: string, exp: string, size: string): string {
  const use = `<Icon of={${exp}} size="${size}" />`;
  return pack === "march"
    ? `import { Icon, ${exp} } from "hadi-march/icons"\n${use}`
    : `import { Icon } from "hadi-march/icons"\nimport { ${exp} } from "hadi-march/icons/${pack}"\n${use}`;
}
