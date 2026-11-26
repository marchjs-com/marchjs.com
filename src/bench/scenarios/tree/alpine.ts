// One value deep in a large tree, Alpine.js (CSP build): Alpine has no recursive templates, so the four levels are
// four nested x-for templates; the leaf values are a reactive array and each leaf's x-text reads only its own entry,
// so a step that sets one entry re-runs one binding (in Alpine's microtask, before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import type { Tree } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  // <div class="tree"><template x-for="a in roots" :key="a.id"><div class="n"><span class="l" x-text="a.label"></span>
  //   <template x-for="b in a.kids" …> … <template x-for="d in c.kids" :key="d.id">
  //     <div class="n leaf"><span class="l" x-text="d.label"></span><b class="v" x-text="values[d.leaf]"></b></div>
  const level = (v: string, of: string, inner: HTMLElement): HTMLElement => el("template", { "x-for": `${v} in ${of}`, "x-bind:key": `${v}.id` }, inner)
  const inner = (v: string, kids: HTMLElement): HTMLElement => el("div", { class: "n" }, el("span", { class: "l", "x-text": `${v}.label` }), kids)
  const leaf = el("div", { class: "n leaf" }, el("span", { class: "l", "x-text": "d.label" }), el("b", { class: "v", "x-text": "values[d.leaf]" }))
  const root = el("div", { class: "tree" }, level("a", "roots", inner("a", level("b", "a.kids", inner("b", level("c", "b.kids", inner("c", level("d", "c.kids", leaf))))))))
  const s = start(host, root, { roots: Alpine.raw(data.roots), values: data.values.slice() })
  return {
    step: (v) => { s.values[data.target] = v as number },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
