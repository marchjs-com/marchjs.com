// Independent counters, ivi: each Counter is a stateful component with its own count (useState) and registers its
// increment; a step increments the fired counters, which invalidates only them (ivi updates them in a microtask,
// before the paint). Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, useState, html } from "ivi"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const inc: (() => void)[] = []
  const Counter = component<number>((c) => {
    const [n, setN] = useState(c, 0)
    return (i) => { inc[i] ??= () => setN(n() + 1); return html`<span class="ct">${n()}</span>` }
  }, () => true)
  const root = createRoot(host)
  update(root, html`<div class="cg">${data.map((_, i) => Counter(i))}</div>`)
  return {
    step: (p) => { for (const i of p as Fired) inc[i]!() },
    destroy: () => update(root, null),
  }
}
