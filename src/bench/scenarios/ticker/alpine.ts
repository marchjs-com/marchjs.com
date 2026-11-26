// Live ticker, Alpine.js (CSP build): the quotes are reactive (Alpine.reactive); each row's x-text and x-bind:class
// read their own quote, so a tick that sets a quote's price and class re-runs only those two bindings, in Alpine's
// microtask (before the paint). Markup built with DOM calls (Trusted Types), as it would be written in HTML.
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const rows = Alpine.reactive(data.map((q) => ({ id: q.id, sym: q.sym, price: q.price, cls: "px" })))
  // <table class="bt" x-data="{ rows, fmt }"><tbody><template x-for="r in rows" :key="r.id">
  //   <tr><td class="sym" x-text="r.sym"></td><td :class="r.cls" x-text="fmt(r.price)"></td></tr></template></tbody></table>
  const table = el("table", { class: "bt" }, el("tbody", {}, el("template", { "x-for": "r in rows", "x-bind:key": "r.id" },
    el("tr", {}, el("td", { class: "sym", "x-text": "r.sym" }), el("td", { "x-bind:class": "r.cls", "x-text": "fmt(r.price)" })))))
  start(host, table, { rows, fmt: fmtPrice })
  return {
    step: (p) => { for (const t of p as Tick[]) { const r = rows[t.i]!; r.cls = `px ${dir(t.price, r.price)}`; r.price = t.price } },
    destroy: () => { Alpine.destroyTree(table); table.remove() },
  }
}
