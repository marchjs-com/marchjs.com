// State at the top, March: App holds the unit as a signal and the focus behind a selector(); Panel > Group > Item
// are real components that run once. The unit is passed down as a prop (the compiler makes props live getters) and the
// selector function is passed as a prop too. Only the measured items read the unit (one per group), so a
// unit step updates only those 200 value text bindings; a focus step
// marks just the old and the new item's class binding. No component runs again and nothing is compared.
import { render, signal, selector } from "march"
import { FIRST_UNIT, NO_FOCUS, fmt, itemClass, type Deep, type Panel, type Group, type Item, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

type IsOn = (id: number) => boolean
function ItemView(props: { it: Item; unit: string; isOn: IsOn }) {
  const it = props.it, isOn = props.isOn
  return <div class={itemClass(isOn(it.id))}><span class="k">{it.label}</span><b class="v">{it.v === null ? `#${it.id}` : fmt(it.v, props.unit)}</b></div>
}
function GroupView(props: { g: Group; unit: string; isOn: IsOn }) {
  const g = props.g
  return <div class="grp"><h4>{g.title}</h4>{g.items.map((it) => <ItemView it={it} unit={props.unit} isOn={props.isOn} />)}</div>
}
function PanelView(props: { p: Panel; unit: string; isOn: IsOn }) {
  const p = props.p
  return <section class="pnl"><h3>{p.title}</h3><p class="note">{p.note}</p>
    <div class="grps">{p.groups.map((g) => <GroupView g={g} unit={props.unit} isOn={props.isOn} />)}</div></section>
}

export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  const unit = signal(FIRST_UNIT), focus = signal(NO_FOCUS)
  const isOn = selector(focus)
  const dispose = render(() => <div class="deep">{data.panels.map((p) => <PanelView p={p} unit={unit()} isOn={isOn} />)}</div>, host)
  return {
    step: (p) => { const s = p as Step; if ("unit" in s) unit.set(s.unit); else focus.set(s.focus) },
    destroy: dispose,
  }
}
