// Start-up, Preact 10: the normal start, render(); a start unmounts the previous page (render(null)) and renders the
// page afresh. The counter is useState in the header component (a click re-renders only the header). Preact attaches
// the onClick listener on the button itself; the update renders in a microtask, before the paint.
import { h, render, Fragment } from "preact"
import { useState } from "preact/hooks"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  function Header({ k }: { k: number }) {
    const [n, setN] = useState(0)
    return h("header", { class: "hd" }, h("h1", null, data.title), h("span", { class: "run" }, k), h("span", { class: "count" }, n),
      h("button", { class: "inc", type: "button", onClick: () => setN((x) => x + 1) }, "+1"))
  }
  function Body({ k }: { k: number }) {
    return h(Fragment, null,
      h("nav", { class: "nv" }, h("ul", null, data.nav.map((l) => h("li", null, h("a", { href: l.href }, l.label))))),
      h("section", { class: "cards" }, data.stats.map((s) => h("div", { class: "card" }, h("div", { class: "lbl" }, s.label), h("div", { class: "val" }, s.value), h("div", { class: "delta" }, s.delta)))),
      h("table", { class: "bt" }, h("thead", null, h("tr", null, HEADS.map((t) => h("th", null, t)))), h("tbody", null,
        rowsFor(data.rows, k).map((r) => h("tr", { key: r.id }, h("td", { class: "id" }, r.id), h("td", null, h("a", { href: `#u${r.id}` }, r.name)), h("td", null, r.email),
          h("td", null, h("span", { class: `badge ${r.status}` }, r.status)), h("td", { class: "amt" }, r.amount), h("td", null, r.date))))),
      h("form", { class: "fm" }, data.fields.map((f) => h("div", { class: "f" }, h("label", null, f.label), h("input", { name: f.name, type: f.type }))), h("button", { type: "button" }, "Kaydet")))
  }
  const App = ({ k }: { k: number }) => h("div", { class: "dash" }, h(Header, { k }), h(Body, { k }))
  render(h(App, { k: 0 }), host)
  return {
    step: (p) => {
      render(null, host)
      render(h(App, { k: p as Run }), host)
      ;(host.querySelector(".inc") as HTMLElement).click()
    },
    destroy: () => render(null, host),
  }
}
