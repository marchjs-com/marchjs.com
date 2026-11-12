// One value deep in a large tree, SolidJS: a recursive TreeNode component per node (components run once); each leaf
// value is a signal bound to its text node, so a step sets one signal and Solid updates only that text.
// Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal } from "solid-js"
import { render } from "solid-js/web"

export function mount(host, data) {
  const cells = data.values.map((v) => createSignal(v))
  function TreeNode(props) {
    const n = props.n
    if (n.kids) return <div class="n"><span class="l">{n.label}</span>{n.kids.map((c) => <TreeNode n={c} />)}</div>
    const [v] = cells[n.leaf]
    return <div class="n leaf"><span class="l">{n.label}</span><b class="v">{v()}</b></div>
  }
  const dispose = render(() => <div class="tree">{data.roots.map((c) => <TreeNode n={c} />)}</div>, host)
  return {
    step: (v) => cells[data.target][1](v),
    destroy: dispose,
  }
}
