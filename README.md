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
| `gen-catalog.mjs` | `src/catalog/*.gen.ts` | CDN `data/components.json`, `data/api/`, `src/catalog/` |
| `gen-sections.js` | `src/sections.gen.ts` | the pages' demo sections |
| `gen-ide-texts.js` | `src/playground/ide-texts.gen.tsx`, `ide-list.gen.ts` | the examples' `ide.json` at the pinned sha |
| `api-examples.js` | `src/api-examples.gen.ts` | `src/api-examples/`, March's exports |
| `api-data.mjs` | `public/api/` | CDN `data/api/`, with links to the site's pages |
| `march-data.mjs` | `public/comp/`, `src/home-stats.gen.ts`, `src/text-costs.gen.ts` | CDN `data/comp/`, `data/stats.json`, `data/text-costs.json`, `march.config.js` budgets |
| `gen-bench.mjs` (`--release`) | `public/bench/`, `src/bench/apps/` | the compared libraries |

## Component cards

Every March component has a card here: its live demo and its Options panel are the site's own files,
`src/catalog/<category>/<name>/demo.tsx` and `playground.ts` (the option spec, `src/catalog/spec.ts`). March publishes
the components themselves (`data/components.json`: name, summary, parts, docs.md) and their props tables (`data/comp/`);
`src/catalog/showcase.json` names the page that draws each card and `pages.json` a component's own page.
`tools/gen-catalog.mjs` writes the catalog modules from them on every build (gitignored: never committed) and fails when a March component has no card, or an option
its demo never reads. The site imports March only through its package entries (`march/actions`, `march/landing`…, and
`march/components/<category>/<name>` for the large ones): no March file by path.

## Component examples

A MarchIDE page's `ide.json` and its files live in [marchjs-com/examples](https://github.com/marchjs-com/examples)
(`components/<page>/ide.json`; the root `ide.json` holds every page's, and the site loads it in the background on any
page). A file in an `ide.json`:

```json
{ "type": "code", "name": "AlertLab.tsx", "src": "examples://components/alert/AlertLab.tsx" }
```

MarchIDE turns `examples://` into jsDelivr's URL of that repository at one commit (`EXAMPLES` in
`src/playground/examples.ts`) and fetches the file. To publish changed examples, push them there (with
`node tools/bundle.mjs` for a changed `ide.json`) and move the sha. `MARCH_EXAMPLES_DIR=<checkout>` makes
`gen-ide-texts.js` read a local checkout instead of the pinned sha.

MarchIDE's preview is a page of its own in an iframe, `playground/preview.html` (written by `build.mjs`; its script
`src/playground/preview-frame.ts`): it runs March from the CDN like the site, a March of its own, so what the
example does to March (its language, router, extensions, layers) stays in the frame. The preview toolbar reaches it
through the frame's `<html>` (theme, light / dark, accent) and `src/playground/preview-share.ts` (network speed,
device values). The site's CSP allows frames of its own origin only (`frame-src` / `frame-ancestors 'self'`).

## Checks

```sh
node tools/check-ide.mjs                 # every MarchIDE page in headless Chrome / Edge (dist/ must be built)
node tools/check-ide.mjs --shard 3/10    # one of 10 parts
node tools/check-ide.mjs alert button    # some pages
```

A page passes when its files load from the examples repository, no file has Problems and its Lab tests pass. CI
(`.github/workflows/ci.yml`) makes the release build once (size budgets, prerendering), then checks the pages in 10 parallel jobs. When a new
March release changes the generated sources, CI warns: run `node build.mjs` and commit them.
