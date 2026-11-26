// Shared store, ivi: one small store object holds all the cells, with one listener per cell; each cell is a stateful
// component that subscribes to its own index. A step writes the 50 cells and invalidates only those (ivi updates them
// in a microtask, before the paint). Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, invalidate, useUnmount, html } from "ivi"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const store = { cells: data.cells.slice(), subs: data.cells.map((): (() => void) | null => null) }
  const Cell = component<number>((c) => {
    let at = -1
    useUnmount(c, () => { store.subs[at] = null })
    return (i) => { if (at < 0) { at = i; store.subs[i] = () => invalidate(c) } return html`<span class="sc">${store.cells[i]}</span>` }
  }, () => true)
  const root = createRoot(host)
  update(root, html`<div class="sg">${sectionsOf(data.cells.length).map((idx) => html`<div class="ss">${idx.map(Cell)}</div>`)}</div>`)
  return {
    step: (p) => { for (const w of p as Write[]) { store.cells[w.i] = w.v; store.subs[w.i]?.() } },
    destroy: () => update(root, null),
  }
}
