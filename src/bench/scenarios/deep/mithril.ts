// State at the top, Mithril: the unit and the focus are app state passed down through Panel > Group > Item
// components. One redraw (m.redraw.sync) per step; each level skips its diff unless the unit changed or the old or new
// focus is inside it (onbeforeupdate, with def.ts panelOf / groupOf), so a focus step diffs two items and their
// ancestors, a unit step the 200 measured items.
import m from "mithril"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf, type Deep, type Step, type Item, type Group, type Panel } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const ItemView: m.Component<{ it: Item; unit: string; on: boolean }> = {
  onbeforeupdate: (v, o) => v.attrs.on !== o.attrs.on || (v.attrs.unit !== o.attrs.unit && v.attrs.it.v !== null),
  view: ({ attrs: { it, unit, on } }) => m("div", { class: itemClass(on) }, m("span.k", it.label), m("b.v", itemText(it, unit))),
}
const GroupView: m.Component<{ g: Group; unit: string; focus: number }> = {
  onbeforeupdate: (v, o) => v.attrs.unit !== o.attrs.unit || (v.attrs.focus !== o.attrs.focus && (groupOf(v.attrs.focus) === v.attrs.g.id - 1 || groupOf(o.attrs.focus) === v.attrs.g.id - 1)),
  view: ({ attrs: { g, unit, focus } }) => m("div.grp", m("h4", g.title), g.items.map((it) => m(ItemView, { key: it.id, it, unit, on: it.id === focus }))),
}
const PanelView: m.Component<{ p: Panel; pi: number; unit: string; focus: number }> = {
  onbeforeupdate: (v, o) => v.attrs.unit !== o.attrs.unit || (v.attrs.focus !== o.attrs.focus && (panelOf(v.attrs.focus) === v.attrs.pi || panelOf(o.attrs.focus) === v.attrs.pi)),
  view: ({ attrs: { p, unit, focus } }) => m("section.pnl", m("h3", p.title), m("p.note", p.note), m("div.grps", p.groups.map((g) => m(GroupView, { key: g.id, g, unit, focus })))),
}
export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  let unit = FIRST_UNIT, focus = NO_FOCUS
  m.mount(host, { view: () => m("div.deep", data.panels.map((p, pi) => m(PanelView, { key: p.id, p, pi, unit, focus }))) })
  return {
    step: (s) => { const x = s as Step; if ("unit" in x) unit = x.unit; else focus = x.focus; m.redraw.sync() },
    destroy: () => m.mount(host, null),
  }
}
