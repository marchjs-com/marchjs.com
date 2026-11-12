// HADI March showcase: every component, theme and animation of the library. Written entirely in March (no inline styles,
// no innerHTML); themes switch with data-hm-theme, light/dark with data-theme. Hash routing (static hosting).
import "hadi-march/css/font.css";
import "hadi-march/css/tokens.css";
import "hadi-march/css/sx.css"; // components bring their own CSS (only what is used, split per page)
import "hadi-march/motion/motion.css";
import "./showcase.css";
import { render, setLocale } from "hadi-march";
import { loadLocale } from "hadi-march/i18n";
import { createRouter, Router } from "hadi-march/router";
import { SHELL, PAGE_LOADING, PAGE_SKELETON, PAGES, LOADERS } from "./app.tsx";
const ROUTER_DEMO = () => import("./router-demo/_layout.tsx");

// the Turkish pack is a lazy chunk (library texts switch to Turkish when it arrives)
loadLocale("tr", () => import("hadi-march/i18n/tr"));
void setLocale("tr");

createRouter({
  mode: "hash",
  // every page sits in the shell layout (kept alive while pages change)
  routes: {
    ...Object.fromEntries(PAGES.map((p) => [p.path, { load: LOADERS[p.path], layouts: [SHELL] }])),
    // page transitions demo: its tabs and tile pages (the page module picks each one's transition)
    "/transitions/*": { load: () => import("./pages/transitions.tsx"), layouts: [SHELL] },
    // router demo: a section layout under the shell (nested, kept while its tabs change) and a record page that opens
    // beside (named outlet), over the list (modal route) or in full (direct visit)
    "/navigation/router": { load: () => import("./router-demo/list.tsx"), layouts: [SHELL, ROUTER_DEMO] },
    "/navigation/router/about": { load: () => import("./router-demo/about.tsx"), layouts: [SHELL, ROUTER_DEMO] },
    "/navigation/router/item/:id": { load: () => import("./router-demo/item.tsx"), layouts: [SHELL] },
  },
  outlets: { aside: { "/item/:id": () => import("./router-demo/item.tsx") } },
  title: (to: { path: string }) => { const t = to.path.startsWith("/navigation/router") ? "Yönlendirici" : to.path !== "/" && PAGES.find((x) => x.path === to.path)?.title; return t ? `${t} · HADI March` : "HADI March · Vitrin"; },
});

const el = document.getElementById("app");
if (el) {
  const app = () => <Router loading={PAGE_LOADING} skeleton={PAGE_SKELETON} />;
  // index.html carries the start page prerendered (march build, seo.prerender). On that route a small lazy chunk
  // hydrates it (the page stays visible meanwhile); any other hash route drops it at once and renders as usual.
  if (el.getAttribute("data-hm-prerender") === `#${location.hash.slice(1) || "/"}`) void import("hadi-march/seo/hydrate").then((m) => m.hydrate(app, el));
  else { el.replaceChildren(); render(app, el); }
  document.getElementById("hm-boot")?.remove();
}
