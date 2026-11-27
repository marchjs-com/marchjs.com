// The libraries under test: each one's benchmark app is its own lazy chunk, downloaded only when its test runs.
// Versions are the showcase's devDependencies (test/bench-libs.test.js keeps them equal).
import type { MountFn } from "./core.ts"

/** What a library is: the yardstick (no library), a view library (rendering only) or a framework (routing and more). */
export type LibKind = "baseline" | "view" | "framework"
/** What comes with it, per feature: 1 in the library itself, 2 an official package of its own team, 0 none. */
export interface Bundled { router: 0 | 1 | 2; store: 0 | 1 | 2; ui: 0 | 1 | 2; i18n: 0 | 1 | 2 }
export interface Lib { id: string; name: string; version: string; kind: LibKind; has: Bundled; /** manifest key of its lazy chunk */ src: string; load: () => Promise<{ mount: MountFn }> }
export const LIBS: Lib[] = [
  { id: "vanilla", name: "Saf JavaScript", version: "", kind: "baseline", has: { router: 0, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/vanilla.ts", load: () => import("./apps/vanilla.ts") },
  { id: "march", name: "March", version: "0.3.0", kind: "framework", has: { router: 1, store: 1, ui: 1, i18n: 1 }, src: "src/bench/apps/march.tsx", load: () => import("./apps/march.tsx") },
  { id: "react", name: "React", version: "19.3.1", kind: "view", has: { router: 0, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/react.ts", load: () => import("./apps/react.ts") },
  { id: "preact", name: "Preact", version: "10.29.8", kind: "view", has: { router: 2, store: 2, ui: 0, i18n: 0 }, src: "src/bench/apps/preact.ts", load: () => import("./apps/preact.ts") },
  { id: "vue", name: "Vue", version: "3.5.45", kind: "view", has: { router: 2, store: 2, ui: 0, i18n: 0 }, src: "src/bench/apps/vue.ts", load: () => import("./apps/vue.ts") },
  { id: "svelte", name: "Svelte", version: "5.57.3", kind: "view", has: { router: 2, store: 1, ui: 0, i18n: 0 }, src: "src/bench/apps/svelte-app.ts", load: () => import("./apps/svelte.ts") },
  { id: "solid", name: "SolidJS", version: "1.9.19", kind: "view", has: { router: 2, store: 1, ui: 0, i18n: 0 }, src: "src/bench/apps/solid.gen.js", load: () => import("./apps/solid.gen.js") },
  { id: "lit", name: "Lit", version: "3.3.3", kind: "view", has: { router: 0, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/lit-app.ts", load: () => import("./apps/lit.ts") },
  { id: "marko", name: "Marko", version: "6.4.14", kind: "view", has: { router: 2, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/marko.ts", load: () => import("./apps/marko.ts") },
  { id: "inferno", name: "Inferno", version: "10.0.0", kind: "view", has: { router: 2, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/inferno.gen.js", load: () => import("./apps/inferno.gen.js") },
  { id: "ivi", name: "ivi", version: "5.1.0", kind: "view", has: { router: 0, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/ivi.gen.js", load: () => import("./apps/ivi.gen.js") },
  { id: "mithril", name: "Mithril", version: "2.3.8", kind: "framework", has: { router: 1, store: 0, ui: 0, i18n: 0 }, src: "src/bench/apps/mithril.ts", load: () => import("./apps/mithril.ts") },
  { id: "alpine", name: "Alpine.js", version: "3.17.5", kind: "view", has: { router: 0, store: 1, ui: 0, i18n: 0 }, src: "src/bench/apps/alpine.ts", load: () => import("./apps/alpine.ts") },
  { id: "angular", name: "Angular", version: "22.2.6", kind: "framework", has: { router: 2, store: 1, ui: 2, i18n: 2 }, src: "src/bench/apps/angular.gen.js", load: () => import("./apps/angular.ts") },
]
/** The yardstick, not a competitor: hand-written DOM code with no framework (no crown; drawn as the reference line). */
export const BASELINE = "vanilla"
export const libById = (id: string): Lib | undefined => LIBS.find((l) => l.id === id)
