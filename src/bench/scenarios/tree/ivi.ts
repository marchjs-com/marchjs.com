// One value deep in a large tree, ivi: inner nodes are plain template functions (drawn once), each leaf a stateful
// component holding its value; the target leaf registers a setter, and a step sets it and invalidates that one
// component, which ivi updates in a microtask (before the paint). Templates compiled with ivi's template compiler
// (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, invalidate, html, type VAny } from "ivi"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  let set: (v: number) => void = () => {}
  const Leaf = component<TNode>((c) => {
    let v = -1
    return (n) => {
      if (v < 0) { v = data.values[n.leaf!]!; if (n.leaf === data.target) set = (x) => { v = x; invalidate(c) } }
      return html`<div class="n leaf"><span class="l">${n.label}</span><b class="v">${v}</b></div>`
    }
  }, () => true)
  const node = (n: TNode): VAny => (n.kids ? html`<div class="n"><span class="l">${n.label}</span>${n.kids.map(node)}</div>` : Leaf(n))
  const root = createRoot(host)
  update(root, html`<div class="tree">${data.roots.map(node)}</div>`)
  return {
    step: (v) => set(v as number),
    destroy: () => update(root, null),
  }
}
