// Moving highlight, Alpine.js (CSP build): the hovered index is reactive and each row's class reads it. Alpine has no
// selector primitive, so a step re-runs every row's class binding (10.000 comparisons, in Alpine's microtask before
// the paint) and writes only the two that changed.
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  // <table class="bt"><tbody><template x-for="(it, i) in items" :key="it.id">
  //   <tr :class="hovered === i ? 'hover' : ''"><td class="id" x-text="it.id"></td><td class="lbl" x-text="it.label"></td></tr></template></tbody></table>
  const root = el("table", { class: "bt" }, el("tbody", {}, el("template", { "x-for": "(it, i) in items", "x-bind:key": "it.id" },
    el("tr", { "x-bind:class": `hovered === i ? '${HOVER}' : ''` }, el("td", { class: "id", "x-text": "it.id" }), el("td", { class: "lbl", "x-text": "it.label" })))))
  const s = start(host, root, { items: data, hovered: -1 })
  return { step: (i) => { s.hovered = i as number }, destroy: () => { Alpine.destroyTree(root); root.remove() } }
}
