// Benchmark app: Svelte 5 (loader). Svelte's runtime asks for a Trusted Types policy when it is evaluated; see no-tt.ts.
import type { BenchApp } from "../core.ts"
import type * as SvelteApp from "./svelte-app.ts"
import { withoutPolicyLookup } from "./no-tt.ts"

export async function mount(host: HTMLElement): Promise<BenchApp> {
  const m: typeof SvelteApp = await withoutPolicyLookup(() => import("./svelte-app.ts"))
  return m.mount(host)
}
