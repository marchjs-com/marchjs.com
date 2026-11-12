// Start-up, React 19: the normal start, createRoot + render in flushSync; a start unmounts the previous root and
// creates a new one. The counter is useState in the header component (a click re-renders only the header, the rest
// is a memo component). The click goes through React's own event delegation on the root; React flushes the discrete
// event's update before the paint.
import { createElement as h, Fragment, memo, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot, type Root } from "react-dom/client"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  function Header({ k }: { k: number }) {
    const [n, setN] = useState(0)
    return h("header", { className: "hd" }, h("h1", null, data.title), h("span", { className: "run" }, k), h("span", { className: "count" }, n),
      h("button", { className: "inc", type: "button", onClick: () => setN((x) => x + 1) }, "+1"))
  }
  const Body = memo(function Body({ k }: { k: number }) {
    return h(Fragment, null,
      h("nav", { className: "nv" }, h("ul", null, data.nav.map((l, i) => h("li", { key: i }, h("a", { href: l.href }, l.label))))),
      h("section", { className: "cards" }, data.stats.map((s, i) => h("div", { key: i, className: "card" }, h("div", { className: "lbl" }, s.label), h("div", { className: "val" }, s.value), h("div", { className: "delta" }, s.delta)))),
      h("table", { className: "bt" }, h("thead", null, h("tr", null, HEADS.map((t) => h("th", { key: t }, t)))), h("tbody", null,
        rowsFor(data.rows, k).map((r) => h("tr", { key: r.id }, h("td", { className: "id" }, r.id), h("td", null, h("a", { href: `#u${r.id}` }, r.name)), h("td", null, r.email),
          h("td", null, h("span", { className: `badge ${r.status}` }, r.status)), h("td", { className: "amt" }, r.amount), h("td", null, r.date))))),
      h("form", { className: "fm" }, data.fields.map((f) => h("div", { key: f.name, className: "f" }, h("label", null, f.label), h("input", { name: f.name, type: f.type }))), h("button", { type: "button" }, "Kaydet")))
  })
  const App = ({ k }: { k: number }) => h("div", { className: "dash" }, h(Header, { k }), h(Body, { k }))
  let root: Root
  const start = (k: number) => { root = createRoot(host); flushSync(() => root.render(h(App, { k }))) }
  start(0)
  return {
    step: (p) => {
      root.unmount()
      start(p as Run)
      ;(host.querySelector(".inc") as HTMLElement).click()
    },
    destroy: () => root.unmount(),
  }
}
