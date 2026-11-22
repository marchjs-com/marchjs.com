// The pages with their menu metadata, for the side menu and the home page: nav-meta.ts (descriptions, groups, icons)
// and topics.ts (every topic's description and March name). Its own module: a section page that reads nav-meta.ts
// (its colour, its group) does not download every section's topics.
import { PAGE_META, type PageMeta } from "./nav-meta.ts";
import { TOPIC_PAGES } from "./topics.ts";

// a topic page (topics.ts) gets its description and March name here: start-up lists it by path and title only
const TOPIC_INFO = new Map(TOPIC_PAGES.map((t) => [t.path, t.name ? { desc: t.desc, name: t.name } : { desc: t.desc }]));

/** The pages with their menu metadata (the start-up list has paths and titles only). */
// a page listed under another (parent) takes the parent's group (and its icon when it has none of its own)
export const withMeta = <P extends { path: string; parent?: string | undefined }>(list: readonly P[]): (P & Partial<PageMeta> & { name?: string })[] => {
  // a nested page takes its group and icon from the nearest ancestor that has them (/sites/story → /sites/landing → /sites)
  const parentOf = new Map(list.map((p) => [p.path, p.parent]));
  const upMeta = (path: string | undefined, depth = 0): PageMeta | undefined =>
    !path || depth > 8 ? undefined : PAGE_META[path] ?? upMeta(parentOf.get(path), depth + 1);
  return list.map((p) => {
    const up = upMeta(p.parent);
    return { ...p, ...(up ? { group: up.group, icon: up.icon } : {}), ...TOPIC_INFO.get(p.path), ...PAGE_META[p.path] };
  });
};
