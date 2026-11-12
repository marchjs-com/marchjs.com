// IDE shell (Complex components): DockLayout, PropertyGrid, OverflowToolbar, StatusBar, ActivityBar, Breadcrumbs and the
// command palette, each as its own card, then a mini editor built only from them.
import "./ide.css";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";
import { Demo } from "../demo.tsx";
import MiniIde from "../ide/mini-ide.tsx";

export default function IdePage() {
  return <Section kicker="Karmaşık bileşenler" title="IDE kabuğu" lead="Editör ve geliştirici araçları için yerleşim parçaları: sürükle-bırak panel yerleşimi, özellik düzenleyici, taşan araç çubuğu, durum ve etkinlik çubukları, yol çubuğu. Hepsi mevcut bileşenlerden kurulur ve komut paletine bağlanır.">
    <Demo wide title="Canlı demo: mini editör" desc="Yalnız bu bileşenlerle kurulu: ActivityBar yan görünümü değiştirir; DockLayout'ta dosya ağacı, sekmeli editörler, ayarlar (PropertyGrid) ve konsol; üstte Breadcrumbs, OverflowToolbar ve komut paleti (Ctrl+K: Kaydet, Çalıştır, Biçimlendir, Paneli göster…); altta StatusBar. Sekmeleri sürükle, yerleşim bu tarayıcıda saklanır. Kaydedilmemiş dosya varken sayfadan ayrılırsan sorulur."
      code={`<ActivityBar value={$view} onChange={…} items={views} />
<DockLayout panels={[explorer, ...editors, inspector, console]} commands="ide.dock" persist="ide.layout"
  layout={{ row: [["files"], { column: [{ row: [editors, ["inspector"]] }, ["console"]], share: .7 }], share: .24 }} />
<OverflowToolbar items={[{ id: "save", command: "ide.save" }, { id: "run", command: "ide.run", showLabel: true }, …]} />
<StatusBar items={[{ id: "pos", side: "end", text: () => "Sa " + $line }, { id: "save", command: "ide.saveAll", live: true, … }]} />`}>
      <MiniIde />
    </Demo>
    <ComponentDemo folder="composite/dock-layout" title="DockLayout: sürükle, bırak, yerleştir" desc="Sekmeyi bir grubun kenarına bırak: yeni bölme; ortasına ya da sekmelerin arasına: sekme; alanın kenarına: tüm yerleşimin kenarı; dışına: yüzen pencere. Bırakma önizlemesi hareket motoruyla kayar. Grup düğmeleri büyütür, yüzdürür, küçültür. Klavye: F6 gruplar arası, Alt+Shift+oklar yerleştirir." />
    <ComponentDemo folder="composite/property-grid" title="PropertyGrid: özellik düzenleyici" desc="Gruplu, aranabilir satırlar; her tür kendi form denetimiyle düzenlenir. Her değişiklik bir geri alma adımı (Ctrl+Z ya da başlıktaki düğmeler), kaydedilmemiş değişiklikler DirtyState’e kayıtlı: sayfadan ayrılırken sorulur. Değişen satır işaretlenir, tek tek sıfırlanır." />
    <ComponentDemo folder="actions/overflow-toolbar" title="OverflowToolbar: taşan öğeler menüye" desc="Genişliği daralt: önceliği en düşük öğeler “Daha fazla” menüsüne geçer, yer açılınca kayarak geri gelir. Öğe bir komut kimliği olabilir (Komut yöneticisi): başlık, ikon, kısayol ve etkinlik komuttan gelir." />
    <ComponentDemo folder="layout/status-bar" title="StatusBar: durum çubuğu" desc="Başta ve sonda öğeler; düğmeler bir eylem ya da komut çalıştırır. Kaydediliyor durumunda nokta hareket motoruyla nefes alır; durum değişince ekran okuyucuya duyurulur. Daraldıkça önceliği düşük öğeler “…” menüsüne geçer." />
    <ComponentDemo folder="navigation/activity-bar" title="ActivityBar: görünüm çubuğu" desc="Yan görünümü değiştirir; gösterge etkin simgeye kayar. Etkin simgeye yeniden basınca yan görünüm kapanır. Rozetler, sonda duran öğeler, dikey ya da yatay." />
    <ComponentDemo folder="navigation/breadcrumbs" title="Breadcrumbs: yol çubuğu" desc="Dosya yolu; kardeşi olan parça menü açar. Daraltınca ortadaki parçalar “…” menüsünde toplanır, ilk ve son kalır." />
  </Section>
}
