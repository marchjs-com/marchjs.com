// Benchmark app: Lit 3, the app itself (loaded by lit.ts). A keyed repeat() over the rows; every change renders the
// list again and lit-html updates only the parts whose values changed.
import { render, _$LH, type TemplateResult } from "lit/html.js"
import { repeat } from "lit/directives/repeat.js"
import type { BenchApp, Row } from "../core.ts"

const { H: AttributePart, U: EventPart } = _$LH as unknown as { H: unknown; U: unknown }
/** The row in compiled form:
 *  <tr class=${}><td class="c1">${}</td><td class="c4"><a class="lbl" @click=${}>${}</a></td>
 *  <td class="c1"><a class="rm" @click=${}>×</a></td><td class="c6"></td></tr>
 *  Part indexes count elements and comments in document order: tr 0, td 1, <!----> 2, td 3, a 4, <!----> 5, td 6, a 7, td 8. */
function rowTemplate() {
  const el = document.createElement("template")
  const e = (tag: string, cls?: string, ...kids: Node[]) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids); return n }
  const mark = () => document.createComment("")
  el.content.append(e("tr", undefined, e("td", "c1", mark()), e("td", "c4", e("a", "lbl", mark())), e("td", "c1", e("a", "rm", document.createTextNode("×"))), e("td", "c6")))
  const one = ["", ""]
  return {
    h: Object.assign([""], { raw: [""] }), el,
    parts: [
      { type: 1, index: 0, name: "class", strings: one, ctor: AttributePart },
      { type: 2, index: 2 },
      { type: 1, index: 4, name: "click", strings: one, ctor: EventPart },
      { type: 2, index: 5 },
      { type: 1, index: 7, name: "click", strings: one, ctor: EventPart },
    ],
  }
}

export function mount(host: HTMLElement): BenchApp {
  const ROW = rowTemplate()
  const table = document.createElement("table"), tbody = document.createElement("tbody")
  table.className = "bt"; table.append(tbody); host.append(table)
  let rows: Row[] = [], sel = 0
  const row = (r: Row) => ({ ["_$litType$"]: ROW, values: [sel === r.id ? "danger" : "", r.id, () => { sel = r.id; draw() }, r.label, () => { rows = rows.filter((x) => x.id !== r.id); draw() }] }) as unknown as TemplateResult
  const draw = () => render(repeat(rows, (r) => r.id, row), tbody)
  draw()
  return {
    run: (r) => { rows = r; sel = 0; draw() },
    add: (r) => { rows = rows.concat(r); draw() },
    update: () => { rows = rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })); draw() },
    swap: () => { if (rows.length <= 998) return; const d = rows.slice(); const t = d[1]!; d[1] = d[998]!; d[998] = t; rows = d; draw() },
    clear: () => { rows = []; sel = 0; draw() },
    destroy: () => { render(null, tbody); table.remove() },
  }
}

// the realistic scenarios' Lit apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/lit.ts"
