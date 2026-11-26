// The Marko apps of the realistic scenarios: each scenario's marko.marko is compiled with the benchmark app onto one
// Marko runtime (tools/gen-bench.mjs → ../apps/marko.gen.js, which exports each template under its scenario's id).
// A template gets { data, api, host } as its input and puts its step function on `api`; a step is flushed at once with
// Marko's run(), as the benchmark app's calls are.
import * as marko from "../apps/marko.gen.js"
import type { ScenarioApp, ScenarioMount } from "./core.ts"

interface Template { mount(input: object, el: Element): { destroy(): void } }
const T = marko as unknown as Record<string, Template> & { run(): void }
const app = (id: string): ScenarioMount<never> => (host, data) => {
  const api = {} as { step(p: unknown): void }
  const view = T[id]!.mount({ data, api, host }, host)
  T.run()
  return { step: (p) => { api.step(p); T.run() }, destroy: () => view.destroy() } satisfies ScenarioApp
}

export const scenarios = { ticker: app("ticker"), tree: app("tree"), derived: app("derived"), theme: app("theme"), hover: app("hover"), counters: app("counters"), store: app("store"), deep: app("deep"), grid: app("grid"), startup: app("startup") }
