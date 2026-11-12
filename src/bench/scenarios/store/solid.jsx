// Shared store, SolidJS: one createStore (solid-js/store) holds all the cells; each Cell component reads
// store.cells[i], so it depends on that index only. A step writes the 50 cells with setStore inside batch() and Solid
// updates only those texts. Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { batch } from "solid-js"
import { createStore } from "solid-js/store"
import { render } from "solid-js/web"
import { sectionsOf } from "./def.ts"

export function mount(host, data) {
  const [store, setStore] = createStore({ cells: data.cells.slice() })
  function Cell(props) {
    return <span class="sc">{store.cells[props.i]}</span>
  }
  function Section(props) {
    return <div class="ss">{props.idx.map((i) => <Cell i={i} />)}</div>
  }
  const dispose = render(() => <div class="sg">{sectionsOf(data.cells.length).map((idx) => <Section idx={idx} />)}</div>, host)
  return {
    step: (writes) => batch(() => { for (const w of writes) setStore("cells", w.i, w.v) }),
    destroy: dispose,
  }
}
