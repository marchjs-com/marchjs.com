// Benchmark app: HADI March, written the way the library recommends: a keyed <For> over a signal holding the rows,
// a selector() for the selected row (choosing one row wakes two rows, not all), and plain onClick handlers.
import { render, For, selector } from "hadi-march"
import type { BenchApp, Row } from "../core.ts"

export function mount(host: HTMLElement): BenchApp {
  let $rows: Row[] = []
  let $sel = 0
  const isSelected = selector(() => $sel)
  const remove = (id: number) => { $rows = $rows.filter((r) => r.id !== id) }
  const dispose = render(() => <table class="bt"><tbody>
    <For each={$rows} key="id">{(row) => <tr class={isSelected(row().id) ? "danger" : ""}>
      <td class="c1">{row().id}</td>
      <td class="c4"><a class="lbl" onClick={() => { $sel = row().id }}>{row().label}</a></td>
      <td class="c1"><a class="rm" onClick={() => remove(row().id)}>×</a></td>
      <td class="c6" />
    </tr>}</For>
  </tbody></table>, host)
  return {
    run: (rows) => { $rows = rows },
    add: (rows) => { $rows = $rows.concat(rows) },
    update: () => { $rows = $rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })) },
    swap: () => {
      const x = $rows.slice()
      if (x.length <= 998) return
      const t = x[1]!; x[1] = x[998]!; x[998] = t
      $rows = x
    },
    clear: () => { $rows = [] },
    destroy: dispose,
  }
}
