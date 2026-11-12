// Independent counters, SolidJS: each Counter component owns a signal and registers its increment; a step calls the
// fired counters' increments inside batch() and Solid updates only their text. Compiled with babel-preset-solid
// (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, batch } from "solid-js"
import { render } from "solid-js/web"

export function mount(host, data) {
  const inc = []
  function Counter(props) {
    const [n, setN] = createSignal(0)
    inc[props.i] = () => setN((v) => v + 1)
    return <span class="ct">{n()}</span>
  }
  const dispose = render(() => <div class="cg">{data.map((_, i) => <Counter i={i} />)}</div>, host)
  return {
    step: (fired) => batch(() => { for (const i of fired) inc[i]() }),
    destroy: dispose,
  }
}
