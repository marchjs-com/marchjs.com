// Live ticker, Mithril: the usual Mithril pattern, one redraw of the whole view per tick (m.redraw.sync); each row
// component skips its diff unless its quote changed (onbeforeupdate), so Mithril compares 2.000 attrs and patches only
// the changed cells.
import m from "mithril"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface Cell { sym: string; price: number; cls: string }
const Row: m.Component<{ c: Cell }> = {
  onbeforeupdate: (v, old) => v.attrs.c !== old.attrs.c,
  view: ({ attrs: { c } }) => m("tr", m("td.sym", c.sym), m("td", { class: c.cls }, fmtPrice(c.price))),
}
export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const cells: Cell[] = data.map((q) => ({ sym: q.sym, price: q.price, cls: "px" }))
  m.mount(host, { view: () => m("table.bt", m("tbody", cells.map((c, i) => m(Row, { key: data[i]!.id, c })))) })
  return {
    step: (p) => {
      for (const t of p as Tick[]) { const c = cells[t.i]!; cells[t.i] = { sym: c.sym, price: t.price, cls: `px ${dir(t.price, c.price)}` } }
      m.redraw.sync()
    },
    destroy: () => m.mount(host, null),
  }
}
