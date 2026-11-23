// The showcase pages that are MarchIDE: page path → the ide.json it opens (the examples' ide.json, examples.ts).
// These pages share one route layout (playground/march-ide.tsx): moving between them keeps MarchIDE on screen and
// only takes the next ide.json. /ide/<path> opens <path>'s ide.json the same way.
// A component page is MarchIDE as soon as the examples have components/<its slug>/ide.json (<section>-<slug> for a shared slug) (ide-list.gen.ts, written by
// tools/gen-ide-texts.js): the page of topic <slug> under section <hub> is /<hub>/<slug>.
import { TOPIC_ROWS } from "../topic-titles.gen.ts";
import { IDE_COMPONENTS } from "./ide-list.gen.ts";

// A slug that two sections share (/editors/code is CodeEditor, /forms/code is CodeInput) has its folder named after
// the section too: components/editors-code/ide.json. A unique slug may use either name.
const wanted = new Set(IDE_COMPONENTS);
const uses = new Map<string, number>();
// (the topic pages from start-up's titles table: this module is part of start-up, topics.ts is not)
const TOPICS = TOPIC_ROWS.map(([p]) => { const i = p.lastIndexOf("/"); return { hub: p.slice(0, i), slug: p.slice(i + 1) }; });
for (const t of TOPICS) uses.set(t.slug, (uses.get(t.slug) ?? 0) + 1);
const folderOf = (hub: string, slug: string): string | undefined => {
  const own = `${hub.slice(1)}-${slug}`;
  return wanted.has(own) ? own : uses.get(slug) === 1 && wanted.has(slug) ? slug : undefined;
};
export const IDE_PAGES: Record<string, string> = Object.fromEntries(TOPICS.flatMap(({ hub, slug }) => {
  const f = folderOf(hub, slug); return f ? [[`${hub}/${slug}`, `components/${f}`]] : [];
}));

/** Whether a path is a MarchIDE page (/ide, /ide/<path>, a page of IDE_PAGES, /test-bilesen). */
export const isIdePage = (path: string): boolean => path === "/ide" || path.startsWith("/ide/") || path in IDE_PAGES || path === "/test-bilesen";

/** The ide.json a path opens: "components/button" for /buttons/button or /ide/components/button, "" for the
 * built-in files (/ide, /test-bilesen). */
export function ideOf(path: string): string {
  if (path === "/ide" || path.startsWith("/ide/")) return path.slice("/ide".length).split("/").filter(Boolean).join("/");
  return IDE_PAGES[path] ?? "";
}
