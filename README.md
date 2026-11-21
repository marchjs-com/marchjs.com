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

**Still being moved:** the site's generated files (API reference, sections, home numbers, IDE texts) are committed;
their generators come here next and read the CDN data. Then the component examples from
[marchjs-com/examples](https://github.com/marchjs-com/examples) pinned to a commit, and the site's own CI.
