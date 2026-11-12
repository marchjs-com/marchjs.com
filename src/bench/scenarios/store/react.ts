// Shared store, React 19, with the pattern React recommends for an external shared store: one store object with a
// subscribe/notify pair, and each memo Cell subscribes with useSyncExternalStore and a per-cell selector
// (() => store.cells[i]). A step writes the 50 cells and notifies once: React runs every subscriber's selector (5.000)
// and re-renders only the cells whose value changed; the sections never render again. Inside flushSync.
import { createElement as h, memo, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const listeners = new Set<() => void>()
  const appStore = {
    cells: data.cells.slice(),
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    write(ws: Write[]) { for (const w of ws) appStore.cells[w.i] = w.v; for (const fn of listeners) fn() },
  }
  const Cell = memo(function Cell({ i }: { i: number }) {
    const v = useSyncExternalStore(appStore.subscribe, () => appStore.cells[i]!)
    return h("span", { className: "sc" }, v)
  })
  const Section = memo(function Section({ idx }: { idx: number[] }) {
    return h("div", { className: "ss" }, idx.map((i) => h(Cell, { key: i, i })))
  })
  const sections = sectionsOf(data.cells.length)
  const App = () => h("div", { className: "sg" }, sections.map((idx, k) => h(Section, { key: k, idx })))
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => appStore.write(p as Write[])),
    destroy: () => root.unmount(),
  }
}
