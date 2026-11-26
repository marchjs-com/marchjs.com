// Derived values, Mithril: Mithril has no derived state, so the app memoizes: a dependency index (field → computed
// cells that read it, def.ts dependents()) recomputes only the edited field's dependents, then one redraw
// (m.redraw.sync) of the whole form; each cell component skips its diff unless its value changed (onbeforeupdate).
import m from "mithril"
import { evalComp, compClass, dependents, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Cell: m.Component<{ cls: string; v: number }> = {
  onbeforeupdate: (v, old) => v.attrs.v !== old.attrs.v || v.attrs.cls !== old.attrs.cls,
  view: ({ attrs }) => m("span", { class: attrs.cls }, attrs.v),
}
export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const f = data.fields.slice(), deps = dependents(data), get = (i: number) => f[i]!
  const vals = data.comps.map((c) => evalComp(c, get))
  m.mount(host, { view: () => m("div.dv",
    m("div.dv-fs", f.map((v) => m(Cell, { cls: "dv-f", v }))),
    m("div.dv-cs", data.comps.map((c, k) => m(Cell, { cls: compClass(c, vals[k]!), v: vals[k]! })))) })
  return {
    step: (p) => {
      const e = p as Edit
      f[e.i] = e.v
      for (const k of deps[e.i]!) vals[k] = evalComp(data.comps[k]!, get)
      m.redraw.sync()
    },
    destroy: () => m.mount(host, null),
  }
}
