// Moving highlight, Preact 10: the hovered index is state in the list component; rows are class components with
// shouldComponentUpdate on their hovered boolean (the same pattern as memo). A step renders the list (10.000 row
// vnodes compared) and only the two changed rows render again. Preact renders in a microtask, before the paint.
import { h, render, Component } from "preact"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface RowProps { it: Item; hovered: boolean }
class RowView extends Component<RowProps> {
  override shouldComponentUpdate(next: RowProps) { return next.hovered !== this.props.hovered || next.it !== this.props.it }
  render({ it, hovered }: RowProps) {
    return h("tr", { class: hovered ? HOVER : "" }, h("td", { class: "id" }, it.id), h("td", { class: "lbl" }, it.label))
  }
}
interface State { hovered: number }
export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const api: { app?: Component<object, State> } = {}
  class App extends Component<object, State> {
    constructor(p: object) { super(p); this.state = { hovered: -1 }; api.app = this }
    render(_p: object, { hovered }: State) {
      return h("table", { class: "bt" }, h("tbody", null, data.map((it, i) => h(RowView, { key: it.id, it, hovered: hovered === i }))))
    }
  }
  render(h(App, {}), host)
  return {
    step: (p) => api.app!.setState({ hovered: p as number }),
    destroy: () => render(null, host),
  }
}
