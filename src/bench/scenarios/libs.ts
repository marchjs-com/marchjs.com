// Realistic scenarios: where each library's apps are. A third-party library's scenario apps ride in that library's
// benchmark chunk (its canonical app re-exports `scenarios` from ./<library>.ts), so the runtime is downloaded once and
// the showcase's per-part budget and HTML-string exemptions (march.config.js › THIRD_PARTY) cover exactly one chunk.
// Layout: src/bench/scenarios/<scenario>/<library>.ts(x); compiled forms (*.gen.js) come from tools/gen-bench.mjs.
import type { ScenarioMount } from "./core.ts"
import { withoutPolicyLookup } from "../apps/no-tt.ts"

export type ScenarioMounts = Record<string, ScenarioMount<never>>
export const SCENARIO_LIBS: Record<string, () => Promise<ScenarioMounts>> = {
  vanilla: () => import("./vanilla.ts").then((m) => m.scenarios),
  march: () => import("./march.ts").then((m) => m.scenarios),
  react: () => import("../apps/react.ts").then((m) => m.scenarios),
  preact: () => import("../apps/preact.ts").then((m) => m.scenarios),
  vue: () => import("../apps/vue.ts").then((m) => m.scenarios),
  svelte: () => withoutPolicyLookup(() => import("../apps/svelte-app.ts")).then((m) => m.scenarios),
  solid: () => import("../apps/solid.gen.js").then((m) => m.scenarios as ScenarioMounts),
  lit: () => withoutPolicyLookup(() => import("../apps/lit-app.ts")).then((m) => m.scenarios),
}
