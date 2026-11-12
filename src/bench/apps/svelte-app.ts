// Benchmark app: Svelte 5, the app itself (loaded by svelte.ts; the compiled component is svelte.gen.js, from
// svelte.svelte). Svelte applies state changes in a microtask, before the next paint.
import { mount as svelteMount, unmount } from "svelte"
import App from "./svelte.gen.js"
import type { BenchApp } from "../core.ts"

interface Api { run: BenchApp["run"]; add: BenchApp["add"]; update(): void; swap(): void; clear(): void }
export function mount(host: HTMLElement): BenchApp {
  const app = svelteMount(App, { target: host }) as unknown as Api
  return { run: (r) => app.run(r), add: (r) => app.add(r), update: () => app.update(), swap: () => app.swap(), clear: () => app.clear(), destroy: () => { void unmount(app as never) } }
}
