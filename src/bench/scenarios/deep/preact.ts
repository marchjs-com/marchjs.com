// State at the top, Preact 10: App holds the unit and the focus in its state and passes them down as props; Panel,
// Group and Item are pure components (shouldComponentUpdate with a shallow props check, what memo does) and each child
// receives only what it needs (the focus if it lies inside that child, else -1; an item gets a boolean, and the unit
// only if it is a measured item). A focus step re-renders App and only the old and the new item's panel, group and
// item; a unit step reaches every group, so all panels and groups render and are diffed, and the 200 measured items
// render again. Preact renders in a microtask, before the paint.
import { h, render, Component } from "preact"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf, type Deep, type Panel, type Group, type Item, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

abstract class Pure<P extends object> extends Component<P> {
  override shouldComponentUpdate(next: P) { for (const k in next) if (next[k] !== (this.props as P)[k]) return true; return false }
}
class ItemView extends Pure<{ it: Item; unit: string; on: boolean }> {
  render({ it, unit, on }: { it: Item; unit: string; on: boolean }) {
    return h("div", { class: itemClass(on) }, h("span", { class: "k" }, it.label), h("b", { class: "v" }, itemText(it, unit)))
  }
}
class GroupView extends Pure<{ g: Group; unit: string; focus: number }> {
  render({ g, unit, focus }: { g: Group; unit: string; focus: number }) {
    return h("div", { class: "grp" }, h("h4", null, g.title), g.items.map((it) => h(ItemView, { key: it.id, it, unit: it.v === null ? "" : unit, on: it.id === focus })))
  }
}
class PanelView extends Pure<{ p: Panel; unit: string; focus: number }> {
  render({ p, unit, focus }: { p: Panel; unit: string; focus: number }) {
    return h("section", { class: "pnl" }, h("h3", null, p.title), h("p", { class: "note" }, p.note),
      h("div", { class: "grps" }, p.groups.map((g) => h(GroupView, { key: g.id, g, unit, focus: groupOf(focus) === g.id - 1 ? focus : NO_FOCUS }))))
  }
}

interface AppState { unit: string; focus: number }
export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  let app: App | null = null
  class App extends Component<object, AppState> {
    constructor(p: object) { super(p); this.state = { unit: FIRST_UNIT, focus: NO_FOCUS }; app = this }
    render(_p: object, { unit, focus }: AppState) {
      return h("div", { class: "deep" }, data.panels.map((p) => h(PanelView, { key: p.id, p, unit, focus: panelOf(focus) === p.id - 1 ? focus : NO_FOCUS })))
    }
  }
  render(h(App, null), host)
  return {
    step: (p) => { const s = p as Step; app!.setState("unit" in s ? { unit: s.unit } : { focus: s.focus }) },
    destroy: () => render(null, host),
  }
}
