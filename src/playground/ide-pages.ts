// The showcase pages that are MarchIDE: page path → the ide.json it opens (<path>/ide.json, from the public files).
// These pages share one route layout (playground/march-ide.tsx): moving between them keeps MarchIDE on screen and
// only loads the next ide.json. /ide/<path> opens <path>/ide.json the same way.
// A component page is MarchIDE as soon as public/components/<its slug>/ide.json exists (ide-list.gen.ts, written by
// tools/gen-ide-texts.js): the page of topic <slug> under section <hub> is /<hub>/<slug>.
import { HUBS } from "../topics.ts";
import { IDE_COMPONENTS } from "./ide-list.gen.ts";

const wanted = new Set(IDE_COMPONENTS);
export const IDE_PAGES: Record<string, string> = Object.fromEntries(Object.entries(HUBS).flatMap(([hub, topics]) =>
  topics.filter((t) => wanted.has(t.slug)).map((t) => [`${hub}/${t.slug}`, `components/${t.slug}`])));

/** Whether a path is a MarchIDE page (/ide, /ide/<path>, a page of IDE_PAGES, /test-bilesen). */
export const isIdePage = (path: string): boolean => path === "/ide" || path.startsWith("/ide/") || path in IDE_PAGES || path === "/test-bilesen";

/** The ide.json a path opens: "components/button" for /buttons/button or /ide/components/button, "" for the
 * built-in files (/ide, /test-bilesen). */
export function ideOf(path: string): string {
  if (path === "/ide" || path.startsWith("/ide/")) return path.slice("/ide".length).split("/").filter(Boolean).join("/");
  return IDE_PAGES[path] ?? "";
}
