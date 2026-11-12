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
    "steps-pagination": () => <Demo title="Adımlar ve sayfalama" desc="Steps tıklanabilir; Pagination üç noktalı kısaltma yapar.">
    <Steps current={$step} onSelect={(i: number) => { $step = i }} steps={[{ title: "Sepet", description: "3 ürün" }, { title: "Teslimat", description: "Adres ve kargo" }, { title: "Ödeme", description: "Kart ya da Elmas" }, { title: "Onay" }]} />
    <div class="sc-row"><Button size="sm" on:click={() => { $step = Math.max(0, $step - 1) }}>Geri</Button><Button size="sm" variant="primary" on:click={() => { $step = Math.min(4, $step + 1) }}>İleri</Button></div>
    <Pagination bind:page={$page} pages={24} />
  </Demo>,
    "kanban": () => <ComponentDemo folder="data/kanban" title="Kanban: sürükle bırak pano" desc="Kartları sürükleyip bırak; klavyede Alt + ← / → ile sütun değiştir. Sütun sayısı ve tonlu başlıklar Playground'da." />,
    "accordion": () => <Demo title="Akordeon" desc="Yükseklik animasyonlu açılır; tek ya da çoklu.">
    <Accordion multiple open={[0]} items={[
      { title: "Kargo ne zaman gelir?", subtitle: "Teslimat", icon: truck, content: "Siparişler 1-3 iş günü içinde kargoya verilir; takip numarası e-postayla gelir." },
      { title: "İade nasıl yapılır?", icon: packageBox, content: "14 gün içinde uygulamadan iade talebi oluştur; kurye kapına gelir." },
      { title: "Ödeme güvenli mi?", icon: shieldCheck, content: "Kart bilgileri saklanmaz; 3D Secure ile ödeme sağlayıcısında işlenir." },
    ]} />
  </Demo>,
    "timeline": () => <ComponentDemo folder="data/timeline" title="Timeline: olaylar sırayla" desc="Tonlu noktalar, isteğe bağlı ikon; Date, epoch ya da ISO zaman yerel biçimde yazılır." />,
    "key-value": () => <ComponentDemo folder="data/key-value" title="KeyValue: ayrıntı özeti" desc="Bir ile dört sütun; dar ekranda sütun azalır. İpucu satırı, gizli satır ve boş değer yer tutucusu." />,
    "json-view": () => <ComponentDemo folder="data/json-view" title="JsonView: açılır JSON ağacı" desc="Türüne göre renkler; kapalı nesne ve dizi kaç anahtar ya da öğe tuttuğunu yazar. Açık derinlik Playground'da." />,
    "code-view": () => <ComponentDemo folder="typography/code-view" title="CodeView: salt okunur kod" desc="Satır numarası, sözdizimi renkleri (js/ts/tsx, css, html, json, sh), kaydırma ve kopyalama. Metin her zaman metin düğümü olarak eklenir." />,
    "card": () => <ComponentDemo folder="data/card" title="Card: başlık, eylemler, alt bilgi" desc="Başlıktaki action() nesneleri düğme olur. Kenar boşluksuz gövde tablolar ve listeler için." />,
    "badge": () => <ComponentDemo folder="data/badge" title="Badge: durum ve sayı" desc="Altı ton, noktalı etiket; sayı rozeti 0'da gizlenir, 99'dan sonra 99+ yazar ve ekran okuyucuya ne saydığını söyler." />,
    "panels": () => <Demo wide title="Bölünebilir panel ve galeri" desc="Splitter tutamacı sürüklenir (ya da ← →); Carousel kaydırarak yaslanır, okları ve noktaları var.">
    <Splitter initial={0.38} start={<div class="sc-pane"><strong>Gelen kutusu</strong><p class="hm-muted">Tutamacı sürükle.</p></div>} end={<div class="sc-pane"><strong>Ayrıntı</strong><p class="hm-muted">İki panel, CSS değişkeniyle boyutlanır.</p></div>} />
    <Carousel perView={3} label="Özellikler">
      {[[zap, "Sinyaller", "Yalnız değişen düğüm güncellenir."], [shieldCheck, "Sıkı CSP", "innerHTML yok, satır içi stil yok."], [users, "Erişilebilir", "ARIA rolleri ve klavye."], [creditCard, "Tam kit", "Form, tablo, grafik, hareket."], [check, "Testli", "node --test ile DOM testleri."]].map(([ic, title, text]) =>
        <Card><Stack gap={2}><IconTile icon={ic} /><strong>{title as string}</strong><span class="hm-muted">{text as string}</span></Stack></Card>)}
    </Carousel>
  </Demo>,
  }
  return <Hub base="C:/Program Files/Git/data" kicker="Bileşenler" title="Veri" lead="10.000 satır sanal kaydırmayla akar; yalnız görünen satırlar çizilir. Sıralama, süzgeç çipleri, seçim ve toplu işlemler, sütun gizleme/taşıma/boyutlama, CSV dışa aktarma." render={RENDER} params={props.params} />
}
