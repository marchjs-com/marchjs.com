// march-app-ui: the core of March IDE, alone on the page (in the site's theme and accent). Panels are empty for now; drag a tab to a side,
// collapse a group to a strip, fill the area, pick a ready-made layout from the top bar.
import "./app-ui.css";
import { AppUI, row, col, tabs, type AppPanel, type Preset } from "hadi-march/app-ui";
import { files, code, monitor, users, terminal, bug } from "hadi-march/icons";

const empty = (name: string) => () => <div class="sc-appui-empty"><b>{name}</b><span>Boş panel</span></div>;
const PANELS: AppPanel[] = [
  { id: "files", title: "Dosyalar", icon: files, min: [150, 160], place: { near: "editor", zone: "left", size: 0.2 }, content: empty("Dosyalar") },
  { id: "editor", title: "Düzenleyici", icon: code, min: [260, 180], place: { near: "preview", zone: "left", size: 0.5 }, content: empty("Düzenleyici") },
  { id: "preview", title: "Önizleme", icon: monitor, min: [220, 180], place: { near: "editor", zone: "right", size: 0.45 }, content: empty("Önizleme") },
  { id: "players", title: "Oyuncular", icon: users, min: [200, 160], place: { near: "preview", zone: "right", size: 0.4, collapsed: true }, content: empty("Oyuncular") },
  { id: "console", title: "Konsol", icon: terminal, min: [180, 90], place: { near: "preview", zone: "bottom", size: 0.36 }, content: empty("Konsol") },
  { id: "debug", title: "Hata ayıklayıcı", icon: bug, min: [260, 140], place: { near: "console", zone: "center" }, content: empty("Hata ayıklayıcı") },
];
const PRESETS: Record<string, Preset> = {
  default: { title: "Varsayılan", tree: () => row([0.17, tabs("files")], [0.43, tabs("editor")], [0.4, col([0.64, row([0.62, tabs("preview")], [0.38, tabs("players", { collapsed: true })])], [0.36, tabs(["console", "debug"])])]) },
  code: { title: "Kod", tree: () => row([0.18, tabs("files")], [0.82, col([0.74, row([0.7, tabs("editor")], [0.2, tabs("preview", { collapsed: true })], [0.1, tabs("players", { collapsed: true })])], [0.26, tabs(["console", "debug"])])]) },
  design: { title: "Tasarım", tree: () => col([0.84, row([0.16, tabs("files", { collapsed: true })], [0.6, tabs("editor")], [0.3, tabs("preview")], [0.2, tabs("players", { collapsed: true })])], [0.16, tabs(["console", "debug"], { collapsed: true })]) },
  game: { title: "Oyun testi", tree: () => row([0.3, tabs(["editor", "files"])], [0.7, col([0.72, row([0.6, tabs("preview")], [0.4, tabs("players")])], [0.28, tabs(["console", "debug"])])]) },
  debug: { title: "Hata ayıklama", tree: () => row([0.15, tabs("files")], [0.47, col([0.62, tabs("editor")], [0.38, tabs("console")])], [0.38, col([0.42, row([0.7, tabs("preview")], [0.3, tabs("players", { collapsed: true })])], [0.58, tabs("debug")])]) },
};

export default function AppUiPage() {
  return <div class="sc-appui">
    <AppUI title="march-app-ui" panels={PANELS} presets={PRESETS} persist="sc.app-ui" />
  </div>
}
