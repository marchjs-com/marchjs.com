# marchjs.com

The site of [March](https://github.com/marchjs-com/march): the showcase, the component pages (MarchIDE), the API
reference and the benchmarks. Moved here from `march/examples/showcase` with its history.

**Status: being moved.** The code still builds only inside the March repository (`node examples/showcase/build.mjs`
there): `build.mjs` and the generators reach into March's `src/`, `compiler/` and `tools/`. Next steps:

1. Build against March as a dependency pinned to a commit, and read March from cdn.marchjs.com pinned to a version
   (`cdn.marchjs.com/<version>/importmap.json`).
2. Read the component examples from [marchjs-com/examples](https://github.com/marchjs-com/examples) pinned to a commit.
3. Bring the showcase's own checks here (pages, MarchIDE panels, Options controls, menu audit in headless Chrome).
