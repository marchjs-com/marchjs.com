# marchjs.com

The site of [March](https://github.com/marchjs-com/march): the showcase, the component pages (MarchIDE), the API
reference and the benchmarks. Moved here from `march/examples/showcase` with its history.

## Build

```bash
npm install
node build.mjs            # dev build into dist/
node build.mjs --serve    # build if needed, then http://127.0.0.1:5181 (--port <n>)
node build.mjs --release  # the published build
```

March is always the newest release: `build.mjs` reads `latest` from `cdn.marchjs.com/versions.json`, installs that
release's sources from March's tag (`github:marchjs-com/march#v<latest>`, `package.json` is not changed) and takes that
version's data from the CDN (`cdn.marchjs.com/<version>/data/`: MarchIDE's types). `MARCH_VERSION=0.3.1` builds with
another release.

Every build regenerates the site's generated sources (`tools/`), from its pages and that release's data:

| Tool | Writes | From |
| --- | --- | --- |
| `gen-sections.js` | `src/sections.gen.ts` | the pages' demo sections |
| `gen-ide-texts.js` | `src/playground/ide-texts.gen.tsx`, `ide-list.gen.ts` | `public/components/**/ide.json` |
| `api-examples.js` | `src/api-examples.gen.ts` | `src/api-examples/`, March's exports |
| `api-data.mjs` | `public/api/` | CDN `data/api/`, with links to the site's pages |
| `march-data.mjs` | `public/comp/`, `src/home-stats.gen.ts` | CDN `data/comp/`, `data/stats.json`, `march.config.js` budgets |
| `gen-bench.mjs` (`--release`) | `public/bench/`, `src/bench/apps/` | the compared libraries |

## Component examples

A MarchIDE page's files are listed in `public/components/<page>/ide.json`; their code lives in
[marchjs-com/examples](https://github.com/marchjs-com/examples):

```json
{ "type": "code", "name": "AlertLab.tsx", "src": "examples://components/alert/AlertLab.tsx" }
```

MarchIDE turns `examples://` into jsDelivr's URL of that repository at one commit (`EXAMPLES` in
`src/playground/ide.ts`) and fetches the file. To publish changed examples, push them there and move the sha.

**Still being moved:** the site's own CI.
