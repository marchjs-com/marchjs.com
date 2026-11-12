// Live ticker, SolidJS: each quote holds two signals (price and class); a tick sets them inside batch() and Solid
// updates only the bound text and class. Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, batch } from "solid-js"
import { render } from "solid-js/web"
import { fmtPrice, dir } from "../core.ts"

export function mount(host, data) {
  const rows = data.map((q) => { const [price, setPrice] = createSignal(q.price), [cls, setCls] = createSignal("px"); return { sym: q.sym, price, setPrice, cls, setCls } })
  const dispose = render(() => (
    <table class="bt"><tbody>
      {rows.map((r) => <tr><td class="sym">{r.sym}</td><td class={r.cls()}>{fmtPrice(r.price())}</td></tr>)}
    </tbody></table>
  ), host)
  return {
    step: (ticks) => batch(() => { for (const t of ticks) { const r = rows[t.i]; r.setCls(`px ${dir(t.price, r.price())}`); r.setPrice(t.price) } }),
    destroy: dispose,
  }
}
