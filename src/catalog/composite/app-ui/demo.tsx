// Showcase stage for AppUI: the workspace with three panels for the Playground values (playground.ts).
import { AppUI } from "march/components/composite/app-ui";
import { row, col, tabs, type DockPanel, type Preset } from "march/components/composite/dock-layout";
import { fileText, terminal, folder, grid } from "march/icons";

export const code = `<AppUI title="march-app-ui" panels={panels} presets={{
  default: { title: "Varsayılan", tree: () => row([.24, tabs("files")], [.76, col([.7, tabs("editor")], [.3, tabs("console")])]) },
  code: { title: "Kod", tree: () => row([.2, tabs("files", { collapsed: true })], [.8, tabs(["editor", "console"])]) },
}} persist="my-ide" tools={<Button>Çalıştır</Button>} />`

const PRESETS: Record<string, Preset> = {
  default: { title: "Varsayılan", tree: () => row([0.24, tabs("files")], [0.76, col([0.7, tabs("editor")], [0.3, tabs("console")])]) },
  code: { title: "Kod", tree: () => row([0.2, tabs("files", { collapsed: true })], [0.8, tabs(["editor", "console"])]) },
  design: { title: "Tasarım", tree: () => col([0.8, row([0.3, tabs("files")], [0.7, tabs("editor")])], [0.2, tabs("console", { collapsed: true })]) },
}
const pane = (title: string, text: string) => <div class="sc-dock-pane"><strong>{title}</strong><p class="m-muted">{text}</p></div>

export default function AppUIDemo(props: { values: { panels: string; title: string; description: string; layoutMenu: boolean; groupMenu: boolean; bar: boolean; preset: string; ownIcon: boolean } }) {
  const panels: DockPanel[] = [
    { id: "files", title: "Dosyalar", icon: folder, min: [140, 100], content: () => pane("Dosyalar", "Sekmeyi sürükleyip başka bir grubun kenarına bırak.") },
    { id: "editor", title: "Düzenleyici", icon: fileText, content: () => pane("Düzenleyici", "Yerleşim menüsünden hazır bir düzen seç.") },
    { id: "console", title: "Konsol", icon: terminal, content: () => pane("Konsol", "Daralt düğmesi grubu şeride indirir.") },
  ]
  return <div class="sc-dock-stage">
    {() => {
      const v = props.values
      // "two": no console (the presets' console group stays empty)
      return <AppUI title={v.title} description={v.description} layoutMenu={v.layoutMenu} actions={v.groupMenu ? true : ["maximize", "collapse"]} bar={v.bar} layoutIcon={v.ownIcon ? grid : undefined} panels={v.panels === "two" ? panels.filter((p) => p.id !== "console") : panels} presets={PRESETS} preset={v.preset} commands={false} label="Örnek uygulama" />
    }}
  </div>
}
