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
import { runLoad } from "hadi-march/lazy";
import { PAGE_LOADING, PAGE_SKELETON } from "./app.tsx";
// the route table is a start-up chunk (grouped with the shell pieces): the entry stays the same size however many
// pages there are; runLoad preloads all of its files at once through the build manifest
const ROUTES = () => import("./routes.ts");

// the Turkish pack is a lazy chunk (library texts switch to Turkish when it arrives)
loadLocale("tr", () => import("hadi-march/i18n/tr"));
void setLocale("tr");

const el = document.getElementById("app");
// index.html carries the start page prerendered (march build, seo.prerender). On that route it stays visible and a small
// lazy chunk hydrates it; any other hash route drops it at once (before anything else loads)
const pre = !!el && el.getAttribute("data-hm-prerender") === `#${location.hash.slice(1) || "/"}`;
if (el && !pre) el.replaceChildren();
const hydrateChunk = pre ? import("hadi-march/seo/hydrate") : null;

void runLoad(ROUTES, { kind: "part", key: "" }).then(async ({ ROUTES: routes, OUTLETS, pageTitle }) => {
  // every page sits in the shell layout (kept alive while pages change)
  createRouter({ mode: "hash", routes, outlets: OUTLETS, title: pageTitle });
  if (!el) return;
  const app = () => <Router loading={PAGE_LOADING} skeleton={PAGE_SKELETON} />;
  if (hydrateChunk) (await hydrateChunk).hydrate(app, el); else render(app, el);
  document.getElementById("hm-boot")?.remove();
});
