// Live ticker, React 19, with the pattern React recommends for frequent updates to a few items of a large list:
// state split per row (a small external store, one useSyncExternalStore subscription per memo row), so a tick
// re-renders only the changed rows and the list component itself does not render again. Updates run in flushSync.
import { createElement as h, memo, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface Cell { price: number; cls: string }
export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const cells: Cell[] = data.map((q) => ({ price: q.price, cls: "px" }))
  const subs: ((() => void) | null)[] = data.map(() => null)
  const Row = memo(function Row({ i, sym }: { i: number; sym: string }) {
    const c = useSyncExternalStore((cb) => { subs[i] = cb; return () => { subs[i] = null } }, () => cells[i]!)
    return h("tr", null, h("td", { className: "sym" }, sym), h("td", { className: c.cls }, fmtPrice(c.price)))
  })
  const App = () => h("table", { className: "bt" }, h("tbody", null, data.map((q, i) => h(Row, { key: q.id, i, sym: q.sym }))))
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => {
      for (const t of p as Tick[]) {
        cells[t.i] = { price: t.price, cls: `px ${dir(t.price, cells[t.i]!.price)}` }
        subs[t.i]?.()
      }
    }),
    destroy: () => root.unmount(),
  }
}
