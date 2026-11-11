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
};
