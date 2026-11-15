// Derived values, March: each field is a signal and each computed cell a computed() reading its fields, so an
// edit re-runs only the computeds that read that field (dependencies are tracked, not declared) and only their bound
// text and class update. The class is a second computed over the value, so it changes only when the flag flips.
import { render, signal, computed } from "march"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const fields = data.fields.map((v) => signal(v))
  const get = (i: number) => fields[i]!()
  const comps = data.comps.map((c) => {
    const value = computed(() => evalComp(c, get))
    return { value, cls: computed(() => compClass(c, value())) }
  })
  const dispose = render(() => <div class="dv">
    <div class="dv-fs">{fields.map((f) => <span class="dv-f">{f()}</span>)}</div>
    <div class="dv-cs">{comps.map((c) => <span class={c.cls()}>{c.value()}</span>)}</div>
  </div>, host)
  return {
    step: (p) => { const e = p as Edit; fields[e.i]!.set(e.v) },
    destroy: dispose,
  }
}
