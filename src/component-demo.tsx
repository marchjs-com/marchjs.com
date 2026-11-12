// One showcase card for a component folder (src/components/<name>/): its demo.tsx drawn with the Playground options
// from playground.ts, the Code tab from demo.tsx › code. New components appear by adding the folder, not by editing pages.
import { signal } from "hadi-march";
import { lazy } from "hadi-march/lazy";
import { Link, type Href } from "hadi-march/router";
import { registry } from "hadi-march/components/registry.gen.ts";
import type { PlaygroundOption } from "hadi-march/ui";
import { Demo } from "./demo.tsx";
import { Playground, type PlayOption } from "./playground.tsx";

function Stage(props: { folder: string }) {
  const entry = registry.find((e) => e.folder === props.folder)!
  const Body = lazy(async () => {
    const [{ default: View }, { default: spec }] = await Promise.all([entry.demo(), entry.playground()])
    const values = signal<Record<string, unknown>>(Object.fromEntries(spec.options.map((o: PlaygroundOption) => [o.key, o.default])))
    const opts: PlayOption[] = spec.options.map((o: PlaygroundOption) => ({
      label: o.label, options: o.options, kind: o.kind, min: o.min, max: o.max, step: o.step, unit: o.unit,
      get: () => values()[o.key], set: ((v: unknown) => values.set({ ...values.peek(), [o.key]: v })) as (v: never) => void,
      visibleWhen: o.visibleWhen ? () => o.visibleWhen!(values() as never) : undefined,
    }))
    // the demo reads props.values.<key>: a getter, so it stays live
    return { default: () => <Playground options={opts}><View values={new Proxy({}, { get: (_, k) => values()[k as string] }) as never} /></Playground> }
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

export function ComponentDemo(props: { folder: string; title?: string; desc?: string; code?: string }) {
  const entry = registry.find((e) => e.folder === props.folder)!
  return <Demo wide title={props.title ?? entry.meta.name} desc={props.desc ?? entry.meta.summary} code={props.code ?? entry.code}>
    <ComposedOf parts={entry.meta.composedOf} />
    <Stage folder={props.folder} />
  </Demo>
}
