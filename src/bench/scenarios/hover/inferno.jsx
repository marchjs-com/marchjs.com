// Moving highlight, Inferno: the hovered index is app state and each row is a functional component receiving
// hovered={hovered === i}; a step renders the list again (render() is synchronous), and only the two rows whose
// boolean changed render (onComponentShouldUpdate). Compiled with babel-plugin-inferno (tools/gen-bench.mjs →
// inferno.gen.js).
import { render } from "inferno"
import { HOVER } from "./def.ts"

function RowView({ it, hovered }) {
  return <tr className={hovered ? HOVER : ""}><td className="id">{it.id}</td><td className="lbl">{it.label}</td></tr>
}
const changed = (a, b) => a.hovered !== b.hovered || a.it !== b.it

export function mount(host, data) {
  const draw = (h) => render(<table className="bt"><tbody $HasKeyedChildren>{data.map((it, i) => <RowView key={it.id} it={it} hovered={h === i} onComponentShouldUpdate={changed} />)}</tbody></table>, host)
  draw(-1)
  return { step: (i) => draw(i), destroy: () => render(null, host) }
}
