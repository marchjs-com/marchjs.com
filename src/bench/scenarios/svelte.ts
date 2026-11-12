// The Svelte apps of the realistic scenarios, bundled into the Svelte benchmark chunk (../apps/svelte-app.ts
// re-exports this, loaded after no-tt.ts hid the Trusted Types policy lookup). Each component is compiled by
// tools/gen-bench.mjs (<scenario>/svelte.svelte → svelte.gen.js) and exports step(payload).
import { mount as svelteMount, unmount, flushSync, type Component } from "svelte"
import Ticker from "./ticker/svelte.gen.js"
import Grid from "./grid/svelte.gen.js"
import Deep from "./deep/svelte.gen.js"
import Store from "./store/svelte.gen.js"
import Counters from "./counters/svelte.gen.js"
import Hover from "./hover/svelte.gen.js"
import Theme from "./theme/svelte.gen.js"
import Derived from "./derived/svelte.gen.js"
import Tree from "./tree/svelte.gen.js"
import type { ScenarioApp } from "./core.ts"

const app = (C: unknown) => (host: HTMLElement, data: unknown): ScenarioApp => {
  const a = svelteMount(C as Component<{ data: unknown }>, { target: host, props: { data } }) as unknown as { step(p: unknown): void }
  flushSync()
  return { step: (p) => a.step(p), destroy: () => { void unmount(a as never) } }
}
export const scenarios = { ticker: app(Ticker), tree: app(Tree), derived: app(Derived), theme: app(Theme), hover: app(Hover), counters: app(Counters), store: app(Store), deep: app(Deep), grid: app(Grid) }
