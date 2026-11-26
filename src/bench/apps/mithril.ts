// Benchmark app: Mithril 2 (hyperscript, no build step: m() calls are what Mithril code is written in). The app is
// mounted with m.mount; calls from the benchmark redraw at once with m.redraw.sync(), as an event handler would be
// followed by a redraw (Mithril redraws after its own event handlers on the next animation frame, before the paint).
// A row skips its diff while its item and selection stay the same (onbeforeupdate).
import m from "mithril"
import type { BenchApp, Row } from "../core.ts"

interface RowAttrs { item: Row; selected: boolean; select: (id: number) => void; remove: (id: number) => void }
const RowView: m.Component<RowAttrs> = {
  onbeforeupdate: (v, old) => v.attrs.item !== old.attrs.item || v.attrs.selected !== old.attrs.selected,
  view: ({ attrs: { item, selected, select, remove } }) =>
    m("tr", { class: selected ? "danger" : "" },
      m("td.c1", item.id),
      m("td.c4", m("a.lbl", { onclick: () => select(item.id) }, item.label)),
      m("td.c1", m("a.rm", { onclick: () => remove(item.id) }, "×")),
      m("td.c6")),
}

export function mount(host: HTMLElement): BenchApp {
  let rows: Row[] = [], sel = 0
  const select = (id: number) => { sel = id }
  const remove = (id: number) => { rows = rows.filter((r) => r.id !== id) }
  m.mount(host, { view: () => m("table.bt", m("tbody", rows.map((item) => m(RowView, { key: item.id, item, selected: item.id === sel, select, remove })))) })
  const set = (fn: () => void) => { fn(); m.redraw.sync() }
  return {
    run: (r) => set(() => { rows = r; sel = 0 }),
    add: (r) => set(() => { rows = rows.concat(r) }),
    update: () => set(() => { rows = rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })) }),
    swap: () => set(() => { if (rows.length <= 998) return; const d = rows.slice(); const t = d[1]!; d[1] = d[998]!; d[998] = t; rows = d }),
    clear: () => set(() => { rows = []; sel = 0 }),
    destroy: () => m.mount(host, null),
  }
}
