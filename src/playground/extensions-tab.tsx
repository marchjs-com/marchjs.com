// The playground's extension tools: the Extensions tab (what the code registered with extend / intercept, and what each
// extension did to the component chosen: props before → after, wrapped callbacks, render, setup), the Properties
// panel's extension group (its options), and the editor's suggestions for the props extensions add (`<Button tr|` →
// track). The data comes from the preview runtime's March (its `extensions`), read after every build and props change.
import { Badge, Button, CodeView } from "hadi-march/ui";
import type { AppPlugin, LanguageService } from "hadi-march/app-ui";
import type { PlaygroundOption } from "hadi-march/components/meta.ts";
import "./extensions-tab.css";

import type { ExtInfo, Spec } from "./extensions-info.ts";
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

const EXAMPLE = `import { extend, intercept, defineExtension } from "hadi-march"
import { Button } from "hadi-march/ui"

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
      <b>{() => `Kayıtlı eklentiler (${props.info().list.length})`}</b>
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
          <span>Önizlemedeki kod henüz bir eklenti kaydetmedi. Bir dosyada <code>extend()</code> ya da <code>intercept()</code> çağır: kayıtlılar burada, seçili bileşene ne yaptıkları altta görünür.</span>
          <CodeView code={EXAMPLE} lang="tsx" copy label="Örnek eklenti" />
        </div>)}
    <div class="sc-ext-tab-head"><b>{() => `Seçili bileşen: ${props.selected() || "—"}`}</b></div>
    {() => {
      const name = props.selected(), info = props.info()
      const ran = info.traces.filter((t) => t.component === name || t.cell === name && t.component === name)
      const added = info.props[name] ?? []
      const warn = hiding(name)
      if (!ran.length && !added.length) return <p class="m-muted">Bu bileşene bir eklenti dokunmadı.</p>
      return <div class="sc-ext-tab-sel">
        {warn.length ? <p class="sc-ext-tab-warn">{`⚠ Bileşenin kendi özelliğini gizleyen eklenti özelliği: ${warn.join(", ")}`}</p> : null}
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
  return spec ? { group: `Eklenti: ${ext}`, spec } : null
}

/**
 * Wrap a plugin that provides the "language" service (marchLanguagePlugin) so that inside a component's tag the
 * props extensions add to it (and m:extend) come first.
 */
export function withExtensionSuggestions(plugin: AppPlugin, info: () => ExtInfo): AppPlugin {
  const attrs = (before: string): { comp: string; word: string } | null => {
    const lt = before.lastIndexOf("<")
    if (lt < 0) return null
    const m = /^<([A-Z][\w$.]*)\s(?:[^<>{}]|\{[^{}]*\})*?([\w:$-]*)$/.exec(before.slice(lt))
    return m ? { comp: m[1]!, word: m[2] ?? "" } : null
  }
  const wrap = (svc: LanguageService): LanguageService => ({
    complete: async (path, ctx) => {
      const at = attrs(ctx.before)
      if (at) {
        const rows = (info().props[at.comp] ?? []).flatMap((x) => Object.entries(x.props).map(([p, spec]) => ({ p, spec, ext: x.extension })))
          .filter((r) => r.p.toLowerCase().startsWith(at.word.toLowerCase()))
          .map((r) => ({ label: r.p, hint: `eklenti · ${r.ext}`, ...(r.spec.type === "boolean" ? {} : { insert: `${r.p}=""`, back: 1 }), doc: { kind: "property", signature: `${r.p}${r.spec.type ? `: ${r.spec.type}` : ""}`, ...(r.spec.doc ? { doc: r.spec.doc } : {}) } }))
        if ("m:extend".startsWith(at.word) && at.word.length >= 2) rows.push({ label: "m:extend", hint: "eklentiler", insert: "m:extend={false}", back: 0, doc: { kind: "property", signature: "m:extend: false | string[]", doc: "Bu örnek eklenti almaz (false) ya da yalnız adı verilenleri alır." } } as never)
        if (rows.length) return { from: ctx.caret - at.word.length, to: ctx.caret, items: rows }
      }
      return svc.complete ? svc.complete(path, ctx) : null
    },
  })
  return {
    ...plugin,
    activate(ctx) {
      return plugin.activate({ ...ctx, provide: (name: string, svc: unknown) => ctx.provide(name, name === "language" ? wrap(svc as LanguageService) : svc) })
    },
  }
}
