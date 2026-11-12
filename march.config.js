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
  // boot: the shell pieces load at start-up, so a route row counts only what its own navigation downloads
  budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, boot: ["src/shell-nav.tsx", "src/shell-tools.tsx", "src/shell-late.tsx"], fail: true },
  // no output file under 10 KB (before gzip): small shared code folds, small lazy modules join their parent or a group
  chunks: { minSize: 10 * 1024 },
};
