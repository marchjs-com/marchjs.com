// HADI March vitrini: kitaplığın bütün bileşenleri, temaları ve animasyonları. Tamamen March ile yazıldı (satır içi stil yok,
// innerHTML yok); temalar data-hm-theme ile, açık/koyu data-theme ile değişir. Yönlendirme hash kipinde (statik barındırma).
import "hadi-march/css/font.css";
import "hadi-march/css/tokens.css";
import "hadi-march/css/sx.css";
import "hadi-march/css/ui.css";
import "hadi-march/css/forms.css";
import "hadi-march/css/table.css";
import "hadi-march/charts/charts.css";
import "hadi-march/motion/motion.css";
import "hadi-march/fx/fx.css";
import "./showcase.css";
import { render, messages, setLocale } from "hadi-march";
import { createRouter } from "hadi-march/router";
import { installTransitions, installFlip, pageTransitions } from "hadi-march/motion";
import { bootLoader } from "hadi-march/ui";
import tr from "hadi-march/i18n/tr";
import { App, PAGES } from "./app.tsx";

messages("tr", tr);
setLocale("tr");
installTransitions();
installFlip();

createRouter({
  mode: "hash",
  routes: Object.fromEntries(PAGES.map((p) => [p.path, p.load])),
  title: (to: { path: string }) => { const p = PAGES.find((x) => x.path === to.path); return p && p.path !== "/" ? `${p.title} · HADI March` : "HADI March · Vitrin"; },
});
pageTransitions({ type: "fade", duration: 180 });

const el = document.getElementById("app");
if (el) { render(() => <App />, el); bootLoader.done(); }
