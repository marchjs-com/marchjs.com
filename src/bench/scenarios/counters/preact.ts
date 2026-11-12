// Independent counters, Preact 10: each Counter is a function component with its own useReducer state and registers
// its dispatch; a step dispatches to the fired counters only (the grid does not render again). Preact renders in a
// microtask, before the paint.
import { h, render } from "preact"
import { useReducer, useLayoutEffect } from "preact/hooks"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const add1 = (n: number) => n + 1
export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const inc: ((() => void) | null)[] = data.map(() => null)
  function Counter({ i }: { i: number }) {
    const [n, bump] = useReducer(add1, 0)
    useLayoutEffect(() => { inc[i] = bump as () => void; return () => { inc[i] = null } }, [i])
    return h("span", { class: "ct" }, n)
  }
  render(h("div", { class: "cg" }, data.map((c, i) => h(Counter, { key: c.id, i }))), host)
  return {
    step: (p) => { for (const i of p as Fired) inc[i]!() },
    destroy: () => render(null, host),
  }
}
