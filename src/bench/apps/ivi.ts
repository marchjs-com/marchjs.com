// Benchmark app: ivi 5. The html`` templates are compiled ahead of time with ivi's own template compiler
// (@ivi/compiler, as its Rollup / Vite plugins run it; tools/gen-bench.mjs → ivi.gen.js). The compiler's HTML-string
// templates become DOM-built ones there (Trusted Types): ivi's own template factory clones a given node the same way.
// A keyed List() of row components; a row skips its update while its item and selection stay the same.
import { createRoot, update, component, List, html } from "ivi"
import type { BenchApp, Row } from "../core.ts"

interface RowProps { item: Row; selected: boolean; select: (id: number) => void; remove: (id: number) => void }
const RowView = component<RowProps>(() => ({ item, selected, select, remove }) => html`
  <tr class=${selected ? "danger" : ""}>
    <td class="c1">${item.id}</td>
    <td class="c4"><a class="lbl" @click=${() => select(item.id)}>${item.label}</a></td>
    <td class="c1"><a class="rm" @click=${() => remove(item.id)}>×</a></td>
    <td class="c6"></td>
  </tr>`, (a, b) => a.item === b.item && a.selected === b.selected)

export function mount(host: HTMLElement): BenchApp {
  const root = createRoot(host)
  let rows: Row[] = [], sel = 0
  const select = (id: number) => { sel = id; draw() }
  const remove = (id: number) => { rows = rows.filter((r) => r.id !== id); draw() }
  const key = (r: Row) => r.id
  const draw = () => update(root, html`<table class="bt"><tbody>${List(rows, key, (item) => RowView({ item, selected: item.id === sel, select, remove }))}</tbody></table>`)
  draw()
  return {
    run: (r) => { rows = r; sel = 0; draw() },
    add: (r) => { rows = rows.concat(r); draw() },
    update: () => { rows = rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })); draw() },
    swap: () => { if (rows.length <= 998) return; const d = rows.slice(); const t = d[1]!; d[1] = d[998]!; d[998] = t; rows = d; draw() },
    clear: () => { rows = []; sel = 0; draw() },
    destroy: () => { update(root, null) },
  }
}
