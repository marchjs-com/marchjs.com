// Benchmark app: Angular (loader). Angular asks for a Trusted Types policy of its own; see no-tt.ts. The app itself is
// angular-app.ts, compiled ahead of time into angular.gen.js (tools/gen-bench.mjs).
import type { BenchApp } from "../core.ts"
import { withoutPolicyLookup } from "./no-tt.ts"

export async function mount(host: HTMLElement): Promise<BenchApp> {
  const m = await withoutPolicyLookup(() => import("./angular.gen.js")) as { mount(host: HTMLElement): Promise<BenchApp> }
  return m.mount(host)
}
