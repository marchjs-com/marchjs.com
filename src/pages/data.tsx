// Data: one MarchIDE page per component (src/components/data/<name>/, Table from march/table): tree, kanban, timeline,
// key-value, cards, rows, badges.
import { Hub } from "../hub.tsx";
import { TOPICS } from "../topics/data.ts";
import { ComponentDemo } from "../component-demo.tsx";

export default function Data(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "icon-tile": () => <ComponentDemo folder="data/icon-tile" title="IconTile: ikon karosu" desc="Kartların, liste satırlarının ve boş durumların başındaki ikon karosu. Dokuz hazır ton ya da herhangi bir tema rengi; yumuşak, çerçeveli ya da dolu; kare ya da yuvarlak." />,
    "link-card": () => <ComponentDemo folder="navigation/link-card" title="LinkCard: bağlantı kartı" desc="Tamamı tek bağlantı olan kart. Başta ikon karosu ya da kendi düğümünüz; açıklama, sondaki metin ve ok ayrı ayrı kapatılır ya da değiştirilir." />,
    "time-ruler": () => <ComponentDemo folder="data/time-ruler" title="TimeRuler: zaman cetveli" desc="Zaman çizelgesinin üstündeki cetvel: tikler, etiketler ve oynatma başı. Cetveli ya da başı sürükleyin, ok tuşlarıyla kaydırın; alttaki çubuklar aynı ölçeği kullanır." />,
    "tree": () => <ComponentDemo folder="data/tree" title="Tree: genişleyen ağaç" desc="role=tree; ↑ ↓ gez, → aç, ← kapat, Enter seç. Uzun adlar kayarak okunur, sağda dosya sayısı ya da boyut." />,
    "kanban": () => <ComponentDemo folder="data/kanban" title="Kanban: sürükle bırak pano" desc="Kartları sürükleyip bırak; klavyede Alt + ← / → ile sütun değiştir. Sütun sayısı ve tonlu başlıklar Playground'da." />,
    "timeline": () => <ComponentDemo folder="data/timeline" title="Timeline: olaylar sırayla" desc="Tonlu noktalar, isteğe bağlı ikon; Date, epoch ya da ISO zaman yerel biçimde yazılır." />,
    "key-value": () => <ComponentDemo folder="data/key-value" title="KeyValue: ayrıntı özeti" desc="Bir ile dört sütun; dar ekranda sütun azalır. İpucu satırı, gizli satır ve boş değer yer tutucusu." />,
    "json-view": () => <ComponentDemo folder="data/json-view" title="JsonView: açılır JSON ağacı" desc="Türüne göre renkler; kapalı nesne ve dizi kaç anahtar ya da öğe tuttuğunu yazar. Açık derinlik Playground'da." />,
    "code-view": () => <ComponentDemo folder="typography/code-view" title="CodeView: salt okunur kod" desc="Satır numarası, sözdizimi renkleri (js/ts/tsx, css, html, json, sh), kaydırma ve kopyalama. Metin her zaman metin düğümü olarak eklenir." />,
    "card": () => <ComponentDemo folder="data/card" title="Card: başlık, eylemler, alt bilgi" desc="Başlıktaki action() nesneleri düğme olur. Kenar boşluksuz gövde tablolar ve listeler için." />,
    "list-row": () => <ComponentDemo folder="data/list-row" title="ListRow: listelerin ortak satırı" desc="Baş yuva (ikon, avatar, nokta), başlık, alt metin, son yuva. Bağlantı, düğme, liste seçeneği ya da düz satır olur; sığmayan başlık üstüne gelince kayar." />,
    "stat-tile": () => <ComponentDemo folder="data/stat-tile" title="StatTile: değer ve etiket" desc="Profil sayıları, özet rakamlar. Değer bir sayaç olabilir; karoya basınca sayı artar ve basamaklar döner." />,
    "badge": () => <ComponentDemo folder="data/badge"title="Badge: durum ve sayı" desc="Altı ton, noktalı etiket; sayı rozeti 0'da gizlenir, 99'dan sonra 99+ yazar ve ekran okuyucuya ne saydığını söyler." />,
  }
  return <Hub section="/data" topics={TOPICS} kicker="Bileşenler" title="Veri" lead="10.000 satır sanal kaydırmayla akar; yalnız görünen satırlar çizilir. Sıralama, süzgeç çipleri, seçim ve toplu işlemler, sütun gizleme/taşıma/boyutlama, CSV dışa aktarma." render={RENDER} params={props.params} />
}
