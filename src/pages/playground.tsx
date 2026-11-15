// Playground: the workspace of a component's page on march-app-ui (AppUI). The top bar: the component's name on the
// left, the command palette and the Layout button on the right. Preview over Properties and Dependencies /
// Accessibility on the left; the component's files over Console / Debugger / Terminal on the right. The .tsx tabs are
// files: the code editor plugin opens them. No tab has a close mark (groups still collapse to strips).
import "./playground.css";
import { signal } from "hadi-march";
import { PaletteButton } from "hadi-march/ui";
import { AppUI, codeEditorPlugin, row, col, tabs, type AppPanel, type Preset } from "hadi-march/app-ui";
import { monitor, sliders, packageBox, users, code, terminal, bug, fileText } from "hadi-march/icons";

const empty = (name: string) => () => <div class="sc-playground-empty"><b>{name}</b><span>Boş panel</span></div>
const panel = (id: string, title: string, icon: unknown): AppPanel => ({ id, title, icon, content: empty(title) })

// the component's files (kept for this visit)
const SOURCES: Record<string, string> = {
  "Component1.tsx": `import { Button } from "hadi-march/ui"

export default function Component1() {
  let $count = 0
  return <Button variant="primary" onClick={() => $count++}>
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
const fileTab = (id: string, path: string): AppPanel => {
  const text = signal(SOURCES[path] ?? "")
  return { id, title: path, icon: fileText, file: { path, text, set: (v: string) => text.set(v) } }
}

const PANELS: AppPanel[] = [
  panel("preview", "Önizleme", monitor),
  panel("props", "Özellikler", sliders),
  panel("deps", "Bağımlılıklar", packageBox),
  panel("a11y", "Erişilebilirlik", users),
  fileTab("c1", "Component1.tsx"),
  fileTab("c2", "Component2.tsx"),
  fileTab("c3", "Component3.tsx"),
  panel("console", "Konsol", code),
  panel("debug", "Hata ayıklayıcı", bug),
  panel("terminal", "Terminal", terminal),
]
const PRESETS: Record<string, Preset> = {
  main: {
    title: "Playground",
    tree: () => row(
      [0.6, col([0.7, tabs("preview")], [0.3, row([0.7, tabs("props")], [0.3, tabs(["deps", "a11y"])])])],
      [0.4, col([0.7, tabs(["c1", "c2", "c3"])], [0.3, tabs(["console", "debug", "terminal"])])],
    ),
  },
}
const PLUGINS = [codeEditorPlugin()]

export default function PlaygroundPage(props: { name?: string }) {
  return <div class="sc-playground">
    <AppUI title={props.name ?? "Test Bileşen"} tools={<PaletteButton label="Komut ara…" class="sc-playground-pal" />}
      panels={PANELS} presets={PRESETS} plugins={PLUGINS} commands="playground" persist="sc.playground.v1" label="Playground" />
  </div>
}
