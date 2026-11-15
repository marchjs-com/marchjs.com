// Playground: the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal / lang.json on the right. The
// .tsx tabs are files: the code editor plugin opens them, the March language plugin suggests March's exports. Button.tsx exports
// the component under work; Properties shows its options, and the build renders it with them (PreviewControl.tsx). Every
// change is built in the page (playground/build.ts): the Console shows each step with its time and the errors,
// lang.json the texts the build found. No tab has a close mark (groups still collapse to strips).
import "./playground.css";
import { signal, computed, effect, untrack, onCleanup } from "hadi-march";
import { registry } from "hadi-march/components/registry.gen.ts";
import type { PlaygroundOption } from "hadi-march/components/meta.ts";
import { appUrl } from "hadi-march/base";
import { PaletteButton, JsonView, Terminal, PropertyGrid, IconPicker, type TerminalApi, type PropertySpec } from "hadi-march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, typeScriptPlugin, groups, type DockApi, row, col, tabs, type AppPanel, type Preset, type MarchCatalog } from "hadi-march/app-ui";
import { monitor, sliders, packageBox, users, code, terminal, bug, fileText, globe } from "hadi-march/icons";
import { createBuilder } from "../playground/build.ts";

const empty = (name: string) => () => <div class="sc-playground-empty"><b>{name}</b><span>Boş panel</span></div>
const panel = (id: string, title: string, icon: unknown): AppPanel => ({ id, title, icon, content: empty(title) })

// the component's files (kept for this visit)
const SOURCES: Record<string, string> = {
  "Button.tsx": `export { Button } from "hadi-march/ui"
`,
  "Component2.tsx": `import { Card, Badge } from "hadi-march/ui"

export function Component2(props: { title: string; count: number }) {
  return <Card title={props.title}>
    <Badge tone="info">{props.count} yeni</Badge>
  </Card>
}
`,
  "Component3.tsx": `import { signal, computed } from "hadi-march"

const items = signal(["elma", "armut"])
const total = computed(() => items().length)

export const Component3 = () => <p>{total()} öğe</p>
`,
}
// every file's text, made first: what reads them (the exported name, the build) finds them all
const files = new Map(Object.entries(SOURCES).map(([p, text]) => [p, signal(text)] as const))
const fileTab = (id: string, path: string): AppPanel => {
  const text = files.get(path) ?? signal("")
  return { id, title: path, icon: fileText, file: { path, text, set: (v: string) => text.set(v) } }
}

// the component under work: the first name Button.tsx exports; its Properties are the options of its showcase card
// (its playground.ts); the preview entry renders it with the values chosen there
// a playground, not a project: the code tab in front (of the files' group) is the one built, previewed, translated
// (lang.json) and whose Properties show; the others wait
const ENTRY = "PreviewControl.tsx"
const FILE_OF: Record<string, string> = { c1: "Button.tsx", c2: "Component2.tsx", c3: "Component3.tsx" }
const active = signal("Button.tsx")
const followTabs = (api: DockApi) => {

  effect(() => {
    const L = api.layout()
    if (!L) return
    // the files' group: the group that holds a file tab; its front tab is the file in work
    const g = groups(L.root).find((x) => x.panels.some((id) => id in FILE_OF))
    const file = g?.active ? FILE_OF[g.active] : undefined
    if (file && file !== untrack(active)) { active.set(file); print(`[${stamp()}] ${file} sekmesi etkin`, "info") }
  })
}
const exportedName = computed(() => {
  const src = files.get(active())?.() ?? ""
  return /export\s*\{\s*([A-Za-z_$][\w$]*)/.exec(src)?.[1] ?? /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/.exec(src)?.[1] ?? ""
})
const options = signal<readonly PlaygroundOption[]>([])
// an option that takes an icon (icon, iconEnd…): chosen with an IconPicker, kept as the icon's name. A yes / no icon
// option of the card (Button's "İkon" with toCode {plus}) starts at the icon its code names.
const isIcon = (o: PlaygroundOption): boolean => /icon/i.test(String(o.prop || o.key)) && !/spinner/i.test(o.key)
const iconDefault = (o: PlaygroundOption): string | null => {
  if (typeof o.default === "string") return o.default || null
  if (o.default !== true) return null
  const code = typeof o.toCode === "object" ? (o.toCode as Record<string, unknown>)["true"] : null
  return typeof code === "string" ? (/^\{([A-Za-z_$][\w$]*)\}$/.exec(code)?.[1] ?? null) : null
}
const values = signal<Record<string, unknown>>({})
effect(() => {
  const name = exportedName(), entry = registry.find((e) => e.meta.name === name)
  if (!entry) { options.set([]); values.set({}); return }
  void entry.playground().then((m) => {
    if (untrack(exportedName) !== name) return
    const list = (m.default as { options: readonly PlaygroundOption[] }).options.filter((o) => o.prop !== false)
    options.set(list)
    values.set(Object.fromEntries(list.map((o) => [o.key, isIcon(o) ? iconDefault(o) : o.default])))
  })
})
const asProperty = (o: PlaygroundOption): PropertySpec => {
  if (isIcon(o)) return { key: o.key, label: o.label, control: (cp: Record<string, unknown>) => IconPicker({ value: () => (cp["value"] as string | null) ?? null, onChange: (n: string | null) => (cp["setValue"] as (v: unknown) => void)(n), label: o.label }) } as PropertySpec
  const opts = o.options?.map((x) => (typeof x === "object" ? x : { value: x, label: String(x) }))
  const type = typeof o.default === "boolean" ? "switch" : opts ? (opts.length <= 4 ? "segmented" : "select") : typeof o.default === "number" ? (o.min !== undefined && o.max !== undefined ? "slider" : "number") : "text"
  return { key: o.key, label: o.label, type, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}), ...(opts ? { options: opts } : {}), ...(o.min !== undefined ? { min: o.min } : {}), ...(o.max !== undefined ? { max: o.max } : {}), ...(o.step !== undefined ? { step: o.step } : {}) } as PropertySpec
}
// one prop of the entry's JSX: a string as an attribute, the rest as an expression; children between the tags
// the preview entry: the exported component, rendered by the preview runtime with the Properties' values. The values
// are not written into the code: they go to the rendered component through a live channel (setProps), so changing a
// property needs no build; only a change of the files (or of the exported name) builds again.
const entrySource = computed(() => {
  const name = exportedName()
  return name ? `import { ${name} } from "./${active()}"\n\nexport default ${name}\n` : "export default function PreviewControl() { return null }\n"
})
// an option whose card writes its value as code of its own (toCode: Button's spinner "off" → {false}, "own" →
// {<MyDots />}): the code turned into a value the preview can take. null: the prop is left out; a literal: its value;
// an icon's name: the icon (as "icon:name", the runtime takes it); a JSX part of the card's own: a stand-in "•••".
const OMIT = Symbol("omit")
function fromCode(o: PlaygroundOption, x: unknown, v: Record<string, unknown>): unknown {
  const map = o.toCode
  const code = typeof map === "function" ? (map as (x: unknown, v: unknown) => unknown)(x, v) : (map as Record<string, unknown>)[String(x)]
  if (code === undefined) return x
  if (code === null) return OMIT
  const inner = /^\{([\s\S]*)\}$/.exec(String(code))?.[1]?.trim() ?? String(code)
  if (/^(true|false|null|-?\d+(\.\d+)?|"[^"]*")$/.test(inner)) return JSON.parse(inner)
  if (/^[A-Za-z_$][\w$]*$/.test(inner)) return `icon:${inner}`
  if (inner.startsWith("<")) return "•••"
  return OMIT
}
// the Properties' values as the component's props: the shown options only, empty / off left out
const propsOf = (v: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const o of options()) {
    const prop = o.prop || o.key
    out[prop] = undefined
    if (o.visibleWhen && !o.visibleWhen(v as never)) continue
    const x = o.toCode && !isIcon(o) ? fromCode(o, v[o.key], v) : v[o.key]
    if (x === OMIT || x === "" || x === null || (x === false && !o.toCode)) continue
    out[prop] = x
  }
  return out
}
const propsPanel = () => <div class="sc-props">
  {() => (options().length
    ? <PropertyGrid properties={() => options().map(asProperty)} value={values} onChange={(v: Record<string, unknown>) => values.set({ ...v })} label={`${exportedName()} özellikleri`} saved={values} history={false} dirty={false} search={false} />
    : <div class="sc-playground-empty"><b>Özellik yok</b><span>{exportedName() ? `${exportedName()} prop almıyor` : "Dışa aktarılan bileşen yok"}</span></div>)}
</div>

// the build: its steps go to the Console (lines written before the Console is there wait for it)
let consoleApi: TerminalApi | null = null
const waiting: [string, Parameters<TerminalApi["print"]>[1]][] = []
type Tone = "success" | "warn" | "error" | "info" | "muted"
const print = (text: string, tone?: Tone) => { if (consoleApi) consoleApi.print(text, { tone }); else waiting.push([text, { tone }]) }
const builder = createBuilder(print)
const stamp = () => new Date().toLocaleTimeString("tr-TR", { hour12: false })
const consolePanel = () => <Terminal readonly scheme="dark" height="100%" label="Derleme çıktısı" class="sc-console"
  ref={(api: TerminalApi) => { consoleApi = api; for (const [t, o] of waiting.splice(0)) api.print(t, o) }} />
// lang.json: the texts the last build found (JSX text, titles, labels…), as a locale file lists them
const langJson = () => Object.fromEntries(builder.texts().map((k) => [k, ""]))

// the preview (AppPreview): its toolbar sets the preview's own theme, accent and light / dark; each successful build's
// PreviewControl is rendered in the middle of its stage by the preview runtime (playground/preview.js, loaded once)
let previewEl: HTMLElement | null = null
type Runtime = { run(code: string, el: HTMLElement, props?: Record<string, unknown>): Promise<void>; setProps(props: Record<string, unknown>): void; stop(): void }
let runtime: Promise<Runtime> | null = null
const loadRuntime = () => (runtime ??= (async () => {
  // its components' stylesheet, once
  const link = document.createElement("link")
  link.rel = "stylesheet"; link.href = appUrl("playground/preview.css")
  document.head.append(link)
  return await import(/* @vite-ignore */ appUrl("playground/preview.js")) as Runtime
})())
async function render(code: string): Promise<void> {
  if (!previewEl) return
  const t0 = performance.now()
  try {
    await (await loadRuntime()).run(code, previewEl, propsOf(untrack(values)))
    print(`[${stamp()}] Önizleme çizildi · ${Math.round(performance.now() - t0)} ms`, "success")
  } catch (e) {
    print(`[${stamp()}] ✖ Çalışma hatası: ${String((e as Error)?.message ?? e)}`, "error")
  }
}
const preview = () => <AppPreview toolbar={{ theme: true, accent: true, mode: true }}>
  <div class="sc-pv-root" ref={(el: HTMLElement) => { previewEl = el }}>
    <div class="sc-playground-empty"><b>Önizleme</b><span>Derleniyor…</span></div>
  </div>
</AppPreview>

const PANELS: AppPanel[] = [
  { id: "preview", title: "Önizleme", icon: monitor, content: preview },
  { id: "props", title: "Özellikler", icon: sliders, disabled: () => !options().length, content: propsPanel },
  panel("deps", "Bağımlılıklar", packageBox),
  panel("a11y", "Erişilebilirlik", users),
  fileTab("c1", "Button.tsx"),
  fileTab("c2", "Component2.tsx"),
  fileTab("c3", "Component3.tsx"),
  { id: "console", title: "Konsol", icon: code, content: consolePanel },
  panel("debug", "Hata ayıklayıcı", bug),
  panel("terminal", "Terminal", terminal),
  { id: "i18n", title: "lang.json", icon: globe, content: () => <div class="sc-lang"><JsonView value={langJson} open={2} label="Çevrilecek metinler" /></div> },
]
const PRESETS: Record<string, Preset> = {
  main: {
    title: "Playground",
    tree: () => row(
      [0.6, col([0.7, tabs("preview")], [0.3, row([0.5, tabs("props")], [0.5, tabs(["deps", "a11y"])])])],
      [0.4, col([0.7, tabs(["c1", "c2", "c3"])], [0.3, tabs(["console", "debug", "terminal", "i18n"])])],
    ),
  },
}
// March's exports for the suggestions: the API reference's index (one JSON file, fetched when the playground opens)
const catalog = (): Promise<MarchCatalog> => fetch(appUrl("api/index.tr.json")).then((r) => r.json() as Promise<MarchCatalog>)
// the TypeScript language service in a worker (the build copies it, the compiler and the lib files to playground/)
const typescript = typeScriptPlugin({ worker: appUrl("playground/ts-worker.js"), typescript: appUrl("playground/ts/typescript.js"), lib: appUrl("playground/ts/") })
const PLUGINS = [typescript, codeEditorPlugin(), marchLanguagePlugin({ catalog })]

export default function PlaygroundPage(props: { name?: string }) {
  // every change is built a moment after typing stops
  let timer: ReturnType<typeof setTimeout> | undefined
  effect(() => {
    // only the file in front (and the entry that renders it)
    const path = active()
    const now = { [path]: files.get(path)?.() ?? "", [ENTRY]: entrySource() }
    clearTimeout(timer)
    // built before with this very code (a tab shown again): the kept result, at once
    const kept = builder.cached(now, ENTRY)
    if (kept) { print(`[${stamp()}] ↺ ${path}: bu kod daha önce derlendi, bellekteki sonuç kullanılıyor`, "muted"); void render(kept.code); return }
    timer = setTimeout(() => { void builder.build(now, ENTRY).then((r) => { if (r?.ok) void render(r.code) }) }, 350)
  })
  // a property changes: the rendered component takes it at once (no build)
  effect(() => { const p = propsOf(values()); void runtime?.then((r) => r.setProps(p)) })
  onCleanup(() => { clearTimeout(timer); consoleApi = null; previewEl = null; void runtime?.then((r) => r.stop()) })
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v3" label="Playground" api={followTabs} />
  </div>
}
