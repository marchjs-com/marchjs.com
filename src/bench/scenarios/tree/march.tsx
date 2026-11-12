// One value deep in a large tree, HADI March: a recursive TreeNode component per node (components run once); each
// leaf's value is a signal, bound to its text node. A step sets the target leaf's signal and only that text updates:
// no component runs again and nothing is compared.
import { render, signal } from "hadi-march"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const cells = data.values.map((v) => signal(v))
  function TreeNode(props: { n: TNode }) {
    const n = props.n
    if (n.kids) return <div class="n"><span class="l">{n.label}</span>{n.kids.map((c) => <TreeNode n={c} />)}</div>
    const cell = cells[n.leaf!]!
    return <div class="n leaf"><span class="l">{n.label}</span><b class="v">{cell()}</b></div>
  }
  const dispose = render(() => <div class="tree">{data.roots.map((c) => <TreeNode n={c} />)}</div>, host)
  return {
    step: (p) => cells[data.target]!.set(p as number),
    destroy: dispose,
  }
}
