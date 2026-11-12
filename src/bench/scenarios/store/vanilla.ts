// Shared store, plain DOM (hand-optimized): the store is a plain array; the cells are cloned from one prototype and
// their text nodes kept in an array, and a step writes the store and only the changed cells' text.
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const doc = host.ownerDocument
  const cells = data.cells.slice(), texts: Text[] = []
  const grid = doc.createElement("div"), secProto = doc.createElement("div"), proto = doc.createElement("span")
  grid.className = "sg"; secProto.className = "ss"; proto.className = "sc"; proto.append("")
  for (const sec of sectionsOf(cells.length)) {
    const s = secProto.cloneNode(false) as HTMLElement
    for (const i of sec) {
      const c = proto.cloneNode(true) as HTMLElement
      const t = c.firstChild as Text
      t.data = String(cells[i])
      texts.push(t)
      s.append(c)
    }
    grid.append(s)
  }
  host.append(grid)
  return {
    step: (p) => { for (const w of p as Write[]) if (cells[w.i] !== w.v) { cells[w.i] = w.v; texts[w.i]!.data = String(w.v) } },
    destroy: () => grid.remove(),
  }
}
