// Start-up, Mithril: the normal start, m.mount(); a start unmounts the previous page and mounts page k (m.mount
// renders at once). The counter is the page component's state and the "+1" button an onclick handler; Mithril
// redraws after its handlers on the next animation frame, so the click is followed by m.redraw.sync() to draw it in
// the same frame, as the other libraries do.
import m from "mithril"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const page = (k: number): m.Component => {
    let n = 0
    return {
      view: () => m("div.dash",
        m("header.hd", m("h1", data.title), m("span.run", k), m("span.count", n), m("button.inc", { type: "button", onclick: () => { n++ } }, "+1")),
        m("nav.nv", m("ul", data.nav.map((l) => m("li", m("a", { href: l.href }, l.label))))),
        m("section.cards", data.stats.map((s) => m("div.card", m("div.lbl", s.label), m("div.val", s.value), m("div.delta", s.delta)))),
        m("table.bt", m("thead", m("tr", HEADS.map((t) => m("th", t)))),
          m("tbody", rowsFor(data.rows, k).map((r) => m("tr", { key: r.id }, m("td.id", r.id), m("td", m("a", { href: `#u${r.id}` }, r.name)), m("td", r.email), m("td", m("span", { class: `badge ${r.status}` }, r.status)), m("td.amt", r.amount), m("td", r.date))))),
        m("form.fm", data.fields.map((f) => m("div.f", m("label", f.label), m("input", { name: f.name, type: f.type }))), m("button", { type: "button" }, "Kaydet"))),
    }
  }
  m.mount(host, page(0))
  return {
    step: (k) => {
      m.mount(host, null)
      m.mount(host, page(k as Run))
      ;(host.querySelector(".inc") as HTMLButtonElement).click()
      m.redraw.sync()
    },
    destroy: () => m.mount(host, null),
  }
}
