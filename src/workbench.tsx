// The workbench of a component card (ComponentDemo): a stage box (toolbar, stage, code) beside the options panel.
// One lazy part for every component page. The structural names the audits read stay: .sc-play > .sc-play-inner >
// .sc-play-stage + .sc-play-panel > .sc-play-opt.
import "./workbench.css";
import { signal, computed, effect, untrack, batch } from "hadi-march";
import { withParts } from "hadi-march/props";
import { Link, type Href } from "hadi-march/router";
import { Button, OverflowToolbar, resolvedTheme, type ToolbarItem } from "hadi-march/ui";
import type { PlaygroundOption, PlaygroundSpec } from "hadi-march/ui";
import { DevicePreview } from "hadi-march/components/layout/device-preview/index.ts";
import { ExplodedView, type ExplodedPart } from "hadi-march/components/layout/exploded-view/index.ts";
import { viewport } from "hadi-march/managers/viewport";
import { defineIcon, monitor, phone, sun, moon, pilcrow, refresh, rotateCw, layers } from "hadi-march/icons";
import { scopedMode, type StageMode } from "./stage-mode.ts";
import { partOptions, partsAttr, parseParts, choices, type ExtraAttr, type PartOption } from "./gen-code.ts";
import { CodeBox } from "./wb-code.tsx";
import { WorkbenchTabs } from "./wb-tabs.tsx";
import { cards, type CardEntry } from "hadi-march/components/cards.gen.ts";
import { optionRow, type PlayOption } from "./playground.tsx";
import { demoId, type DemoView } from "./component-demo.tsx";

/** The page that draws a component's own demo (cards.gen.ts › w), as a link target. */
const pageOf = (name: string): Href | null => { const part = cards.find((e) => e.n === name); return part?.w ? `${part.w}#${demoId(part.f)}` as Href : null }

/**
 * "Şunlardan oluşur": the parts of the component (a press chooses the part: the options panel turns to it) and the
 * link to its API entry, above the workbench.
 */
function PartsRow(props: { parts: readonly string[]; api?: string | undefined; chosen: () => string | null; choose: (name: string) => void }) {
  return <div class="sc-wb-parts">
    {props.parts.length ? <span class="sc-parts-label">Şunlardan oluşur</span> : null}
    {props.parts.map((name) => <button type="button" class="sc-part" aria-pressed={() => (props.chosen() === name ? "true" : "false")} title={`${name}: seçeneklerini aç`} on:click={() => props.choose(name)}>{name}</button>)}
    {props.api ? <Link class="sc-part sc-part-api" href={`/api/${props.api}` as Href} title="API başvurusu"><span aria-hidden="true">{"{ }"}</span>{props.api.split("/").pop()}</Link> : null}
  </div>
}

/** What is known of a part once it is loaded: the component itself (the key of the m:parts map) and its options. */
interface PartInfo { comp: unknown; options: PartOption[] }
type PartVals = Record<string, Record<string, unknown>>

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
  const userExtras = signal<readonly ExtraAttr[]>([])

  // ---- the parts of a composite (m:parts): a chosen part's own playground options, written on it from outside.
  // partVals: per part, the props set on it; they reach the stage through withParts and the code as m:parts
  const partVals = signal<PartVals>({}), partInfo = signal<Record<string, PartInfo>>({}), chosen = signal<string | null>(null)
  let loading: Promise<void> | null = null
  /** Load every part once: its component (cards-parts.gen.ts) and its playground. */
  const loadParts = (): Promise<void> => (loading ??= import("hadi-march/components/cards-parts.gen.ts").then(async ({ parts: loaders }) => {
    const info: Record<string, PartInfo> = {}
    await Promise.all(parts.map(async (name) => {
      const card = cards.find((e) => e.n === name)
      const [comp, spec] = await Promise.all([loaders[name]?.().catch(() => undefined), card ? card.playground().then((m) => m.default).catch(() => null) : null])
      if (comp) info[name] = { comp, options: spec ? partOptions(spec) : [] }
    }))
    partInfo.set(info)
  }))
  const choose = (name: string | null): void => {
    if (!name || !parts.includes(name)) { chosen.set(null); return }
    void loadParts().then(() => chosen.set(chosen.peek() === name ? null : name))
  }
  const known = (): Record<string, readonly PartOption[]> => Object.fromEntries(Object.entries(partInfo()).map(([name, i]) => [name, i.options]))
  const setPart = (name: string, prop: string, value: unknown): void => {
    const all = { ...partVals.peek() }, own = { ...all[name] }
    if (value === undefined) delete own[prop]; else own[prop] = value
    if (Object.keys(own).length) all[name] = own; else delete all[name]
    partVals.set(all)
  }
  // the attributes the code shows after the options: m:parts first, then what was typed by hand
  const allExtras = computed((): readonly ExtraAttr[] => { const code = partsAttr(partVals()); return code ? [{ name: "m:parts", value: code }, ...userExtras()] : userExtras() })
  const extras = Object.assign(() => allExtras(), {
    peek: (): readonly ExtraAttr[] => untrack(allExtras),
    set: (list: readonly ExtraAttr[]): void => {
      const mp = list.find((x) => x.name === "m:parts")
      const read = (): void => { partVals.set(mp ? parseParts(mp.value, untrack(known)).values : {}) }
      batch(() => { userExtras.set(list.filter((x) => x.name !== "m:parts")); if (!mp || Object.keys(partInfo.peek()).length) read() })
      // the parts are not loaded yet (m:parts typed before any part was chosen): read it when they are
      if (mp && Object.keys(partInfo.peek()).length === 0) void loadParts().then(read)
    },
  })
  const extraErrors = (list: readonly ExtraAttr[]): string[] => { const mp = list.find((x) => x.name === "m:parts"); return mp && Object.keys(partInfo.peek()).length ? parseParts(mp.value, untrack(known)).errors : [] }
  const partsMap = (): Map<never, Record<string, unknown>> => { const info = partInfo(), out = new Map<never, Record<string, unknown>>(); for (const [name, own] of Object.entries(partVals())) if (info[name]) out.set(info[name]!.comp as never, own); return out }
  // a prop that was not set on a part when it was drawn cannot follow later: the stage is drawn again when the SET of
  // props changes (a change of a value is live)
  const shape = computed(() => Object.entries(partVals()).map(([name, own]) => `${name}:${Object.keys(own).sort().join(",")}`).sort().join("|"))

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
  // ---- a composite on the stage: a press on one of its parts chooses it (its options open), hovering outlines it.
  // The parts are found by their root classes (cards-roots.gen.ts); the innermost one under the pointer wins
  let rootsOf: Record<string, string> | null = null
  if (parts.length) void import("hadi-march/components/cards-roots.gen.ts").then((m) => { rootsOf = m.roots })
  const partAt = (target: EventTarget | null): [string, Element] | null => {
    if (!rootsOf || !(target instanceof Element)) return null
    let best: [string, Element] | null = null
    for (const name of parts) {
      const cls = rootsOf[name], el = cls ? target.closest(`.${cls}`) : null
      if (el && (frame as Element).contains(el) && (!best || best[1].contains(el))) best = [name, el]
    }
    return best
  }
  let hovered: Element | null = null
  const hover = (el: Element | null): void => { if (hovered === el) return; hovered?.classList.remove("sc-wb-hover"); hovered = el; el?.classList.add("sc-wb-hover") }
  const marked = new Set<Element>()
  effect(() => {
    const name = chosen(), cls = name && rootsOf?.[name]; run(); shape()
    for (const el of marked) el.classList.remove("sc-wb-chosen")
    marked.clear()
    if (cls && !apart()) queueMicrotask(() => (frame as Element).querySelectorAll(`.${cls}`).forEach((el) => { el.classList.add("sc-wb-chosen"); marked.add(el) }))
  })
  const stageEvents = parts.length ? {
    "on:click": (e: MouseEvent) => {
      if (apart.peek()) return
      const hit = partAt(e.target)
      if (!hit) { chosen.set(null); return }
      void loadParts().then(() => chosen.set(hit[0]))
    },
    "on:pointerover": (e: PointerEvent) => { if (!apart.peek()) hover(partAt(e.target)?.[1] ?? null) },
    "on:pointerleave": () => hover(null),
  } : {}
  // one view for every stage look: the same element moves between the plain stage and the device screen
  const frame = <div class={`sc-wb-frame${parts.length ? " sc-wb-pickable" : ""}`} dir={() => (rtl() ? "rtl" : null)} {...stageEvents}>
    <ExplodedView open={apart()} parts={plates()} target={rootSel} fit={560} active={chosen() ?? picked()} label="Parçalarına ayrılmış bileşen"
      onPick={(id: string) => { if (parts.includes(id)) choose(id); else picked.set(picked.peek() === id ? null : id) }}>
      {() => { run(); shape(); return untrack(() => withParts(partsMap, () => <View values={live as never} />)) }}
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
  const reset = (): void => {
    const name = chosen.peek()
    if (name) { const all = { ...partVals.peek() }; delete all[name]; partVals.set(all); return }
    batch(() => { values.set(defaults()); userExtras.set([]); partVals.set({}) })
  }
  const canReset = (): boolean => { const name = chosen(); return name ? !!partVals()[name] : changed() || allExtras().length > 0 }
  const hint = (): string => (chosen() ? "Bu parçada yaptığın değişiklik bileşenin koduna m:parts olarak yazılır." : "Bileşenin kendi seçenekleri. Bir parçanın seçenekleri için sahnede ona ya da yukarıda adına tıkla.")
  const moreProps = (): { name: string; hint: string; value: string }[] => (parts.length ? [{ name: "m:parts", hint: "parçaların özellikleri", value: `={{ ${parts[0]!}: {  } }}` }] : [])
  /** The options panel of a chosen part: the options of its own playground that work from outside. */
  const partRows = (name: string): unknown => {
    const list = partInfo.peek()[name]?.options ?? [], page = pageOf(name)
    const rows: PlayOption[] = list.map((po): PlayOption => {
      const o = po.option, all = choices(o)
      const now = (): unknown => partVals()[name]?.[po.prop]
      return {
        label: o.label, options: o.options, kind: o.kind === "text" ? undefined : o.kind, min: o.min, max: o.max, step: o.step, unit: o.unit,
        // a choice shows as chosen when the part has exactly what it writes; nothing set: the choice that writes nothing
        get: () => { const v = now(); return all ? all.find((c) => po.value(c) === v) : v ?? o.default },
        set: ((c: unknown) => setPart(name, po.prop, all ? po.value(c) : c)) as (v: never) => void,
      }
    })
    return <div class="sc-wb-rows sc-wb-part-rows">
      {rows.length ? rows.map(optionRow) : <p class="sc-wb-none">Bu parçanın buradan ayarlanan seçeneği yok.</p>}
      {page ? <p class="sc-wb-none"><Link href={page}>{`${name} sayfasını aç`}</Link></p> : null}
    </div>
  }
  const size = (): string => { const d = device(); if (!d) return ""; const [w, h] = SIZES[d]; return `${DEVICES[d].name} · ${land() ? h : w} × ${land() ? w : h}` }
  return <>
    {parts.length || props.entry.a ? <PartsRow parts={parts} api={props.entry.a} chosen={chosen} choose={choose} /> : null}
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
        <CodeBox spec={props.spec} name={props.entry.n} values={values} extras={extras} fallback={props.code.trim()} frame={frame as Element} extraErrors={extraErrors} suggestMore={moreProps} />
      </div>
      <div class="sc-play-panel" role="group" aria-label="Seçenekler">
        <div class="sc-wb-panel-head">
          {parts.length
            ? <span class="sc-wb-path"><button type="button" class="sc-wb-crumb" aria-current={() => (chosen() ? null : "true")} title="Bileşenin kendi seçenekleri" on:click={() => chosen.set(null)}>{props.entry.n}</button>
              {() => (chosen() ? <><span aria-hidden="true">›</span><span class="sc-wb-crumb" aria-current="true">{chosen()}</span></> : null)}</span>
            : <span class="sc-wb-panel-title">Seçenekler</span>}
          <Button size="sm" variant="ghost" disabled={() => !canReset()} on:click={reset}>Sıfırla</Button>
        </div>
        {parts.length ? <p class="sc-wb-hint">{hint}</p> : null}
        <div class="sc-wb-rows" hidden={() => !!chosen()}>
          {opts.length ? opts.map(optionRow) : <p class="sc-wb-none">Bu bileşenin ayarlanacak seçeneği yok.</p>}
        </div>
        {() => { const name = chosen(); return name ? untrack(() => partRows(name)) : null }}
      </div>
    </div></div>
    <WorkbenchTabs entry={props.entry} spec={spec} values={values} />
  </>
}
