// Data list, Lit 3: the usual Lit pattern, the state kept in plain variables and a render() of the whole list per
// step through the repeat() directive keyed by id (rows reused and moved by key); the filtered list and the sorted
// view are recomputed only when their inputs change. lit-html walks every visible row's values on each render and
// touches the DOM only where a value changed. Templates in compiled form (../lit-tpl.ts), as the CSP refuses HTML
// strings.
import { render } from "lit/html.js"
import { repeat } from "lit/directives/repeat.js"
import { template, el, attr, child } from "../lit-tpl.ts"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  const row = template(el("tr", { class: attr("class") },
    el("td", { class: "id" }, child()), el("td", { class: "nm" }, child()), el("td", { class: "cat" }, child()),
    el("td", { class: "px" }, child()), el("td", { class: "st" }, child())))
  const page = template(el("div", {}, el("p", { class: "gsum" }, child()), el("table", { class: "bt" }, el("tbody", {}, child()))))
  let q = "", key: Key = "id", dir: 1 | -1 = 1, count = 0, total = 0
  const cats = CATS.map(() => true), sel = new Array<boolean>(data.length).fill(false)
  let filtered: Rec[] = [], view: Rec[] = []
  const refilter = () => { filtered = data.filter((r) => matches(r, q, cats)) }
  const resort = () => { view = filtered.slice().sort(compare(key, dir)) }
  const setSel = (i: number, on: boolean) => {
    if (sel[i] === on) return
    sel[i] = on
    count += on ? 1 : -1
    total += on ? data[i]!.price : -data[i]!.price
  }
  const box = document.createElement("div")
  host.append(box)
  const draw = () => render(page(summary(view.length, count, total),
    repeat(view, (r) => r.id, (r) => row(sel[r.i] ? SEL : "", r.id, r.name, CATS[r.cat], fmtPrice(r.price), r.stock))), box)
  refilter(); resort(); draw()
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q" || a.t === "cat") {
        if (a.t === "q") q = a.q
        else cats[a.c] = a.on
        refilter(); resort()
      } else if (a.t === "sort") { key = a.key; dir = a.dir; resort() }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
      draw()
    },
    destroy: () => { render(null, box); box.remove() },
  }
}
