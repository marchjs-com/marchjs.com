// Derived values, Alpine.js (CSP build): the fields are reactive; each computed cell's x-text and class call a method
// that reads only its own fields, so Alpine's reactivity (Vue's, inside Alpine) re-runs just the bindings of the edited
// field's dependents, in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  // <div class="dv"><div class="dv-fs"><template x-for="(v, i) in f" :key="i"><span class="dv-f" x-text="v"></span></template></div>
  //   <div class="dv-cs"><template x-for="(c, k) in comps" :key="k"><span :class="cls(k)" x-text="val(k)"></span></template></div></div>
  const root = el("div", { class: "dv" },
    el("div", { class: "dv-fs" }, el("template", { "x-for": "(v, i) in f", "x-bind:key": "i" }, el("span", { class: "dv-f", "x-text": "v" }))),
    el("div", { class: "dv-cs" }, el("template", { "x-for": "(c, k) in comps", "x-bind:key": "k" }, el("span", { "x-bind:class": "cls(k)", "x-text": "val(k)" }))))
  const s = start(host, root, {
    f: data.fields.slice(), comps: data.comps,
    val(k: number): number { return evalComp(data.comps[k]!, (i) => this.f[i]!) },
    cls(k: number): string { return compClass(data.comps[k]!, this.val(k)) },
  })
  return {
    step: (p) => { const e = p as Edit; s.f[e.i] = e.v },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
