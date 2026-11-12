// Moving highlight, Lit 3: the usual Lit pattern, a render() of the whole list with the hovered index; lit-html walks
// every row's three values and touches the DOM only where one changed (the two rows' class). Row template in compiled
// form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, attr, child } from "../lit-tpl.ts"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const row = template(el("tr", { class: attr("class") }, el("td", { class: "id" }, child()), el("td", { class: "lbl" }, child())))
  const table = document.createElement("table"), tbody = document.createElement("tbody")
  table.className = "bt"; table.append(tbody); host.append(table)
  const draw = (hovered: number) => render(data.map((it, i) => row(i === hovered ? HOVER : "", it.id, it.label)), tbody)
  draw(-1)
  return {
    step: (p) => draw(p as number),
    destroy: () => { render(null, tbody); table.remove() },
  }
}
