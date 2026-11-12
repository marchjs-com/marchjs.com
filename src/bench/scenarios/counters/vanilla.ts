// Independent counters, plain DOM (hand-optimized): the spans are cloned from one prototype, each counter's text node
// and value are kept in arrays, and a fired timer writes only that counter's text.
import type { Counter, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Counter[]): ScenarioApp {
  const doc = host.ownerDocument
  const grid = doc.createElement("div"), proto = doc.createElement("span")
  grid.className = "cg"; proto.className = "ct"; proto.append("0")
  const texts: Text[] = [], n = data.map(() => 0)
  for (let i = 0; i < data.length; i++) {
    const s = proto.cloneNode(true) as HTMLElement
    texts.push(s.firstChild as Text)
    grid.append(s)
  }
  host.append(grid)
  return {
    step: (p) => { for (const i of p as Fired) texts[i]!.data = String(++n[i]!) },
    destroy: () => grid.remove(),
  }
}
