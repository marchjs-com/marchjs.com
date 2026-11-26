// Data list, ivi: the query, categories, sort and selection are app state; the filtered list is recomputed only when
// the query or the categories change and the sorted view only when it or the sort changes (memoized by hand). Every
// action updates the app again (synchronously in update()); a keyed List() reuses rows by record and each row
// component skips its update unless its record or selection changed, so a toggle patches one row and the summary.
// Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, List, html } from "ivi"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface RowP { r: Rec; on: boolean }
const RowView = component<RowP>(() => ({ r, on }) => html`<tr class=${on ? SEL : ""}><td class="id">${r.id}</td><td class="nm">${r.name}</td><td class="cat">${CATS[r.cat]}</td><td class="px">${fmtPrice(r.price)}</td><td class="st">${r.stock}</td></tr>`,
  (a, b) => a.r === b.r && a.on === b.on)

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
  const byId = (r: Rec) => r.id
  const root = createRoot(host)
  const draw = () => update(root, html`<div><p class="gsum">${summary(view.length, count, total)}</p><table class="bt"><tbody>${List(view, byId, (r) => RowView({ r, on: sel[r.i]! }))}</tbody></table></div>`)
  draw()
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q") { q = a.q; refilter() }
      else if (a.t === "cat") { cats = cats.slice(); cats[a.c] = a.on; refilter() }
      else if (a.t === "sort") { key = a.key; dir = a.dir; resort() }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
      draw()
    },
    destroy: () => update(root, null),
  }
}
