// Messaging: parts of the page that do not know each other talk through typed channels (hadi-march/channel). Each part
// below imports only ./messaging/channels.ts. The live log at the bottom shows every message.
import { Portal, computed } from "hadi-march";
import { ChannelScope, channelDevtools, useChannel, type TrafficEntry } from "hadi-march/channel";
import { lazy } from "hadi-march/lazy";
import { Card, Button, Badge, Grid, Chip, Empty } from "hadi-march/ui";
import { TextInput } from "hadi-march/forms";
import { shoppingBag, plus, trash, send, externalLink, refresh } from "hadi-march/icons";
import { ch, type Product, type Sale } from "../messaging/channels.ts";
import { Demo, Section } from "../demo.tsx";

// the chart arrives late on purpose (its own chunk + 1.2 s), after the sales were already sent
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SalesChart = lazy(() => wait(1200).then(() => import("../messaging/sales-chart.tsx")), { placeholder: "chart", height: "15rem" });

const PRODUCTS: Product[] = [
  { id: "tea", name: "Çay", price: 45 },
  { id: "simit", name: "Simit", price: 20 },
  { id: "ayran", name: "Ayran", price: 30 },
];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];
const ORDERS = Array.from({ length: 18 }, (_, i) => ({ id: 1040 + i, month: MONTHS[i % 6] as string, customer: ["Ada", "Can", "Ece", "Mert", "Zeynep", "Deniz"][(i * 5) % 6] as string, total: 120 + ((i * 37) % 9) * 45 }));
const TAB = Math.random().toString(36).slice(2, 6); // this tab's short id

/** The top bar badge: listens to cart.changed (sticky), knows nothing about products or the cart. */
function CartBadge() {
  const cart = ch["cart.changed"].toSignal()
  return <span class="sc-msg-badge" aria-live="polite">
    <Button size="sm" variant="ghost" icon={shoppingBag} aria-label="Sepet">Sepet</Button>
    <Badge count={() => cart()?.count ?? 0} label="ürün" />
  </span>
}

/** Product buttons: only say "add this". */
function Products() {
  return <div class="sc-row">
    {PRODUCTS.map((p) => <Button size="sm" variant="secondary" icon={plus} on:click={() => ch["cart.added"].emit(p)}>{p.name} · {p.price} ₺</Button>)}
  </div>
}

/** The cart owns the cart state; it hears additions and clears and publishes its new state. */
function Cart() {
  let $items: Product[] = ch["cart.changed"].last()?.items ?? []
  const publish = () => ch["cart.changed"].emit({ count: $items.length, items: $items })
  ch["cart.added"].on((p) => { $items = [...$items, p]; publish() })
  ch["cart.cleared"].on(() => { $items = []; publish() })
  return <div>
    {$items.length
      ? <ul class="sc-msg-list">{$items.map((p) => <li>{p.name} <span class="sc-msg-muted">{p.price} ₺</span></li>)}</ul>
      : <p class="sc-msg-muted">Sepet boş.</p>}
    <p><strong>Toplam: {$items.reduce((s, p) => s + p.price, 0)} ₺</strong></p>
  </div>
}

/** Somewhere else entirely: a "clear" button. */
function ClearCart() {
  return <Button size="sm" variant="ghost" icon={trash} on:click={() => ch["cart.cleared"].emit()}>Sepeti boşalt</Button>
}

/** Sales source: sends new data whenever it changes (sticky), long before the chart exists. */
function SalesSource() {
  let $round = 0
  const make = (k: number): Sale[] => MONTHS.map((month, i) => ({ month, total: 4000 + Math.round(2600 * Math.abs(Math.sin(i * 1.3 + k))) }))
  if (!ch["sales.updated"].last()) ch["sales.updated"].emit(make(0))
  return <div class="sc-row">
    <Button size="sm" variant="secondary" icon={refresh} on:click={() => { $round = $round + 1; ch["sales.updated"].emit(make($round)) }}>Yeni veri gönder</Button>
    <span class="sc-msg-muted">{$round} kez gönderildi</span>
  </div>
}

/** Orders list: filtered by the chart's selection (it never sees the chart). */
function Orders() {
  const sel = ch["chart.select"].toSignal()
  const rows = computed(() => { const m = sel()?.month; return m ? ORDERS.filter((o) => o.month === m) : ORDERS })
  return <div>
    <div class="sc-row sc-row-between">
      <span>{sel() ? `Süzgeç: ${sel()?.month}` : "Tüm siparişler"} · {rows().length}</span>
      <Button size="sm" variant="ghost" disabled={!sel()} on:click={() => ch["chart.select"].emit(null)}>Süzgeci kaldır</Button>
    </div>
    <ul class="sc-msg-list">{rows().map((o) => <li>#{o.id} · {o.customer} <span class="sc-msg-muted">{o.month} · {o.total} ₺</span></li>)}</ul>
  </div>
}

/** Notes between tabs: the same channel in every open tab of this page (BroadcastChannel). */
function TabNotes() {
  let $text = ""
  let $notes: { text: string; tab: string; from: string }[] = []
  ch["tabs.note"].on((n, from) => { $notes = [{ ...n, from }, ...$notes].slice(0, 10) })
  const sendNote = () => { const text = $text.trim(); if (text) { ch["tabs.note"].emit({ text, tab: TAB }); $text = "" } }
  return <div class="sc-msg-tabs">
    <div class="sc-row">
      <TextInput bind:value={$text} placeholder="Bir not yaz" aria-label="Not" onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter") sendNote() }} />
      <Button size="sm" icon={send} on:click={sendNote}>Gönder</Button>
      <Button size="sm" variant="ghost" icon={externalLink} on:click={() => window.open(location.href, "_blank", "noopener")}>Yeni sekmede aç</Button>
    </div>
    <p class="sc-msg-muted">Bu sekme: {TAB}</p>
    {$notes.length
      ? <ul class="sc-msg-list">{$notes.map((n) => <li><Chip size="sm" m:color={n.tab === TAB ? "neutral" : "brand-blue"}>{n.tab === TAB ? "bu sekme" : `sekme ${n.tab}`}</Chip> {n.text}</li>)}</ul>
      : <p class="sc-msg-muted">Henüz not yok. Sayfayı ikinci bir sekmede açıp oradan yaz.</p>}
  </div>
}

/** One copy of a widget: its button and its display only share a scoped channel. */
function CounterButton() {
  const bump = useChannel(ch["counter.bump"]) // bound to this copy's scope (event handlers have none)
  return <Button size="sm" variant="secondary" icon={plus} on:click={() => bump.emit((bump.last() ?? 0) + 1)}>Artır</Button>
}
function CounterDisplay() {
  const n = useChannel(ch["counter.bump"]).toSignal()
  return <strong class="sc-msg-count">{n() ?? 0}</strong>
}
function Counter(props: { label: string }) {
  return <ChannelScope label={props.label}>
    <Card title={props.label}><div class="sc-row"><CounterButton /><CounterDisplay /></div></Card>
  </ChannelScope>
}

/** The live log: every message on the page (channelDevtools.watch). */
function TrafficLog() {
  let $entries: TrafficEntry[] = channelDevtools.traffic().slice(-30).reverse()
  channelDevtools.watch((e) => { $entries = [e, ...$entries].slice(0, 30) })
  const time = (t: number) => new Date(t).toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const show = (p: unknown) => { const s = p === undefined ? "—" : JSON.stringify(p); return s.length > 90 ? `${s.slice(0, 90)}…` : s }
  return <div>
    <div class="sc-row sc-row-between">
      <span class="sc-msg-muted">Son 30 mesaj, en yenisi üstte</span>
      <Button size="sm" variant="ghost" on:click={() => { channelDevtools.clear(); $entries = [] }}>Temizle</Button>
    </div>
    {$entries.length
      ? <ol class="sc-msg-log" aria-live="polite">{$entries.map((e) => <li>
          <span class="sc-msg-muted">{time(e.time)}</span>
          <code>{e.name}</code>
          {e.from === "tab" ? <Chip size="sm" m:color="brand-blue">diğer sekme</Chip> : null}
          {e.scope !== "app" ? <Chip size="sm" m:color="brand-purple">{e.scope}</Chip> : null}
          <span class="sc-msg-payload">{show(e.payload)}</span>
          <span class="sc-msg-muted">{e.listeners} dinleyici</span>
        </li>)}</ol>
      : <Empty title="Henüz mesaj yok" description="Yukarıdaki düğmelere bas." />}
  </div>
}

export default function Messaging() {
  let $chart = false
  return <Section kicker="Temel" title="Haberleşme" lead="Birbirinden habersiz bileşenler türlü kanallarla konuşur: ad ve yük tek dosyada tanımlı, yanlışı derlenmez. Dinleyiciler bileşenle birlikte kalkar; geç gelen bileşen son durumu alır.">
    <Portal to="toolbar" order={20}><CartBadge /></Portal>

    <Demo wide title="Sepet: üç habersiz parça" desc="Ürün düğmesi yalnız cart.added gönderir; sepet durumunu tutar ve cart.changed yayar; üst çubuktaki rozet onu dinler."
      code={`// channels.ts
export const ch = defineChannels({
  "cart.added": of<Product>(),
  "cart.changed": of<{ count: number; items: Product[] }>({ sticky: true }),
});
// ürün düğmesi
<Button on:click={() => ch["cart.added"].emit(p)}>Ekle</Button>
// sepet (durumu tutan tek yer)
ch["cart.added"].on((p) => { $items = [...$items, p]; ch["cart.changed"].emit({ count: $items.length, items: $items }) })
// üst çubuktaki rozet
const cart = ch["cart.changed"].toSignal()
<Badge count={() => cart()?.count ?? 0} />`}>
      <Grid cols={2} gap={4}>
        <Card title="Ürünler"><Products /></Card>
        <Card title="Sepet" actions={<ClearCart />}><Cart /></Card>
      </Grid>
    </Demo>

    <Demo wide title="Geç gelen grafik ve süzülen liste" desc="Satış verisi grafik yokken gönderilir (sticky). Grafiği yükle: kendi parçası 1,2 sn sonra gelir ve son veriyi hemen çizer. Bir çubuğa tıkla: liste süzülür."
      code={`"sales.updated": of<Sale[]>({ sticky: true }),
"chart.select": of<{ month: string } | null>({ sticky: true }),
// tembel grafik (geç gelir, son veriyi hemen alır)
const sales = ch["sales.updated"].toSignal()
<BarChart data={sales() ?? []} onSelect={(p) => ch["chart.select"].emit({ month: p.datum.month })} />
// liste (grafiği tanımaz)
const sel = ch["chart.select"].toSignal()`}>
      <Grid cols={2} gap={4}>
        <Card title="Satış grafiği">
          <SalesSource />
          {$chart ? <SalesChart /> : <div class="sc-msg-wait"><Button size="sm" on:click={() => $chart = true}>Grafiği yükle</Button></div>}
        </Card>
        <Card title="Siparişler"><Orders /></Card>
      </Grid>
    </Demo>

    <Demo title="Sekmeler arası" desc="crossTab: aynı kanal bu sitenin bütün açık sekmelerinde. Yeni açılan sekme son 10 notu alır."
      code={`"tabs.note": of<{ text: string; tab: string }>({ crossTab: true, replay: 10 }),
ch["tabs.note"].emit({ text, tab })
ch["tabs.note"].on((n, from) => …)   // from: "local" | "tab"`}>
      <TabNotes />
    </Demo>

    <Demo title="Kapsam: iki kopya" desc="scoped kanal + ChannelScope: aynı bileşenin iki kopyası birbirini duymaz."
      code={`"counter.bump": of<number>({ scoped: true, sticky: true }),
<ChannelScope><Counter /></ChannelScope>
const bump = useChannel(ch["counter.bump"])   // kurulumda; olay işleyicide bump.emit()`}>
      <Grid cols={2} gap={3}><Counter label="Kopya A" /><Counter label="Kopya B" /></Grid>
    </Demo>

    <Demo wide title="Canlı mesaj günlüğü" desc="channelDevtools.watch: sayfadaki her mesaj, kaynağı ve dinleyici sayısı.">
      <TrafficLog />
    </Demo>
  </Section>
}
