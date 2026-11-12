// Moving highlight, React 19, with the common recommended pattern: the hovered index is state in the list component
// and each row is a memo component receiving hovered={hovered === i}. A step re-renders the list (10.000 row
// elements created and their props compared) but only the two rows whose boolean changed render again.
// (A useSyncExternalStore selector per row would skip the list render, but memo rows with a boolean prop are what
// React's docs and most code use for selection and hover.) Updates run in flushSync, as a discrete pointer event would.
import { createElement as h, memo, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const Row = memo(function Row({ it, hovered }: { it: Item; hovered: boolean }) {
  return h("tr", { className: hovered ? HOVER : "" }, h("td", { className: "id" }, it.id), h("td", { className: "lbl" }, it.label))
})
export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const api: { set?: (i: number) => void } = {}
  function App() {
    const [hovered, setHovered] = useState(-1)
    api.set = setHovered
    return h("table", { className: "bt" }, h("tbody", null, data.map((it, i) => h(Row, { key: it.id, it, hovered: hovered === i }))))
  }
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => flushSync(() => api.set!(p as number)),
    destroy: () => root.unmount(),
  }
}
