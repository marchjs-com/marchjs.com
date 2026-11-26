// Independent counters, Mithril: the counts are app state (Mithril components keep no state that redraws on its own);
// a step increments the fired counts and redraws once (m.redraw.sync), and each counter component skips its diff
// unless its count changed (onbeforeupdate).
import m from "mithril"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Counter: m.Component<{ n: number }> = {
  onbeforeupdate: (v, old) => v.attrs.n !== old.attrs.n,
  view: ({ attrs }) => m("span.ct", attrs.n),
}
export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const n = data.map(() => 0)
  m.mount(host, { view: () => m("div.cg", data.map((c, i) => m(Counter, { key: c.id, n: n[i]! }))) })
  return {
    step: (p) => { for (const i of p as Fired) n[i]!++; m.redraw.sync() },
    destroy: () => m.mount(host, null),
  }
}
