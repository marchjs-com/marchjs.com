// The libraries under test: each one's benchmark app is its own lazy chunk, downloaded only when its test runs.
// Versions are the showcase's devDependencies (test/bench-libs.test.js keeps them equal).
import type { MountFn } from "./core.ts"

export interface Lib { id: string; name: string; version: string; /** manifest key of its lazy chunk */ src: string; load: () => Promise<{ mount: MountFn }> }
export const LIBS: Lib[] = [
  { id: "vanilla", name: "Saf JavaScript", version: "", src: "src/bench/apps/vanilla.ts", load: () => import("./apps/vanilla.ts") },
  { id: "march", name: "March", version: "0.3.0", src: "src/bench/apps/march.tsx", load: () => import("./apps/march.tsx") },
  { id: "react", name: "React", version: "19.3.1", src: "src/bench/apps/react.ts", load: () => import("./apps/react.ts") },
  { id: "preact", name: "Preact", version: "10.29.8", src: "src/bench/apps/preact.ts", load: () => import("./apps/preact.ts") },
  { id: "vue", name: "Vue", version: "3.5.45", src: "src/bench/apps/vue.ts", load: () => import("./apps/vue.ts") },
  { id: "svelte", name: "Svelte", version: "5.57.3", src: "src/bench/apps/svelte-app.ts", load: () => import("./apps/svelte.ts") },
  { id: "solid", name: "SolidJS", version: "1.9.19", src: "src/bench/apps/solid.gen.js", load: () => import("./apps/solid.gen.js") },
  { id: "lit", name: "Lit", version: "3.3.3", src: "src/bench/apps/lit-app.ts", load: () => import("./apps/lit.ts") },
  { id: "marko", name: "Marko", version: "6.4.14", src: "src/bench/apps/marko.ts", load: () => import("./apps/marko.ts") },
  { id: "inferno", name: "Inferno", version: "10.0.0", src: "src/bench/apps/inferno.gen.js", load: () => import("./apps/inferno.gen.js") },
  { id: "ivi", name: "ivi", version: "5.1.0", src: "src/bench/apps/ivi.gen.js", load: () => import("./apps/ivi.gen.js") },
  { id: "mithril", name: "Mithril", version: "2.3.8", src: "src/bench/apps/mithril.ts", load: () => import("./apps/mithril.ts") },
  { id: "alpine", name: "Alpine.js", version: "3.17.5", src: "src/bench/apps/alpine.ts", load: () => import("./apps/alpine.ts") },
  { id: "angular", name: "Angular", version: "22.2.6", src: "src/bench/apps/angular.gen.js", load: () => import("./apps/angular.ts") },
]
/** The yardstick, not a competitor: hand-written DOM code with no framework (no crown; drawn as the reference line). */
export const BASELINE = "vanilla"
export const libById = (id: string): Lib | undefined => LIBS.find((l) => l.id === id)
