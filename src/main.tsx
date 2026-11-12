// HADI March showcase: every component, theme and animation of the library. Written entirely in March (no inline styles,
// no innerHTML); themes switch with data-hm-theme, light/dark with data-theme. Hash routing (static hosting).
import "hadi-march/css/font.css";
import "hadi-march/css/tokens.css";
import "hadi-march/css/sx.css"; // components bring their own CSS (only what is used, split per page)
import "hadi-march/motion/motion.css";
import "./showcase.css";
import "./perflog.ts"; // network panel of the Speed page: records from the start
import { render, messages, setLocale } from "hadi-march";
import { createRouter } from "hadi-march/router";
import { installTransitions, installFlip, pageTransitions } from "hadi-march/motion";
import { bootLoader } from "hadi-march/ui";
import tr from "hadi-march/i18n/tr";
import { App, PAGES, LOADERS } from "./app.tsx";

messages("tr", tr);
setLocale("tr");
installTransitions();
installFlip();

createRouter({
  mode: "hash",
  routes: Object.fromEntries(PAGES.map((p) => [p.path, LOADERS[p.path]])),
  title: (to: { path: string }) => { const p = PAGES.find((x) => x.path === to.path); return p && p.path !== "/" ? `${p.title} · HADI March` : "HADI March · Vitrin"; },
});
pageTransitions({ type: "fade", duration: 180 });

const el = document.getElementById("app");
if (el) { render(() => <App />, el); bootLoader.done(); }
