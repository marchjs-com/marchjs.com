// Independent counters, Alpine.js (CSP build): each counter is its own reactive object and its x-text reads only its
// count, so a step re-runs just the fired counters' bindings, in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  // <div class="cg"><template x-for="c in counters" :key="c.id"><span class="ct" x-text="c.n"></span></template></div>
  const root = el("div", { class: "cg" }, el("template", { "x-for": "c in counters", "x-bind:key": "c.id" }, el("span", { class: "ct", "x-text": "c.n" })))
  const s = start(host, root, { counters: data.map((c) => ({ id: c.id, n: 0 })) })
  return {
    step: (p) => { for (const i of p as Fired) s.counters[i]!.n++ },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
