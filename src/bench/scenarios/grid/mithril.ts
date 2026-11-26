// Data list, Mithril: the query, categories, sort and selection are app state; the filtered list is recomputed only
// when the query or the categories change and the sorted view only when it or the sort changes (memoized by hand).
// One redraw (m.redraw.sync) per action; rows are keyed by record and each row component skips its diff unless its
// record or selection changed (onbeforeupdate), so a toggle patches one row and the summary.
import m from "mithril"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const RowView: m.Component<{ r: Rec; on: boolean }> = {
  onbeforeupdate: (v, o) => v.attrs.on !== o.attrs.on || v.attrs.r !== o.attrs.r,
  view: ({ attrs: { r, on } }) => m("tr", { class: on ? SEL : "" }, m("td.id", r.id), m("td.nm", r.name), m("td.cat", CATS[r.cat]), m("td.px", fmtPrice(r.price)), m("td.st", r.stock)),
}
export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  let q = "", cats = CATS.map(() => true), key: Key = "id", dir: 1 | -1 = 1, count = 0, total = 0
  const sel = data.map(() => false)
  let filtered = data, view = data
  const refilter = () => { filtered = data.filter((r) => matches(r, q, cats)); resort() }
  const resort = () => { view = filtered.slice().sort(compare(key, dir)) }
  const setSel = (i: number, on: boolean) => {
    if (sel[i] === on) return
    sel[i] = on; count += on ? 1 : -1; total += on ? data[i]!.price : -data[i]!.price
  }
  m.mount(host, { view: () => m("div", m("p.gsum", summary(view.length, count, total)), m("table.bt", m("tbody", view.map((r) => m(RowView, { key: r.id, r, on: sel[r.i]! }))))) })
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q") { q = a.q; refilter() }
      else if (a.t === "cat") { cats = cats.slice(); cats[a.c] = a.on; refilter() }
      else if (a.t === "sort") { key = a.key; dir = a.dir; resort() }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
      m.redraw.sync()
    },
    destroy: () => m.mount(host, null),
  }
}
