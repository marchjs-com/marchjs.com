// One value deep in a large tree, Inferno: functional components per node (rendered once, then skipped: their node
// never changes), and each leaf a class component holding its value; the target leaf registers itself and a step
// calls its forceUpdate() (synchronous in Inferno), so only that leaf renders again.
// Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render, Component } from "inferno"

export function mount(host, data) {
  let target = null
  class Leaf extends Component {
    constructor(props) { super(props); this.v = data.values[props.n.leaf]; if (props.n.leaf === data.target) target = this }
    set(v) { this.v = v; this.forceUpdate() }
    render() { const n = this.props.n; return <div className="n leaf"><span className="l">{n.label}</span><b className="v">{this.v}</b></div> }
  }
  function TreeNode({ n }) {
    return <div className="n"><span className="l">{n.label}</span>{n.kids.map((c) => (c.kids ? <TreeNode key={c.id} n={c} onComponentShouldUpdate={no} /> : <Leaf key={c.id} n={c} />))}</div>
  }
  const no = () => false
  render(<div className="tree">{data.roots.map((c) => <TreeNode key={c.id} n={c} onComponentShouldUpdate={no} />)}</div>, host)
  return {
    step: (v) => target.set(v),
    destroy: () => render(null, host),
  }
}
