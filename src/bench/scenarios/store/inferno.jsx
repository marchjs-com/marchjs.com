// Shared store, Inferno: one small store object holds all the cells, with one listener per cell; each Cell is a class
// component subscribed to its own index. A step writes the 50 cells and notifies only those, whose forceUpdate() is
// synchronous in Inferno; sections and the grid do not render again. Compiled with babel-plugin-inferno
// (tools/gen-bench.mjs → inferno.gen.js).
import { render, Component } from "inferno"
import { sectionsOf } from "./def.ts"

export function mount(host, data) {
  const store = { cells: data.cells.slice(), subs: data.cells.map(() => null) }
  class Cell extends Component {
    componentDidMount() { store.subs[this.props.i] = () => this.forceUpdate() }
    componentWillUnmount() { store.subs[this.props.i] = null }
    render() { return <span className="sc">{store.cells[this.props.i]}</span> }
  }
  const no = () => false
  function Section({ idx }) { return <div className="ss">{idx.map((i) => <Cell i={i} />)}</div> }
  render(<div className="sg">{sectionsOf(data.cells.length).map((idx) => <Section idx={idx} onComponentShouldUpdate={no} />)}</div>, host)
  return {
    step: (writes) => { for (const w of writes) { store.cells[w.i] = w.v; store.subs[w.i]?.() } },
    destroy: () => render(null, host),
  }
}
