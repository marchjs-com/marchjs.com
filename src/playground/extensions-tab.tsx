// The playground's extension tools: the Extensions tab (what the code registered with extend / intercept, and what each
// extension did to the component chosen: props before → after, wrapped callbacks, render, setup), the Properties
// panel's extension group (its options), and the editor's suggestions for the props extensions add (`<Button tr|` →
// track). The data comes from the preview runtime's March (its `extensions`), read after every build and props change.
import { Badge, Button, CodeView } from "march/ui";
import type { AppPlugin, LanguageService } from "march/app-ui";
import type { PlaygroundOption } from "march/components/meta.ts";
import "./extensions-tab.css";

import type { ExtInfo, Spec } from "./extensions-info.ts";
import { tagPlace, codeRows, iconRows, type HelperData } from "./prop-helpers.ts";
import { tagAt, valueAt, writtenProps, insertOf, propAt, componentAt, shortType, firstSentence, docOf, GROUP_ORDER, type OwnProp } from "./prop-suggest.ts";
export type { ExtInfo } from "./extensions-info.ts";
export const NO_EXT: ExtInfo = { list: [], props: {}, traces: [] };

const DID: Record<string, string> = { props: "özellikleri değiştirdi", on: "geri çağrıları sardı", render: "çıktıyı sardı / değiştirdi", setup: "çizimden sonra çalıştı", adds: "özellik ekler" };
const show = (v: unknown): string => {
  if (typeof v === "function") return "ƒ"
  if (typeof v === "string") return JSON.stringify(v)
  try { return JSON.stringify(v) ?? String(v) } catch { return String(v) }
}
/** The keys a props step changed, with their values before and after. */
const changes = (s: ExtInfo["traces"][number]["steps"][number]): [string, string, string][] => {
  if (!s.before || !s.after) return []
  const keys = new Set([...Object.keys(s.before), ...Object.keys(s.after)])
  return [...keys].filter((k) => show(s.before![k]) !== show(s.after![k])).map((k) => [k, k in s.before! ? show(s.before![k]) : "—", show(s.after![k])])
}

const EXAMPLE = `import { extend, intercept, defineExtension } from "march"
import { Button } from "march/ui"

const track = defineExtension({
  name: "track",
  props: { track: { type: "string", doc: "Tıklamada gönderilen olay" } },
  setup: ({ props, roots }) => roots().forEach((el) => el.addEventListener("click", () => console.log("olay", props.track))),
})
extend([Button], track)
intercept(Button, { name: "small", props: (p) => ({ size: p.size ?? "sm" }) })

export const Demo = () => <Button track="save">Kaydet</Button>`

/**
 * The Extensions tab. `ownProps(name)`: the component's own props (the API reference / its type), so an extension prop
 * that hides one is pointed out.
 */
export function ExtensionsPanel(props: { info: () => ExtInfo; selected: () => string; ownProps: (name: string) => readonly string[]; refresh: () => void }) {
  const hiding = (name: string): string[] => {
    const own = new Set(props.ownProps(name))
    return (props.info().props[name] ?? []).flatMap((x) => Object.keys(x.props).filter((k) => own.has(k)).map((k) => `${x.extension} → ${k}`))
  }
  return <div class="sc-ext-tab">
    <div class="sc-ext-tab-head">
      <b>{() => `Kayıtlı askılar (${props.info().list.length})`}</b>
      <Button size="sm" variant="ghost" onClick={() => props.refresh()}>Yenile</Button>
    </div>
    {() => (props.info().list.length
      ? <ul class="sc-ext-tab-list">{props.info().list.map((x) => <li>
          <code>{x.name}</code>
          <span class="m-muted">{x.target === "*" ? "her bileşen" : x.target === "test" ? "test" : x.target}</span>
          <Badge tone={x.scope === "global" ? "info" : "neutral"}>{x.scope === "global" ? "genel" : "kapsamlı"}</Badge>
          {x.order ? <Badge tone="neutral">{`sıra ${x.order}`}</Badge> : null}
          {x.does.map((d) => <span class="sc-ext-tab-chip" title={DID[d] ?? d}>{d}</span>)}
          {Object.keys(x.props).map((p) => <span class="sc-ext-tab-prop" title={x.props[p]?.doc ?? ""}>{p}</span>)}
        </li>)}</ul>
      : <div class="sc-ext-tab-empty">
          <span>Önizlemedeki kod henüz bir askı kaydetmedi. Bir dosyada <code>extend()</code> ya da <code>intercept()</code> çağır: kayıtlılar burada, seçili bileşene ne yaptıkları altta görünür.</span>
          <CodeView code={EXAMPLE} lang="tsx" copy label="Örnek askı" />
        </div>)}
    <div class="sc-ext-tab-head"><b>{() => `Seçili bileşen: ${props.selected() || "—"}`}</b></div>
    {() => {
      const name = props.selected(), info = props.info()
      const ran = info.traces.filter((t) => t.component === name || t.cell === name && t.component === name)
      const added = info.props[name] ?? []
      const warn = hiding(name)
      if (!ran.length && !added.length) return <p class="m-muted">Bu bileşene bir askı dokunmadı.</p>
      return <div class="sc-ext-tab-sel">
        {warn.length ? <p class="sc-ext-tab-warn">{`⚠ Bileşenin kendi özelliğini gizleyen askı özelliği: ${warn.join(", ")}`}</p> : null}
        {added.length ? <p>Eklenen özellikler: {added.flatMap((x) => Object.keys(x.props).map((p) => <span class="sc-ext-tab-prop" title={x.props[p]?.doc ?? ""}>{`${p} (${x.extension})`}</span>))}</p> : null}
        {ran.map((t, i) => <div class="sc-ext-tab-run">
          <span class="m-muted">{`${i + 1}. örnek (${t.cell})`}</span>
          <ol>{t.steps.map((s) => <li>
            <code>{s.name}</code> <span>{s.did.map((d) => DID[d] ?? d).join(", ")}</span>
            {changes(s).length ? <table class="sc-ext-tab-diff"><tbody>{changes(s).map(([k, a, b]) => <tr><th>{k}</th><td>{a}</td><td>→</td><td>{b}</td></tr>)}</tbody></table> : null}
          </li>)}</ol>
        </div>)}
      </div>
    }}
  </div>
}

/** The Properties panel's options for the props extensions add to `name` (key `ext:<extension>:<prop>`). */
export function extensionOptions(info: ExtInfo, name: string, own: ReadonlySet<string>): PlaygroundOption[] {
  const out: PlaygroundOption[] = []
  for (const x of info.props[name] ?? []) for (const [prop, spec] of Object.entries(x.props)) {
    if (own.has(prop)) continue
    out.push({ key: `ext:${x.extension}:${prop}`, label: prop, prop, default: spec.default ?? (spec.type === "boolean" ? false : spec.type === "number" ? null : ""), kind: "text" } as PlaygroundOption)
  }
  return out
}
/** The spec of an extension option (its group, type, values and text for the Properties panel). */
export function extensionSpec(info: ExtInfo, name: string, key: string): { group: string; spec: Spec } | null {
  const [, ext, prop] = /^ext:([^:]+):(.+)$/.exec(key) ?? []
  const x = (info.props[name] ?? []).find((e) => e.extension === ext)
  const spec = prop ? x?.props[prop] : undefined
  return spec ? { group: `Askı: ${ext}`, spec } : null
}

export type { OwnProp }
/** A prop whose place has helpers (its values, icons, sx / m:parts' objects, a handler): picking it asks again. */
const helps = (p: OwnProp): boolean => !!(p.values?.length || p.icon || p.insert || /^on[A-Z]|^on:|^ref$/.test(p.name))
/**
 * Wrap a plugin that provides the "language" service (marchLanguagePlugin) so that inside a component's tag the
 * props extensions add to it (and m:extend) come first, then the component's own props with their types and texts
 * (`own`: the API reference's props of a component, by its name). Resting the pointer on a prop's name shows the same.
 */
export function withExtensionSuggestions(plugin: AppPlugin, info: () => ExtInfo, own?: (comp: string) => Promise<readonly OwnProp[]>,
  component?: (name: string) => Promise<{ sub?: string; summary?: string } | null>,
  more: Omit<HelperData, "own"> = {}): AppPlugin {
  const icons = more.icons
  const attrs = tagAt
  const wrap = (svc: LanguageService): LanguageService => ({
    complete: async (path, ctx) => {
      // inside a prop's quotes (`variant="|"`): the words it takes, narrowing as they are typed
      const v = valueAt(ctx.before)
      if (v) {
        const p = own ? (await own(v.comp).catch(() => [] as readonly OwnProp[])).find((x) => x.name === v.prop) : undefined
        const items = (p?.values ?? []).filter((w) => w.toLowerCase().startsWith(v.typed.toLowerCase()))
          .map((w) => ({ label: w, hint: v.prop, doc: { kind: "değer", signature: `${v.prop}="${w}"`, ...(p?.doc ? { doc: firstSentence(p.doc) } : {}) } }))
        return { from: ctx.caret - v.typed.length, to: ctx.caret, items, all: true, open: true }
      }
      // inside an icon prop's braces (`icon={|`): the file's icons, March's, every pack's (Lucide, Tabler…), defineIcon
      const place = tagPlace(ctx.before)
      const c = place?.at === "code" && place.frames.length === 1 && !place.quoted ? place : null
      const ip = c && own ? (await own(c.comp).catch(() => [] as readonly OwnProp[])).find((x) => x.name === c.prop) : undefined
      if (c && ip?.icon) {
        const [march, packs] = await Promise.all([icons ? icons().catch(() => [] as readonly string[]) : [], more.packs ? more.packs().catch(() => []) : []])
        return { from: ctx.caret - c.typed.length, to: ctx.caret, items: iconRows(c.prop, c.typed, ctx.value, march, packs) as never, all: true, open: true }
      }
      // inside any other prop's braces: sx's keys and values, m:parts' components, props and values, a handler for an
      // event, true / false, the file's signals (prop-helpers.ts); nothing to offer: the language service answers
      if (place?.at === "code" && own) {
        const rows = await codeRows(place, ctx.value, { ...more, own })
        if (rows) return { from: ctx.caret - place.typed.length, to: ctx.caret, items: rows as never, all: true, open: true }
        return svc.complete ? svc.complete(path, ctx) : null
      }
      // inside a component's tag (after its name and a space): its props not written yet, March's first, then the common
      // ones (m:…, sx), then the HTML attributes; open at once, narrowing as the name is typed
      const at = attrs(ctx.before) ?? (place?.at === "attr" ? { comp: place.comp, word: place.word, tag: place.tag } : null)
      if (at) {
        const written = new Set([...writtenProps(at.tag, ctx.value, ctx.caret), ...(place?.at === "attr" ? place.props : [])])
        // the word being typed is no written prop (`<Button sx|`: sx is still offered, Tab takes it)
        if (at.word) written.delete(at.word)
        const list = own ? await own(at.comp).catch(() => [] as readonly OwnProp[]) : []
        const fits = (name: string): boolean => !written.has(name) && name.toLowerCase().startsWith(at.word.toLowerCase())
        const rows = list.filter((p) => fits(p.name)).map((p) => ({
          label: p.name, group: p.group ?? "March", hint: p.values?.length ? p.values.slice(0, 4).join(" · ") : shortType(p.type, 28),
          ...insertOf(p), ...(helps(p) ? { again: true } : {}), doc: docOf(p),
        }))
        if (fits("m:extend")) rows.push({ label: "m:extend", group: "Ortak", hint: "askılar", insert: "m:extend={false}", back: 0, doc: { kind: "property", signature: "m:extend: false | string[]", doc: "Bu örnek askı almaz (false) ya da yalnız adı verilenleri alır." } } as never)
        const order = (g: string): number => { const i = GROUP_ORDER.indexOf(g); return i < 0 ? GROUP_ORDER.length : i }
        rows.sort((a, b) => order(a.group) - order(b.group))
        return { from: ctx.caret - at.word.length, to: ctx.caret, items: rows as never, all: true, open: true }
      }
      return svc.complete ? svc.complete(path, ctx) : null
    },
    hover: async (path, q) => {
      // the word under the pointer, inside a component's tag: an extension's prop or the component's own
      const at = propAt(q.value, q.at)
      if (at) {
        for (const x of info().props[at.comp] ?? []) { const spec = x.props[at.name]; if (spec) return { kind: `askı · ${x.extension}`, signature: `${at.name}${spec.type ? `: ${spec.type}` : ""}`, ...(spec.doc ? { doc: spec.doc } : {}) } }
        const p = own ? (await own(at.comp).catch(() => [] as readonly OwnProp[])).find((x) => x.name === at.name) : undefined
        if (p) return { ...docOf(p), kind: `${at.comp} · özellik` }
      }
      // a component's name (its tag, its import): what it is, where it comes from, what it does and its props
      const name = !at ? componentAt(q.value, q.at) : null
      const c = name && component ? await component(name).catch(() => null) : null
      if (name && c) {
        const props = own ? await own(name).catch(() => [] as readonly OwnProp[]) : []
        return {
          kind: c.sub ? `bileşen · ${c.sub}` : "bileşen",
          signature: c.sub ? `import { ${name} } from "${c.sub}"` : `<${name} />`,
          ...(c.summary ? { doc: c.summary } : {}),
          ...(props.length ? { list: props.filter((x) => x.name !== "children").map((x) => ({ label: `${x.name}${x.type ? `: ${shortType(x.type)}` : ""}`, ...(x.doc ? { doc: firstSentence(x.doc) } : {}) })) } : {}),
        }
      }
      return svc.hover ? svc.hover(path, q) : null
    },
  })
  return {
    ...plugin,
    activate(ctx) {
      return plugin.activate({ ...ctx, provide: (name: string, svc: unknown) => ctx.provide(name, name === "language" ? wrap(svc as LanguageService) : svc) })
    },
  }
}
