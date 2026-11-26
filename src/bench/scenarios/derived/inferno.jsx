// Derived values, Inferno: Inferno has no derived state, so the app keeps a dependency index (field → computed cells
// that read it, def.ts dependents()). Every field and computed cell is a small class component that registers
// itself; an edit sets the field, recomputes only its dependents and calls forceUpdate() (synchronous in Inferno) on
// the field and on each computed cell whose value changed. Compiled with babel-plugin-inferno (tools/gen-bench.mjs →
// inferno.gen.js).
import { render, Component } from "inferno"
import { evalComp, compClass, dependents } from "./def.ts"

export function mount(host, data) {
  const f = data.fields.slice(), deps = dependents(data), get = (i) => f[i]
  const fieldViews = [], compViews = []
  class Field extends Component {
    constructor(props) { super(props); fieldViews[props.i] = this }
    render() { return <span className="dv-f">{f[this.props.i]}</span> }
  }
  class Comp extends Component {
    constructor(props) { super(props); this.v = evalComp(props.c, get); compViews[props.k] = this }
    refresh() { const v = evalComp(this.props.c, get); if (v !== this.v) { this.v = v; this.forceUpdate() } }
    render() { return <span className={compClass(this.props.c, this.v)}>{this.v}</span> }
  }
  render(
    <div className="dv">
      <div className="dv-fs">{f.map((_, i) => <Field i={i} />)}</div>
      <div className="dv-cs">{data.comps.map((c, k) => <Comp c={c} k={k} />)}</div>
    </div>, host)
  return {
    step: (e) => { f[e.i] = e.v; fieldViews[e.i].forceUpdate(); for (const k of deps[e.i]) compViews[k].refresh() },
    destroy: () => render(null, host),
  }
}
