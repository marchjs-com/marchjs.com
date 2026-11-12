// Derived values, React 19: the fields live in a small external store with one listener set per field. Each field
// cell and each computed cell is a memo component reading the store through useSyncExternalStore; a computed cell
// subscribes only to its own fields and its snapshot is the derived number (a selector), so an edit re-renders the
// edited field and only the computed cells whose value changed; the form component itself never renders again.
// (Lifting the 200 fields into one useState with useMemo per cell would re-render and diff all 700 cells per edit.)
// Updates run in flushSync.
import { createElement as h, memo, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const f = data.fields.slice(), get = (i: number) => f[i]!
  const subs: Set<() => void>[] = f.map(() => new Set())
  const listen = (ids: number[]) => (cb: () => void) => { for (const i of ids) subs[i]!.add(cb); return () => { for (const i of ids) subs[i]!.delete(cb) } }
  const fieldSub = f.map((_, i) => listen([i])), compSub = data.comps.map((c) => listen([...new Set(c.deps)]))
  const Field = memo(function Field({ i }: { i: number }) {
    const v = useSyncExternalStore(fieldSub[i]!, () => f[i]!)
    return h("span", { className: "dv-f" }, v)
  })
  const Computed = memo(function Computed({ k }: { k: number }) {
    const c = data.comps[k]!
    const v = useSyncExternalStore(compSub[k]!, () => evalComp(c, get))
    return h("span", { className: compClass(c, v) }, v)
  })
  const App = () => h("div", { className: "dv" },
    h("div", { className: "dv-fs" }, f.map((_, i) => h(Field, { key: i, i }))),
    h("div", { className: "dv-cs" }, data.comps.map((_, k) => h(Computed, { key: k, k }))))
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => {
      const e = p as Edit
      f[e.i] = e.v
      for (const cb of subs[e.i]!) cb()
    }),
    destroy: () => root.unmount(),
  }
}
