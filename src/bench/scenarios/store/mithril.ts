// Shared store, Mithril: one plain store object holds all the cells (Mithril's usual model: state outside the
// components, read in view()); a step writes the 50 cells and redraws once (m.redraw.sync), and each cell component
// skips its diff unless its value changed (onbeforeupdate).
import m from "mithril"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Cell: m.Component<{ v: number }> = {
  onbeforeupdate: (v, old) => v.attrs.v !== old.attrs.v,
  view: ({ attrs }) => m("span.sc", attrs.v),
}
export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const store = { cells: data.cells.slice() }
  const sections = sectionsOf(data.cells.length)
  m.mount(host, { view: () => m("div.sg", sections.map((idx) => m("div.ss", idx.map((i) => m(Cell, { v: store.cells[i]! }))))) })
  return {
    step: (p) => { for (const w of p as Write[]) store.cells[w.i] = w.v; m.redraw.sync() },
    destroy: () => m.mount(host, null),
  }
}
