// State at the top, Alpine.js (CSP build): the unit and the focus are reactive at the top; the panel > group > item
// levels are nested x-for templates that read them. Only the measured items read the unit (one per group); every
// item's class reads the focus (Alpine has no selector primitive), so a focus step re-runs every item's class binding
// and writes only the two that changed. Updates run in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, type Deep, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface State { unit: string; focus: number }
export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  // <div class="deep"><template x-for="p in panels" :key="p.id"><section class="pnl"><h3 x-text="p.title"></h3><p class="note" x-text="p.note"></p>
  //   <div class="grps"><template x-for="g in p.groups" :key="g.id"><div class="grp"><h4 x-text="g.title"></h4>
  //     <template x-for="it in g.items" :key="it.id"><div :class="cls(it.id === focus)"><span class="k" x-text="it.label"></span>
  //       <b class="v" x-text="text(it, it.v === null ? '' : unit)"></b></div></template></div></template></div></section></template></div>
  const item = el("div", { "x-bind:class": "cls(it.id === focus)" }, el("span", { class: "k", "x-text": "it.label" }), el("b", { class: "v", "x-text": "text(it, it.v === null ? '' : unit)" }))
  const group = el("div", { class: "grp" }, el("h4", { "x-text": "g.title" }), el("template", { "x-for": "it in g.items", "x-bind:key": "it.id" }, item))
  const panel = el("section", { class: "pnl" }, el("h3", { "x-text": "p.title" }), el("p", { class: "note", "x-text": "p.note" }),
    el("div", { class: "grps" }, el("template", { "x-for": "g in p.groups", "x-bind:key": "g.id" }, group)))
  const root = el("div", { class: "deep" }, el("template", { "x-for": "p in panels", "x-bind:key": "p.id" }, panel))
  const s = start<State>(host, root, { panels: data.panels, unit: FIRST_UNIT, focus: NO_FOCUS, cls: itemClass, text: itemText } as State)
  return {
    step: (x) => { const st = x as Step; if ("unit" in st) s.unit = st.unit; else s.focus = st.focus },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
