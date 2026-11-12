// Derived values, SolidJS: each field is a signal and each computed cell a createMemo reading its fields (plus a memo
// for the class), so an edit re-runs only the memos that read that field and Solid updates only their bound text and
// class. Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, createMemo } from "solid-js"
import { render } from "solid-js/web"
import { evalComp, compClass } from "./def.ts"

export function mount(host, data) {
  const fields = data.fields.map((v) => createSignal(v))
  const get = (i) => fields[i][0]()
  const dispose = render(() => {
    const comps = data.comps.map((c) => { const value = createMemo(() => evalComp(c, get)); return { value, cls: createMemo(() => compClass(c, value())) } })
    return (
      <div class="dv">
        <div class="dv-fs">{fields.map(([v]) => <span class="dv-f">{v()}</span>)}</div>
        <div class="dv-cs">{comps.map((c) => <span class={c.cls()}>{c.value()}</span>)}</div>
      </div>
    )
  }, host)
  return {
    step: (e) => fields[e.i][1](e.v),
    destroy: dispose,
  }
}
