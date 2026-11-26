// Live ticker, ivi: each row is a stateful component that registers a setter; a tick sets the changed rows' quotes
// and invalidates only those components, which ivi updates in a microtask (before the paint). Templates compiled
// with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, invalidate, html } from "ivi"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const set: ((price: number) => void)[] = []
  const Row = component<{ q: Quote; i: number }>((c) => {
    let price = -1, cls = "px", sym = ""
    return ({ q, i }) => {
      if (price < 0) { price = q.price; sym = q.sym; set[i] = (p) => { cls = `px ${dir(p, price)}`; price = p; invalidate(c) } }
      return html`<tr><td class="sym">${sym}</td><td class=${cls}>${fmtPrice(price)}</td></tr>`
    }
  }, () => true)
  const root = createRoot(host)
  update(root, html`<table class="bt"><tbody>${data.map((q, i) => Row({ q, i }))}</tbody></table>`)
  return {
    step: (p) => { for (const t of p as Tick[]) set[t.i]!(t.price) },
    destroy: () => update(root, null),
  }
}
