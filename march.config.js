// HADI March showcase: `node ../../cli/march.js dev` or `node build.mjs` (static, relative paths → dist/).
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
  budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, boot: ["src/routes.ts", "src/shell-nav.tsx", "src/shell-tools.tsx", "src/shell-late.tsx", "src/motion-late.ts"], fail: true },
  // no output file under 10 KB (before gzip): small shared code folds, small lazy modules join their parent or a group
  // allow: a locale dictionary stays its own file (only that locale downloads it; grouping it would make every
  // Turkish visitor download pages, or every English visitor the dictionary)
  chunks: { minSize: 10 * 1024, allow: {
    "src/i18n/tr.ts": "locale dictionary: downloaded only for Turkish, never grouped",
    "src/router/outlets.ts": "named / modal outlets (1.8 KB, no dependencies): joining any page group would make it pull that page",
    "src/seo/hydrate.ts": "takes over the prerendered start page (1 KB): loaded only on that page, never with a page group",
    "src/pages/navigation.tsx": "page whose code is mostly shared (NavSidebar, router): any page group would push its route past the 60 KB budget",
    "src/env-managers/sync-server.ts": "Sync demo of the environment managers page: net and its mock arrive only when that demo is drawn",
    "src/components/composite/consent-banner/index.ts": "the consent UI (hadi-march/managers/consent/ui), lazy on purpose: loaded by the managers page and the ConsentBanner card, never folded into the component registry",
    ".demos.gen.ts": "component cards of one showcase page (tools/gen-registry.js): joining the registry would make every page with a component card load them",
    "src/pages/editors.tsx": "a page of lazy editor cards (each card loads its own editor): grouping it would make its neighbours download nothing useful and regroup the other pages",
  } },
};
