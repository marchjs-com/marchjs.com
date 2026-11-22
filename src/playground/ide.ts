// ide.json: what MarchIDE loads for a page (playground/ide-pages.ts) or for /ide/<path> (the examples repository's
// root ide.json holds every page's, examples.ts › ideBundle) to set itself up. `layout` picks the workspace (LAYOUTS); `sources` are its files. The format is a first draft and will change.

export interface IdeSource {
  /** "code": a file of the workspace (its text in `code`). */
  type: "code";
  /** The file's name, its tab's title (ButtonDemo.tsx). */
  name: string;
  code: string;
}
/** A file of an ide.json as written: its text in `code`, or read from `src` (examples://<path>: EXAMPLES). */
export type IdeFileSource = IdeSource | { type: "code"; name: string; src: string };
/** An ide.json as written; MarchIDE reads its `src` files (loadIde) and the workspace takes an IdeJson. */
export interface IdeFile extends Omit<IdeJson, "sources"> { sources: IdeFileSource[] }

// a source's `src: "examples://<path>"` is read from the examples repository pinned to a commit (examples.ts)
import { sourceUrl } from "./examples.ts";
export { EXAMPLES, sourceUrl } from "./examples.ts";

export interface IdeJson {
  layout: string;
  /** The workspace's description, shown beside MarchIDE's title (a component's: its sentence on the components page). */
  description?: string;
  sources: IdeSource[];
}

/** A layout: the workspace drawn for an ide.json. It stays on screen while MarchIDE moves between pages of the same
 * layout: `ide` changes to the next ide.json and `id` to the path it came from ("" for the built-in files). */
/** A workspace: it takes an ide.json's files and calls `ready(id)` once it is ready with them (its tabs in place). */
export type IdeLayout = (props: { ide: () => IdeJson; id: () => string; ready?: (id: string) => void }) => unknown;

/** The layouts MarchIDE knows, by ide.json's `layout`: each its own chunk, loaded when one is asked for. */
export const LAYOUTS: Record<string, () => Promise<{ default: IdeLayout }>> = {
  component: () => import("./layouts/component.tsx"),
};


// the built-in files: /playground with no path (and /test-bilesen) opens these
export const DEFAULT_IDE: IdeJson = { layout: "component", sources: Object.entries({
  "Button.tsx": `export { Button } from "march/ui"
`,
  "Component2.tsx": `import { Card, Badge } from "march/ui"

export function Component2(props: { title: string; count: number }) {
  return <Card title={props.title}>
    <Badge tone="info">{props.count} yeni</Badge>
  </Card>
}
`,
  "Component3.tsx": `import { signal, computed } from "march"

const items = signal(["elma", "armut"])
const total = computed(() => items().length)

export const Component3 = () => <p>{total()} öğe</p>
`,
}).map(([name, code]): IdeSource => ({ type: "code", name, code })) }
/** Reads and checks an ide.json's text: the parsed value, or a message saying what is wrong. */
export function parseIde(text: string): IdeFile | string {
  let v: unknown;
  try { v = JSON.parse(text); } catch { return "ide.json geçerli bir JSON değil"; }
  if (!v || typeof v !== "object") return "ide.json bir nesne olmalı";
  const o = v as Record<string, unknown>;
  if (typeof o["layout"] !== "string") return "ide.json: \"layout\" eksik";
  if (!(o["layout"] in LAYOUTS)) return `ide.json: bilinmeyen layout "${o["layout"]}" (bilinenler: ${Object.keys(LAYOUTS).join(", ")})`;
  const sources = Array.isArray(o["sources"]) ? o["sources"] : [];
  for (const s of sources) {
    const x = s as Record<string, unknown> | null;
    if (!x || x["type"] !== "code" || typeof x["name"] !== "string" || (typeof x["code"] !== "string" && typeof x["src"] !== "string")) return "ide.json: her kaynak { type: \"code\", name, code } ya da { type: \"code\", name, src } olmalı";
  }
  if (o["description"] !== undefined && typeof o["description"] !== "string") return "ide.json: \"description\" bir metin olmalı";
  return { layout: o["layout"], ...(typeof o["description"] === "string" ? { description: o["description"] } : {}), sources: sources as IdeFileSource[] };
}

/** An ide.json's files with their texts: each `src` is made a URL (sourceUrl) and fetched, all at once. A file that
 * cannot be read makes the whole ide.json a message saying which. */
export async function loadIde(ide: IdeFile): Promise<IdeJson | string> {
  const files = await Promise.all(ide.sources.map(async (s): Promise<IdeSource | string> => {
    if ("code" in s) return s;
    const url = sourceUrl(s.src);
    const res = await fetch(url).catch(() => null);
    return res?.ok ? { type: "code", name: s.name, code: await res.text() } : `${s.name} okunamadı (${url}${res ? `: ${res.status}` : ""})`;
  }));
  const failed = files.find((f): f is string => typeof f === "string");
  return failed ?? { ...ide, sources: files as IdeSource[] };
}
