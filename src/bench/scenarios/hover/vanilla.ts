// Moving highlight, plain DOM (hand-optimized): the rows are cloned from one prototype and kept in an array; a step
// removes the class from the previously hovered row and adds it to the new one (two class writes).
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const doc = host.ownerDocument
  const table = doc.createElement("table"), tbody = doc.createElement("tbody")
  table.className = "bt"
  const proto = doc.createElement("tr")
  const id = doc.createElement("td"), lbl = doc.createElement("td")
  id.className = "id"; lbl.className = "lbl"
  id.append(""); lbl.append("")
  proto.append(id, lbl)
  const trs: HTMLTableRowElement[] = []
  for (const it of data) {
    const tr = proto.cloneNode(true) as HTMLTableRowElement
    ;(tr.firstChild!.firstChild as Text).data = String(it.id)
    ;(tr.lastChild!.firstChild as Text).data = it.label
    trs.push(tr); tbody.append(tr)
  }
  table.append(tbody)
  host.append(table)
  let prev: HTMLTableRowElement | null = null
  return {
    step: (p) => {
      const tr = trs[p as number]!
      if (tr === prev) return
      if (prev) prev.className = ""
      tr.className = HOVER
      prev = tr
    },
    destroy: () => table.remove(),
  }
}
