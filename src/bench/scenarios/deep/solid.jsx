// State at the top, SolidJS: App holds the unit as a signal and the focus behind createSelector(); Panel > Group > Item
// are real components that run once. The unit is passed down as a prop (Solid compiles it to a live getter) and the
// selector function is passed as a prop too. Only the measured items read the unit (one per group), so a
// unit step updates only those 200 value text bindings; a focus step
// updates just the old and the new item's class binding. Compiled with babel-preset-solid
// (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, createSelector } from "solid-js"
import { render } from "solid-js/web"
import { FIRST_UNIT, NO_FOCUS, fmt, itemClass } from "./def.ts"

function ItemView(props) {
  const it = props.it, isOn = props.isOn
  return <div class={itemClass(isOn(it.id))}><span class="k">{it.label}</span><b class="v">{it.v === null ? `#${it.id}` : fmt(it.v, props.unit)}</b></div>
}
function GroupView(props) {
  const g = props.g
  return <div class="grp"><h4>{g.title}</h4>{g.items.map((it) => <ItemView it={it} unit={props.unit} isOn={props.isOn} />)}</div>
}
function PanelView(props) {
  const p = props.p
  return <section class="pnl"><h3>{p.title}</h3><p class="note">{p.note}</p>
    <div class="grps">{p.groups.map((g) => <GroupView g={g} unit={props.unit} isOn={props.isOn} />)}</div></section>
}

export function mount(host, data) {
  const [unit, setUnit] = createSignal(FIRST_UNIT), [focus, setFocus] = createSignal(NO_FOCUS)
  const isOn = createSelector(focus)
  const dispose = render(() => <div class="deep">{data.panels.map((p) => <PanelView p={p} unit={unit()} isOn={isOn} />)}</div>, host)
  return { step: (s) => ("unit" in s ? setUnit(s.unit) : setFocus(s.focus)), destroy: dispose }
}
