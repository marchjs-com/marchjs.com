// The workbench of a component card (ComponentDemo): a stage box (toolbar, stage, code) beside the options panel.
// One lazy part for every component page. The structural names the audits read stay: .sc-play > .sc-play-inner >
// .sc-play-stage + .sc-play-panel > .sc-play-opt.
import "./workbench.css";
import { signal } from "hadi-march";
import { Link, type Href } from "hadi-march/router";
import { Button, Widget, codeView } from "hadi-march/ui";
import type { PlaygroundOption, PlaygroundSpec } from "hadi-march/ui";
import { cards, type CardEntry } from "hadi-march/components/cards.gen.ts";
import { optionRow, type PlayOption } from "./playground.tsx";
import { demoId, type DemoView } from "./component-demo.tsx";

/** A part of a component (meta.composedOf), linked to the page that draws its own demo (cards.gen.ts › w). */
function Part(props: { name: string }) {
  const part = cards.find((e) => e.n === props.name)
  return part?.w ? <Link class="sc-part" href={`${part.w}#${demoId(part.f)}` as Href}>{props.name}</Link> : <code class="sc-part">{props.name}</code>
}

/** "Şunlardan oluşur": the parts of the component and the link to its API entry, above the workbench. */
function PartsRow(props: { parts: readonly string[]; api?: string | undefined }) {
  return <div class="sc-wb-parts">
    {props.parts.length ? <span class="sc-parts-label">Şunlardan oluşur</span> : null}
    {props.parts.map((name) => <Part name={name} />)}
    {props.api ? <Link class="sc-part sc-part-api" href={`/api/${props.api}` as Href} title="API başvurusu"><span aria-hidden="true">{"{ }"}</span>{props.api.split("/").pop()}</Link> : null}
  </div>
}

export function Workbench(props: { entry: CardEntry; view: DemoView; spec: PlaygroundSpec<never>; code: string }) {
  const spec = props.spec as PlaygroundSpec
  const View = props.view
  const defaults = (): Record<string, unknown> => Object.fromEntries(spec.options.map((o: PlaygroundOption) => [o.key, o.default]))
  const values = signal<Record<string, unknown>>(defaults())
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
  const changed = (): boolean => { const v = values(); return spec.options.some((o: PlaygroundOption) => v[o.key] !== o.default) }
  const parts = props.entry.p ?? []
  return <>
    {parts.length || props.entry.a ? <PartsRow parts={parts} api={props.entry.a} /> : null}
    <div class="sc-play sc-wb"><div class="sc-play-inner">
      <div class="sc-wb-box">
        <div class={spec.stage === "center" ? "sc-play-stage sc-wb-stage sc-wb-center" : "sc-play-stage sc-wb-stage"}>
          <div class="sc-wb-frame"><View values={live as never} /></div>
        </div>
        {props.code ? <div class="sc-wb-code"><Widget sources={[codeView]} input={{ source: props.code.trim(), lang: "tsx" }} /></div> : null}
      </div>
      <div class="sc-play-panel" role="group" aria-label="Seçenekler">
        <div class="sc-wb-panel-head">
          <span class="sc-wb-panel-title">Seçenekler</span>
          <Button size="sm" variant="ghost" disabled={() => !changed()} on:click={() => values.set(defaults())}>Sıfırla</Button>
        </div>
        {opts.length ? opts.map(optionRow) : <p class="sc-wb-none">Bu bileşenin ayarlanacak seçeneği yok.</p>}
      </div>
    </div></div>
  </>
}
