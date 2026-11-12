// Theme change, Preact 10: the theme is a context provided by the top component; the cards and the list never update
// (shouldComponentUpdate false), and a change re-renders only the context consumers, the 2.000 badge components
// (useContext). Preact renders in a microtask, before the paint.
import { h, render, Component, createContext } from "preact"
import { useContext } from "preact/hooks"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Theme = createContext({ accent: FIRST })
const Badge = ({ id }: { id: number }) => h("span", { class: badgeClass(useContext(Theme).accent) }, `#${id}`)
class CardView extends Component<{ c: Card }> {
  override shouldComponentUpdate() { return false }
  render({ c }: { c: Card }) { return h("div", { class: "card" }, h("h3", null, c.title), h("p", null, c.text), h(Badge, { id: c.id })) }
}

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  class Cards extends Component {
    override shouldComponentUpdate() { return false }
    render() { return h("div", { class: "cards" }, data.map((c) => h(CardView, { key: c.id, c }))) }
  }
  let app: App | null = null
  class App extends Component<object, { value: { accent: string } }> {
    constructor(p: object) { super(p); this.state = { value: { accent: FIRST } }; app = this }
    render() { return h(Theme.Provider, { value: this.state.value }, h(Cards, null)) }
  }
  render(h(App, null), host)
  return { step: (p) => app!.setState({ value: { accent: p as string } }), destroy: () => render(null, host) }
}
