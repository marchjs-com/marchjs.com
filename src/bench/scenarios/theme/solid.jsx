// Theme change, SolidJS: the theme is provided at the top with createContext; its accent is a signal. Each card's
// badge reads it with useContext() and binds it to its class, so a change updates only those 2.000 class bindings.
// Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, createContext, useContext } from "solid-js"
import { render } from "solid-js/web"
import { FIRST, badgeClass } from "./def.ts"

const Theme = createContext()
function CardView(props) {
  const t = useContext(Theme), c = props.c
  return <div class="card"><h3>{c.title}</h3><p>{c.text}</p><span class={badgeClass(t.accent())}>{`#${c.id}`}</span></div>
}

export function mount(host, data) {
  const [accent, setAccent] = createSignal(FIRST)
  const dispose = render(() => (
    <Theme.Provider value={{ accent }}>
      <div class="cards">{data.map((c) => <CardView c={c} />)}</div>
    </Theme.Provider>
  ), host)
  return { step: (a) => setAccent(a), destroy: dispose }
}
