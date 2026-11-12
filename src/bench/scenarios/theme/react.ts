// Theme change, React 19, with the pattern React recommends: the theme is a context whose value is memoized; the cards
// and the list are memo components, so a change skips them and React re-renders only the context consumers, the
// 2.000 badge components. Updates run in flushSync.
import { createElement as h, createContext, memo, useContext, useMemo, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Theme = createContext({ accent: FIRST })
const Badge = ({ id }: { id: number }) => h("span", { className: badgeClass(useContext(Theme).accent) }, `#${id}`)
const CardView = memo(function CardView({ c }: { c: Card }) {
  return h("div", { className: "card" }, h("h3", null, c.title), h("p", null, c.text), h(Badge, { id: c.id }))
})

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  let setAccent: (a: string) => void = () => {}
  const Cards = memo(() => h("div", { className: "cards" }, data.map((c) => h(CardView, { key: c.id, c }))))
  const App = () => {
    const [accent, set] = useState(FIRST)
    setAccent = set
    const value = useMemo(() => ({ accent }), [accent])
    return h(Theme.Provider, { value }, h(Cards))
  }
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return { step: (p) => flushSync(() => setAccent(p as string)), destroy: () => root.unmount() }
}
