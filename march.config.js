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
  // the build fails when the entry, a route or a lazy part (lazy() component, shell piece) grows past it
  // the two motion pages carry the whole motion engine (~11 KB gzip: keyframes, timeline, easing, drivers, clock)
  budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, routes: { "/motion": 64 * 1024, "/animation": 64 * 1024 }, fail: true },
};
