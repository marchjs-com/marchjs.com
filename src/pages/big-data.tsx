// Big data: components for large collections, each from its folder in src/components (demo, Playground, Code tab).
// Every demo is its own lazy chunk: the page itself is only the frame.
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

export default function BigDataPage(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "data-grid": () => <ComponentDemo folder="data/data-grid" title="DataGrid" desc="100 bin satır, sanal satır ve sütun. Başlığı tıklayarak sırala (Shift ile ekle), sürükleyerek taşı, kenarından boyutla; ⋮ menüsünden grupla, sabitle, gizle. Hücreye çift tıkla ya da yazmaya başla; ok tuşları, Boşluk, Shift+↓, Ctrl+C." />,
    "tree-view": () => <ComponentDemo folder="data/tree-view" title="TreeView" desc="Yaklaşık 3 000 düğüm; “eski” klasörleri açılınca tembel yüklenir. Ara: eşleşmeye giden yol açık kalır, eşleşme vurgulanır. Sürükle: önüne, arkasına ya da içine bırak (kapalı klasörün üstünde bekle, açılır). Alt+↑/↓ klavyeyle taşır." />,
    "scheduler": () => <ComponentDemo folder="data/scheduler" title="Takvim (Scheduler)" desc="Ay, hafta ve gün görünümü. Etkinliği sürükleyerek taşı (15 dakikaya oturur, sütunlar arası gün değiştirir), kenarından boyutla; boş saate sürükleyerek yeni etkinlik oluştur. Tarih dili değişince gün adları, haftanın ilk günü ve saat biçimi Intl ile değişir." />,
    "gantt": () => <ComponentDemo folder="data/gantt" title="Gantt" desc="Bağımlılık okları, bugün çizgisi, gün/hafta/ay ölçeği. Çubuğu sürükleyerek taşı, uçlarından boyutla, altındaki tutamaçla ilerlemeyi ayarla; ardıl görevler gerekirse ileri itilir. Klavye: ↑↓ görev seç, Alt+←→ taşı." />,
  }
  return <Hub base="/big-data" kicker="Bileşenler" title="Büyük veri" lead="Sanal pencereyle yüz binlerce satır, tembel ağaçlar, sürüklenebilir takvim ve zaman çizelgesi, dosya yöneticisi. Hepsi ortak sanal liste ve seçim modelinin üstünde." render={RENDER} params={props.params} />
}
