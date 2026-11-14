// One showcase card for a component folder (src/components/<name>/): its demo.tsx drawn with the Playground options
// from playground.ts, the Code tab from demo.tsx › code. New components appear by adding the folder, not by editing pages.
// A component with its own package entry (meta.entry) has no lazy loader in the registry: its page passes `view` and
// `spec` (imported statically) and the card draws them at once.
import { signal } from "hadi-march";
import { lazy } from "hadi-march/lazy";
import { Link, type Href } from "hadi-march/router";
import { cards, cardCode } from "hadi-march/components/cards.gen.ts";
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
  return <Playground options={opts} stage={spec.stage}><View values={live as never} /></Playground>
}

function Stage(props: { folder: string }) {
  const entry = cards.find((e) => e.f === props.folder)!
  const Body = lazy(async () => {
    const [{ default: view }, { default: spec }] = await Promise.all([entry.demo(), entry.playground()])
    return { default: () => <PlayStage view={view} spec={spec} /> }
  }, { placeholder: "card", height: "12rem" })
  return <Body />
}

/** A part of a component (meta.composedOf), linked to the page that draws its own demo (cards.gen.ts › w). */
function Part(props: { name: string }) {
  const part = cards.find((e) => e.n === props.name)
  return part?.w ? <Link class="sc-part" href={`${part.w}#${demoId(part.f)}` as Href}>{props.name}</Link> : <code class="sc-part">{props.name}</code>
}

/** How many parts the strip beside the tabs shows; the rest open with the "+N" button. */
const PARTS_SHOWN = 3

/**
 * The strip at the end of a component card's tab row: "Şunlardan oluşur" (the first parts; "+N" opens the full list
 * under the row) and the link to the component's API entry. One line, so the demo starts right under the tabs.
 */
function MetaStrip(props: { parts: readonly string[]; api?: string | undefined; open: () => boolean; toggle: () => void }) {
  const rest = props.parts.length - PARTS_SHOWN
  return <div class="sc-meta">
    {props.parts.length ? <span class="sc-meta-parts">
      <span class="sc-parts-label">Şunlardan oluşur</span>
      {props.parts.slice(0, PARTS_SHOWN).map((name) => <Part name={name} />)}
      <button type="button" class={rest > 0 ? "sc-part sc-part-more" : "sc-part sc-part-more sc-part-more-narrow"} aria-expanded={props.open() ? "true" : "false"} title="Bütün parçalar" on:click={props.toggle}>
        <span class="sc-more-wide">{`+${rest}`}</span><span class="sc-more-narrow">{`${props.parts.length} parça`}</span>
      </button>
    </span> : null}
    {props.api ? <Link class="sc-part sc-part-api" href={`/api/${props.api}` as Href} title="API başvurusu"><span aria-hidden="true">{"{ }"}</span>{props.api.split("/").pop()}</Link> : null}
  </div>
}

/** The anchor of a component demo on its page ("landing/hero" → "c-landing-hero"). */
export const demoId = (folder: string): string => "c-" + folder.split("/").join("-")

/** `desc`: what to try in this card (the page heading already says what the component is). */
export function ComponentDemo(props: { folder: string; title?: string; desc?: string; code?: string; view?: View; spec?: PlaygroundSpec<never> }) {
  const entry = cards.find((e) => e.f === props.folder)!
  const parts = entry.p ?? []
  const open = signal(false)
  return <Demo wide id={demoId(props.folder)} title={props.title ?? entry.n} desc={props.desc} code={props.code ?? (() => cardCode(props.folder))}
    meta={parts.length || entry.a ? <MetaStrip parts={parts} api={entry.a} open={open} toggle={() => open.set(!open.peek())} /> : undefined}>
    {() => (open() ? <p class="sc-parts">{parts.map((name) => <Part name={name} />)}</p> : null)}
    {props.view && props.spec ? <PlayStage view={props.view} spec={props.spec} /> : <Stage folder={props.folder} />}
  </Demo>
}
