// Veri: 10.000 satırlık tablo (sıralama, süzgeç, seçim, sanal kaydırma, sütun boyutlama), ağaç, pano, adımlar, sayfalama,
// akordeon, zaman çizelgesi, anahtar-değer, bölünebilir panel, kaydırmalı galeri.
import { Table } from "hadi-march/table";
import {
  Badge, Avatar, Tree, Kanban, Steps, Pagination, Accordion, Timeline, KeyValue, Splitter, Carousel, Card, Button, Chip, toast, action, Stack, IconTile, Rating,
} from "hadi-march/ui";
import { folder, fileText, image, code, settings, trash, mail, check, packageBox, truck, users, zap, shieldCheck, creditCard } from "hadi-march/icons";
import { Demo, Section } from "../demo.tsx";

const FIRST = ["Elif", "Mert", "Zeynep", "Can", "Ayşe", "Emre", "Selin", "Burak", "Ece", "Kerem", "Derya", "Onur", "Deniz", "Arda", "İpek", "Kaan"];
const LAST = ["Yılmaz", "Demir", "Kaya", "Arslan", "Çelik", "Şahin", "Aydın", "Öztürk", "Koç", "Polat", "Aksoy", "Kılıç"];
const CITY = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Trabzon"];
const STATUS = ["Etkin", "Davetli", "Askıda"];
const TONE: Record<string, string> = { Etkin: "success", Davetli: "info", Askıda: "warn" };
const rnd = (i: number, m: number) => ((i * 2654435761) >>> 0) % m;
const ROWS = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1, name: `${FIRST[rnd(i, FIRST.length)]} ${LAST[rnd(i * 7 + 3, LAST.length)]}`, city: CITY[rnd(i * 13 + 5, CITY.length)],
  status: STATUS[rnd(i * 7 + 2, 10) < 6 ? 0 : rnd(i * 5 + 1, 10) < 6 ? 1 : 2], elmas: rnd(i * 31 + 7, 25000), joined: Date.UTC(2024, 0, 1) + rnd(i * 17, 680) * 864e5, score: 1 + rnd(i * 11, 5),
}))

const FILES = [
  { id: "src", label: "src", icon: folder, children: [
    { id: "ui", label: "ui", icon: folder, children: [{ id: "button", label: "button.ts", icon: code, meta: "280" }, { id: "nav", label: "nav.ts", icon: code, meta: "190" }, { id: "extras", label: "extras.ts", icon: code, meta: "320" }] },
    { id: "css", label: "css", icon: folder, children: [{ id: "tokens", label: "tokens.css", icon: fileText, meta: "120" }, { id: "themes", label: "themes.css", icon: fileText, meta: "gen" }] },
    { id: "icons", label: "icons", icon: folder, children: [{ id: "set", label: "set.ts", icon: image, meta: "131" }] },
  ] },
  { id: "cfg", label: "march.config.js", icon: settings },
]

interface Task { id: string; title: string; tag: string; who: string }
export default function Data() {
  let $page = 4
  let $step = 1
  let $file = "button"
  let $board: { id: string; title: string; tone: string; items: Task[] }[] = [
    { id: "todo", title: "Yapılacak", tone: "info", items: [{ id: "t1", title: "Tema seçiciyi üst çubuğa al", tag: "Arayüz", who: "Elif Yılmaz" }, { id: "t2", title: "Tablo dışa aktarma", tag: "Veri", who: "Mert Demir" }] },
    { id: "doing", title: "Sürüyor", tone: "warn", items: [{ id: "t3", title: "Koyu tema kontrastı", tag: "Erişilebilirlik", who: "Zeynep Kaya" }] },
    { id: "done", title: "Bitti", tone: "success", items: [{ id: "t4", title: "Inter + Figtree yazı tipleri", tag: "Tipografi", who: "Can Arslan" }, { id: "t5", title: "131 ikon", tag: "İkon", who: "Ayşe Çelik" }] },
  ]
  const move = (it: Task, from: string, to: string) => {
    $board = $board.map((c) => (c.id === from ? { ...c, items: c.items.filter((x) => x.id !== it.id) } : c.id === to ? { ...c, items: [...c.items, it] } : c))
    toast(`"${it.title}" taşındı`, { kind: "success" })
  }
  const invite = action("Davet gönder", async () => { await new Promise((r) => setTimeout(r, 300)) }, { icon: mail, success: "Davet gönderildi" })
  const suspend = action("Askıya al", async () => { await new Promise((r) => setTimeout(r, 300)) }, { icon: trash, danger: true, confirm: "Seçilenler askıya alınsın mı?", success: "Askıya alındı" })
  return <Section kicker="Bileşenler" title="Veri" lead="10.000 satır sanal kaydırmayla akar; yalnız görünen satırlar çizilir. Sıralama, süzgeç çipleri, seçim ve toplu işlemler, sütun gizleme/taşıma/boyutlama, CSV dışa aktarma.">
    <Demo wide title="Tablo · 10.000 satır" desc="Başlığa tıkla: sırala (Shift ile çoklu). Sütunlar menüsü, satır seçimi ve alttaki toplu işlem çubuğu."
      code={`<Table rows={üyeler} virtual height={480} rowHeight={48} selectable
  columns={[{ key: "name", label: "Üye", render: (r) => <Avatar …/> },
            { key: "status", filter: "select", options: DURUMLAR }, …]}
  bulkActions={[davet, askıyaAl]} />`}>
      <Table rows={ROWS} rowKey="id" virtual height={480} rowHeight={48} paging={false} selectable bulkActions={[invite, suspend]} filename="uyeler" caption="Üyeler"
        columns={[
          { key: "id", label: "#", align: "end", width: 64 },
          { key: "name", label: "Üye", width: 220, render: (r: typeof ROWS[number]) => <span class="sc-row sc-nowrap"><Avatar name={r.name} size="sm" />{r.name}</span> },
          { key: "city", label: "Şehir", filter: "select", options: CITY },
          { key: "status", label: "Durum", filter: "select", options: STATUS, render: (r: typeof ROWS[number]) => <Badge tone={TONE[r.status]} dot>{r.status}</Badge> },
          { key: "elmas", label: "Elmas", align: "end", format: "number" },
          { key: "score", label: "Puan", render: (r: typeof ROWS[number]) => <Rating value={r.score} readonly size="sm" /> },
          { key: "joined", label: "Katılım", format: "date" },
        ]} />
    </Demo>

    <Demo title="Ağaç" desc="role=tree; ↑ ↓ gez, → aç, ← kapat, Enter seç.">
      <Tree nodes={FILES} expanded={["src", "ui"]} selected={() => $file} onSelect={(n: { id: string }) => { $file = n.id }} label="Dosyalar" />
    </Demo>

    <Demo title="Adımlar ve sayfalama" desc="Steps tıklanabilir; Pagination üç noktalı kısaltma yapar.">
      <Steps current={$step} onSelect={(i: number) => { $step = i }} steps={[{ title: "Sepet", description: "3 ürün" }, { title: "Teslimat", description: "Adres ve kargo" }, { title: "Ödeme", description: "Kart ya da Elmas" }, { title: "Onay" }]} />
      <div class="sc-row"><Button size="sm" on:click={() => { $step = Math.max(0, $step - 1) }}>Geri</Button><Button size="sm" variant="primary" on:click={() => { $step = Math.min(4, $step + 1) }}>İleri</Button></div>
      <Pagination bind:page={$page} pages={24} />
    </Demo>

    <Demo wide title="Pano (Kanban)" desc="Kartları sürükleyip bırak; klavyede Alt + ← / → ile sütun değiştir.">
      <Kanban columns={$board} itemKey={(x: Task) => x.id} onMove={move} card={(x: Task) => <Stack gap={2}>
        <strong>{x.title}</strong>
        <div class="sc-row sc-row-between"><Chip size="sm">{x.tag}</Chip><Avatar name={x.who} size="sm" /></div>
      </Stack>} />
    </Demo>

    <Demo title="Akordeon" desc="Yükseklik animasyonlu açılır; tek ya da çoklu.">
      <Accordion multiple open={[0]} items={[
        { title: "Kargo ne zaman gelir?", subtitle: "Teslimat", icon: truck, content: "Siparişler 1-3 iş günü içinde kargoya verilir; takip numarası e-postayla gelir." },
        { title: "İade nasıl yapılır?", icon: packageBox, content: "14 gün içinde uygulamadan iade talebi oluştur; kurye kapına gelir." },
        { title: "Ödeme güvenli mi?", icon: shieldCheck, content: "Kart bilgileri saklanmaz; 3D Secure ile ödeme sağlayıcısında işlenir." },
      ]} />
    </Demo>

    <Demo title="Zaman çizelgesi ve özet" desc="Timeline tonlu noktalar; KeyValue sütunlu ayrıntı.">
      <Timeline items={[
        { time: "Bugün 09:12", title: "Sipariş oluşturuldu", body: "#48210 · 3 ürün", tone: "info" },
        { time: "Bugün 09:14", title: "Ödeme alındı", body: "1.499,90 ₺ · kart", tone: "success" },
        { time: "Bugün 11:40", title: "Kargoya verildi", body: "Takip: HD123456", tone: "warn" },
      ]} />
      <KeyValue columns={2} items={[{ label: "Müşteri", value: "Elif Yılmaz" }, { label: "Tutar", value: "1.499,90 ₺", hint: "KDV dahil" }, { label: "Durum", value: "Kargoda" }, { label: "Kanal", value: "Mobil uygulama" }]} />
    </Demo>

    <Demo wide title="Bölünebilir panel ve galeri" desc="Splitter tutamacı sürüklenir (ya da ← →); Carousel kaydırarak yaslanır, okları ve noktaları var.">
      <Splitter initial={0.38} start={<div class="sc-pane"><strong>Gelen kutusu</strong><p class="hm-muted">Tutamacı sürükle.</p></div>} end={<div class="sc-pane"><strong>Ayrıntı</strong><p class="hm-muted">İki panel, CSS değişkeniyle boyutlanır.</p></div>} />
      <Carousel perView={3} label="Özellikler">
        {[[zap, "Sinyaller", "Yalnız değişen düğüm güncellenir."], [shieldCheck, "Sıkı CSP", "innerHTML yok, satır içi stil yok."], [users, "Erişilebilir", "ARIA rolleri ve klavye."], [creditCard, "Tam kit", "Form, tablo, grafik, hareket."], [check, "Testli", "node --test ile DOM testleri."]].map(([ic, title, text]) =>
          <Card><Stack gap={2}><IconTile icon={ic} /><strong>{title as string}</strong><span class="hm-muted">{text as string}</span></Stack></Card>)}
      </Carousel>
    </Demo>
  </Section>
}
