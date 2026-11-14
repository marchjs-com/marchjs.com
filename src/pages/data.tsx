// Data: a 10,000-row table (sorting, filters, selection, virtual scrolling, column sizing), tree, kanban, steps, pagination,
// accordion, timeline, key-value, splitter, carousel.
import { lazy } from "hadi-march/lazy";

// heavy parts load when they come into view, with a table / card shaped placeholder of the same size
const Table = lazy(() => import("hadi-march/table/render.ts"), { pick: "Table", when: "visible", placeholder: "table", height: "30rem" })
import {
  Badge, Avatar, Steps, Pagination, Accordion, Splitter, Carousel, Card, Button, action, Stack, IconTile, Rating,
} from "hadi-march/ui";
import { trash, mail, check, packageBox, truck, users, zap, shieldCheck, creditCard } from "hadi-march/icons";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ComponentDemo } from "../component-demo.tsx";

const FIRST = ["Elif", "Mert", "Zeynep", "Can", "Ayşe", "Emre", "Selin", "Burak", "Ece", "Kerem", "Derya", "Onur", "Deniz", "Arda", "İpek", "Kaan"];
const LAST = ["Yılmaz", "Demir", "Kaya", "Arslan", "Çelik", "Şahin", "Aydın", "Öztürk", "Koç", "Polat", "Aksoy", "Kılıç"];
const CITY = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Trabzon"];
const STATUS = ["active", "invited", "suspended"] as const;
const STATUS_LABEL: Record<string, string> = { active: "Etkin", invited: "Davetli", suspended: "Askıda" };
const STATUS_OPTIONS = STATUS.map((value) => ({ value, label: STATUS_LABEL[value] }));
const TONE: Record<string, string> = { active: "success", invited: "info", suspended: "warn" };
const rnd = (i: number, m: number) => ((i * 2654435761) >>> 0) % m;
const ROWS = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1, name: `${FIRST[rnd(i, FIRST.length)]} ${LAST[rnd(i * 7 + 3, LAST.length)]}`, city: CITY[rnd(i * 13 + 5, CITY.length)],
  status: STATUS[rnd(i * 7 + 2, 10) < 6 ? 0 : rnd(i * 5 + 1, 10) < 6 ? 1 : 2], diamonds: rnd(i * 31 + 7, 25000), joined: Date.UTC(2024, 0, 1) + rnd(i * 17, 680) * 864e5, score: 1 + rnd(i * 11, 5),
}))

export default function Data(props: { params?: { rest?: string } }) {
  let $page = 4
  let $step = 1
  const invite = action("Davet gönder", async () => { await new Promise((r) => setTimeout(r, 300)) }, { icon: mail, success: "Davet gönderildi" })
  const suspend = action("Askıya al", async () => { await new Promise((r) => setTimeout(r, 300)) }, { icon: trash, danger: true, confirm: "Seçilenler askıya alınsın mı?", success: "Askıya alındı" })
  const RENDER: Record<string, () => unknown> = {
    "icon-tile": () => <ComponentDemo folder="data/icon-tile" title="IconTile: ikon karosu" desc="Kartların, liste satırlarının ve boş durumların başındaki ikon karosu. Dokuz hazır ton ya da herhangi bir tema rengi; yumuşak, çerçeveli ya da dolu; kare ya da yuvarlak." />,
    "link-card": () => <ComponentDemo folder="navigation/link-card" title="LinkCard: bağlantı kartı" desc="Tamamı tek bağlantı olan kart. Başta ikon karosu ya da kendi düğümünüz; açıklama, sondaki metin ve ok ayrı ayrı kapatılır ya da değiştirilir." />,
    "time-ruler": () => <ComponentDemo folder="data/time-ruler" title="TimeRuler: zaman cetveli" desc="Zaman çizelgesinin üstündeki cetvel: tikler, etiketler ve oynatma başı. Cetveli ya da başı sürükleyin, ok tuşlarıyla kaydırın; alttaki çubuklar aynı ölçeği kullanır." />,
    "table": () => <Demo wide title="Tablo · 10.000 satır" desc="Başlığa tıkla: sırala (Shift ile çoklu). Sütunlar menüsü, satır seçimi ve alttaki toplu işlem çubuğu."
    code={`<Table rows={members} virtual height={480} rowHeight={48} selectable
columns={[{ key: "name", label: "Üye", render: (r) => <Avatar …/> },
          { key: "status", filter: "select", options: STATUSES }, …]}
bulkActions={[invite, suspend]} />`}>
    <Table rows={ROWS} rowKey="id" virtual height={480} rowHeight={48} paging={false} selectable bulkActions={[invite, suspend]} filename="members" caption="Üyeler"
      columns={[
        { key: "id", label: "#", align: "end", width: 64 },
        { key: "name", label: "Üye", width: 220, render: (r: typeof ROWS[number]) => <span class="sc-row sc-nowrap"><Avatar name={r.name} size="sm" />{r.name}</span> },
        { key: "city", label: "Şehir", filter: "select", options: CITY },
        { key: "status", label: "Durum", filter: "select", options: STATUS_OPTIONS, render: (r: typeof ROWS[number]) => <Badge tone={TONE[r.status]} dot>{STATUS_LABEL[r.status]}</Badge> },
        { key: "diamonds", label: "Elmas", align: "end", format: "number" },
        { key: "score", label: "Puan", render: (r: typeof ROWS[number]) => <Rating value={r.score} readonly size="sm" /> },
        { key: "joined", label: "Katılım", format: "date" },
      ]} />
  </Demo>,
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
    "panels": () => <Demo wide title="Bölünebilir panel ve galeri" desc="Splitter tutamacı sürüklenir (ya da ← →); Carousel kaydırarak yaslanır, okları ve noktaları var.">
    <Splitter initial={0.38} start={<div class="sc-pane"><strong>Gelen kutusu</strong><p class="m-muted">Tutamacı sürükle.</p></div>} end={<div class="sc-pane"><strong>Ayrıntı</strong><p class="m-muted">İki panel, CSS değişkeniyle boyutlanır.</p></div>} />
    <Carousel perView={3} label="Özellikler">
      {[[zap, "Sinyaller", "Yalnız değişen düğüm güncellenir."], [shieldCheck, "Sıkı CSP", "innerHTML yok, satır içi stil yok."], [users, "Erişilebilir", "ARIA rolleri ve klavye."], [creditCard, "Tam kit", "Form, tablo, grafik, hareket."], [check, "Testli", "node --test ile DOM testleri."]].map(([ic, title, text]) =>
        <Card><Stack gap={2}><IconTile icon={ic} /><strong>{title as string}</strong><span class="m-muted">{text as string}</span></Stack></Card>)}
    </Carousel>
  </Demo>,
  }
  return <Hub section="/data" kicker="Bileşenler" title="Veri" lead="10.000 satır sanal kaydırmayla akar; yalnız görünen satırlar çizilir. Sıralama, süzgeç çipleri, seçim ve toplu işlemler, sütun gizleme/taşıma/boyutlama, CSV dışa aktarma." render={RENDER} params={props.params} />
}
