// March showcase: every component, theme and animation of the library. Written entirely in March (no inline styles,
// no innerHTML); themes switch with data-m-theme, light/dark with data-theme. Normal addresses (/motion) under any base
// path; where the address cannot change (file://, a sandboxed iframe) the router uses #/motion by itself.
import "march/css/font.css";
import "march/css/tokens.css";
import "march/css/sx.css"; // components bring their own CSS (only what is used, split per page)
import "march/motion/motion.css";
import "./showcase.css";
import { setLocale } from "march";
import { loadLocale } from "march/i18n";
import { runLoad } from "march/lazy";
import { prerenderedFor } from "march/seo/prerendered";
// the route table is a start-up chunk (grouped with the shell pieces): the entry stays the same size however many
// pages there are; runLoad preloads all of its files at once through the build manifest. It also brings the router and
// the renderer (start.tsx): the entry only loads
const ROUTES = () => import("./routes.ts");

// the Turkish pack is a lazy chunk (library texts switch to Turkish when it arrives)
loadLocale("tr", () => import("march/i18n/tr"));
void setLocale("tr");

const el = document.getElementById("app");
// every page's index.html carries that page prerendered (march build, seo.prerender). When the address shows that route
// it stays visible and a small lazy chunk hydrates it; any other route (a 404 fallback, an old #/ link) drops it at once
const pre = !!el && prerenderedFor(el);
if (el && !pre) el.replaceChildren();
const hydrateChunk = pre ? import("march/seo/hydrate") : null;

void runLoad(ROUTES, { kind: "part", key: "" }).then((table) => table.start(table, el, hydrateChunk));
