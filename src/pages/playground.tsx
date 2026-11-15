// Playground: the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal / lang.json on the right. The
// .tsx tabs are files: the code editor plugin opens them, the March language plugin suggests March's exports. Every
// change is built in the page (playground/build.ts): the Console shows each step with its time and the errors,
// lang.json the texts the build found. No tab has a close mark (groups still collapse to strips).
import "./playground.css";
import { signal, effect, onCleanup } from "hadi-march";
import { appUrl } from "hadi-march/base";
import { PaletteButton, JsonView, Terminal, type TerminalApi } from "hadi-march/ui";
import { AppUI, AppPreview, codeEditorPlugin, marchLanguagePlugin, row, col, tabs, type AppPanel, type Preset, type MarchCatalog } from "hadi-march/app-ui";
import { monitor, sliders, packageBox, users, code, terminal, bug, fileText, globe } from "hadi-march/icons";
import { createBuilder } from "../playground/build.ts";

const empty = (name: string) => () => <div class="sc-playground-empty"><b>{name}</b><span>Boş panel</span></div>
const panel = (id: string, title: string, icon: unknown): AppPanel => ({ id, title, icon, content: empty(title) })

// the component's files (kept for this visit)
const SOURCES: Record<string, string> = {
  "Component1.tsx": `import { Button } from "hadi-march/ui"

export default function Component1() {
  let $count = 0
  return <Button variant="primary" title="Sayacı artırır" onClick={() => $count++}>
    Tıklandı: {$count}
  </Button>
}
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
const files = new Map<string, ReturnType<typeof signal<string>>>()
const fileTab = (id: string, path: string): AppPanel => {
  const text = signal(SOURCES[path] ?? "")
  files.set(path, text)
  return { id, title: path, icon: fileText, file: { path, text, set: (v: string) => text.set(v) } }
}

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
  panel("props", "Özellikler", sliders),
  panel("deps", "Bağımlılıklar", packageBox),
  panel("a11y", "Erişilebilirlik", users),
  fileTab("c1", "Component1.tsx"),
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
const PLUGINS = [codeEditorPlugin(), marchLanguagePlugin({ catalog })]

export default function PlaygroundPage(props: { name?: string }) {
  // every change is built a moment after typing stops
  let timer: ReturnType<typeof setTimeout> | undefined
  effect(() => {
    const now = Object.fromEntries([...files].map(([p, s]) => [p, s()]))
    clearTimeout(timer)
    timer = setTimeout(() => { void builder.build(now) }, 350)
  })
  onCleanup(() => { clearTimeout(timer); consoleApi = null })
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v3" label="Playground" />
  </div>
}
