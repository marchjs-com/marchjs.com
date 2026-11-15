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
import { PaletteButton, JsonView, Terminal, PropertyGrid, type TerminalApi, type PropertySpec } from "hadi-march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, typeScriptPlugin, row, col, tabs, type AppPanel, type Preset, type MarchCatalog } from "hadi-march/app-ui";
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
const MAIN = "Button.tsx", ENTRY = "PreviewControl.tsx"
const exportedName = computed(() => {
  const src = files.get(MAIN)?.() ?? ""
  return /export\s*\{\s*([A-Za-z_$][\w$]*)/.exec(src)?.[1] ?? /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/.exec(src)?.[1] ?? ""
})
const options = signal<readonly PlaygroundOption[]>([])
const values = signal<Record<string, unknown>>({})
effect(() => {
  const name = exportedName(), entry = registry.find((e) => e.meta.name === name)
  if (!entry) { options.set([]); values.set({}); return }
  void entry.playground().then((m) => {
    if (untrack(exportedName) !== name) return
    const list = (m.default as { options: readonly PlaygroundOption[] }).options.filter((o) => o.prop !== false)
    options.set(list)
    values.set(Object.fromEntries(list.map((o) => [o.key, o.default])))
  })
})
const asProperty = (o: PlaygroundOption): PropertySpec => {
  const opts = o.options?.map((x) => (typeof x === "object" ? x : { value: x, label: String(x) }))
  const type = typeof o.default === "boolean" ? "switch" : opts ? (opts.length <= 4 ? "segmented" : "select") : typeof o.default === "number" ? (o.min !== undefined && o.max !== undefined ? "slider" : "number") : "text"
  return { key: o.key, label: o.label, type, ...(o.visibleWhen ? { hidden: (v: Record<string, unknown>) => !o.visibleWhen!(v as never) } : {}), ...(opts ? { options: opts } : {}), ...(o.min !== undefined ? { min: o.min } : {}), ...(o.max !== undefined ? { max: o.max } : {}), ...(o.step !== undefined ? { step: o.step } : {}) } as PropertySpec
}
// one prop of the entry's JSX: a string as an attribute, the rest as an expression; children between the tags
const attr = (name: string, v: unknown): string => (typeof v === "string" ? `${name}=${JSON.stringify(v)}` : v === true ? name : `${name}={${JSON.stringify(v)}}`)
const entrySource = computed(() => {
  const name = exportedName()
  if (!name) return "export default function PreviewControl() { return null }\n"
  const v = values()
  const visible = options().filter((o) => !o.visibleWhen || o.visibleWhen(v as never))
  let children = ""
  const props: string[] = []
  for (const o of visible) {
    const prop = o.prop || o.key, x = v[o.key]
    if (prop === "children") { children = String(x ?? ""); continue }
    if (x === "" || x === false || x === undefined || x === null) continue
    if (o.toCode) continue // a value written as code of its own (an icon, a custom part): not in the preview
    props.push(attr(prop, x))
  }
  const open = [name, ...props].join(" ")
  return `import { ${name} } from "./${MAIN}"\n\nexport default function PreviewControl() {\n  return ${children ? `<${open}>${children}</${name}>` : `<${open} />`}\n}\n`
})
const propsPanel = () => <div class="sc-props">
  {() => (options().length
    ? <PropertyGrid properties={() => options().map(asProperty)} value={values} onChange={(v: Record<string, unknown>) => values.set({ ...v })} label={`${exportedName()} özellikleri`} saved={values} history={false} dirty={false} search={false} />
    : <div class="sc-playground-empty"><b>Özellik yok</b><span>{exportedName() ? `${exportedName()} prop almıyor` : "Dışa aktarılan bileşen yok"}</span></div>)}
</div>

// the build: its steps go to the Console (lines written before the Console is there wait for it)
let consoleApi: TerminalApi | null = null
const waiting: [string, Parameters<TerminalApi["print"]>[1]][] = []
const builder = createBuilder((text, tone) => { if (consoleApi) consoleApi.print(text, { tone }); else waiting.push([text, { tone }]) })
const consolePanel = () => <Terminal readonly scheme="dark" label="Derleme çıktısı" class="sc-console"
  ref={(api: TerminalApi) => { consoleApi = api; for (const [t, o] of waiting.splice(0)) api.print(t, o) }} />
// lang.json: the texts the last build found (JSX text, titles, labels…), as a locale file lists them
const langJson = () => Object.fromEntries(builder.texts().map((k) => [k, ""]))

// the preview (AppPreview): its toolbar sets the preview's own theme, accent and light / dark; the stage in the middle
const preview = () => <AppPreview>
  <div class="sc-playground-empty"><b>Önizleme</b><span>Boş panel</span></div>
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
    const now = { ...Object.fromEntries([...files].map(([p, s]) => [p, s()])), [ENTRY]: entrySource() }
    clearTimeout(timer)
    timer = setTimeout(() => { void builder.build(now, ENTRY) }, 350)
  })
  onCleanup(() => { clearTimeout(timer); consoleApi = null })
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v3" label="Playground" />
  </div>
}
