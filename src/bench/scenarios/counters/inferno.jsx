// Independent counters, Inferno: each Counter is a class component holding its own count and registering its
// increment; a step increments the fired counters, each calling its own forceUpdate() (synchronous in Inferno), so
// the grid itself does not render again. Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render, Component } from "inferno"

export function mount(host, data) {
  const inc = []
  class Counter extends Component {
    constructor(props) { super(props); this.n = 0; inc[props.i] = () => { this.n++; this.forceUpdate() } }
    render() { return <span className="ct">{this.n}</span> }
  }
  render(<div className="cg" $HasKeyedChildren>{data.map((c, i) => <Counter key={c.id} i={i} />)}</div>, host)
  return {
    step: (fired) => { for (const i of fired) inc[i]() },
    destroy: () => render(null, host),
  }
}
