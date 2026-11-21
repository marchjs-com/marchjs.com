// The libraries under test: each one's benchmark app is its own lazy chunk, downloaded only when its test runs.
// Versions are the showcase's devDependencies (test/bench-libs.test.js keeps them equal).
import type { MountFn } from "./core.ts"

export interface Lib { id: string; name: string; version: string; /** manifest key of its lazy chunk */ src: string; load: () => Promise<{ mount: MountFn }> }
export const LIBS: Lib[] = [
  { id: "vanilla", name: "Vanilla JS", version: "", src: "src/bench/apps/vanilla.ts", load: () => import("./apps/vanilla.ts") },
  { id: "march", name: "March", version: "0.3.0", src: "src/bench/apps/march.tsx", load: () => import("./apps/march.tsx") },
  { id: "react", name: "React", version: "19.3.1", src: "src/bench/apps/react.ts", load: () => import("./apps/react.ts") },
  { id: "preact", name: "Preact", version: "10.29.8", src: "src/bench/apps/preact.ts", load: () => import("./apps/preact.ts") },
  { id: "vue", name: "Vue", version: "3.5.45", src: "src/bench/apps/vue.ts", load: () => import("./apps/vue.ts") },
  { id: "svelte", name: "Svelte", version: "5.57.3", src: "src/bench/apps/svelte-app.ts", load: () => import("./apps/svelte.ts") },
  { id: "solid", name: "SolidJS", version: "1.9.19", src: "src/bench/apps/solid.gen.js", load: () => import("./apps/solid.gen.js") },
  { id: "lit", name: "Lit", version: "3.3.3", src: "src/bench/apps/lit-app.ts", load: () => import("./apps/lit.ts") },
]
export const BASELINE = "vanilla"
export const libById = (id: string): Lib | undefined => LIBS.find((l) => l.id === id)
