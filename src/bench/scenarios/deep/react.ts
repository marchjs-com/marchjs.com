// State at the top, React 19, with the textbook pattern for state at the top: App holds the unit and the focus in
// useState and passes them down as props; Panel, Group and Item are memo components and each child receives only
// what it needs (the focus if it lies inside that child, else -1; an item gets a boolean, and the unit only if it is
// a measured item), so the props stay equal where nothing changed. A focus step re-renders App, then only the old and
// the new item's panel, group and item; the other panels are skipped by memo. A unit step reaches every group, so all
// panels and groups render and are reconciled, and the 200 measured items render again. The unit is a prop, not
// context: context would re-render the same measured items and skip nothing more. Updates run in flushSync.
import { createElement as h, memo, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf, type Deep, type Panel, type Group, type Item, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const ItemView = memo(function ItemView({ it, unit, on }: { it: Item; unit: string; on: boolean }) {
  return h("div", { className: itemClass(on) }, h("span", { className: "k" }, it.label), h("b", { className: "v" }, itemText(it, unit)))
})
const GroupView = memo(function GroupView({ g, unit, focus }: { g: Group; unit: string; focus: number }) {
  return h("div", { className: "grp" }, h("h4", null, g.title), g.items.map((it) => h(ItemView, { key: it.id, it, unit: it.v === null ? "" : unit, on: it.id === focus })))
})
const PanelView = memo(function PanelView({ p, unit, focus }: { p: Panel; unit: string; focus: number }) {
  return h("section", { className: "pnl" }, h("h3", null, p.title), h("p", { className: "note" }, p.note),
    h("div", { className: "grps" }, p.groups.map((g) => h(GroupView, { key: g.id, g, unit, focus: groupOf(focus) === g.id - 1 ? focus : NO_FOCUS }))))
})

export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  let setUnit: (u: string) => void = () => {}, setFocus: (f: number) => void = () => {}
  const App = () => {
    const [unit, su] = useState(FIRST_UNIT), [focus, sf] = useState(NO_FOCUS)
    setUnit = su; setFocus = sf
    return h("div", { className: "deep" }, data.panels.map((p) => h(PanelView, { key: p.id, p, unit, focus: panelOf(focus) === p.id - 1 ? focus : NO_FOCUS })))
  }
  const root = createRoot(host)
  flushSync(() => root.render(h(App)))
  return {
    step: (p) => { const s = p as Step; flushSync(() => ("unit" in s ? setUnit(s.unit) : setFocus(s.focus))) },
    destroy: () => root.unmount(),
  }
}
