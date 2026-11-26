// Benchmark app: Inferno. JSX compiled ahead of time with babel-plugin-inferno (tools/gen-bench.mjs → inferno.gen.js),
// the plugin Inferno's own setup uses: elements become createVNode calls with their flags worked out at compile time.
// Every change renders the app again (Inferno's render() is synchronous); a row skips its update while its item and
// selection stay the same (onComponentShouldUpdate).
import { render } from "inferno"

function RowView({ item, selected, select, remove }) {
  return (
    <tr className={selected ? "danger" : ""}>
      <td className="c1">{item.id}</td>
      <td className="c4"><a className="lbl" onClick={() => select(item.id)}>{item.label}</a></td>
      <td className="c1"><a className="rm" onClick={() => remove(item.id)}>×</a></td>
      <td className="c6"></td>
    </tr>
  )
}
RowView.defaultHooks = { onComponentShouldUpdate: (a, b) => a.item !== b.item || a.selected !== b.selected }

export function mount(host) {
  let rows = [], sel = 0
  const select = (id) => { sel = id; draw() }
  const remove = (id) => { rows = rows.filter((r) => r.id !== id); draw() }
  const draw = () => render(
    <table className="bt"><tbody $HasKeyedChildren>
      {rows.map((item) => <RowView key={item.id} item={item} selected={item.id === sel} select={select} remove={remove} />)}
    </tbody></table>, host)
  draw()
  return {
    run: (r) => { rows = r; sel = 0; draw() },
    add: (r) => { rows = rows.concat(r); draw() },
    update: () => { rows = rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })); draw() },
    swap: () => { if (rows.length <= 998) return; const d = rows.slice(); const t = d[1]; d[1] = d[998]; d[998] = t; rows = d; draw() },
    clear: () => { rows = []; sel = 0; draw() },
    destroy: () => render(null, host),
  }
}

// the realistic scenarios' Inferno apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/inferno.ts"
