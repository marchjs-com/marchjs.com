// A light Playground for heavy feature pages that must stay inside the route budget: the same stage + options panel
// look (sc-play) and the same rules (an option shows only while it has an effect, booleans are switches), but every
// choice is a Segmented control (a feature page's options are few) and a spec is read from playground.ts directly.
// The full Playground (ChoicePicker: chips, cards, grids, Combobox) lives in playground.tsx.
import { signal, computed, untrack, If, getOwner, runWithOwner } from "march";
import { Segmented, Toggle, Field } from "march/forms";
import type { PlaygroundOption, PlaygroundSpec } from "./catalog/spec.ts";

type View<V> = (p: { values: V }) => unknown

/** `<LitePlayground spec={spec} view={Demo} />`: values live in a signal; the view reads props.values.<key>. */
export function LitePlayground<V>(props: { spec: PlaygroundSpec<V>; view: View<V>; label?: string }) {
  const opts = props.spec.options as readonly PlaygroundOption<V>[]
  const values = signal<Record<string, unknown>>(Object.fromEntries(opts.map((o) => [o.key, o.default])))
  const set = (k: string) => (v: unknown) => values.set({ ...values.peek(), [k]: v })
  // each key read through its own memo: a block that reads props.values.x runs again only when x changes (the
  // component then animates the new value instead of being rebuilt at it)
  const owner = getOwner(), byKey = new Map<string, () => unknown>()
  const live = new Proxy({}, { get: (_, k) => {
    if (typeof k !== "string") return undefined
    let m = byKey.get(k)
    if (!m) { m = runWithOwner(owner, () => computed(() => values()[k])) as () => unknown; byKey.set(k, m) }
    return m()
  } }) as V
  const control = (o: PlaygroundOption<V>) => o.options
    ? <Field label={o.label} group><Segmented aria-label={o.label} value={values()[o.key]} onChange={set(o.key)} options={o.options} /></Field>
    : <Toggle value={!!values()[o.key]} onChange={set(o.key)} label={o.label} />
  const View = props.view
  return <div class="sc-play"><div class="sc-play-inner">
    <div class={props.spec.stage === "center" ? "sc-play-stage sc-play-center" : "sc-play-stage"}><View values={live} /></div>
    <div class="sc-play-panel" role="group" aria-label={props.label ?? "Seçenekler"}>
      {opts.map((o) => (o.visibleWhen
        // If redraws only when the visibility flips: a value change never rebuilds the control (focus, pointer capture stay)
        ? If({ when: () => o.visibleWhen!(values() as V), children: () => <div class="sc-play-opt">{control(o)}</div> })
        : untrack(() => <div class="sc-play-opt">{control(o)}</div>)))}
    </div>
  </div></div>
}
