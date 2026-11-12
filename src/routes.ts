// The route table: every page's path, title and lazy loader. A start-up chunk of its own (budget.boot, grouped with
// the shell pieces), not part of the entry: adding a page adds a line here and a chunk, never entry bytes
// (test/entry-pages.test.js checks it).
import type { RouteTarget } from "hadi-march/router";
import { PAGES, SUB_PAGES } from "./nav.ts";
import { SHELL, setPages } from "./app.tsx";
import GEN from "./routes.gen.js";

const ROUTER_DEMO = () => import("./router-demo/_layout.tsx");
/** Lazy page loaders (path → module): generated from src/pages/ by `march gen routes` (a page file is the only line a
 * new page adds); the start page is pages/home.tsx. */
export const LOADERS: Record<string, () => Promise<unknown>> = { ...GEN, "/": GEN["/home"] };

const ROUTER_TITLE = "Yönlendirici";
export const ROUTES = {
  ...Object.fromEntries(PAGES.map((p) => [p.path, { load: LOADERS[p.path], layouts: [SHELL], title: p.title }])),
  // page transitions demo: its tabs and tile pages (the page module picks each one's transition)
  "/transitions/*": { load: LOADERS["/transitions"], layouts: [SHELL], title: PAGES.find((p) => p.path === "/transitions")?.title },
  // API page: /api/<subpath>/<name> opens one export (the same page module)
  "/api/*": { load: LOADERS["/api"], layouts: [SHELL], title: "API" },
  // motion library pages (/motion/svg, /motion/morph…): one route, each page its own lazy chunk
  "/motion/*": { load: () => import("./motion-hub.tsx"), layouts: [SHELL], title: "Hareket" },
  // router demo: a section layout under the shell (nested, kept while its tabs change) and a record page that opens
  // beside (named outlet), over the list (modal route) or in full (direct visit)
  "/navigation/router": { load: () => import("./router-demo/list.tsx"), layouts: [SHELL, ROUTER_DEMO], title: ROUTER_TITLE },
  "/navigation/router/about": { load: () => import("./router-demo/about.tsx"), layouts: [SHELL, ROUTER_DEMO], title: ROUTER_TITLE },
  "/navigation/router/item/:id": { load: () => import("./router-demo/item.tsx"), layouts: [SHELL], title: ROUTER_TITLE },
};
export const OUTLETS = { aside: { "/item/:id": () => import("./router-demo/item.tsx") } };

const titleOf = (p: string): string | undefined => (p.startsWith("/navigation/router") ? ROUTER_TITLE : (PAGES.find((x) => x.path === p) ?? SUB_PAGES.find((x) => p === x.path || p.startsWith(`${x.path}/`)))?.title);
// paths and titles only: descriptions, groups and icons (nav-meta.ts) load with the side menu, not at start-up
setPages([...PAGES, ...SUB_PAGES.map((p) => ({ ...p, sub: true }))], titleOf);
/** Document title of a route. */
export const pageTitle = (to: RouteTarget): string => { const t = to.path !== "/" && titleOf(to.path); return t ? `${t} · HADI March` : "HADI March · Vitrin"; };
