// Live ticker, March: each quote holds two signals (price and direction); a tick writes them inside batch(), and
// only the bound text and class of the changed cells update. No list diff: the rows themselves never change.
import { render, signal, batch } from "march"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const rows = data.map((q) => ({ sym: q.sym, price: signal(q.price), cls: signal("px") }))
  const dispose = render(() => <table class="bt"><tbody>
    {rows.map((r) => <tr><td class="sym">{r.sym}</td><td class={r.cls()}>{fmtPrice(r.price())}</td></tr>)}
  </tbody></table>, host)
  return {
    step: (p) => batch(() => {
      for (const t of p as Tick[]) {
        const r = rows[t.i]!
        r.cls.set(`px ${dir(t.price, r.price.peek())}`)
        r.price.set(t.price)
      }
    }),
    destroy: dispose,
  }
}
