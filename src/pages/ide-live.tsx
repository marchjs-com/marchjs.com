// IDE shell live demo page (Complex components): a mini editor built only from DockLayout, PropertyGrid,
// OverflowToolbar, StatusBar, ActivityBar, Breadcrumbs and the command palette.
import "./ide.css";
import { Section, Demo } from "../demo.tsx";
import MiniIde from "../ide/mini-ide.tsx";

export default function IdeLivePage() {
  return <Section kicker="Karmaşık bileşenler" title="IDE kabuğu: canlı demo" lead="Gerçek his veren küçük bir editör. ActivityBar yan görünümü değiştirir; DockLayout'ta dosya ağacı, sekmeli editörler, ayarlar ve konsol; üstte yol çubuğu, araç çubuğu ve komut paleti (Ctrl+K); altta durum çubuğu. Sekmeleri sürükleyip kenarlara bırak; yerleşim bu tarayıcıda saklanır.">
    <Demo wide title="Mini editör" desc="Ctrl+S kaydeder, Ctrl+Enter çalıştırır, Ctrl+Shift+I biçimlendirir; hepsi komut paletinde de var. Kaydedilmemiş dosya varken sayfadan ayrılırsan sorulur (DirtyState). F6 panel grupları arasında gezinir."
      code={`<ActivityBar value={$view} onChange={…} items={views} />
<DockLayout panels={[explorer, ...editors, inspector, console]} commands="ide.dock" persist="ide.layout"
  layout={{ row: [["files"], { column: [editors, ["inspector", "console"]], share: .62 }], share: .24 }} />
<OverflowToolbar items={[{ id: "save", command: "ide.save" }, { id: "run", command: "ide.run", showLabel: true }, …]} />
<StatusBar items={[{ id: "pos", side: "end", text: () => "Sa " + $line }, { id: "save", command: "ide.saveAll", live: true, … }]} />`}>
      <MiniIde />
    </Demo>
  </Section>
}
