// State at the top, Inferno: the unit and the focus are app state passed down through Panel > Group > Item (function
// components). A step renders the app again (render() is synchronous); each level skips its update unless the unit
// changed or the old or new focus is inside it (onComponentShouldUpdate, with def.ts panelOf / groupOf), so a focus
// step re-renders two items and their ancestors, a unit step the 200 measured items.
// Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render } from "inferno"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf } from "./def.ts"

function ItemView({ it, unit, on }) {
  return <div className={itemClass(on)}><span className="k">{it.label}</span><b className="v">{itemText(it, unit)}</b></div>
}
function GroupView({ g, unit, focus }) {
  return <div className="grp"><h4>{g.title}</h4>{g.items.map((it) => <ItemView key={it.id} it={it} unit={unit} on={it.id === focus} onComponentShouldUpdate={itemChanged} />)}</div>
}
function PanelView({ p, unit, focus }) {
  return <section className="pnl"><h3>{p.title}</h3><p className="note">{p.note}</p>
    <div className="grps">{p.groups.map((g) => <GroupView key={g.id} g={g} gi={g.id - 1} unit={unit} focus={focus} onComponentShouldUpdate={groupChanged} />)}</div></section>
}
const itemChanged = (a, b) => a.on !== b.on || (a.unit !== b.unit && a.it.v !== null)
const groupChanged = (a, b) => a.unit !== b.unit || (a.focus !== b.focus && (groupOf(a.focus) === a.gi || groupOf(b.focus) === a.gi))
const panelChanged = (a, b) => a.unit !== b.unit || (a.focus !== b.focus && (panelOf(a.focus) === a.pi || panelOf(b.focus) === a.pi))

export function mount(host, data) {
  let unit = FIRST_UNIT, focus = NO_FOCUS
  const draw = () => render(<div className="deep">{data.panels.map((p, k) => <PanelView key={p.id} p={p} pi={k} unit={unit} focus={focus} onComponentShouldUpdate={panelChanged} />)}</div>, host)
  draw()
  return {
    step: (s) => { if ("unit" in s) unit = s.unit; else focus = s.focus; draw() },
    destroy: () => render(null, host),
  }
}
