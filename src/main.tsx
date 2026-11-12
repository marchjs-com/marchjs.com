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
import { SHELL, PAGE_LOADING, PAGES, LOADERS } from "./app.tsx";

// the Turkish pack is a lazy chunk (library texts switch to Turkish when it arrives)
loadLocale("tr", () => import("hadi-march/i18n/tr"));
void setLocale("tr");

createRouter({
  mode: "hash",
  // every page sits in the shell layout (kept alive while pages change)
  routes: Object.fromEntries(PAGES.map((p) => [p.path, { load: LOADERS[p.path], layouts: [SHELL] }])),
  title: (to: { path: string }) => { const p = PAGES.find((x) => x.path === to.path); return p && p.path !== "/" ? `${p.title} · HADI March` : "HADI March · Vitrin"; },
});

const el = document.getElementById("app");
if (el) { render(() => <Router loading={PAGE_LOADING} />, el); document.getElementById("hm-boot")?.remove(); }
