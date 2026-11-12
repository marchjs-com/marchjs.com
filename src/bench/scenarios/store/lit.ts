// Shared store, Lit 3: the usual Lit pattern, one plain store object and a render() of the whole page per step;
// lit-html walks every section and every cell's value (5.000) and touches the DOM only where a value changed.
// Templates in compiled form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, child } from "../lit-tpl.ts"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const cell = template(el("span", { class: "sc" }, child()))
  const section = template(el("div", { class: "ss" }, child()))
  const appStore = { cells: data.cells.slice() }
  const sections = sectionsOf(data.cells.length)
  const grid = document.createElement("div")
  grid.className = "sg"; host.append(grid)
  const draw = () => render(sections.map((idx) => section(idx.map((i) => cell(appStore.cells[i])))), grid)
  draw()
  return {
    step: (p) => { for (const w of p as Write[]) appStore.cells[w.i] = w.v; draw() },
    destroy: () => { render(null, grid); grid.remove() },
  }
}
