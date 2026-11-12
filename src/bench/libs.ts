// The libraries under test: each one's benchmark app is its own lazy chunk, downloaded only when its test runs.
// Versions are the showcase's devDependencies (test/bench-libs.test.js keeps them equal).
import type { MountFn } from "./core.ts"

export interface Lib { id: string; name: string; version: string; /** package names whose licenses the page shows */ pkgs: string[]; src: string; load: () => Promise<{ mount: MountFn }> }
export const LIBS: Lib[] = [
  { id: "vanilla", name: "Vanilla JS", version: "", pkgs: [], src: "src/bench/apps/vanilla.ts", load: () => import("./apps/vanilla.ts") },
  { id: "march", name: "HADI March", version: "0.1.0", pkgs: [], src: "src/bench/apps/march.tsx", load: () => import("./apps/march.tsx") },
  { id: "react", name: "React", version: "19.3.1", pkgs: ["react", "react-dom", "scheduler"], src: "src/bench/apps/react.ts", load: () => import("./apps/react.ts") },
]
export const BASELINE = "vanilla"
export const libById = (id: string): Lib | undefined => LIBS.find((l) => l.id === id)
