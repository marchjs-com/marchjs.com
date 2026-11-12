// IDE shell (Complex components): DockLayout, PropertyGrid, OverflowToolbar, StatusBar, ActivityBar, Breadcrumbs and the
// command palette, each as its own card, then a mini editor built only from them.
import "./ide.css";
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function IdePage() {
  return <Section kicker="Karmaşık bileşenler" title="IDE kabuğu" lead="Editör ve geliştirici araçları için yerleşim parçaları: sürükle-bırak panel yerleşimi, özellik düzenleyici, taşan araç çubuğu, durum ve etkinlik çubukları, yol çubuğu. Hepsi mevcut bileşenlerden kurulur ve komut paletine bağlanır.">
    <ComponentDemo folder="composite/dock-layout" title="DockLayout: sürükle, bırak, yerleştir" desc="Sekmeyi bir grubun kenarına bırak: yeni bölme; ortasına ya da sekmelerin arasına: sekme; alanın kenarına: tüm yerleşimin kenarı; dışına: yüzen pencere. Bırakma önizlemesi hareket motoruyla kayar. Grup düğmeleri büyütür, yüzdürür, küçültür. Klavye: F6 gruplar arası, Alt+Shift+oklar yerleştirir." />
  </Section>
}
