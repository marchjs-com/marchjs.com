// Benchmark app: React 19 (react-dom/client). useReducer state, memo rows; calls from the benchmark run inside
// flushSync, as a click on a button would (discrete event: rendered before the next paint).
import { createElement as h, memo, useReducer, type Dispatch } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import type { BenchApp, Row } from "../core.ts"

interface State { data: Row[]; sel: number }
type Action = { t: "run" | "add"; rows: Row[] } | { t: "update" | "swap" | "clear" } | { t: "select" | "remove"; id: number }
function reducer(s: State, a: Action): State {
  switch (a.t) {
    case "run": return { data: a.rows, sel: 0 }
    case "add": return { ...s, data: s.data.concat(a.rows) }
    case "update": { const d = s.data.slice(); for (let i = 0; i < d.length; i += 10) { const r = d[i]!; d[i] = { id: r.id, label: r.label + " !!!" } } return { ...s, data: d } }
    case "swap": { if (s.data.length <= 998) return s; const d = s.data.slice(); const t = d[1]!; d[1] = d[998]!; d[998] = t; return { ...s, data: d } }
    case "clear": return { data: [], sel: 0 }
    case "select": return { ...s, sel: a.id }
    case "remove": return { ...s, data: s.data.filter((r) => r.id !== a.id) }
  }
}
const RowView = memo(function RowView({ item, selected, dispatch }: { item: Row; selected: boolean; dispatch: Dispatch<Action> }) {
  return h("tr", { className: selected ? "danger" : "" },
    h("td", { className: "c1" }, item.id),
    h("td", { className: "c4" }, h("a", { className: "lbl", onClick: () => dispatch({ t: "select", id: item.id }) }, item.label)),
    h("td", { className: "c1" }, h("a", { className: "rm", onClick: () => dispatch({ t: "remove", id: item.id }) }, "×")),
    h("td", { className: "c6" }))
})
function App({ api }: { api: { dispatch?: Dispatch<Action> } }) {
  const [s, dispatch] = useReducer(reducer, { data: [], sel: 0 })
  api.dispatch = dispatch
  return h("table", { className: "bt" }, h("tbody", null, s.data.map((item) => h(RowView, { key: item.id, item, selected: s.sel === item.id, dispatch }))))
}

export function mount(host: HTMLElement): BenchApp {
  const root = createRoot(host)
  const api: { dispatch?: Dispatch<Action> } = {}
  flushSync(() => root.render(h(App, { api })))
  const send = (a: Action) => flushSync(() => api.dispatch!(a))
  return {
    run: (rows) => send({ t: "run", rows }),
    add: (rows) => send({ t: "add", rows }),
    update: () => send({ t: "update" }),
    swap: () => send({ t: "swap" }),
    clear: () => send({ t: "clear" }),
    destroy: () => root.unmount(),
  }
}
