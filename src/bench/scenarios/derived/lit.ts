// Derived values, Lit 3: Lit has no derived state, so the app memoizes: a dependency index (field → computed cells that
// read it) marks the edited field's dependents dirty, and render() recomputes only those before a render() of the
// whole form. lit-html then walks all 700 cells' values and touches the DOM only where a value changed (no virtual
// DOM, but a value check per cell). Cell templates in compiled form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, attr, child } from "../lit-tpl.ts"
import { evalComp, compClass, dependents, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const field = template(el("span", { class: "dv-f" }, child()))
  const cell = template(el("span", { class: attr("class") }, child()))
  const f = data.fields.slice(), get = (i: number) => f[i]!, deps = dependents(data)
  const value = data.comps.map((c) => evalComp(c, get)), cls = data.comps.map((c, k) => compClass(c, value[k]!))
  let dirty: number[] = []
  const root = document.createElement("div"), fbox = document.createElement("div"), cbox = document.createElement("div")
  root.className = "dv"; fbox.className = "dv-fs"; cbox.className = "dv-cs"
  root.append(fbox, cbox); host.append(root)
  const draw = () => {
    for (const k of dirty) { const c = data.comps[k]!; value[k] = evalComp(c, get); cls[k] = compClass(c, value[k]!) }
    dirty = []
    render(f.map((v) => field(v)), fbox)
    render(value.map((v, k) => cell(cls[k], v)), cbox)
  }
  draw()
  return {
    step: (p) => { const e = p as Edit; f[e.i] = e.v; dirty = deps[e.i]!; draw() },
    destroy: () => { render(null, fbox); render(null, cbox); root.remove() },
  }
}
