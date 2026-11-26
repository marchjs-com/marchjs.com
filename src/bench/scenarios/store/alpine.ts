// Shared store, Alpine.js (CSP build): one Alpine store (Alpine.store, its global state) holds all the cells; each
// cell's x-text reads $store…cells[i], so it depends on that index only, and a step that writes 50 cells re-runs
// just those bindings, in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  Alpine.store("benchStore", { cells: data.cells.slice() })
  const store = Alpine.store("benchStore") as { cells: number[] }
  // <div class="sg"><template x-for="idx in sections"><div class="ss">
  //   <template x-for="i in idx" :key="i"><span class="sc" x-text="$store.benchStore.cells[i]"></span></template></div></template></div>
  const root = el("div", { class: "sg" }, el("template", { "x-for": "idx in sections" },
    el("div", { class: "ss" }, el("template", { "x-for": "i in idx", "x-bind:key": "i" }, el("span", { class: "sc", "x-text": "$store.benchStore.cells[i]" })))))
  start(host, root, { sections: sectionsOf(data.cells.length) })
  return {
    step: (p) => { for (const w of p as Write[]) store.cells[w.i] = w.v },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
