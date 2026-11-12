// Independent counters, March: each Counter component owns its value (`let $n = 0` in the body is a signal) and
// registers its increment; a step calls the fired counters' increments inside batch(), and only their text updates.
import { render, batch } from "hadi-march"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const inc: (() => void)[] = []
  function Counter(p: { i: number }) {
    let $n = 0
    inc[p.i] = () => { $n++ }
    return <span class="ct">{$n}</span>
  }
  const dispose = render(() => <div class="cg">{data.map((_, i) => <Counter i={i} />)}</div>, host)
  return {
    step: (p) => batch(() => { for (const i of p as Fired) inc[i]!() }),
    destroy: dispose,
  }
}
