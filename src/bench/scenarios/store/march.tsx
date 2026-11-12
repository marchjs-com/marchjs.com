// Shared store, HADI March: one store() (src/core/store.ts) holds all the cells; each Cell component reads
// app.cells[i] and so tracks only that path. A step writes the 50 cells inside batch(): only the 50 readers update,
// the sections and the other cells never run again.
import { render, batch, store } from "hadi-march"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const app = store({ cells: data.cells.slice() })
  function Cell(p: { i: number }) {
    return <span class="sc">{app.cells[p.i]}</span>
  }
  function Section(p: { idx: number[] }) {
    return <div class="ss">{p.idx.map((i) => <Cell i={i} />)}</div>
  }
  const dispose = render(() => <div class="sg">{sectionsOf(data.cells.length).map((idx) => <Section idx={idx} />)}</div>, host)
  return {
    step: (p) => batch(() => { for (const w of p as Write[]) app.cells[w.i] = w.v }),
    destroy: dispose,
  }
}
