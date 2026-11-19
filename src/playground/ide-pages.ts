// The showcase pages that are MarchIDE: page path → the ide.json it opens (<path>/ide.json, from the public files).
// These pages share one route layout (playground/march-ide.tsx): moving between them keeps MarchIDE on screen and
// only loads the next ide.json. /ide/<path> opens <path>/ide.json the same way.
export const IDE_PAGES: Record<string, string> = {
  "/buttons/button": "components/button",
  "/buttons/icon-button": "components/icon-button",
};

/** Whether a path is a MarchIDE page (/ide, /ide/<path>, a page of IDE_PAGES, /test-bilesen). */
export const isIdePage = (path: string): boolean => path === "/ide" || path.startsWith("/ide/") || path in IDE_PAGES || path === "/test-bilesen";

/** The ide.json a path opens: "components/button" for /buttons/button or /ide/components/button, "" for the
 * built-in files (/ide, /test-bilesen). */
export function ideOf(path: string): string {
  if (path === "/ide" || path.startsWith("/ide/")) return path.slice("/ide".length).split("/").filter(Boolean).join("/");
  return IDE_PAGES[path] ?? "";
}
