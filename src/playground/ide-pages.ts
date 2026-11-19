// The showcase pages that are MarchIDE: page path → the ide.json it opens (<path>/ide.json, from the public files).
// These pages share one route layout (playground/march-ide.tsx): moving between them keeps MarchIDE on screen and
// only loads the next ide.json. /ide/<path> opens <path>/ide.json the same way.
// A component page is MarchIDE as soon as public/components/<its slug>/ide.json exists (<section>-<slug> for a shared slug) (ide-list.gen.ts, written by
// tools/gen-ide-texts.js): the page of topic <slug> under section <hub> is /<hub>/<slug>.
import { HUBS } from "../topics.ts";
import { IDE_COMPONENTS } from "./ide-list.gen.ts";

// A slug that two sections share (/editors/code is CodeEditor, /forms/code is CodeInput) has its folder named after
// the section too: public/components/editors-code/ide.json. A unique slug may use either name.
const wanted = new Set(IDE_COMPONENTS);
const uses = new Map<string, number>();
for (const topics of Object.values(HUBS)) for (const t of topics) uses.set(t.slug, (uses.get(t.slug) ?? 0) + 1);
const folderOf = (hub: string, slug: string): string | undefined => {
  const own = `${hub.slice(1)}-${slug}`;
  return wanted.has(own) ? own : uses.get(slug) === 1 && wanted.has(slug) ? slug : undefined;
};
export const IDE_PAGES: Record<string, string> = Object.fromEntries(Object.entries(HUBS).flatMap(([hub, topics]) =>
  topics.flatMap((t) => { const f = folderOf(hub, t.slug); return f ? [[`${hub}/${t.slug}`, `components/${f}`]] : []; })));

/** Whether a path is a MarchIDE page (/ide, /ide/<path>, a page of IDE_PAGES, /test-bilesen). */
export const isIdePage = (path: string): boolean => path === "/ide" || path.startsWith("/ide/") || path in IDE_PAGES || path === "/test-bilesen";

/** The ide.json a path opens: "components/button" for /buttons/button or /ide/components/button, "" for the
 * built-in files (/ide, /test-bilesen). */
export function ideOf(path: string): string {
  if (path === "/ide" || path.startsWith("/ide/")) return path.slice("/ide".length).split("/").filter(Boolean).join("/");
  return IDE_PAGES[path] ?? "";
}
