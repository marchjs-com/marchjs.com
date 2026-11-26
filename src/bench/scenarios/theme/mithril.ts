// Theme change, Mithril: the accent is app state read by every card; one redraw (m.redraw.sync) diffs the 2.000 cards
// and patches only their badges' class.
import m from "mithril"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  let accent = FIRST
  const CardView: m.Component<{ c: Card }> = {
    view: ({ attrs: { c } }) => m("div.card", m("h3", c.title), m("p", c.text), m("span", { class: badgeClass(accent) }, `#${c.id}`)),
  }
  m.mount(host, { view: () => m("div.cards", data.map((c) => m(CardView, { key: c.id, c }))) })
  return { step: (a) => { accent = a as string; m.redraw.sync() }, destroy: () => m.mount(host, null) }
}
