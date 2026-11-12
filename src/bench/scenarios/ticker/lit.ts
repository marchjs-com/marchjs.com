// Live ticker, Lit 3: the usual Lit pattern, a render() of the whole list per tick; lit-html walks every row's values
// and touches the DOM only where a value changed (no virtual DOM, but a value check per row). Row template in compiled
// form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, attr, child } from "../lit-tpl.ts"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const row = template(el("tr", {}, el("td", { class: "sym" }, child()), el("td", { class: attr("class") }, child())))
  const rows = data.map((q) => ({ sym: q.sym, price: q.price, cls: "px" }))
  const table = document.createElement("table"), tbody = document.createElement("tbody")
  table.className = "bt"; table.append(tbody); host.append(table)
  const draw = () => render(rows.map((r) => row(r.sym, r.cls, fmtPrice(r.price))), tbody)
  draw()
  return {
    step: (p) => {
      for (const t of p as Tick[]) { const r = rows[t.i]!; r.cls = `px ${dir(t.price, r.price)}`; r.price = t.price }
      draw()
    },
    destroy: () => { render(null, tbody); table.remove() },
  }
}
