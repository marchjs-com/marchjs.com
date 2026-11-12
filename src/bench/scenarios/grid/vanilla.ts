// Data list, plain DOM (hand-optimized): rows are cloned from one prototype and cached by record, made only when a
// record first becomes visible; the filtered and the sorted view are recomputed only when their inputs change; the
// list is reconciled by key (rows that left are removed, the kept and new rows are put in order, a row already in
// place is not touched); a selection toggle writes one row's class and the summary keeps a running count and total.
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  const doc = host.ownerDocument
  const sum = doc.createElement("p"), table = doc.createElement("table"), tbody = doc.createElement("tbody")
  sum.className = "gsum"; sum.append(""); table.className = "bt"; table.append(tbody)
  const proto = doc.createElement("tr")
  for (const c of ["id", "nm", "cat", "px", "st"]) { const td = doc.createElement("td"); td.className = c; td.append(""); proto.append(td) }
  const rows: (HTMLTableRowElement | undefined)[] = new Array(data.length)
  const rowOf = (r: Rec): HTMLTableRowElement => {
    let tr = rows[r.i]
    if (tr) return tr
    tr = proto.cloneNode(true) as HTMLTableRowElement
    const td = tr.cells
    ;(td[0]!.firstChild as Text).data = String(r.id)
    ;(td[1]!.firstChild as Text).data = r.name
    ;(td[2]!.firstChild as Text).data = CATS[r.cat]!
    ;(td[3]!.firstChild as Text).data = fmtPrice(r.price)
    ;(td[4]!.firstChild as Text).data = String(r.stock)
    if (sel[r.i]) tr.className = SEL
    return (rows[r.i] = tr)
  }
  let q = "", key: Key = "id", dir: 1 | -1 = 1, count = 0, total = 0
  const cats = CATS.map(() => true), sel = new Array<boolean>(data.length).fill(false)
  let filtered: Rec[] = [], view: Rec[] = [], shown: Rec[] = []
  const refilter = () => { filtered = data.filter((r) => matches(r, q, cats)) }
  const resort = () => { view = filtered.slice().sort(compare(key, dir)) }
  // keyed reconciliation: remove rows no longer shown, then walk the new order, inserting only rows not already in place
  const patch = () => {
    const next = new Uint8Array(data.length)
    for (const r of view) next[r.i] = 1
    for (const r of shown) if (!next[r.i]) rows[r.i]!.remove()
    let cur = tbody.firstChild
    for (const r of view) {
      const tr = rowOf(r)
      if (tr === cur) cur = cur.nextSibling
      else tbody.insertBefore(tr, cur)
    }
    shown = view
  }
  const setSel = (i: number, on: boolean) => {
    if (sel[i] === on) return
    sel[i] = on
    count += on ? 1 : -1
    total += on ? data[i]!.price : -data[i]!.price
    const tr = rows[i]
    if (tr) tr.className = on ? SEL : ""
  }
  const writeSum = () => { (sum.firstChild as Text).data = summary(view.length, count, total) }
  refilter(); resort(); patch(); writeSum()
  host.append(sum, table)
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q" || a.t === "cat") {
        if (a.t === "q") q = a.q
        else cats[a.c] = a.on
        refilter(); resort(); patch()
      } else if (a.t === "sort") { key = a.key; dir = a.dir; resort(); patch() }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) if (sel[i]) setSel(i, false)
      writeSum()
    },
    destroy: () => { sum.remove(); table.remove() },
  }
}
