// HADI March showcase: `node ../../cli/march.js dev` or `node build.mjs` (static, relative paths → dist/).
export default {
  entry: "src/main.tsx",
  outdir: "dist",
  publicDir: "public",
  pagesDir: "src/pages",
  components: "src/components",
  html: "index.html",
  port: 5180,
  alias: { "hadi-march": "../../src" },
  // sw.js only for the local preview (build.mjs --serve): the published showcase must not leave a worker registered
  sw: process.env.MARCH_SHOWCASE_SW === "1",
  // the build fails when the entry, a route or a lazy part (lazy() component, shell piece) grows past it
  budget: { entry: 15 * 1024, route: 60 * 1024, part: 25 * 1024, fail: true },
};
