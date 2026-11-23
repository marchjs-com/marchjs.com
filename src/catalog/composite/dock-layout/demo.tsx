// Showcase stage for DockLayout: a small workspace for the Playground values (playground.ts). Code: the Code tab.
import { DockLayout, row, col, tabs, type DockPanel, type DockAction, type Preset } from "march/composite";
import { fileText, terminal, folder, sliders } from "march/icons";

export const code = `<DockLayout panels={[
  { id: "files", title: "Dosyalar", icon: folder, min: [150, 120], content: () => <FileTree /> },
  { id: "editor", title: "main.ts", icon: fileText, content: () => <Editor />, dirty: () => $dirty },
  { id: "console", title: "Konsol", icon: terminal, content: () => <Console /> },
]} presets={{ main: { title: "Ana", tree: () => row([.26, tabs("files")], [.74, col([.68, tabs("editor")], [.32, tabs("console")])]) } }}
   persist="ide.layout" api={(a) => dock = a} />`

const PRESETS: Record<string, Record<string, Preset>> = {
  ide: { ide: { title: "IDE", tree: () => row([0.28, tabs("files")], [0.72, col([0.62, tabs(["editor", "notes"])], [0.38, tabs(["console", "props"])])]) } },
  columns: { columns: { title: "Üç sütun", tree: () => row([0.33, tabs("files")], [0.34, tabs(["editor", "notes"])], [0.33, tabs(["console", "props"])]) } },
  single: { single: { title: "Tek grup", tree: () => tabs(["editor", "files", "console", "props", "notes"]) } },
}
const ACTIONS: Record<string, boolean | DockAction[]> = { all: true, nomenu: ["maximize", "collapse"], max: ["maximize"], none: false }

const pane = (title: string, lines: string[]) => <div class="sc-dock-pane"><strong>{title}</strong>{lines.map((l) => <p class="m-muted">{l}</p>)}</div>

export default function DockLayoutDemo(props: { values: { panels: string; preset: string; actions: string; collapsed: boolean; icons: boolean; motion: boolean } }) {
  const panels: DockPanel[] = [
    { id: "files", title: "Dosyalar", icon: folder, min: [140, 100], content: () => pane("HADİ", ["src/", "  app.ts", "  theme.css", "README.md"]) },
    { id: "editor", title: "app.ts", icon: fileText, content: () => pane("app.ts", ["Sekmeyi bir grubun kenarına sürükle: yeni bölme.", "Ortasına ya da sekmelerin arasına: sekme.", "Alanın kenarına: tüm yerleşimin kenarı."]) },
    { id: "notes", title: "Notlar", icon: fileText, content: () => pane("Notlar", ["Daralt düğmesi grubu şeride indirir; şeride basınca eski boyutuyla döner.", "Ayırıcıyı çift tıkla: eşit boyut."]) },
    { id: "console", title: "Konsol", icon: terminal, content: () => pane("Konsol", ["> derleme tamam (412 ms)"]) },
    { id: "props", title: "Özellikler", icon: sliders, content: () => pane("Özellikler", ["Genişlik: 320", "Görünür: evet"]) },
  ]
  return <div class="sc-dock-stage">
    {() => {
      const presets = PRESETS[props.values.preset] ?? PRESETS["ide"]!
      const collapsed = props.values.collapsed
      // the group buttons are drawn with each group: the workspace is made again when they change
      const own = props.values.icons
      // "three": files, app.ts and the console (the presets' other places stay empty)
      const shown = props.values.panels === "three" ? panels.filter((p) => ["files", "editor", "console"].includes(p.id)) : panels
      return <DockLayout panels={shown} presets={presets} commands="dockDemo" label="Örnek çalışma alanı" actions={ACTIONS[props.values.actions]}
        motion={props.values.motion}
        icons={own ? { menu: "⋯", maximize: "▢", restore: "❐", collapse: "–" } : undefined}
        labels={own ? { menu: "Seçenekler", maximize: "Tam boy", restore: "Eski boyuna dön", collapse: "Şeride indir" } : undefined}
        api={(a) => { if (collapsed) queueMicrotask(() => a.collapse("notes")) }} />
    }}
  </div>
}
