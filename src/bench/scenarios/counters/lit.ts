// Independent counters, Lit 3: the usual Lit pattern, each counter's value kept in its own slot and a render() of the
// whole grid per step; lit-html walks every counter's value and touches the DOM only where it changed. Counter
// template in compiled form (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, child } from "../lit-tpl.ts"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const counter = template(el("span", { class: "ct" }, child()))
  const n = data.map(() => 0)
  const grid = document.createElement("div")
  grid.className = "cg"; host.append(grid)
  const draw = () => render(n.map((v) => counter(v)), grid)
  draw()
  return {
    step: (p) => { for (const i of p as Fired) n[i]!++; draw() },
    destroy: () => { render(null, grid); grid.remove() },
  }
}
