// One showcase card for a component folder (src/components/<name>/): its demo.tsx drawn with the Playground options
// from playground.ts, the Code tab from demo.tsx › code. New components appear by adding the folder, not by editing pages.
// A component with its own package entry (meta.entry) has no lazy loader in the registry: its page passes `view` and
// `spec` (imported statically) and the card draws them at once.
import { signal } from "hadi-march";
import { lazy } from "hadi-march/lazy";
import { Link, type Href } from "hadi-march/router";
import { registry } from "hadi-march/components/registry.gen.ts";
import type { PlaygroundOption, PlaygroundSpec } from "hadi-march/ui";
import { Demo } from "./demo.tsx";
import { Playground, type PlayOption } from "./playground.tsx";

type View = (p: { values: never }) => unknown

/** A demo view with its Playground options (values live in a signal; the view reads props.values.<key>). */
export function PlayStage(props: { view: View; spec: PlaygroundSpec<never> }) {
  const spec = props.spec as PlaygroundSpec
  const View = props.view
  const values = signal<Record<string, unknown>>(Object.fromEntries(spec.options.map((o: PlaygroundOption) => [o.key, o.default])))
  const opts: PlayOption[] = spec.options.map((o: PlaygroundOption) => ({
    label: o.label, options: o.options, kind: o.kind, min: o.min, max: o.max, step: o.step, unit: o.unit,
    get: () => values()[o.key], set: ((v: unknown) => values.set({ ...values.peek(), [o.key]: v })) as (v: never) => void,
    visibleWhen: o.visibleWhen ? () => o.visibleWhen!(values() as never) : undefined,
  }))
  // the demo reads props.values.<key>: a getter, so it stays live. `{ ...props.values }` reads every value at once: a
  // thunk that rebuilds a block must read the values itself, because a value only passed on as a prop (`tone={v.tone}`)
  // becomes a live getter the block reads untracked, once, and the thunk would never run again
  const live = new Proxy({}, {
    get: (_, k) => values()[k as string],
    ownKeys: () => Reflect.ownKeys(values()),
    getOwnPropertyDescriptor: (_, k) => (k in values() ? { value: values()[k as string], enumerable: true, configurable: true } : undefined),
  })
  return <Playground options={opts}><View values={live as never} /></Playground>
}

function Stage(props: { folder: string }) {
  const entry = registry.find((e) => e.folder === props.folder)!
  const Body = lazy(async () => {
    const [{ default: view }, { default: spec }] = await Promise.all([entry.demo(), entry.playground()])
    return { default: () => <PlayStage view={view} spec={spec} /> }
  }, { placeholder: "card", height: "12rem" })
  return <Body />
}

/** "Şunlardan oluşur": the parts a component is built from (meta.composedOf), each linked to the page that shows it. */
export function ComposedOf(props: { parts: readonly string[] }) {
  if (!props.parts.length) return null
  return <p class="sc-parts"><span class="sc-parts-label">Şunlardan oluşur:</span>
    {props.parts.map((name) => {
      const page = registry.find((e) => e.meta.name === name)?.meta.showcase
      return page ? <Link class="sc-part" href={page as Href}>{name}</Link> : <code class="sc-part">{name}</code>
    })}
  </p>
}

export function ComponentDemo(props: { folder: string; title?: string; desc?: string; code?: string; view?: View; spec?: PlaygroundSpec<never> }) {
  const entry = registry.find((e) => e.folder === props.folder)!
  return <Demo wide title={props.title ?? entry.meta.name} desc={props.desc ?? entry.meta.summary} code={props.code ?? entry.code}>
    <ComposedOf parts={entry.meta.composedOf} />
    {props.view && props.spec ? <PlayStage view={props.view} spec={props.spec} /> : <Stage folder={props.folder} />}
  </Demo>
}
