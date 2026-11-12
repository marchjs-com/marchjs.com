// State at the top, Lit 3: the unit and the focus are plain values at the top and every step renders the whole tree
// again from the root with them (panel > group > item templates, nested); lit-html compares every part's value and
// touches the DOM only where one changed. The formatted values are computed once per unit (a step that only moves the
// focus reuses them). Templates in compiled form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, child, attr } from "../lit-tpl.ts"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, type Deep, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  const itemT = template(el("div", { class: attr("class") }, el("span", { class: "k" }, child()), el("b", { class: "v" }, child())))
  const groupT = template(el("div", { class: "grp" }, el("h4", {}, child()), child()))
  const panelT = template(el("section", { class: "pnl" }, el("h3", {}, child()), el("p", { class: "note" }, child()), el("div", { class: "grps" }, child())))
  const root = document.createElement("div")
  root.className = "deep"; host.append(root)
  let unit = FIRST_UNIT, focus = NO_FOCUS
  let texts = data.items.map((it) => itemText(it, unit))
  const draw = () => render(data.panels.map((p) => panelT(p.title, p.note,
    p.groups.map((g) => groupT(g.title, g.items.map((it) => itemT(itemClass(it.id === focus), it.label, texts[it.id - 1]))))
  )), root)
  draw()
  return {
    step: (p) => {
      const s = p as Step
      if ("unit" in s) { unit = s.unit; texts = data.items.map((it) => itemText(it, unit)) } else focus = s.focus
      draw()
    },
    destroy: () => { render(null, root); root.remove() },
  }
}
