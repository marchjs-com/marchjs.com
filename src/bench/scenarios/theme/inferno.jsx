// Theme change, Inferno: Inferno's context does not push changes past components that skip their update, so the
// accent is passed down as a prop and the app renders again (render() is synchronous); each card skips its update
// unless the accent changed, so a change re-renders the 2.000 cards and patches only their badges' class.
// Compiled with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js).
import { render } from "inferno"
import { FIRST, badgeClass } from "./def.ts"

function CardView({ c, accent }) {
  return <div className="card"><h3>{c.title}</h3><p>{c.text}</p><span className={badgeClass(accent)}>{`#${c.id}`}</span></div>
}
const changed = (a, b) => a.accent !== b.accent || a.c !== b.c

export function mount(host, data) {
  const draw = (accent) => render(<div className="cards" $HasKeyedChildren>{data.map((c) => <CardView key={c.id} c={c} accent={accent} onComponentShouldUpdate={changed} />)}</div>, host)
  draw(FIRST)
  return { step: (a) => draw(a), destroy: () => render(null, host) }
}
