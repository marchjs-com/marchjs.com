// Live ticker, plain DOM (hand-optimized): the rows are cloned from one prototype, the price cells are kept in an
// array, and a tick writes only the changed cells' text and class.
import { fmtPrice, dir, type Quote, type Tick } from "../core.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const doc = host.ownerDocument
  const table = doc.createElement("table"), tbody = doc.createElement("tbody")
  table.className = "bt"
  const proto = doc.createElement("tr")
  const sym = doc.createElement("td"), px = doc.createElement("td")
  sym.className = "sym"; px.className = "px"
  sym.append(""); px.append("")
  proto.append(sym, px)
  const cells: Text[] = [], tds: HTMLElement[] = [], last = data.map((q) => q.price)
  for (const q of data) {
    const tr = proto.cloneNode(true) as HTMLTableRowElement
    ;(tr.firstChild!.firstChild as Text).data = q.sym
    const td = tr.lastChild as HTMLElement
    ;(td.firstChild as Text).data = fmtPrice(q.price)
    cells.push(td.firstChild as Text); tds.push(td)
    tbody.append(tr)
  }
  table.append(tbody)
  host.append(table)
  return {
    step: (p) => {
      for (const t of p as Tick[]) {
        cells[t.i]!.data = fmtPrice(t.price)
        tds[t.i]!.className = `px ${dir(t.price, last[t.i]!)}`
        last[t.i] = t.price
      }
    },
    destroy: () => table.remove(),
  }
}
