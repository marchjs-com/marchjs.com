// The route table: every page's path, title and lazy loader. A start-up chunk of its own (budget.boot, grouped with
// the shell pieces), not part of the entry: adding a page adds a line here and a chunk, never entry bytes
// (test/entry-pages.test.js checks it).
import type { RouteTarget } from "hadi-march/router";
import { PAGES } from "./nav.ts";
import { SHELL, setPageTitles } from "./app.tsx";

const ROUTER_DEMO = () => import("./router-demo/_layout.tsx");
/** Lazy page loaders (path → module). */
export const LOADERS: Record<string, () => Promise<unknown>> = {
  "/": () => import("./pages/home.tsx"),
  "/start": () => import("./pages/start.tsx"),
  "/themes": () => import("./pages/themes.tsx"),
  "/icons": () => import("./pages/icons.tsx"),
  "/buttons": () => import("./pages/buttons.tsx"),
  "/forms": () => import("./pages/forms.tsx"),
  "/data": () => import("./pages/data.tsx"),
  "/charts": () => import("./pages/charts.tsx"),
  "/overlays": () => import("./pages/overlays.tsx"),
  "/feedback": () => import("./pages/feedback.tsx"),
  "/motion": () => import("./pages/motion.tsx"),
  "/animation": () => import("./pages/animation.tsx"),
  "/text-motion": () => import("./pages/text-motion.tsx"),
  "/speed": () => import("./pages/speed.tsx"),
  "/messaging": () => import("./pages/messaging.tsx"),
  "/network": () => import("./pages/network.tsx"),
  "/layout": () => import("./pages/layout.tsx"),
  "/navigation": () => import("./pages/navigation.tsx"),
  "/overlay": () => import("./pages/overlay.tsx"),
  "/language": () => import("./pages/language.tsx"),
  "/managers": () => import("./pages/managers.tsx"),
  "/managers-data": () => import("./pages/managers-data.tsx"),
  "/managers-ops": () => import("./pages/managers-ops.tsx"),
  "/seo": () => import("./pages/seo.tsx"),
  "/managers-a11y": () => import("./pages/managers-a11y.tsx"),
  "/managers-env": () => import("./pages/managers-env.tsx"),
  "/ide": () => import("./pages/ide.tsx"),
};

const ROUTER_TITLE = "Yönlendirici";
export const ROUTES = {
  ...Object.fromEntries(PAGES.map((p) => [p.path, { load: LOADERS[p.path], layouts: [SHELL], title: p.title }])),
  // router demo: a section layout under the shell (nested, kept while its tabs change) and a record page that opens
  // beside (named outlet), over the list (modal route) or in full (direct visit)
  "/navigation/router": { load: () => import("./router-demo/list.tsx"), layouts: [SHELL, ROUTER_DEMO], title: ROUTER_TITLE },
  "/navigation/router/about": { load: () => import("./router-demo/about.tsx"), layouts: [SHELL, ROUTER_DEMO], title: ROUTER_TITLE },
  "/navigation/router/item/:id": { load: () => import("./router-demo/item.tsx"), layouts: [SHELL], title: ROUTER_TITLE },
};
export const OUTLETS = { aside: { "/item/:id": () => import("./router-demo/item.tsx") } };

const titleOf = (p: string): string | undefined => (p.startsWith("/navigation/router") ? ROUTER_TITLE : PAGES.find((x) => x.path === p)?.title);
setPageTitles(titleOf);
/** Document title of a route. */
export const pageTitle = (to: RouteTarget): string => { const t = to.path !== "/" && titleOf(to.path); return t ? `${t} · HADI March` : "HADI March · Vitrin"; };
