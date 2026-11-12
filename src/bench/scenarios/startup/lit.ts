// Start-up, Lit 3: the normal start, render() of the page template into a fresh container; a start removes the
// previous container and renders the page afresh (lit-html clones the template, then sets each part's value once).
// The counter is kept beside the page and a click re-renders the page, the usual lit-html pattern: lit-html walks
// the values and writes only the changed counter text. The click goes to the listener lit-html set on the button.
// Templates in compiled form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, attr, on, child } from "../lit-tpl.ts"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const page = template(el("div", { class: "dash" },
    el("header", { class: "hd" }, el("h1", {}, child()), el("span", { class: "run" }, child()), el("span", { class: "count" }, child()), el("button", { class: "inc", type: "button", "@click": on("click") }, "+1")),
    el("nav", { class: "nv" }, el("ul", {}, child())),
    el("section", { class: "cards" }, child()),
    el("table", { class: "bt" }, el("thead", {}, el("tr", {}, child())), el("tbody", {}, child())),
    el("form", { class: "fm" }, child(), el("button", { type: "button" }, "Kaydet"))))
  const li = template(el("li", {}, el("a", { href: attr("href") }, child())))
  const card = template(el("div", { class: "card" }, el("div", { class: "lbl" }, child()), el("div", { class: "val" }, child()), el("div", { class: "delta" }, child())))
  const th = template(el("th", {}, child()))
  const row = template(el("tr", {}, el("td", { class: "id" }, child()), el("td", {}, el("a", { href: attr("href") }, child())), el("td", {}, child()),
    el("td", {}, el("span", { class: attr("class") }, child())), el("td", { class: "amt" }, child()), el("td", {}, child())))
  const field = template(el("div", { class: "f" }, el("label", {}, child()), el("input", { name: attr("name"), type: attr("type") })))

  let box: HTMLElement | null = null
  const start = (k: number) => {
    if (box) { render(null, box); box.remove() }
    const c = (box = document.createElement("div")), rows = rowsFor(data.rows, k)
    let n = 0
    const draw = () => render(page(data.title, k, n, onInc,
      data.nav.map((l) => li(l.href, l.label)),
      data.stats.map((s) => card(s.label, s.value, s.delta)),
      HEADS.map((t) => th(t)),
      rows.map((r) => row(r.id, `#u${r.id}`, r.name, r.email, `badge ${r.status}`, r.status, r.amount, r.date)),
      data.fields.map((f) => field(f.label, f.name, f.type))), c)
    const onInc = () => { n++; draw() }
    draw()
    host.append(c)
  }
  start(0)
  return {
    step: (p) => { start(p as Run); (host.querySelector(".inc") as HTMLElement).click() },
    destroy: () => { if (box) { render(null, box); box.remove(); box = null } },
  }
}
