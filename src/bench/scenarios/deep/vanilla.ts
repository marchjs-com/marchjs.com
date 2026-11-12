// State at the top, plain DOM (hand-optimized): the hierarchy is built once from cloned prototypes, and the page keeps
// references to what depends on the state: each item's element and the measured items' value text nodes. A focus
// step changes the class of the old and the new item; a unit step rewrites the measured values.
import { FIRST_UNIT, NO_FOCUS, fmt, itemText, itemClass, type Deep, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  const doc = host.ownerDocument
  const mk = (tag: string, cls: string, ...kids: Node[]) => { const e = doc.createElement(tag); if (cls) e.className = cls; e.append(...kids); return e }
  const pProto = mk("section", "pnl", mk("h3", "", doc.createTextNode("")), mk("p", "note", doc.createTextNode("")), mk("div", "grps"))
  const gProto = mk("div", "grp", mk("h4", "", doc.createTextNode("")))
  const iProto = mk("div", itemClass(false), mk("span", "k", doc.createTextNode("")), mk("b", "v", doc.createTextNode("")))
  const root = mk("div", "deep")
  const els: HTMLElement[] = [], vals: Text[] = [], metres: number[] = []
  for (const p of data.panels) {
    const pe = pProto.cloneNode(true) as HTMLElement
    ;(pe.firstChild!.firstChild as Text).data = p.title
    ;(pe.childNodes[1]!.firstChild as Text).data = p.note
    const grps = pe.lastChild!
    for (const g of p.groups) {
      const ge = gProto.cloneNode(true) as HTMLElement
      ;(ge.firstChild!.firstChild as Text).data = g.title
      for (const it of g.items) {
        const ie = iProto.cloneNode(true) as HTMLElement
        ;(ie.firstChild!.firstChild as Text).data = it.label
        const t = ie.lastChild!.firstChild as Text
        t.data = itemText(it, FIRST_UNIT)
        els.push(ie)
        if (it.v !== null) { vals.push(t); metres.push(it.v) }
        ge.append(ie)
      }
      grps.append(ge)
    }
    root.append(pe)
  }
  host.append(root)
  let focus = NO_FOCUS
  return {
    step: (p) => {
      const s = p as Step
      if ("unit" in s) { for (let i = 0; i < vals.length; i++) vals[i]!.data = fmt(metres[i]!, s.unit); return }
      if (focus !== NO_FOCUS) els[focus - 1]!.className = itemClass(false)
      els[(focus = s.focus) - 1]!.className = itemClass(true)
    },
    destroy: () => root.remove(),
  }
}
