// Derived values, Preact 10: the fields live in a small store with one listener set per field. Each field cell and
// each computed cell is a class component that subscribes only to the fields it reads and keeps the derived number
// in its state; an edit calls setState on those components, and shouldComponentUpdate skips the ones whose value did
// not change (the form component never renders again). Preact renders in a microtask, before the paint.
import { h, render, Component } from "preact"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const f = data.fields.slice(), get = (i: number) => f[i]!
  const subs: Set<() => void>[] = f.map(() => new Set())
  abstract class Cell<P> extends Component<P, { v: number }> {
    abstract ids(): number[]
    abstract read(): number
    private on = () => this.setState({ v: this.read() })
    override componentDidMount() { for (const i of this.ids()) subs[i]!.add(this.on) }
    override componentWillUnmount() { for (const i of this.ids()) subs[i]!.delete(this.on) }
    override shouldComponentUpdate(_p: P, s: { v: number }) { return s.v !== this.state.v }
  }
  class Field extends Cell<{ i: number }> {
    constructor(p: { i: number }) { super(p); this.state = { v: this.read() } }
    ids() { return [this.props.i] }
    read() { return f[this.props.i]! }
    render() { return h("span", { class: "dv-f" }, this.state.v) }
  }
  class Computed extends Cell<{ k: number }> {
    constructor(p: { k: number }) { super(p); this.state = { v: this.read() } }
    ids() { return [...new Set(data.comps[this.props.k]!.deps)] }
    read() { return evalComp(data.comps[this.props.k]!, get) }
    render() { return h("span", { class: compClass(data.comps[this.props.k]!, this.state.v) }, this.state.v) }
  }
  render(h("div", { class: "dv" },
    h("div", { class: "dv-fs" }, f.map((_, i) => h(Field, { key: i, i }))),
    h("div", { class: "dv-cs" }, data.comps.map((_, k) => h(Computed, { key: k, k })))), host)
  return {
    step: (p) => {
      const e = p as Edit
      f[e.i] = e.v
      for (const cb of subs[e.i]!) cb()
    },
    destroy: () => render(null, host),
  }
}
