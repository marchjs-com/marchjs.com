// The workbench of a component card (ComponentDemo): a stage box (toolbar, stage, code) beside the options panel.
// One lazy part for every component page. The structural names the audits read stay: .sc-play > .sc-play-inner >
// .sc-play-stage + .sc-play-panel > .sc-play-opt.
import "./workbench.css";
import { signal, computed, effect, untrack } from "hadi-march";
import { Link, type Href } from "hadi-march/router";
import { Button, OverflowToolbar, resolvedTheme, type ToolbarItem } from "hadi-march/ui";
import type { PlaygroundOption, PlaygroundSpec } from "hadi-march/ui";
import { DevicePreview } from "hadi-march/components/layout/device-preview/index.ts";
import { ExplodedView, type ExplodedPart } from "hadi-march/components/layout/exploded-view/index.ts";
import { viewport } from "hadi-march/managers/viewport";
import { defineIcon, monitor, phone, sun, moon, pilcrow, refresh, rotateCw, layers } from "hadi-march/icons";
import { scopedMode, type StageMode } from "./stage-mode.ts";
import type { ExtraAttr } from "./gen-code.ts";
import { CodeBox } from "./wb-code.tsx";
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

const tablet = defineIcon("tablet", ["b:4,2,16,20,2.5", "M11 18h2"])
/** The devices of the stage toolbar: a real screen size, body and status bar (DevicePreview). */
const DEVICES = { phone: { id: "iphone-15", name: "Telefon" }, tablet: { id: "ipad", name: "Tablet" } } as const
type Device = keyof typeof DEVICES
const SIZES: Record<Device, readonly [number, number]> = { phone: [393, 852], tablet: [820, 1180] }

export function Workbench(props: { entry: CardEntry; view: DemoView; spec: PlaygroundSpec<never>; code: string }) {
  const spec = props.spec as PlaygroundSpec
  const View = props.view
  const defaults = (): Record<string, unknown> => Object.fromEntries(spec.options.map((o: PlaygroundOption) => [o.key, o.default]))
  const values = signal<Record<string, unknown>>(defaults())
  const opts: PlayOption[] = spec.options.map((o: PlaygroundOption) => ({
    label: o.label, options: o.options, kind: o.kind === "text" ? undefined : o.kind, text: o.kind === "text", min: o.min, max: o.max, step: o.step, unit: o.unit,
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
  // ---- the code under the stage: written from the options (playground.ts › code); else the first code block of docs.md
  const extras = signal<readonly ExtraAttr[]>([])

  // ---- the stage: device, rotation, its own light / dark, direction, replay
  const device = signal<Device | null>(null), land = signal(false), rtl = signal(false), run = signal(0)
  const mode = signal<StageMode | null>(null)
  const dark = (): boolean => (mode() ?? resolvedTheme()) === "dark"
  const vars = scopedMode(mode)
  const wide = signal(true)
  // ---- "Parçalarına ayır": the same component on the stage comes apart (ExplodedView). A composite (meta.composedOf):
  // the components it is built from, found by their root classes; a plain component: its layers
  const apart = signal(false), picked = signal<string | null>(null)
  const plates = signal<readonly ExplodedPart[] | undefined>(undefined)
  const rootSel = (spec.code && typeof spec.code === "object" ? spec.code.root : undefined) ?? '[class^="m-"], [class*=" m-"]'
  const explode = (): void => {
    const next = !apart.peek()
    if (!next || !parts.length) { apart.set(next); return }
    void import("hadi-march/components/cards-roots.gen.ts").then(({ roots }) => {
      const stage = frame as Element, own = roots[props.entry.n]
      // the parts that are on the stage now; the composite's own surface (a Card that is its root) stays the base plate
      const found = parts.filter((name) => roots[name] && stage.querySelector(`.${roots[name]!}`))
        .map((name): ExplodedPart => ({ selector: `.${roots[name]!}`, label: name, ...(own && stage.querySelector(`.${roots[name]!}`)!.classList.contains(own) ? { level: 0 } : {}) }))
      // nothing of it on the stage (a Button's Spinner shows only while loading): the layers of the component itself
      plates.set(found.length ? found : undefined)
      apart.set(true)
    })
  }
  // one view for every stage look: the same element moves between the plain stage and the device screen
  const frame = <div class="sc-wb-frame" dir={() => (rtl() ? "rtl" : null)}>
    <ExplodedView open={apart()} parts={plates()} target={rootSel} fit={560} active={picked()} onPick={(id: string) => picked.set(picked.peek() === id ? null : id)} label="Parçalarına ayrılmış bileşen">
      {() => { run(); return untrack(() => <View values={live as never} />) }}
    </ExplodedView>
  </div>
  const tools = computed((): ToolbarItem[] => {
    const showLabel = wide()
    return [
      { id: "stage", label: "Sahne", icon: monitor, priority: 9, pressed: () => device() === null, onSelect: () => device.set(null) },
      { id: "tablet", label: "Tablet", icon: tablet, priority: 6, pressed: () => device() === "tablet", onSelect: () => device.set("tablet") },
      { id: "phone", label: "Telefon", icon: phone, priority: 8, pressed: () => device() === "phone", onSelect: () => device.set("phone") },
      { id: "rotate", label: "Döndür", icon: rotateCw, priority: 5, disabled: () => device() === null, onSelect: () => land.set(!land.peek()) },
      { id: "s1", separator: true },
      { id: "light", label: "Açık", icon: sun, priority: 4, showLabel, pressed: () => !dark(), onSelect: () => mode.set("light") },
      { id: "dark", label: "Koyu", icon: moon, priority: 4, showLabel, pressed: dark, onSelect: () => mode.set("dark") },
      { id: "s2", separator: true },
      { id: "rtl", label: "Sağdan sola", icon: pilcrow, priority: 3, showLabel, pressed: rtl, onSelect: () => rtl.set(!rtl.peek()) },
      { id: "explode", label: () => (apart() ? "Birleştir" : "Parçalarına ayır"), icon: layers, priority: 7, showLabel, pressed: apart, onSelect: explode },
    ]
  })
  const size = (): string => { const d = device(); if (!d) return ""; const [w, h] = SIZES[d]; return `${DEVICES[d].name} · ${land() ? h : w} × ${land() ? w : h}` }
  return <>
    {parts.length || props.entry.a ? <PartsRow parts={parts} api={props.entry.a} /> : null}
    <div class="sc-play sc-wb"><div class="sc-play-inner">
      <div class="sc-wb-box" ref={(x: Element) => { const c = viewport().container(x, { narrow: 0, wide: 600 }); effect(() => wide.set(c.up("wide"))) }}>
        <div class="sc-wb-bar" m:no-select>
          <OverflowToolbar label="Sahne araçları" items={tools} moreLabel="Diğer sahne araçları"
            end={<Button size="sm" variant="ghost" icon={refresh} title="Yeniden oynat" aria-label="Yeniden oynat" on:click={() => run.set(run.peek() + 1)}>{() => (wide() ? "Yeniden oynat" : null)}</Button>} />
        </div>
        <div class={() => `sc-play-stage sc-wb-stage${spec.stage === "center" || device() ? " sc-wb-center" : ""}${device() ? " sc-wb-device" : ""}${apart() ? " sc-wb-apart" : ""}${mode() ? ` sc-wb-${mode()}` : ""}`} style={vars}>
          {() => (device() ? <span class="sc-wb-devinfo">{size}</span> : null)}
          {() => { const d = device(); return d ? untrack(() => <DevicePreview device={DEVICES[d].id} landscape={land()} time="9:41" fitHeight={520} label={`${DEVICES[d].name} önizlemesi`}>{frame}</DevicePreview>) : frame }}
        </div>
        <CodeBox spec={props.spec} name={props.entry.n} values={values} extras={extras} fallback={props.code.trim()} frame={frame as Element} />
      </div>
      <div class="sc-play-panel" role="group" aria-label="Seçenekler">
        <div class="sc-wb-panel-head">
          <span class="sc-wb-panel-title">Seçenekler</span>
          <Button size="sm" variant="ghost" disabled={() => !changed()} on:click={() => { values.set(defaults()); extras.set([]) }}>Sıfırla</Button>
        </div>
        {opts.length ? opts.map(optionRow) : <p class="sc-wb-none">Bu bileşenin ayarlanacak seçeneği yok.</p>}
      </div>
    </div></div>
  </>
}
