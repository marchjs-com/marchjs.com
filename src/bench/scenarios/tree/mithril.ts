// One value deep in a large tree, Mithril: one redraw per step (m.redraw.sync), with Mithril's own way to keep it
// small: a node component skips its subtree (onbeforeupdate) unless the changed leaf is under it, so the redraw
// walks only the four nodes on the path and the leaf.
import m from "mithril"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const values = data.values.slice()
  // the nodes on the path to the target leaf: their subtrees are the only ones that can change
  const path = new Set<number>()
  const find = (ns: TNode[]): boolean => ns.some((n) => (n.leaf === data.target || (!!n.kids && find(n.kids))) && (path.add(n.id), true))
  find(data.roots)
  const Node: m.Component<{ n: TNode }> = {
    onbeforeupdate: (v) => path.has(v.attrs.n.id),
    view: ({ attrs: { n } }) => (n.kids
      ? m("div.n", m("span.l", n.label), n.kids.map((c) => m(Node, { key: c.id, n: c })))
      : m("div.n.leaf", m("span.l", n.label), m("b.v", values[n.leaf!]))),
  }
  m.mount(host, { view: () => m("div.tree", data.roots.map((c) => m(Node, { key: c.id, n: c }))) })
  return {
    step: (v) => { values[data.target] = v as number; m.redraw.sync() },
    destroy: () => m.mount(host, null),
  }
}
