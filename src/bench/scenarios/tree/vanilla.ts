// One value deep in a large tree, plain DOM (hand-optimized): the tree is built once, recursively, from two cloned
// prototypes (inner node, leaf); the target leaf's text node is kept, and a step writes only that text.
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const doc = host.ownerDocument
  const box = doc.createElement("div")
  box.className = "tree"
  const inner = doc.createElement("div"), leaf = doc.createElement("div")
  inner.className = "n"; leaf.className = "n leaf"
  const l = doc.createElement("span"), v = doc.createElement("b")
  l.className = "l"; v.className = "v"
  l.append(""); v.append("")
  inner.append(l.cloneNode(true)); leaf.append(l, v)
  let target: Text | null = null
  const build = (parent: HTMLElement, nodes: TNode[]): void => {
    for (const n of nodes) {
      const el = (n.kids ? inner : leaf).cloneNode(true) as HTMLElement
      ;(el.firstChild!.firstChild as Text).data = n.label
      if (n.kids) build(el, n.kids)
      else {
        const t = el.lastChild!.firstChild as Text
        t.data = String(data.values[n.leaf!])
        if (n.leaf === data.target) target = t
      }
      parent.append(el)
    }
  }
  build(box, data.roots)
  host.append(box)
  return {
    step: (p) => { target!.data = String(p as number) },
    destroy: () => box.remove(),
  }
}
