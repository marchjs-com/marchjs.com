// Start-up, Alpine.js (CSP build): Alpine starts on markup that is already in the page, so a start tears down the
// previous page, puts a fresh copy of the page's markup in (cloned, as a parsed HTML page would be) and lets Alpine
// initialise it: x-for draws the lists, x-text and x-bind fill the values. The counter is in x-data and the "+1"
// button an x-on:click; the click's update runs in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const each = (expr: string, ...kids: HTMLElement[]) => el("template", { "x-for": expr }, ...kids)
  const markup = el("div", { class: "dash" },
    el("header", { class: "hd" }, el("h1", { "x-text": "data.title" }), el("span", { class: "run", "x-text": "k" }), el("span", { class: "count", "x-text": "n" }),
      el("button", { class: "inc", type: "button", "x-on:click": "inc()" }, "+1")),
    el("nav", { class: "nv" }, el("ul", {}, each("l in data.nav", el("li", {}, el("a", { "x-bind:href": "l.href", "x-text": "l.label" }))))),
    el("section", { class: "cards" }, each("s in data.stats", el("div", { class: "card" }, el("div", { class: "lbl", "x-text": "s.label" }), el("div", { class: "val", "x-text": "s.value" }), el("div", { class: "delta", "x-text": "s.delta" })))),
    el("table", { class: "bt" }, el("thead", {}, el("tr", {}, each("t in heads", el("th", { "x-text": "t" })))), el("tbody", {}, el("template", { "x-for": "r in rows", "x-bind:key": "r.id" },
      el("tr", {}, el("td", { class: "id", "x-text": "r.id" }), el("td", {}, el("a", { "x-bind:href": "'#u' + r.id", "x-text": "r.name" })), el("td", { "x-text": "r.email" }),
        el("td", {}, el("span", { "x-bind:class": "'badge ' + r.status", "x-text": "r.status" })), el("td", { class: "amt", "x-text": "r.amount" }), el("td", { "x-text": "r.date" }))))),
    el("form", { class: "fm" }, each("f in data.fields", el("div", { class: "f" }, el("label", { "x-text": "f.label" }), el("input", { "x-bind:name": "f.name", "x-bind:type": "f.type" }))), el("button", { type: "button" }, "Kaydet")))
  let page: HTMLElement | null = null
  const run = (k: number) => {
    if (page) { Alpine.destroyTree(page); page.remove() }
    page = markup.cloneNode(true) as HTMLElement
    start(host, page, { data, heads: HEADS, k, rows: rowsFor(data.rows, k), n: 0, inc() { this.n++ } })
  }
  run(0)
  return {
    step: (k) => { run(k as Run); (page!.querySelector(".inc") as HTMLButtonElement).click() },
    destroy: () => { if (page) { Alpine.destroyTree(page); page.remove() } },
  }
}
