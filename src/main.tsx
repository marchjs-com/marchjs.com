// March showcase: every component, theme and animation of the library. Written entirely in March (no inline styles,
// no innerHTML); themes switch with data-hm-theme, light/dark with data-theme. Normal addresses (/motion) under any base
// path; where the address cannot change (file://, a sandboxed iframe) the router uses #/motion by itself.
import "hadi-march/css/font.css";
import "hadi-march/css/tokens.css";
import "hadi-march/css/sx.css"; // components bring their own CSS (only what is used, split per page)
import "hadi-march/motion/motion.css";
import "./showcase.css";
import { render, setLocale } from "hadi-march";
import { loadLocale } from "hadi-march/i18n";
import { createRouter, Router } from "hadi-march/router";
import { runLoad } from "hadi-march/lazy";
import { prerenderedFor } from "hadi-march/seo/prerendered";
import { PAGE_LOADING, PAGE_SKELETON } from "./app.tsx";
// the route table is a start-up chunk (grouped with the shell pieces): the entry stays the same size however many
// pages there are; runLoad preloads all of its files at once through the build manifest
const ROUTES = () => import("./routes.ts");

// the Turkish pack is a lazy chunk (library texts switch to Turkish when it arrives)
loadLocale("tr", () => import("hadi-march/i18n/tr"));
void setLocale("tr");

const el = document.getElementById("app");
// every page's index.html carries that page prerendered (march build, seo.prerender). When the address shows that route
// it stays visible and a small lazy chunk hydrates it; any other route (a 404 fallback, an old #/ link) drops it at once
const pre = !!el && prerenderedFor(el);
if (el && !pre) el.replaceChildren();
const hydrateChunk = pre ? import("hadi-march/seo/hydrate") : null;

void runLoad(ROUTES, { kind: "part", key: "" }).then(async ({ ROUTES: routes, OUTLETS, pageTitle, restoreFrameRoute }) => {
  // in an iframe, a reload that went back to the frame's first address returns to the page it showed
  restoreFrameRoute();
  // every page sits in the shell layout (kept alive while pages change)
  createRouter({ mode: "history", base: "auto", routes, outlets: OUTLETS, title: pageTitle });
  if (!el) return;
  const app = () => <Router loading={PAGE_LOADING} skeleton={PAGE_SKELETON} />;
  if (hydrateChunk) (await hydrateChunk).hydrate(app, el); else render(app, el);
  document.getElementById("hm-boot")?.remove();
});
