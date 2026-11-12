// Live ticker, Preact 10: state split per row. Each row is a class component holding its own price; a tick calls
// setState on the changed rows only (the list does not render again). Preact renders in a microtask, before the paint.
import { h, render, Component } from "preact"
import { fmtPrice, dir, type Quote, type Tick, type ScenarioApp } from "../core.ts"

interface RowState { price: number; cls: string }
export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const rows: (RowView | null)[] = data.map(() => null)
  class RowView extends Component<{ i: number; q: Quote }, RowState> {
    constructor(p: { i: number; q: Quote }) { super(p); this.state = { price: p.q.price, cls: "px" }; rows[p.i] = this }
    override shouldComponentUpdate(_p: unknown, s: RowState) { return s.price !== this.state.price || s.cls !== this.state.cls }
    render({ q }: { q: Quote }, { price, cls }: RowState) { return h("tr", null, h("td", { class: "sym" }, q.sym), h("td", { class: cls }, fmtPrice(price))) }
  }
  render(h("table", { class: "bt" }, h("tbody", null, data.map((q, i) => h(RowView, { key: q.id, i, q })))), host)
  return {
    step: (p) => {
      for (const t of p as Tick[]) {
        const r = rows[t.i]!
        r.setState({ price: t.price, cls: `px ${dir(t.price, r.state.price)}` })
      }
    },
    destroy: () => render(null, host),
  }
}
