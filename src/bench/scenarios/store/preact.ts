// Shared store, Preact 10, the same pattern with hooks: one store object with subscribe/notify; each Cell subscribes
// in useLayoutEffect with a per-cell selector and sets its state only when its value changed (useState skips an equal
// value). A step writes the 50 cells and notifies once: every subscriber's selector runs (5.000), only the changed
// cells re-render; the sections never render again. Preact renders in a microtask, before the paint.
import { h, render, Component } from "preact"
import { useState, useLayoutEffect } from "preact/hooks"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const listeners = new Set<() => void>()
  const appStore = {
    cells: data.cells.slice(),
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    write(ws: Write[]) { for (const w of ws) appStore.cells[w.i] = w.v; for (const fn of listeners) fn() },
  }
  function useCell(i: number): number {
    const [v, set] = useState(() => appStore.cells[i]!)
    useLayoutEffect(() => appStore.subscribe(() => set(appStore.cells[i]!)), [i])
    return v
  }
  const Cell = ({ i }: { i: number }) => h("span", { class: "sc" }, useCell(i))
  class Section extends Component<{ idx: number[] }> {
    override shouldComponentUpdate() { return false }
    render({ idx }: { idx: number[] }) { return h("div", { class: "ss" }, idx.map((i) => h(Cell, { key: i, i }))) }
  }
  render(h("div", { class: "sg" }, sectionsOf(data.cells.length).map((idx, k) => h(Section, { key: k, idx }))), host)
  return {
    step: (p) => appStore.write(p as Write[]),
    destroy: () => render(null, host),
  }
}
