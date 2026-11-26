// Derived values, ivi: ivi has no derived state, so the app keeps a dependency index (field → computed cells that read
// it, def.ts dependents()). Fields and computed cells are stateful components that register an invalidate; an edit
// sets the field, recomputes only its dependents and invalidates the field and each computed cell whose value
// changed (ivi updates them in a microtask, before the paint). Templates compiled with ivi's template compiler
// (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, invalidate, html } from "ivi"
import { evalComp, compClass, dependents, type Form, type Edit, type Comp } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const f = data.fields.slice(), deps = dependents(data), get = (i: number) => f[i]!
  const fieldInv: (() => void)[] = [], compRefresh: (() => void)[] = []
  const Field = component<number>((c) => (i) => { fieldInv[i] ??= () => invalidate(c); return html`<span class="dv-f">${f[i]}</span>` }, () => true)
  const Cell = component<{ c: Comp; k: number }>((ctx) => {
    let v = NaN
    return ({ c, k }) => {
      if (Number.isNaN(v)) { v = evalComp(c, get); compRefresh[k] = () => { const n = evalComp(c, get); if (n !== v) { v = n; invalidate(ctx) } } }
      return html`<span class=${compClass(c, v)}>${v}</span>`
    }
  }, () => true)
  const root = createRoot(host)
  update(root, html`<div class="dv"><div class="dv-fs">${f.map((_, i) => Field(i))}</div><div class="dv-cs">${data.comps.map((c, k) => Cell({ c, k }))}</div></div>`)
  return {
    step: (p) => { const e = p as Edit; f[e.i] = e.v; fieldInv[e.i]!(); for (const k of deps[e.i]!) compRefresh[k]!() },
    destroy: () => update(root, null),
  }
}
