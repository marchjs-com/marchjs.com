// Benchmark app: Preact 10. Class components; a row re-renders only when its row object or its selection changes.
// Preact renders state changes in a microtask, before the next paint.
import { h, render, Component } from "preact"
import type { BenchApp, Row } from "../core.ts"

interface RowProps { item: Row; selected: boolean; select: (id: number) => void; remove: (id: number) => void }
class RowView extends Component<RowProps> {
  override shouldComponentUpdate(next: RowProps) { return next.item !== this.props.item || next.selected !== this.props.selected }
  onSelect = () => this.props.select(this.props.item.id)
  onRemove = () => this.props.remove(this.props.item.id)
  render({ item, selected }: RowProps) {
    return h("tr", { class: selected ? "danger" : "" },
      h("td", { class: "c1" }, item.id),
      h("td", { class: "c4" }, h("a", { class: "lbl", onClick: this.onSelect }, item.label)),
      h("td", { class: "c1" }, h("a", { class: "rm", onClick: this.onRemove }, "×")),
      h("td", { class: "c6" }))
  }
}
interface State { data: Row[]; sel: number }
interface Api { app?: App }
class App extends Component<{ api: Api }, State> {
  constructor(props: { api: Api }) { super(props); this.state = { data: [], sel: 0 }; props.api.app = this }
  select = (id: number) => this.setState({ sel: id })
  remove = (id: number) => this.setState(({ data }) => ({ data: data.filter((r) => r.id !== id) }))
  render(_p: unknown, { data, sel }: State) {
    return h("table", { class: "bt" }, h("tbody", null, data.map((item) => h(RowView, { key: item.id, item, selected: sel === item.id, select: this.select, remove: this.remove }))))
  }
}

export function mount(host: HTMLElement): BenchApp {
  const api: Api = {}
  render(h(App, { api }), host)
  const set = (f: (s: State) => Partial<State>) => api.app!.setState(f as (s: State) => State)
  return {
    run: (rows) => set(() => ({ data: rows, sel: 0 })),
    add: (rows) => set(({ data }) => ({ data: data.concat(rows) })),
    update: () => set(({ data }) => { const d = data.slice(); for (let i = 0; i < d.length; i += 10) { const r = d[i]!; d[i] = { id: r.id, label: r.label + " !!!" } } return { data: d } }),
    swap: () => set(({ data }) => { if (data.length <= 998) return {}; const d = data.slice(); const t = d[1]!; d[1] = d[998]!; d[998] = t; return { data: d } }),
    clear: () => set(() => ({ data: [], sel: 0 })),
    destroy: () => render(null, host),
  }
}

// the realistic scenarios' preact apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/preact.ts"
