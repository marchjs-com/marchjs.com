// One value deep in a large tree, Preact 10: a component per node; the value lives in the leaf itself (a class
// component holding its own state), so a step calls setState on the target leaf only and Preact re-renders and diffs
// that one component; its ancestors do not render again. Preact renders in a microtask, before the paint.
import { h, render, Component, type VNode } from "preact"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const leaves: (Leaf | null)[] = data.values.map(() => null)
  class Leaf extends Component<{ n: TNode }, { v: number }> {
    constructor(p: { n: TNode }) { super(p); this.state = { v: data.values[p.n.leaf!]! }; leaves[p.n.leaf!] = this }
    override shouldComponentUpdate(_p: unknown, s: { v: number }) { return s.v !== this.state.v }
    render({ n }: { n: TNode }, { v }: { v: number }) { return h("div", { class: "n leaf" }, h("span", { class: "l" }, n.label), h("b", { class: "v" }, v)) }
  }
  class TreeNode extends Component<{ n: TNode }> {
    override shouldComponentUpdate() { return false }
    render({ n }: { n: TNode }): VNode { return h("div", { class: "n" }, h("span", { class: "l" }, n.label), n.kids!.map((c) => (c.kids ? h(TreeNode, { key: c.id, n: c }) : h(Leaf, { key: c.id, n: c })))) }
  }
  render(h("div", { class: "tree" }, data.roots.map((c) => h(TreeNode, { key: c.id, n: c }))), host)
  return {
    step: (p) => leaves[data.target]!.setState({ v: p as number }),
    destroy: () => render(null, host),
  }
}
