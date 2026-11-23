// marchjs.com: `node build.mjs` (static, relative paths → dist/); March comes from node_modules/march (package.json).
import { readFileSync } from "node:fs";

// every page of the menu (nav.ts), also the ones under a wildcard route (/motion/svg…): each gets its own index.html
const NAV_PATHS = [...readFileSync(new URL("./src/nav.ts", import.meta.url), "utf8").matchAll(/path: "([^"]+)"/g)].map((m) => m[1]);
// MarchIDE pages (/buttons/button, /ide…) are not prerendered: their content (editors, code, preview) is drawn at run
// time from the examples' ide.json, so their HTML would hold little more than a title, and 200 index.html files would
// be 200 more files to deploy (budget.maxFiles). 404.html opens them.
const { isIdePage } = await import("./src/playground/ide-pages.ts");

// Speed › Comparison (/bench): each compared third-party library is a lazy chunk fetched only when its own test runs
// (never at start-up, never with a page). THIRD_PARTY: those chunks (build.mjs skips its HTML-string check on them:
// library code paths the benchmark apps never reach, refused by the CSP's Trusted Types anyway). BENCH_PARTS: the ones a
// UI library runtime pushes past the 25 KB part budget get an argued, measured limit. Only third-party benchmark apps:
// no March code, no showcase page (test/bench-libs.test.js).
export const THIRD_PARTY = ["src/bench/apps/react.ts", "src/bench/apps/preact.ts", "src/bench/apps/vue.ts", "src/bench/apps/svelte-app.ts", "src/bench/apps/solid.gen.js", "src/bench/apps/lit-app.ts"];
const BENCH_PARTS = {
  "src/bench/apps/react.ts": { limit: 72 * 1024, why: "React 19 + react-dom client runtime (67.6 KB gzip measured), loaded only when its benchmark runs" },
  "src/bench/apps/vue.ts": { limit: 30 * 1024, why: "Vue 3 runtime-dom + reactivity (26.3 KB gzip measured), loaded only when its benchmark runs" },
};

// Showcase pages and parts past the default budgets (route 60 KB, part 25 KB): each is a demo of many components at
// once, a full tool or a whole sample site, loaded only where it is shown. Each limit is the larger of two release measurements
// (23 Nov 2026, March 0.3.5: this machine, Windows / Node 26, and CI, Linux / Node 24: packing differs a little between
// them) plus 15%, rounded up to 5 KB. The packer packs to the default budgets, so the limits do not change the packing. A row that grows past its limit still fails the build.
const kb = (n) => n * 1024;
const PAGE = "a section page: live demos of every component of its section on one page";
const IDE = "MarchIDE's live workbench (/ide-live): editors, the compiler, preview and panels, a full tool on its own page";
const APP_UI = "/app-ui: the AppUI kit's full app (editor, terminal, AI, debugger) drawn live on one page";
const API_EX = "API reference examples, one part of ~1/15 of them (tools/api-examples.js): live code of every export in its range, loaded when a card of the range opens";
const THEME_EDITOR = "a ThemeEditor tab (ColorPicker, the live preview with real components, saving): loaded when the editor opens it";
const CARDS = "component cards of one showcase page (tools/gen-registry.js): loaded with that page only";
const SAMPLE = "a sample website (a whole page made of real components): loaded only when its page opens";
const HOME = "a lower section of the start page with live demos: loaded as it comes near the viewport";
const MARCH_IDE = "MarchIDE's component workspace (editor, preview, panels): loaded on a MarchIDE page only";
const MENU = "the side menu with every page's manifest and search: loaded when idle after the first paint";
const LATE = "command palette, toasts, commands: loaded when idle after the first paint";
const SECTIONS = "Ctrl+K's index of every demo section: loaded when idle";
const BENCH = "a benchmark's scenarios or a compared library: loaded only on /bench when it runs";
const COMMON = "the shared common chunk: small code many pages use, prefetched when idle, never part of start-up";
const HYDRATE = "takes over a prerendered page: loaded only on a page's first load";
const ROUTER_DEMO = "the router demo's layout (nested routes, outlets): loaded with /navigation/router only";
const COMPONENT_PAGE = "the component pages' layout (prop table, options, cards): loaded with a component page";
const argued = (rows) => Object.fromEntries(Object.entries(rows).map(([k, [n, why]]) => [k, { limit: kb(n), why }]));
const SHOWCASE_ROUTES = Object.fromEntries(Object.entries(argued({
  "/animation": [120, PAGE],
  "/api": [70, PAGE],
  "/app-ui": [230, APP_UI],
  "/bench": [70, PAGE],
  "/charts": [180, PAGE],
  "/feedback": [180, PAGE],
  "/flow": [165, PAGE],
  "/home": [170, PAGE],
  "/icons": [70, PAGE],
  "/ide": [70, PAGE],
  "/ide-live": [320, IDE],
  "/ide-shell": [70, PAGE],
  "/language": [145, PAGE],
  "/layout": [105, PAGE],
  "/managers": [125, PAGE],
  "/managers-a11y": [185, PAGE],
  "/managers-data": [175, PAGE],
  "/managers-env": [120, PAGE],
  "/managers-ops": [145, PAGE],
  "/messaging": [70, PAGE],
  "/motion": [140, PAGE],
  "/motion/*": [85, PAGE],
  "/motion/micro": [65, PAGE],
  "/motion/morph": [70, PAGE],
  "/motion/pages": [70, PAGE],
  "/motion/svg": [65, PAGE],
  "/navigation/router": [70, PAGE],
  "/navigation/router/about": [70, PAGE],
  "/navigation/router/item/:id": [70, PAGE],
  "/network": [125, PAGE],
  "/overlays": [180, PAGE],
  "/seo": [100, PAGE],
  "/sites": [115, PAGE],
  "/speed": [150, PAGE],
  "/start": [70, PAGE],
  "/test-bilesen": [70, PAGE],
  "/text-motion": [70, PAGE],
  "/themes": [115, PAGE],
  "/transitions": [70, PAGE],
  "/web": [70, PAGE],
})).map(([k, v]) => [k, v.limit]));
const SHOWCASE_PARTS = argued({
  "node_modules/march/src/components/composite/theme-editor/panels.ts": [75, THEME_EDITOR],
  "node_modules/march/src/components/composite/theme-editor/persist.ts": [55, THEME_EDITOR],
  "node_modules/march/src/components/composite/theme-editor/preview.ts": [45, THEME_EDITOR],
  "node_modules/march/src/components/web-hero.demos.gen.ts": [30, CARDS],
  "node_modules/march/src/components/web-proof.demos.gen.ts": [30, CARDS],
  "node_modules/march/src/components/web-sell.demos.gen.ts": [30, CARDS],
  "node_modules/march/src/components/web-talk.demos.gen.ts": [30, CARDS],
  "node_modules/march/src/components/web-work.demos.gen.ts": [30, CARDS],
  "src/api-examples/gen/part-01.ex.tsx": [115, API_EX],
  "src/api-examples/gen/part-02.ex.tsx": [280, API_EX],
  "src/api-examples/gen/part-03.ex.tsx": [160, API_EX],
  "src/api-examples/gen/part-04.ex.tsx": [130, API_EX],
  "src/api-examples/gen/part-05.ex.tsx": [145, API_EX],
  "src/api-examples/gen/part-06.ex.tsx": [185, API_EX],
  "src/api-examples/gen/part-07.ex.tsx": [120, API_EX],
  "src/api-examples/gen/part-08.ex.tsx": [110, API_EX],
  "src/api-examples/gen/part-09.ex.tsx": [65, API_EX],
  "src/api-examples/gen/part-10.ex.tsx": [135, API_EX],
  "src/api-examples/gen/part-11.ex.tsx": [235, API_EX],
  "src/api-examples/gen/part-12.ex.tsx": [350, API_EX],
  "src/api-examples/gen/part-13.ex.tsx": [275, API_EX],
  "src/api-examples/gen/part-14.ex.tsx": [275, API_EX],
  "src/api-examples/gen/part-15.ex.tsx": [185, API_EX],
  "src/bench/apps/react.ts": [85, BENCH],
  "src/bench/apps/svelte-app.ts": [30, BENCH],
  "src/bench/apps/vue.ts": [35, BENCH],
  "src/bench/scenarios-section.tsx": [65, BENCH],
  "src/component-page/_layout.tsx": [70, COMPONENT_PAGE],
  "src/home/more2/app.tsx": [30, HOME],
  "src/home/more3/tools.tsx": [90, HOME],
  "src/home/more3/visual.tsx": [45, HOME],
  "src/home/sections.tsx": [225, HOME],
  "src/playground/layouts/component.tsx": [200, MARCH_IDE],
  "src/playground/march-ide.tsx": [70, MARCH_IDE],
  "src/router-demo/_layout.tsx": [70, ROUTER_DEMO],
  "src/sections.gen.ts": [30, SECTIONS],
  "src/shell-late.tsx": [40, LATE],
  "src/shell-menu.tsx": [145, MENU],
  "src/web/honest.tsx": [130, SAMPLE],
  "src/web/live.tsx": [130, SAMPLE],
  "src/web/portfolio-more.tsx": [30, SAMPLE],
  "src/web/portfolio.tsx": [170, SAMPLE],
  "src/web/product-more.tsx": [30, SAMPLE],
  "src/web/product.tsx": [115, SAMPLE],
  "src/web/redesign.tsx": [155, SAMPLE],
  "src/web/slides.tsx": [55, SAMPLE],
  "src/web/story.tsx": [160, SAMPLE],
  "src/workbench.tsx": [295, IDE],
});

export default {
  entry: "src/main.tsx",
  outdir: "dist",
  base: "./", // relative asset URLs: the same build works at a domain root, in a sub-folder, from files and in an artifact
  publicDir: "public",
  pagesDir: "src/pages",
  components: "src/components",
  html: "index.html",
  port: 5180,
  // March's sources from the installed package (its own subpaths: registry, cards, meta…)
  alias: { "march": "./node_modules/march/src" },
  // sw.js only for the local preview (build.mjs --serve): the published showcase must not leave a worker registered
  sw: process.env.MARCH_SHOWCASE_SW === "1",
  // stable file names (main.js, chunks/home.js…, version in ?v=): each deploy overwrites the same paths
  stableNames: true,
  // no _headers file: the publishing host refuses names starting with "_" (caching is set on the host)
  headers: false,
  // every page is written as <route>/index.html at build time (march/seo), so each opens directly on a static host
  // without rewrites; addresses with params (/navigation/router/item/7) go through 404.html (docs/hosting.md)
  seo: { prerender: true, routes: NAV_PATHS, exclude: isIdePage },
  // the build fails when the entry, a route or a lazy part (lazy() component, shell piece) grows past it
  // boot: the route table and the shell pieces load at start-up, so a route row counts only what its own navigation downloads
  // (shell-late.tsx — palette, toasts — loads when idle: a lazy part of its own, not start-up)
  // bootLimit: start-up as a whole; the packer folds shared code into start-up chunks only below it
  // maxFiles: Cloudflare Pages takes up to 20,000 files per deployment; 1,000 (≈580 today: pages, chunks, media, icon
  // packs, MarchIDE's tools) keeps deploys quick and fails a build whose splitting runs away
  budget: { maxFiles: 1000, entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, bootLimit: 52 * 1024, boot: ["src/routes.ts", "src/shell-nav.tsx", "src/shell-tools.tsx"], fail: true, parts: { ...BENCH_PARTS, ...SHOWCASE_PARTS }, routes: SHOWCASE_ROUTES },
  // no output file under 10 KB (before gzip): small shared code folds, small lazy modules join their parent or a group
  // allow: a locale dictionary stays its own file (only that locale downloads it; grouping it would make every
  // Turkish visitor download pages, or every English visitor the dictionary)
  // commonRoom: page groups stay 6 KB under the route budget, room for the shared "common" chunk (small code many pages
  // use, outside start-up, prefetched when idle) on every route that loads it
  // fail: false — the 10 KB floor is an aim: the packer folds what it can in two builds (maxBuilds: 2, ~1 min) and lists
  // what is left instead of failing; Cloudflare serves small files over HTTP/2 at little cost, and maxFiles still caps
  // the count. Chasing the last ~50 small files took up to 12 more minutes per release.
  chunks: { minSize: 10 * 1024, fail: false, maxBuilds: 2, commonRoom: 6 * 1024, allow: {
    "src/web/product.tsx": "Web siteleri sample page: loaded only when /sites/product opens it, never with the blocks page",
    "src/web/product-more.tsx": "lower half of the product sample: loaded when it comes near the viewport",
    "src/web/portfolio-more.tsx": "lower half of the portfolio sample: loaded when it comes near the viewport",
    "src/web/portfolio.tsx": "Web siteleri sample page: loaded only when /sites/portfolio opens it",
    "src/web/portfolio-detail.tsx": "a portfolio project's detail page: warmed up after the portfolio sample, shown on a click",
    "src/web/slides.tsx": "Web siteleri sample deck: loaded only when /sites/slides opens it",
    "src/web/redesign.tsx": "redesign sample page: loaded only when /sites/redesign opens it",
    "src/web/honest.tsx": "honest sample page: loaded only when /sites/honest opens it",
    "src/web/live.tsx": "live sample page: loaded only when /sites/live opens it",
    "src/web/story.tsx": "story sample page: loaded only when /sites/story opens it",
    "src/i18n/tr.ts": "locale dictionary: downloaded only for Turkish, never grouped",
    "src/router/outlets.ts": "named / modal outlets (1.8 KB, no dependencies): joining any page group would make it pull that page",
    "src/demo-code.tsx": "a demo card's Code tab (code widget + highlighter), loaded on the first click on Kod: inlined into the card it would load with every page",
    "src/shell-menu.tsx": "the side menu with its manifest, loaded on first idle by shell-nav: inlined into it, the menu would be part of start-up again",
    "src/seo/hydrate.ts": "takes over a prerendered page (1 KB): loaded only on a page's first load, never with a page group",
    "src/pages/navigation.tsx": "page whose code is mostly shared (NavSidebar, router): any page group would push its route past the 60 KB budget",
    "src/components/composite/dock-layout/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/actions/overflow-toolbar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/layout/status-bar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/composite/property-grid/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/composite/property-grid/index.ts": "PropertyGrid (7 KB), shared by its card and the IDE shell demo page: either host would make the other download it",
    "src/env-managers/sync-server.ts": "Sync demo of the environment managers page: net and its mock arrive only when that demo is drawn",
    "src/components/composite/consent-banner/index.ts": "the consent UI (march/managers/consent/ui), lazy on purpose: loaded by the managers page and the ConsentBanner card, never folded into the component registry",
    ".ex.tsx": "API reference examples, one part of ~1/14 of them (api-examples/gen/part-NN.ex.tsx, tools/api-examples.js): loads when a card of its range opens; joining the API page would make the page download every example",
    ".demos.gen.ts":"component cards of one showcase page (tools/gen-registry.js): joining the registry would make every page with a component card load them",
    "src/motion/scroll.ts": "motion values, scroll and pointer (4 KB) shared by /flow, the home page group and four demos: start-up is at its budget and any page host would push a demo part past 25 KB",
    "src/pages/editors.tsx": "a page of lazy editor cards (each card loads its own editor): grouping it would make its neighbours download nothing useful and regroup the other pages",
    "src/components/composite/theme-editor/colors.ts": "ThemeEditor colors tab: with ColorPicker its own part; folded into the editor, the editor's first part passes 25 KB",
    "src/components/composite/theme-editor/persist.ts": "ThemeEditor start step and saving (StorageManager, DirtyState): loads after the editor shows; folded, the editor's first part passes 25 KB",
    "src/components/composite/theme-editor/preview.ts": "ThemeEditor preview screen (real components, a chart): its own part; folded into the editor, the editor's first part passes 25 KB",
    "src/components/composite/wizard/demo.tsx": "Wizard card's stage: it brings the form engine; folded into the component registry, every page with a component card would download it",
  } },
};
