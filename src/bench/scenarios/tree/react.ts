// One value deep in a large tree, React 19, with the pattern React recommends when one deep value changes often:
// memo components per node, and the leaf values kept outside the tree in a small external store, read with
// useSyncExternalStore by each leaf (one subscription per leaf). A step notifies only the target leaf, so React
// re-renders that one component and reconciles its two elements; its ancestors do not render again. flushSync.
import { createElement as h, memo, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const values = data.values.slice()
  const subs: ((() => void) | null)[] = values.map(() => null)
  const Leaf = memo(function Leaf({ n }: { n: TNode }) {
    const i = n.leaf!
    const v = useSyncExternalStore((cb) => { subs[i] = cb; return () => { subs[i] = null } }, () => values[i]!)
    return h("div", { className: "n leaf" }, h("span", { className: "l" }, n.label), h("b", { className: "v" }, v))
  })
  const TreeNode = memo(function TreeNode({ n }: { n: TNode }): ReturnType<typeof h> {
    return h("div", { className: "n" }, h("span", { className: "l" }, n.label), n.kids!.map((c) => h(c.kids ? TreeNode : Leaf, { key: c.id, n: c })))
  })
  const App = () => h("div", { className: "tree" }, data.roots.map((c) => h(TreeNode, { key: c.id, n: c })))
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => { values[data.target] = p as number; subs[data.target]?.() }),
    destroy: () => root.unmount(),
  }
}
