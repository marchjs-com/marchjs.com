// ide.json: what MarchIDE loads for a page (playground/ide-pages.ts) or for /ide/<path> (<path>/ide.json, from
// the showcase's public files) to set itself up. `layout` picks the workspace (LAYOUTS); `sources` are its files. The format is a first draft and will change.

export interface IdeSource {
  /** "code": a file of the workspace (its text in `code`). */
  type: "code";
  /** The file's name, its tab's title (ButtonDemo.tsx). */
  name: string;
  code: string;
}
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
export function parseIde(text: string): IdeJson | string {
  let v: unknown;
  try { v = JSON.parse(text); } catch { return "ide.json geçerli bir JSON değil"; }
  if (!v || typeof v !== "object") return "ide.json bir nesne olmalı";
  const o = v as Record<string, unknown>;
  if (typeof o["layout"] !== "string") return "ide.json: \"layout\" eksik";
  if (!(o["layout"] in LAYOUTS)) return `ide.json: bilinmeyen layout "${o["layout"]}" (bilinenler: ${Object.keys(LAYOUTS).join(", ")})`;
  const sources = Array.isArray(o["sources"]) ? o["sources"] : [];
  for (const s of sources) {
    const x = s as Record<string, unknown> | null;
    if (!x || x["type"] !== "code" || typeof x["name"] !== "string" || typeof x["code"] !== "string") return "ide.json: her kaynak { type: \"code\", name, code } olmalı";
  }
  if (o["description"] !== undefined && typeof o["description"] !== "string") return "ide.json: \"description\" bir metin olmalı";
  return { layout: o["layout"], ...(typeof o["description"] === "string" ? { description: o["description"] } : {}), sources: sources as IdeSource[] };
}
