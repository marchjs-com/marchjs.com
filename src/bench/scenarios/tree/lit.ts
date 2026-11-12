// One value deep in a large tree, Lit 3: the usual Lit pattern, a render() of the whole tree per step from its data
// (one template per node, recursively); lit-html walks every node's values and touches the DOM only where a value
// changed (no virtual DOM, but a value check per node). Templates in compiled form (../lit-tpl.ts), as the CSP
// refuses HTML strings.
import { render, type TemplateResult } from "lit/html.js"
import { template, el, child } from "../lit-tpl.ts"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const inner = template(el("div", { class: "n" }, el("span", { class: "l" }, child()), child()))
  const leaf = template(el("div", { class: "n leaf" }, el("span", { class: "l" }, child()), el("b", { class: "v" }, child())))
  const values = data.values.slice()
  const box = document.createElement("div")
  box.className = "tree"; host.append(box)
  const node = (n: TNode): TemplateResult => (n.kids ? inner(n.label, n.kids.map(node)) : leaf(n.label, values[n.leaf!]))
  const draw = () => render(data.roots.map(node), box)
  draw()
  return {
    step: (p) => { values[data.target] = p as number; draw() },
    destroy: () => { render(null, box); box.remove() },
  }
}
