// Benchmark app: Lit (loader). lit-html asks for a Trusted Types policy named "lit-html" when it is evaluated; see
// no-tt.ts. The row template is handed over in lit-html's compiled-template form (lit-app.ts), so no HTML string is parsed.
import type { BenchApp } from "../core.ts"
import type * as LitApp from "./lit-app.ts"
import { withoutPolicyLookup } from "./no-tt.ts"

export async function mount(host: HTMLElement): Promise<BenchApp> {
  const m: typeof LitApp = await withoutPolicyLookup(() => import("./lit-app.ts"))
  return m.mount(host)
}
