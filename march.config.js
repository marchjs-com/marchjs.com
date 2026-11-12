// HADI March vitrini (showcase): `node ../../cli/march.js dev` ya da `node build.mjs` (statik, göreli yollar → dist/).
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
  budget: { entry: 15 * 1024, route: 60 * 1024 },
};
