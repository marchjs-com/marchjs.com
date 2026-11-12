// Benchmark app: plain DOM (the baseline). One row prototype cloned per row, one delegated click listener.
import type { BenchApp, Row } from "../core.ts"

export function mount(host: HTMLElement): BenchApp {
  const doc = host.ownerDocument
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] => { const e = doc.createElement(tag); if (cls) e.className = cls; return e }
  const table = el("table", "bt"), tbody = el("tbody")
  table.append(tbody)
  host.append(table)
  // <tr><td.c1>id</td><td.c4><a.lbl>label</a></td><td.c1><a.rm>×</a></td><td.c6></td></tr>
  const proto = el("tr")
  const lbl = el("a", "lbl"), rm = el("a", "rm"), c4 = el("td", "c4"), c1b = el("td", "c1")
  lbl.append(doc.createTextNode("")); rm.textContent = "×"
  c4.append(lbl); c1b.append(rm)
  const c1 = el("td", "c1"); c1.append(doc.createTextNode(""))
  proto.append(c1, c4, c1b, el("td", "c6"))

  let data: Row[] = [], trs: HTMLTableRowElement[] = [], sel: HTMLTableRowElement | null = null
  const make = (r: Row): HTMLTableRowElement => {
    const tr = proto.cloneNode(true) as HTMLTableRowElement
    ;(tr.firstChild!.firstChild as Text).data = String(r.id)
    ;(tr.childNodes[1]!.firstChild!.firstChild as Text).data = r.label
    return tr
  }
  tbody.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a"), tr = a?.closest("tr")
    if (!a || !tr) return
    if (a.className === "lbl") { if (sel) sel.className = ""; tr.className = "danger"; sel = tr; return }
    const i = trs.indexOf(tr as HTMLTableRowElement)
    if (i < 0) return
    tr.remove(); trs.splice(i, 1); data.splice(i, 1)
    if (sel === tr) sel = null
  })
  const add = (rows: Row[]) => {
    const frag = doc.createDocumentFragment()
    for (const r of rows) { const tr = make(r); trs.push(tr); data.push(r); frag.append(tr) }
    tbody.append(frag)
  }
  const clear = () => { tbody.textContent = ""; trs = []; data = []; sel = null }
  return {
    run: (rows) => { clear(); add(rows) },
    add,
    update: () => {
      for (let i = 0; i < data.length; i += 10) {
        const r = data[i]!
        data[i] = { id: r.id, label: r.label + " !!!" }
        ;(trs[i]!.childNodes[1]!.firstChild!.firstChild as Text).data = data[i]!.label
      }
    },
    swap: () => {
      if (trs.length <= 998) return
      const a = trs[1]!, b = trs[998]!, after = b.nextSibling
      tbody.insertBefore(b, a); tbody.insertBefore(a, after)
      trs[1] = b; trs[998] = a
      const d = data[1]!; data[1] = data[998]!; data[998] = d
    },
    clear,
    destroy: () => { clear(); table.remove() },
  }
}
