// Moving highlight, Mithril: the hovered index is app state; one redraw (m.redraw.sync) per step, and each row
// component skips its diff unless its boolean changed (onbeforeupdate), so only two rows are patched.
import m from "mithril"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const RowView: m.Component<{ it: Item; hovered: boolean }> = {
  onbeforeupdate: (v, old) => v.attrs.hovered !== old.attrs.hovered || v.attrs.it !== old.attrs.it,
  view: ({ attrs: { it, hovered } }) => m("tr", { class: hovered ? HOVER : "" }, m("td.id", it.id), m("td.lbl", it.label)),
}
export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  let hovered = -1
  m.mount(host, { view: () => m("table.bt", m("tbody", data.map((it, i) => m(RowView, { key: it.id, it, hovered: i === hovered })))) })
  return { step: (i) => { hovered = i as number; m.redraw.sync() }, destroy: () => m.mount(host, null) }
}
