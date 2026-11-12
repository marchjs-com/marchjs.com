// HADI March showcase: `node ../../cli/march.js dev` or `node build.mjs` (static, relative paths → dist/).
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

export default {
  entry: "src/main.tsx",
  outdir: "dist",
  base: "./", // relative asset URLs: the showcase is published under a sub-path
  publicDir: "public",
  pagesDir: "src/pages",
  components: "src/components",
  html: "index.html",
  port: 5180,
  alias: { "hadi-march": "../../src" },
  // sw.js only for the local preview (build.mjs --serve): the published showcase must not leave a worker registered
  sw: process.env.MARCH_SHOWCASE_SW === "1",
  // stable file names (main.js, chunks/home.js…, version in ?v=): each deploy overwrites the same paths
  stableNames: true,
  // no _headers file: the publishing host refuses names starting with "_" (caching is set on the host)
  headers: false,
  // the start page is written into index.html at build time (hadi-march/seo); hash routing: other routes stay
  // client-side, and main.tsx drops the prerendered page at once when the URL asks for another route
  seo: { prerender: true },
  // the build fails when the entry, a route or a lazy part (lazy() component, shell piece) grows past it
  // boot: the route table and the shell pieces load at start-up, so a route row counts only what its own navigation downloads
  // bootLimit: start-up as a whole; the packer folds shared code into start-up chunks only below it
  budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, bootLimit: 52 * 1024, boot: ["src/routes.ts", "src/shell-nav.tsx", "src/shell-tools.tsx", "src/shell-late.tsx"], fail: true, parts: BENCH_PARTS },
  // no output file under 10 KB (before gzip): small shared code folds, small lazy modules join their parent or a group
  // allow: a locale dictionary stays its own file (only that locale downloads it; grouping it would make every
  // Turkish visitor download pages, or every English visitor the dictionary)
  // commonRoom: page groups stay 6 KB under the route budget, room for the shared "common" chunk (small code many pages
  // use, outside start-up, prefetched when idle) on every route that loads it
  chunks: { minSize: 10 * 1024, commonRoom: 6 * 1024, allow: {
    "src/i18n/tr.ts": "locale dictionary: downloaded only for Turkish, never grouped",
    "src/router/outlets.ts": "named / modal outlets (1.8 KB, no dependencies): joining any page group would make it pull that page",
    "src/demo-code.tsx": "a demo card's Code tab (code widget + highlighter), loaded on the first click on Kod: inlined into the card it would load with every page",
    "src/shell-menu.tsx": "the side menu with its manifest, loaded on first idle by shell-nav: inlined into it, the menu would be part of start-up again",
    "src/seo/hydrate.ts": "takes over the prerendered start page (1 KB): loaded only on that page, never with a page group",
    "src/pages/navigation.tsx": "page whose code is mostly shared (NavSidebar, router): any page group would push its route past the 60 KB budget",
    "src/components/composite/dock-layout/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/actions/overflow-toolbar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/layout/status-bar/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/composite/property-grid/demo.tsx": "IDE shell component demo: loads with its card only (folded into the registry, every page with a component card would download it)",
    "src/components/composite/property-grid/index.ts": "PropertyGrid (7 KB), shared by its card and the IDE shell demo page: either host would make the other download it",
    "src/env-managers/sync-server.ts": "Sync demo of the environment managers page: net and its mock arrive only when that demo is drawn",
    "src/components/composite/consent-banner/index.ts": "the consent UI (hadi-march/managers/consent/ui), lazy on purpose: loaded by the managers page and the ConsentBanner card, never folded into the component registry",
    ".demos.gen.ts": "component cards of one showcase page (tools/gen-registry.js): joining the registry would make every page with a component card load them",
    "src/motion/scroll.ts": "motion values, scroll and pointer (4 KB) shared by /flow, the home page group and four demos: start-up is at its budget and any page host would push a demo part past 25 KB",
    "src/pages/editors.tsx": "a page of lazy editor cards (each card loads its own editor): grouping it would make its neighbours download nothing useful and regroup the other pages",
    "src/components/composite/wizard/demo.tsx": "Wizard card's stage: it brings the form engine; folded into the component registry, every page with a component card would download it",
    "src/schema/index.ts": "the schema engine (9 KB), shared by the form pages, the Wizard card and the editors: the editors part is at its 25 KB budget, so no host fits it",
  } },
};
