// Independent counters, React 19: each Counter is a memo component with its own useReducer state and registers its
// dispatch; a step dispatches to the fired counters only (the grid does not render again), inside flushSync.
import { createElement as h, memo, useReducer, useLayoutEffect } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const add1 = (n: number) => n + 1
export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const inc: ((() => void) | null)[] = data.map(() => null)
  const Counter = memo(function Counter({ i }: { i: number }) {
    const [n, bump] = useReducer(add1, 0)
    useLayoutEffect(() => { inc[i] = bump as () => void; return () => { inc[i] = null } }, [i])
    return h("span", { className: "ct" }, n)
  })
  const App = () => h("div", { className: "cg" }, data.map((c, i) => h(Counter, { key: c.id, i })))
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => { for (const i of p as Fired) inc[i]!() }),
    destroy: () => root.unmount(),
  }
}
