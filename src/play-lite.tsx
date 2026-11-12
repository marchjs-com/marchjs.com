// A light Playground for heavy feature pages that must stay inside the route budget: the same stage + options panel
// look (sc-play) and the same rules (an option shows only while it has an effect, booleans are switches), but every
// choice is a Segmented control (a feature page's options are few) and a spec is read from playground.ts directly.
// The full Playground (ChoicePicker: chips, cards, grids, Combobox) lives in playground.tsx.
import { untrack, signal } from "hadi-march";
import { Segmented, Toggle, FieldFrame } from "hadi-march/forms";
import type { PlaygroundOption, PlaygroundSpec } from "hadi-march/ui";

type View<V> = (p: { values: V }) => unknown

/** `<LitePlayground spec={spec} view={Demo} />`: values live in a signal; the view reads props.values.<key>. */
export function LitePlayground<V>(props: { spec: PlaygroundSpec<V>; view: View<V>; label?: string }) {
  const opts = props.spec.options as readonly PlaygroundOption<V>[]
  const values = signal<Record<string, unknown>>(Object.fromEntries(opts.map((o) => [o.key, o.default])))
  const set = (k: string) => (v: unknown) => values.set({ ...values.peek(), [k]: v })
  const live = new Proxy({}, { get: (_, k) => values()[k as string] }) as V
  const control = (o: PlaygroundOption<V>) => o.options
    ? <FieldFrame label={o.label} group><Segmented aria-label={o.label} value={values()[o.key]} onChange={set(o.key)} options={o.options} /></FieldFrame>
    : <Toggle value={!!values()[o.key]} onChange={set(o.key)} label={o.label} />
  const View = props.view
  return <div class="sc-play"><div class="sc-play-inner">
    <div class="sc-play-stage"><View values={live} /></div>
    <div class="sc-play-panel" role="group" aria-label={props.label ?? "Seçenekler"}>
      {opts.map((o) => () => (o.visibleWhen && !o.visibleWhen(values() as V) ? null : untrack(() => <div class="sc-play-opt">{control(o)}</div>)))}
    </div>
  </div></div>
}
