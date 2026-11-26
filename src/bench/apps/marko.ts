// Benchmark app: Marko 6 (the wrapper). marko.marko is compiled by Marko's own compiler for the browser and bundled with
// Marko's DOM runtime (tools/gen-bench.mjs → marko.gen.js); the template hands its handlers to `api` when it mounts.
// Calls from the benchmark render at once with Marko's run(), as React's flushSync does; a click in the table is
// rendered by Marko's own scheduler (a microtask, before the next paint).
import App, { run } from "./marko.gen.js"
import type { BenchApp, Row } from "../core.ts"

interface Api { run(r: Row[]): void; add(r: Row[]): void; update(): void; swap(): void; clear(): void }
export function mount(host: HTMLElement): BenchApp {
  const api = {} as Api
  const app = (App as unknown as { mount(input: object, el: Element): { destroy(): void } }).mount({ api }, host)
  const now = (fn: () => void) => { fn(); run() }
  return {
    run: (r) => now(() => api.run(r)),
    add: (r) => now(() => api.add(r)),
    update: () => now(() => api.update()),
    swap: () => now(() => api.swap()),
    clear: () => now(() => api.clear()),
    destroy: () => app.destroy(),
  }
}
