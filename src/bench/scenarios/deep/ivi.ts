// State at the top, ivi: the unit and the focus are app state passed down through Panel > Group > Item components.
// A step updates the app again; each level skips its update unless the unit changed or the old or new focus is inside
// it (the components' areEqual, with def.ts panelOf / groupOf), so a focus step re-renders two items and their
// ancestors, a unit step the 200 measured items. Templates compiled with ivi's template compiler
// (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, html } from "ivi"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf, type Deep, type Step, type Item, type Group, type Panel } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface ItemP { it: Item; unit: string; on: boolean }
interface GroupP { g: Group; unit: string; focus: number }
interface PanelP { p: Panel; pi: number; unit: string; focus: number }
const ItemView = component<ItemP>(() => ({ it, unit, on }) => html`<div class=${itemClass(on)}><span class="k">${it.label}</span><b class="v">${itemText(it, unit)}</b></div>`,
  (a, b) => a.on === b.on && (a.unit === b.unit || a.it.v === null))
const GroupView = component<GroupP>(() => ({ g, unit, focus }) => html`<div class="grp"><h4>${g.title}</h4>${g.items.map((it) => ItemView({ it, unit, on: it.id === focus }))}</div>`,
  (a, b) => a.unit === b.unit && (a.focus === b.focus || (groupOf(a.focus) !== a.g.id - 1 && groupOf(b.focus) !== a.g.id - 1)))
const PanelView = component<PanelP>(() => ({ p, unit, focus }) => html`<section class="pnl"><h3>${p.title}</h3><p class="note">${p.note}</p><div class="grps">${p.groups.map((g) => GroupView({ g, unit, focus }))}</div></section>`,
  (a, b) => a.unit === b.unit && (a.focus === b.focus || (panelOf(a.focus) !== a.pi && panelOf(b.focus) !== a.pi)))

export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  let unit = FIRST_UNIT, focus = NO_FOCUS
  const root = createRoot(host)
  const draw = () => update(root, html`<div class="deep">${data.panels.map((p, pi) => PanelView({ p, pi, unit, focus }))}</div>`)
  draw()
  return {
    step: (s) => { const x = s as Step; if ("unit" in x) unit = x.unit; else focus = x.focus; draw() },
    destroy: () => update(root, null),
  }
}
