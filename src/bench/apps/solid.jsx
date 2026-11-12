// Benchmark app: SolidJS. Compiled ahead of time with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js); the
// compiler's HTML-string templates become DOM-built templates there (Trusted Types), cloned the same way.
// Labels are per-row signals; selection uses createSelector (only the two affected rows update).
import { createSignal, createSelector, batch } from "solid-js"
import { render, For } from "solid-js/web"

export function mount(host) {
  const [rows, setRows] = createSignal([])
  const [selected, setSelected] = createSignal(0)
  const isSelected = createSelector(selected)
  const wrap = (list) => list.map((r) => { const [label, setLabel] = createSignal(r.label); return { id: r.id, label, setLabel } })
  const remove = (id) => setRows((d) => d.filter((r) => r.id !== id))
  const dispose = render(() => (
    <table class="bt"><tbody>
      <For each={rows()}>{(row) => (
        <tr class={isSelected(row.id) ? "danger" : ""}>
          <td class="c1">{row.id}</td>
          <td class="c4"><a class="lbl" onClick={() => setSelected(row.id)}>{row.label()}</a></td>
          <td class="c1"><a class="rm" onClick={() => remove(row.id)}>×</a></td>
          <td class="c6"></td>
        </tr>
      )}</For>
    </tbody></table>
  ), host)
  return {
    run: (list) => batch(() => { setRows(wrap(list)); setSelected(0) }),
    add: (list) => setRows((d) => d.concat(wrap(list))),
    update: () => batch(() => { const d = rows(); for (let i = 0; i < d.length; i += 10) d[i].setLabel((l) => l + " !!!") }),
    swap: () => { const d = rows().slice(); if (d.length <= 998) return; const t = d[1]; d[1] = d[998]; d[998] = t; setRows(d) },
    clear: () => batch(() => { setRows([]); setSelected(0) }),
    destroy: dispose,
  }
}
