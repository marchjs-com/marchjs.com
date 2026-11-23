// Home page sections (a lazy part): working with data and flows. A product table that sorts, filters and searches as
// you type; a board whose cards move between columns; a stay picked on a calendar; a file tree that searches and
// reorders; a welcome flow of steps, tabs and sections. Real components throughout, nothing faked.
import "./data.css";
import "march/css/table.css";
import { Link } from "march/router";
import { Badge, TextInput, Toggle, toast } from "march/ui";
import { Table } from "march/table";
import { Kanban, type KanbanColumn } from "march/data";
import { TreeView, type TreeViewNode } from "march/components/data/tree-view";
import { Calendar, DateRangePicker, type DateRange } from "march/forms";
import { Accordion } from "march/layout";
import { Tabs, Stepper } from "march/navigation";
import { Reveal } from "march/landing";
import { Head } from "../head.tsx";

// ── a table ─────────────────────────────────────────────────────────────────────────────────────────────────────

interface Product { id: string; name: string; category: string; price: number; stock: number; rating: number }
/** A small seeded random: the same rows on every visit. */
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
/** Ten thousand products, made from a few words (the table pages, sorts and searches all of them). */
const KINDS: readonly [string, readonly string[]][] = [
  ["Spor", ["Yürüyüş ayakkabısı", "Yoga matı", "Kamp sandalyesi", "Koşu tişörtü", "Termos", "Dambıl"]],
  ["Ev", ["Seramik kupa", "Masa lambası", "Pamuk nevresim", "Bambu tepsi", "Kokulu mum", "Keten örtü"]],
  ["Elektronik", ["Kablosuz kulaklık", "Akıllı saat", "Bluetooth hoparlör", "Powerbank", "Klavye", "Webcam"]],
  ["Giyim", ["Keten gömlek", "Yün atkı", "Rüzgarlık", "Kot ceket", "Bere", "Spor çorap"]],
]
const TONES = ["Gece", "Kum", "Zeytin", "Mercan", "Buz", "Bal", "Füme", "Nane"]
const PRODUCT_COUNT = 10000
const PRODUCTS: readonly Product[] = (() => {
  const r = seeded(7), out: Product[] = []
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const [category, names] = KINDS[i % KINDS.length]!
    const name = `${names[Math.floor(r() * names.length)]!} · ${TONES[Math.floor(r() * TONES.length)]!}`
    out.push({ id: `p${i + 1}`, name, category, price: Math.round(150 + r() * 6000), stock: Math.floor(r() * 200), rating: Math.round((3.5 + r() * 1.5) * 10) / 10 })
  }
  return out
})()
const CATEGORIES = ["Spor", "Ev", "Elektronik", "Giyim"]

function DataTableSection() {
  return <section class="sc-sec" aria-labelledby="sc-dt-table-h">
    <Head id="sc-dt-table-h" kicker="Veri" color="brand-blue" title="Büyük veri için hızlı bir tablo" example={`${PRODUCTS.length.toLocaleString("tr")} satır, tek satır kadar hafif`}
      lead="Sırala, süz, ara, seç: tablo yazarken yanıt verir. Sunucudan sayfa sayfa gelen veriyle, sanal kaydırmayla ve dar ekranda kart görünümüyle aynı bileşen." />
    <Reveal class="sc-dt-table sc-card" effect="up">
      <Table rows={PRODUCTS} rowKey="id" selectable pageSize={6} exportable={false} columns={[
        { key: "name", label: "Ürün", filter: "text" },
        { key: "category", label: "Kategori", filter: "select", options: CATEGORIES },
        { key: "price", label: "Fiyat", format: ["money", "TRY"], align: "end", filter: "range" },
        { key: "stock", label: "Stok", align: "end" },
        { key: "rating", label: "Puan", align: "end", render: (r: Product) => <Badge tone={r.rating >= 4.6 ? "success" : "info"}>{r.rating.toLocaleString("tr")}</Badge> },
      ]} />
    </Reveal>
    <Link href="/data" class="sc-fast-link">Veri bileşenlerinin hepsi</Link>
  </section>
}

// ── a board ─────────────────────────────────────────────────────────────────────────────────────────────────────

interface Task { id: string; title: string; tag: string }
const BOARD: readonly KanbanColumn<Task>[] = [
  { id: "todo", title: "Yapılacak", color: "brand-orange", items: [
    { id: "t1", title: "Açılış sayfasını tasarla", tag: "Tasarım" }, { id: "t2", title: "Ödeme akışını yaz", tag: "Kod" }, { id: "t3", title: "Kullanıcılarla görüş", tag: "Araştırma" },
  ] },
  { id: "doing", title: "Sürüyor", color: "brand-blue", items: [
    { id: "t4", title: "Koyu temayı bitir", tag: "Tasarım" }, { id: "t5", title: "Bildirimleri bağla", tag: "Kod" },
  ] },
  { id: "done", title: "Bitti", color: "brand-green", items: [
    { id: "t6", title: "Kayıt formu", tag: "Kod" },
  ] },
]

function Board() {
  let $board = BOARD.map((c) => ({ ...c, items: [...c.items] }))
  const move = (task: Task, from: string, to: string): void => {
    $board = $board.map((c) => (c.id === from ? { ...c, items: c.items.filter((x) => x.id !== task.id) } : c.id === to ? { ...c, items: [...c.items, task] } : c))
    if (to === "done") toast(`“${task.title}” bitti`, { kind: "success" })
  }
  return <section class="sc-sec" aria-labelledby="sc-dt-board-h">
    <Head id="sc-dt-board-h" kicker="Pano" color="brand-orange" title="Sürükle bırak pano" example="Kartı tut, sütuna bırak"
      lead="Sürükle bırak fareyle, kalemle, dokunarak; klavyede Alt ve ok tuşlarıyla. Kart taşınırken iz bırakır, bırakıldığı yere yumuşakça oturur." />
    <Reveal class="sc-dt-board sc-card" effect="up">
      <Kanban columns={$board} itemKey={(t: Task) => t.id} onMove={move}
        card={(t: Task) => <div class="sc-dt-task"><b>{t.title}</b><Badge tone={t.tag === "Kod" ? "info" : t.tag === "Tasarım" ? "primary" : "warn"}>{t.tag}</Badge></div>} />
    </Reveal>
  </section>
}

// ── a calendar ──────────────────────────────────────────────────────────────────────────────────────────────────

const iso = (d: Date): string => d.toISOString().slice(0, 10)
const addDays = (d: string, n: number): string => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return iso(x) }
const longDate = (d: string): string => new Intl.DateTimeFormat("tr", { day: "numeric", month: "long", weekday: "long", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`))
const nights = (a: string, b: string): number => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)

function Dates() {
  const today = iso(new Date())
  let $range: DateRange | null = { from: addDays(today, 3), to: addDays(today, 7) }
  // a click on the calendar starts a new stay; the second click ends it (in either order)
  let $anchor: string | null = null
  const pick = (d: string): void => {
    if (!$anchor) { $anchor = d; $range = { from: d, to: null }; return }
    const [a, b] = $anchor <= d ? [$anchor, d] : [d, $anchor]
    $range = { from: a, to: b }
    $anchor = null
  }
  const summary = (): string => {
    const r = $range
    if (!r?.from) return "Bir başlangıç günü seç"
    if (!r.to) return `${longDate(r.from)} → bitiş gününü seç`
    const n = nights(r.from, r.to)
    return `${longDate(r.from)} – ${longDate(r.to)} · ${n} gece`
  }
  return <section class="sc-sec" aria-labelledby="sc-dt-date-h">
    <Head id="sc-dt-date-h" kicker="Takvim" color="brand-green" title="Tarih ve aralık seçen takvim" example="Bir aralık seç ya da hazır aralıklardan birine dokun"
      lead="Ay ızgarası, aralık seçimi, hazır aralıklar, yerel gün ve ay adları; yaz saati değişse de gün kaymaz. Klavyeyle de tam kullanılır." />
    <Reveal class="sc-dt-dates" effect="up" stagger={110}>
      <div class="sc-dt-cal sc-card">
        <Calendar value={$range?.to ?? $range?.from ?? null} rangeFrom={$range?.from ?? undefined} rangeTo={$range?.to ?? undefined} min={today} onPick={pick} locale="tr" />
      </div>
      <div class="sc-dt-stay sc-card">
        <span class="sc-dt-cap">Konaklama</span>
        <p class="sc-dt-sum">{summary()}</p>
        <DateRangePicker bind:value={$range} min={today} />
      </div>
    </Reveal>
  </section>
}

// ── a file tree ─────────────────────────────────────────────────────────────────────────────────────────────────

/** A project tree of a few thousand files (folders × subfolders × files), drawn only as far as it is in view. */
const AREAS = ["src", "docs", "tests", "public", "scripts"]
const PARTS = ["pages", "components", "forms", "charts", "store", "router", "motion", "icons", "themes", "utils"]
const FILE_KINDS = ["Card", "List", "Form", "Chart", "Modal", "Table", "Menu", "Panel", "Badge", "Field", "Tabs", "Toast"]
const FILES: TreeViewNode[] = AREAS.map((a) => ({ id: a, label: a, children: PARTS.map((part) => ({
  id: `${a}/${part}`, label: part,
  children: Array.from({ length: 60 }, (_, k) => {
    const name = `${FILE_KINDS[k % FILE_KINDS.length]}${Math.floor(k / FILE_KINDS.length) || ""}.${a === "docs" ? "md" : a === "public" ? "svg" : "tsx"}`
    return { id: `${a}/${part}/${name}`, label: name }
  }),
})) }))
const count = (list: readonly TreeViewNode[]): number => list.reduce((n, x) => n + 1 + (x.children ? count(x.children) : 0), 0)
const NODE_COUNT = count(FILES)

function Files() {
  let $q = ""
  let $picked: string[] = []
  let $drag = true
  return <section class="sc-sec" aria-labelledby="sc-dt-tree-h">
    <Head id="sc-dt-tree-h" kicker="Ağaç" color="brand-purple" title="Büyük ağaçlar için sanal ağaç" example={`${NODE_COUNT.toLocaleString("tr")} düğüm, akıcı bir ağaç`}
      lead="Yalnız görünen satırlar çizilir, klasörler istenince yüklenir. Ara: eşleşen yol açılır ve vurgulanır. Sürükle: önüne, arkasına, içine bırak." />
    <Reveal class="sc-dt-files" effect="up" stagger={110}>
      <div class="sc-dt-tree sc-card">
        <TextInput bind:value={$q} placeholder="Dosya ara: card, logo…" aria-label="Dosya ara" />
        <TreeView nodes={FILES} search={$q} draggable={$drag} selection="multiple" expanded={["src", "src/pages"]}
          onSelect={(ids: string[]) => { $picked = ids }} height={300} label="Proje dosyaları" />
      </div>
      <div class="sc-dt-treeside sc-card">
        <span class="sc-dt-cap">Seçili</span>
        <p class="sc-dt-sum">{$picked.length ? $picked.map((p) => p.split("/").pop()).join(", ") : "Ctrl ya da Shift ile birden çok dosya seç"}</p>
        <Toggle bind:value={$drag}>Sürükle bırak açık</Toggle>
        <ul class="sc-dt-keys">
          <li><kbd>↑</kbd><kbd>↓</kbd> satırlar arasında</li>
          <li><kbd>→</kbd> klasörü aç, <kbd>←</kbd> kapat</li>
          <li><kbd>Alt</kbd> + <kbd>↑</kbd> düğümü taşı</li>
        </ul>
      </div>
    </Reveal>
  </section>
}

// ── a welcome flow ──────────────────────────────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: "dev", label: "Geliştirici", text: "Bileşenler, sinyaller, router ve test araçları seni bekliyor. Kodla başla, Playground'da dene." },
  { id: "design", label: "Tasarımcı", text: "Temalar, belirteçler, hareket eğrileri: tasarımın kodda da aynı görünür. Tema editörüyle başla." },
  { id: "lead", label: "Ekip lideri", text: "Bağımlılık yok, bütçeler test altında, erişilebilirlik hazır. Ekibin ilk günden hızlı başlar." },
]
const SETUP = [
  { title: "Tema", subtitle: "Açık, koyu ya da sistemin", content: "Sayfa sistem tercihini izler; kullanıcı istediğinde değiştirir, seçim hatırlanır." },
  { title: "Dil", subtitle: "Türkçe ve çevirileri", content: "Metinler çevrilir, tarihler ve sayılar yerelleşir; sağdan sola diller aynalanır." },
  { title: "Bildirimler", subtitle: "Ne zaman haber verelim?", content: "Önemli olanlar anında, gerisi günün özetinde. İzinler tarayıcıdan bir kez istenir." },
]

function Welcome() {
  let $step = 0
  let $role = "dev"
  const panels = [
    <div class="sc-dt-panel">
      <p class="sc-dt-lead">Seni en iyi ne anlatır?</p>
      <Tabs variant="pill" bind:value={$role} label="Rolün" tabs={ROLES.map((r) => ({ id: r.id, label: r.label, content: () => <p class="sc-dt-role">{r.text}</p> }))} />
    </div>,
    <div class="sc-dt-panel">
      <p class="sc-dt-lead">Birkaç tercih, sonra hazırsın.</p>
      <Accordion items={SETUP.map((s) => ({ title: s.title, subtitle: s.subtitle, content: <p class="sc-dt-role">{s.content}</p> }))} open={[0]} variant="contained" />
    </div>,
    <div class="sc-dt-panel sc-dt-ready">
      <span class="sc-dt-big">Hazırsın.</span>
      <p class="sc-dt-role">{() => `${ROLES.find((r) => r.id === $role)?.label ?? ""} olarak başlıyorsun. Bitir'e bas, gerisi bizde.`}</p>
    </div>,
  ]
  return <section class="sc-sec" aria-labelledby="sc-dt-flow-h">
    <Head id="sc-dt-flow-h" kicker="Akış" color="brand-blue" title="Adım, sekme ve açılır bölümlerle akışlar" example="Karşılama akışı, üç adımda"
      lead="Adımlar, sekmeler ve açılır bölümler birlikte: geçişte vurgu bir adımdan ötekine akar, panel geçmişe kayarken yenisi gelecekten gelir." />
    <Reveal class="sc-dt-flow sc-card" effect="up">
      <Stepper steps={[{ title: "Sen", description: "Rolünü seç" }, { title: "Tercihler", description: "Tema, dil, bildirim" }, { title: "Hazır", description: "Başla" }]}
        current={$step} onSelect={(i: number) => { $step = i }} panels={panels} finishLabel="Bitir"
        onFinish={() => { toast("Hoş geldin! Her şey hazır.", { kind: "success" }); $step = 0 }} />
    </Reveal>
  </section>
}

export default function MoreData() {
  return <>
    <DataTableSection />
    <Board />
    <Dates />
    <Files />
    <Welcome />
  </>
}
