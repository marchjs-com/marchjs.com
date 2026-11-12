// Data list, React 19, with the patterns React recommends: one useReducer state (query, categories, sort, selection
// as an immutable Set, running count and total), the filtered list and the sorted view in two useMemo, and memo rows
// with a `selected` boolean prop. A selection toggle renders the list component again (2.000 row elements made and
// compared), but only the toggled memo row renders; a filter or sort change is a keyed list diff. Updates run in
// flushSync.
import { createElement as h, memo, useMemo, useReducer, useLayoutEffect } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface State { q: string; cats: boolean[]; key: Key; dir: 1 | -1; sel: ReadonlySet<number>; count: number; total: number }
/** The app's own action: "all" arrives with the visible records (the reducer does not see the memoized view). */
type Do = Exclude<Act, { t: "all" }> | { t: "all"; view: Rec[] }

export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  const reduce = (s: State, a: Do): State => {
    switch (a.t) {
      case "q": return { ...s, q: a.q }
      case "cat": { const cats = s.cats.slice(); cats[a.c] = a.on; return { ...s, cats } }
      case "sort": return { ...s, key: a.key, dir: a.dir }
      case "sel": {
        if (s.sel.has(a.i) === a.on) return s
        const sel = new Set(s.sel), price = data[a.i]!.price
        if (a.on) sel.add(a.i); else sel.delete(a.i)
        return { ...s, sel, count: s.count + (a.on ? 1 : -1), total: s.total + (a.on ? price : -price) }
      }
      case "all": {
        const sel = new Set(s.sel)
        let { count, total } = s
        for (const r of a.view) if (!sel.has(r.i)) { sel.add(r.i); count++; total += r.price }
        return { ...s, sel, count, total }
      }
      case "none": return { ...s, sel: new Set(), count: 0, total: 0 }
    }
  }
  const init: State = { q: "", cats: CATS.map(() => true), key: "id", dir: 1, sel: new Set(), count: 0, total: 0 }
  const api: { send?: (a: Do) => void; view: Rec[] } = { view: [] }
  const Row = memo(function Row({ r, selected }: { r: Rec; selected: boolean }) {
    return h("tr", { className: selected ? SEL : "" },
      h("td", { className: "id" }, r.id), h("td", { className: "nm" }, r.name), h("td", { className: "cat" }, CATS[r.cat]),
      h("td", { className: "px" }, fmtPrice(r.price)), h("td", { className: "st" }, r.stock))
  })
  function App() {
    const [s, send] = useReducer(reduce, init)
    const filtered = useMemo(() => data.filter((r) => matches(r, s.q, s.cats)), [s.q, s.cats])
    const view = useMemo(() => filtered.slice().sort(compare(s.key, s.dir)), [filtered, s.key, s.dir])
    useLayoutEffect(() => { api.send = send; api.view = view })
    return h("div", null,
      h("p", { className: "gsum" }, summary(view.length, s.count, s.total)),
      h("table", { className: "bt" }, h("tbody", null, view.map((r) => h(Row, { key: r.id, r, selected: s.sel.has(r.i) })))))
  }
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => {
      const a = p as Act
      flushSync(() => api.send!(a.t === "all" ? { t: "all", view: api.view } : a))
    },
    destroy: () => root.unmount(),
  }
}
