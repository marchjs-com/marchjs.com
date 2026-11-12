// Big data: components for large collections, each from its folder in src/components (demo, Playground, Code tab).
// Every demo is its own lazy chunk: the page itself is only the frame.
import { Section } from "../demo.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function BigDataPage() {
  return <Section kicker="Bileşenler" title="Büyük veri" lead="Sanal pencereyle yüz binlerce satır, tembel ağaçlar, sürüklenebilir takvim ve zaman çizelgesi, dosya yöneticisi. Hepsi ortak sanal liste ve seçim modelinin üstünde.">
    <ComponentDemo folder="data/data-grid" title="DataGrid" desc="100 bin satır, sanal satır ve sütun. Başlığı tıklayarak sırala (Shift ile ekle), sürükleyerek taşı, kenarından boyutla; ⋮ menüsünden grupla, sabitle, gizle. Hücreye çift tıkla ya da yazmaya başla; ok tuşları, Boşluk, Shift+↓, Ctrl+C." />
    <ComponentDemo folder="data/tree-view" title="TreeView" desc="Yaklaşık 3 000 düğüm; “eski” klasörleri açılınca tembel yüklenir. Ara: eşleşmeye giden yol açık kalır, eşleşme vurgulanır. Sürükle: önüne, arkasına ya da içine bırak (kapalı klasörün üstünde bekle, açılır). Alt+↑/↓ klavyeyle taşır." />
  </Section>
}
