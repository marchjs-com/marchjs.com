// Data list, Inferno: the query, categories, sort and selection are app state; the filtered list is recomputed only
// when the query or the categories change and the sorted view only when it or the sort changes (memoized by hand,
// Inferno has no derived state). Every action renders the app again (render() is synchronous); rows are keyed by
// record and each row skips its update unless its record or selection changed (onComponentShouldUpdate), so a
// toggle patches one row and the summary. Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render } from "inferno"
import { CATS, SEL, matches, compare, fmtPrice, summary } from "./def.ts"

function RowView({ r, on }) {
  return <tr className={on ? SEL : ""}><td className="id">{r.id}</td><td className="nm">{r.name}</td><td className="cat">{CATS[r.cat]}</td><td className="px">{fmtPrice(r.price)}</td><td className="st">{r.stock}</td></tr>
}
const changed = (a, b) => a.on !== b.on || a.r !== b.r

export function mount(host, data) {
  let q = "", cats = CATS.map(() => true), key = "id", dir = 1, count = 0, total = 0
  const sel = data.map(() => false)
  let filtered = data, view = data
  const refilter = () => { filtered = data.filter((r) => matches(r, q, cats)); resort() }
  const resort = () => { view = filtered.slice().sort(compare(key, dir)) }
  const setSel = (i, on) => {
    if (sel[i] === on) return
    sel[i] = on; count += on ? 1 : -1; total += on ? data[i].price : -data[i].price
  }
  const draw = () => render(
    <div>
      <p className="gsum">{summary(view.length, count, total)}</p>
      <table className="bt"><tbody $HasKeyedChildren>{view.map((r) => <RowView key={r.id} r={r} on={sel[r.i]} onComponentShouldUpdate={changed} />)}</tbody></table>
    </div>, host)
  draw()
  return {
    step: (a) => {
      if (a.t === "q") { q = a.q; refilter() }
      else if (a.t === "cat") { cats = cats.slice(); cats[a.c] = a.on; refilter() }
      else if (a.t === "sort") { key = a.key; dir = a.dir; resort() }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
      draw()
    },
    destroy: () => render(null, host),
  }
}
