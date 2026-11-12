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
    // page transitions demo: each tab is its own route with its own transition; a tile's page (shared element)
    "/transitions": { load: () => import("./pages/transitions.tsx"), layouts: [SHELL], meta: { transition: "fade" } },
    "/transitions/slide": { load: () => import("./pages/transitions.tsx"), layouts: [SHELL], meta: { transition: "slide" } },
    "/transitions/scale": { load: () => import("./pages/transitions.tsx"), layouts: [SHELL], meta: { transition: "scale" } },
    "/transitions/tile/:id": { load: () => import("./transitions-demo/tile.tsx"), layouts: [SHELL] },
    // router demo: a section layout under the shell (nested, kept while its tabs change) and a record page that opens
    // beside (named outlet), over the list (modal route) or in full (direct visit)
    "/navigation/router": { load: () => import("./router-demo/list.tsx"), layouts: [SHELL, ROUTER_DEMO] },
    "/navigation/router/about": { load: () => import("./router-demo/about.tsx"), layouts: [SHELL, ROUTER_DEMO] },
    "/navigation/router/item/:id": { load: () => import("./router-demo/item.tsx"), layouts: [SHELL] },
  },
  outlets: { aside: { "/item/:id": () => import("./router-demo/item.tsx") } },
  title: (to: { path: string }) => { const t = to.path.startsWith("/navigation/router") ? "Yönlendirici" : to.path !== "/" && PAGES.findLast((x) => to.path.startsWith(x.path))?.title; return t ? `${t} · HADI March` : "HADI March · Vitrin"; },
});

const el = document.getElementById("app");
if (el) { render(() => <Router loading={PAGE_LOADING} skeleton={PAGE_SKELETON} />, el); document.getElementById("hm-boot")?.remove(); }
