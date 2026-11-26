// marchjs.com: `node build.mjs` (static, relative paths → dist/). March runs from cdn.marchjs.com, like on any site made
// with it: the release build.mjs picked (the newest, MARCH_VERSION), its version folder (immutable, one release per
// page). node_modules/march is only the build's tools (CLI, compiler, prerender) and its types.
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
export const THIRD_PARTY = ["src/bench/apps/react.ts", "src/bench/apps/preact.ts", "src/bench/apps/vue.ts", "src/bench/apps/svelte-app.ts", "src/bench/apps/solid.gen.js", "src/bench/apps/lit-app.ts",
  "src/bench/apps/marko.ts", "src/bench/apps/inferno.gen.js", "src/bench/apps/ivi.gen.js", "src/bench/apps/mithril.ts", "src/bench/apps/alpine.ts", "src/bench/apps/angular.gen.js"];
const BENCH_PARTS = {
  "src/bench/apps/react.ts": { limit: 72 * 1024, why: "React 19 + react-dom client runtime (67.6 KB gzip measured), loaded only when its benchmark runs" },
  "src/bench/apps/vue.ts": { limit: 30 * 1024, why: "Vue 3 runtime-dom + reactivity (26.3 KB gzip measured), loaded only when its benchmark runs" },
  "src/bench/apps/angular.gen.js": { limit: 45 * 1024, why: "Angular 22 core + platform-browser, AOT-compiled and tree-shaken as ng build does (37.9 KB gzip measured in the release build), loaded only when its benchmark runs" },
};
// Third-party benchmark chunks under the 10 KB floor (a small runtime: Marko, ivi): grouped with others, a library
// would download with the page or with another library; each stays a file of its own, fetched when its test runs.
const BENCH_SMALL = Object.fromEntries(THIRD_PARTY.map((k) => [k, "a compared library's benchmark app with its runtime: loaded only on /bench when its own test runs"]));

// Showcase pages and parts past the default budgets (route 60 KB, part 25 KB): each is a demo of many components at
// once, a full tool or a whole sample site, loaded only where it is shown. March runs from the CDN, so a row counts the
// site's own code only. Each limit is the larger of two release measurements (23 Nov 2026, March 0.3.12: this machine,
// Windows / Node 26, and CI's report, Linux / Node 24) plus 15%, rounded up to 5 KB; a row that fits its default has no
// limit of its own. The packer packs to the default budgets, so the limits do not change the packing. A row that grows
// past its limit still fails the build.
const kb = (n) => n * 1024;
const PAGE = "a section page: live demos of every component of its section on one page";
const IDE = "MarchIDE's live workbench (/ide-live): editors, the compiler, preview and panels, a full tool on its own page";
const APP_UI = "/app-ui: the AppUI kit's full app (editor, terminal, AI, debugger) drawn live on one page";
const API_EX = "API reference examples, one part of ~1/15 of them (tools/api-examples.js): live code of every export in its range, loaded when a card of the range opens";
const THEME_EDITOR = "a ThemeEditor tab (ColorPicker, the live preview with real components, saving): loaded when the editor opens it";
const CARDS = "component cards of one showcase page (tools/gen-catalog.mjs): loaded with that page only";
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
  "/charts": [75, PAGE],
  "/feedback": [65, PAGE],
  "/home": [70, PAGE],
  "/managers": [65, PAGE],
  "/managers-data": [70, PAGE],
  "/managers-env": [70, PAGE],
  "/managers-ops": [70, PAGE],
  "/motion/*": [75, PAGE],
  "/motion/morph": [75, PAGE],
  "/motion/pages": [75, PAGE],
  "/overlays": [65, PAGE],
  "/seo": [65, PAGE],
  "/speed": [70, PAGE],
  "/start": [75, PAGE],
  "/themes": [65, PAGE],
  "/transitions": [75, PAGE],
  "/web": [70, PAGE],
})).map(([k, v]) => [k, v.limit]));
const SHOWCASE_PARTS = argued({
  "src/api-examples/gen/part-02.ex.tsx": [30, API_EX],
  "src/api-examples/gen/part-05.ex.tsx": [30, API_EX],
  "src/api-examples/gen/part-14.ex.tsx": [30, API_EX],
  "src/bench/apps/react.ts": [85, BENCH],
  "src/bench/apps/svelte-app.ts": [30, BENCH],
  "src/bench/apps/vue.ts": [35, BENCH],
  "src/component-page/_layout.tsx": [34, COMPONENT_PAGE],
  "src/home/sections.tsx": [55, HOME],
  "src/playground/layouts/component.tsx": [110, MARCH_IDE],
  "src/playground/march-ide.tsx": [75, MARCH_IDE],
  "src/router-demo/_layout.tsx": [75, ROUTER_DEMO],
  "src/sections.gen.ts": [30, SECTIONS],
  "src/shell-menu.tsx": [30, MENU],
  "src/web/product.tsx": [30, SAMPLE],
});

// The charts page's card demos (src/pages/charts.tsx): each a lazy part loaded only when its chart page opens. Most are under
// the 10 KB floor; left as they are, the packer folds them into parts every component page loads (workbench, the
// component page layout), so each stays a small file of its own.
const CHART_DEMOS = Object.fromEntries([
  "src/catalog/data/line-chart/demo.tsx",
  "src/catalog/data/bar-chart/demo.tsx",
  "src/catalog/data/pie-chart/demo.tsx",
  "src/catalog/data/stream-graph/demo.tsx",
  "src/catalog/data/scatter-chart/demo.tsx",
  "src/catalog/data/histogram/demo.tsx",
  "src/catalog/data/box-plot/demo.tsx",
  "src/catalog/data/heatmap/demo.tsx",
  "src/catalog/data/funnel-chart/demo.tsx",
  "src/catalog/data/waterfall-chart/demo.tsx",
  "src/catalog/data/bullet-chart/demo.tsx",
  "src/catalog/data/stat/demo.tsx",
  "src/catalog/data/radar-chart/demo.tsx",
  "src/catalog/data/radial-bar-chart/demo.tsx",
  "src/catalog/data/progress-ring/demo.tsx",
  "src/catalog/data/sunburst-chart/demo.tsx",
  "src/catalog/data/treemap/demo.tsx",
  "src/catalog/data/sankey-chart/demo.tsx",
  "src/catalog/data/chord-chart/demo.tsx",
  "src/catalog/data/candlestick-chart/demo.tsx",
  "src/catalog/data/network-graph/demo.tsx",
  "src/catalog/data/choropleth-map/demo.tsx",
  "src/catalog/data/sparkline/demo.tsx",
  "src/catalog/data/bar-list/demo.tsx",
  "src/catalog/data/gauge/demo.tsx",
  "src/catalog/data/odometer/demo.tsx",
  "src/catalog/data/level-meter/demo.tsx",
  "src/catalog/media/oscilloscope/demo.tsx",
  "src/catalog/media/spectrum/demo.tsx",
  "src/catalog/media/waveform/demo.tsx",
  "src/catalog/media/audio-reactive/demo.tsx",
].map((f) => [f, "a chart card's live demo: loaded only when its chart page opens"]));

export default {
  entry: "src/main.tsx",
  // MARCH_CDN: another CDN folder (a local build of March's CDN, node tools/build-cdn.js --base <origin>) for a test
  cdn: process.env.MARCH_CDN || `https://cdn.marchjs.com/${process.env.MARCH_VERSION}`,
  outdir: "dist",
  base: "./", // relative asset URLs: the same build works at a domain root, in a sub-folder, from files and in an artifact
  publicDir: "public",
  pagesDir: "src/pages",
  components: "src/components",
  html: "index.html",
  port: 5180,
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
  // fail: false — the 10 KB floor is an aim: the packer folds what it can and lists what is left instead of failing;
  // Cloudflare serves small files over HTTP/2 at little cost, and maxFiles still caps the count.
  // maxBuilds: 3 (~2.5 min): the planner groups small pages from size estimates and takes a group past the route budget
  // apart only on its next pass; the third build checks the second's groups. With 2 they were never checked: from 0.3.7 on they
  // came out past 60 KB (/buttons, /big-data, /overlay, /text and /forms each loading one group of 85–137 KB).
  // 5 (26 Nov 2026): with the chart pages' 16 more lazy demos the third build still left groups past their budget; two more
  // passes let the planner split and re-check them.
  chunks: { minSize: 10 * 1024, fail: false, maxBuilds: 5, commonRoom: 6 * 1024, allow: {
    ...CHART_DEMOS,
    ...BENCH_SMALL,
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
    "src/component-page/_layout.tsx": "every component page's frame (1 KB): in a page group it made each component page download that group's pages (the motion pages, /start, /transitions)",
    "src/wb-topics.ts": "the workbench's Parçalar tab titles (the menu's topic tables): loaded when that tab opens; joined to the workbench they cost every component page ~18 KB",
    "src/i18n/tr.ts": "locale dictionary: downloaded only for Turkish, never grouped",
    "src/router/outlets.ts": "named / modal outlets (1.8 KB, no dependencies): joining any page group would make it pull that page",
    "src/demo-code.tsx": "a demo card's Code tab (code widget + highlighter), loaded on the first click on Kod: inlined into the card it would load with every page",
    "src/shell-menu.tsx": "the side menu with its manifest, loaded on first idle by shell-nav: inlined into it, the menu would be part of start-up again",
    "src/seo/hydrate.ts": "takes over a prerendered page (1 KB): loaded only on a page's first load, never with a page group",
    "src/pages/navigation.tsx": "page whose code is mostly shared (NavSidebar, router): any page group would push its route past the 60 KB budget",
    "src/catalog/composite/dock-layout/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/catalog/actions/overflow-toolbar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/catalog/layout/status-bar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/catalog/composite/property-grid/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/env-managers/sync-server.ts": "Sync demo of the environment managers page: net and its mock arrive only when that demo is drawn",
    ".ex.tsx": "API reference examples, one part of ~1/14 of them (api-examples/gen/part-NN.ex.tsx, tools/api-examples.js): loads when a card of its range opens; joining the API page would make the page download every example",
    ".demos.gen.ts":"component cards of one showcase page (tools/gen-catalog.mjs): joining the registry would make every page with a component card load them",
    "src/motion/scroll.ts": "motion values, scroll and pointer (4 KB) shared by /flow, the home page group and four demos: start-up is at its budget and any page host would push a demo part past 25 KB",
    "src/pages/editors.tsx": "a page of lazy editor cards (each card loads its own editor): grouping it would make its neighbours download nothing useful and regroup the other pages",
    "src/catalog/composite/wizard/demo.tsx": "Wizard card's stage: it brings the form engine; folded into the component registry, every page with a component card would download it",
  } },
};
