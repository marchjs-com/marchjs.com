// Theme change, March: the theme is provided at the top with context(); its accent is a signal. Each card's
// badge reads it with useContext() and binds it to its class, so a change updates only those 2.000 class bindings:
// the cards themselves and the list never run again.
import { render, signal, context, useContext, type Accessor } from "march"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface ThemeValue { accent: Accessor<string> }
const Theme = context<ThemeValue>()

function CardView(props: { c: Card }) {
  const t = useContext(Theme)
  const c = props.c
  return <div class="card"><h3>{c.title}</h3><p>{c.text}</p><span class={badgeClass(t.accent())}>{`#${c.id}`}</span></div>
}

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  const accent = signal(FIRST)
  const dispose = render(() => <Theme.Provider value={{ accent }}>
    <div class="cards">{data.map((c) => <CardView c={c} />)}</div>
  </Theme.Provider>, host)
  return { step: (p) => accent.set(p as string), destroy: dispose }
}
