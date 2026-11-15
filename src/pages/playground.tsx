// Playground: the workspace of a component's page on march-app-ui (AppUI), and nothing else. Preview over Properties
// and Dependencies / Accessibility on the left; the component's files over Console / Debugger / Terminal on the right.
// No tab has a close mark (groups still collapse to strips). Panels are empty for now.
import "./playground.css";
import { AppUI, row, col, tabs, type DockPanel, type Preset } from "hadi-march/app-ui";
import { monitor, sliders, packageBox, users, code, terminal, bug, fileText } from "hadi-march/icons";

const empty = (name: string) => () => <div class="sc-playground-empty"><b>{name}</b><span>Boş panel</span></div>
const panel = (id: string, title: string, icon: unknown): DockPanel => ({ id, title, icon, content: empty(title) })
const PANELS: DockPanel[] = [
  panel("preview", "Önizleme", monitor),
  panel("props", "Özellikler", sliders),
  panel("deps", "Bağımlılıklar", packageBox),
  panel("a11y", "Erişilebilirlik", users),
  panel("c1", "Component1.tsx", fileText),
  panel("c2", "Component2.tsx", fileText),
  panel("c3", "Component3.tsx", fileText),
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

export default function PlaygroundPage() {
  return <div class="sc-playground">
    <AppUI bar={false} panels={PANELS} presets={PRESETS} commands="playground" persist="sc.playground.v1" label="Playground" />
  </div>
}
