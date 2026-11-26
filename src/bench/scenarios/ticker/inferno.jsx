// Live ticker, Inferno: each row is a class component holding its own quote and registering itself; a tick replaces
// the changed rows' quotes and calls their forceUpdate() (synchronous in Inferno), so only those rows render again.
// Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render, Component } from "inferno"
import { fmtPrice, dir } from "./def.ts"

export function mount(host, data) {
  const rows = []
  class Row extends Component {
    constructor(props) { super(props); this.q = { price: props.q.price, cls: "px" }; rows[props.i] = this }
    set(price) { this.q = { price, cls: `px ${dir(price, this.q.price)}` }; this.forceUpdate() }
    render() { return <tr><td className="sym">{this.props.q.sym}</td><td className={this.q.cls}>{fmtPrice(this.q.price)}</td></tr> }
  }
  render(<table className="bt"><tbody $HasKeyedChildren>{data.map((q, i) => <Row key={q.id} q={q} i={i} />)}</tbody></table>, host)
  return {
    step: (ticks) => { for (const t of ticks) rows[t.i].set(t.price) },
    destroy: () => render(null, host),
  }
}
