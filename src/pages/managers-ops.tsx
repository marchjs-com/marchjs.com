// Operations managers: FeatureFlag, Log, Performance, RateLimit (events on the "managers.*" channels).
import "./managers-data.css";
import { onCleanup } from "hadi-march";
import { Button, Card, Badge, Toggle, Segmented, Slider, Field, TextInput, toast } from "hadi-march/ui";
import { flags, configureFlags, bucket } from "hadi-march/managers/flags";
import { logger, configureLog, consoleTransport, memoryTransport, beaconTransport, type Level } from "hadi-march/managers/log";
import { perf, type VitalName } from "hadi-march/managers/perf";
import { rateLimit } from "hadi-march/managers/rate";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { ticker, tone } from "../managers-data/ticker.ts";
import { ChannelPanel } from "../managers-data/channel-panel.tsx";

function FlagsDemo() {
  let $percent = 30
  let $user = "kullanici-42"
  const apply = () => configureFlags({ user: () => $user, overrideKey: "sc.flags.override", flags: {
    newCheckout: { percent: $percent }, pricing: { variants: { monthly: 50, annual: 50 } }, compactTables: true, betaSearch: { when: () => $user.startsWith("beta") },
  } })
  apply()
  onCleanup(() => configureFlags({ flags: {}, user: null, overrideKey: "flags.override" }))
  const src = { rule: "neutral", remote: "info", override: "warning" } as const
  return <Demo wide title="Özellik bayrakları" desc="Kademeli açılış kullanıcı kimliğinin karmasıyla: aynı kullanıcı hep aynı tarafta. A/B varyantları, koşullar, uzak değerler ve bu cihaza özel zorlama (yenilemeden sonra da kalır). feature: özniteliği öğeyi bayrağa göre gösterir."
    code={`configureFlags({ user: () => session.id, flags: { newCheckout: { percent: 30 }, pricing: { variants: { monthly: 50, annual: 50 } } } })
flags().on("newCheckout")   flags().variant("pricing")   flags().override("newCheckout", true)
<section feature:newCheckout>…</section>   <p feature:newCheckout={false}>…</p>   <p feature:pricing="annual">…</p>`}>
    <div class="sc-md-cols">
      <div class="sc-md-flag" feature:newCheckout><Badge tone="success">Yeni ödeme akışı</Badge><p>Tek sayfa, cüzdan ile öde.</p></div>
      <div class="sc-md-flag" feature:newCheckout={false}><Badge tone="neutral">Eski ödeme akışı</Badge><p>Üç adımlı form.</p></div>
      <div class="sc-md-flag" feature:pricing="annual"><Badge tone="info">Fiyat: yıllık varyant</Badge><p>2 ay bedava.</p></div>
      <div class="sc-md-flag" feature:pricing="monthly"><Badge tone="info">Fiyat: aylık varyant</Badge><p>İstediğin zaman bırak.</p></div>
    </div>
    <p class="hm-muted">{() => `Kullanıcı ${$user} → newCheckout kovası ${bucket($user, "newCheckout")} (eşik ${$percent})`}</p>
    <table class="sc-md-table">
      <thead><tr><th>Bayrak</th><th>Kural</th><th>Değer</th><th>Kaynak</th><th>Bu cihazda zorla</th></tr></thead>
      <tbody>{() => flags().list().map((f) => <tr>
        <td><code>{f.name}</code></td><td>{f.rule}</td><td>{String(f.value)}</td><td><Badge tone={src[f.source]}>{f.source}</Badge></td>
        <td><div class="sc-row">
          <Button size="sm" variant="ghost" on:click={() => flags().override(f.name, typeof f.value === "string" ? (f.value === "annual" ? "monthly" : "annual") : !f.value)}>Çevir</Button>
          {f.source === "override" ? <Button size="sm" variant="ghost" on:click={() => flags().override(f.name, null)}>Kaldır</Button> : null}
        </div></td>
      </tr>)}</tbody>
    </table>
    <div class="sc-row"><Button variant="secondary" on:click={() => flags().load({ compactTables: false })}>Uzak değerleri yükle</Button><Button variant="ghost" on:click={() => flags().clearOverrides()}>Zorlamaları temizle</Button></div>
    <Card title="Seçenekler" subtitle="FeatureFlag">
      <Field label="newCheckout açılış yüzdesi"><Slider bind:value={$percent} onChange={() => apply()} min={0} max={100} step={5} format={(v: number) => `%${v}`} /></Field>
      <Field label="Kullanıcı kimliği"><Segmented bind:value={$user} onChange={() => apply()} options={["kullanici-42", "kullanici-7", "beta-3"].map((v) => ({ value: v, label: v }))} /></Field>
    </Card>
  </Demo>
}

function LogDemo() {
  const mem = memoryTransport(30)
  let $allow = false
  let $batches: string[] = []
  const beacon = beaconTransport("/log", { batch: 3, minLevel: "warn", allow: () => $allow, send: (_u, body) => { $batches = [`${new Date().toLocaleTimeString()} · ${(JSON.parse(body) as unknown[]).length} kayıt`, ...$batches].slice(0, 4); return true } })
  configureLog({ level: "info", transports: [mem, consoleTransport(), beacon] })
  const log = logger().child("checkout", { cart: 3 })
  let $level: Level = "info"
  onCleanup(() => configureLog({ level: "info", transports: [consoleTransport()] }))
  return <Demo title="Günlük" desc="Düzeyler (debug < info < warn < error), taşıyıcılar (konsol, bellek, toplu beacon), alt kapsamlar ve gizli alanların maskelenmesi. Gönderim izin kapısından geçer: izin yokken kayıt cihazdan çıkmaz."
    code={`configureLog({ level: "info", transports: [consoleTransport(), beaconTransport("/log", { allow: () => consent.has("analytics") })] })
const log = logger().child("checkout", { cart: 3 })
log.warn("kart reddedildi", { card: "4242…" })   // card → [redacted]`}>
    <Segmented bind:value={$level} onChange={(v: Level) => logger().setLevel(v)} options={(["debug", "info", "warn", "error"] as const).map((v) => ({ value: v, label: v }))} />
    <div class="sc-row">
      <Button size="sm" variant="ghost" on:click={() => log.debug("sepet hesaplandı", { ms: 3 })}>debug</Button>
      <Button size="sm" variant="secondary" on:click={() => log.info("ödeme başladı", { amount: 420 })}>info</Button>
      <Button size="sm" variant="secondary" on:click={() => log.warn("kart reddedildi", { card: "4242 4242 4242 4242", password: "gizli" })}>warn</Button>
      <Button size="sm" variant="danger" on:click={() => log.error(new Error("ödeme servisi yanıt vermedi"))}>error</Button>
    </div>
    <ol class="sc-md-feed">{() => mem.entries().slice(0, 6).map((e) => <li><Badge tone={e.level === "error" ? "danger" : e.level === "warn" ? "warning" : e.level === "info" ? "info" : "neutral"}>{e.level}</Badge><code>{e.scope}</code><span>{e.msg} <span class="hm-muted">{e.data ? JSON.stringify(e.data).slice(0, 80) : ""}</span></span></li>)}</ol>
    <Toggle bind:value={$allow} label="Sunucuya gönderime izin var (warn ve üstü, 3'lü paket)" />
    <ul class="sc-mgr-log">{() => ($batches.length ? $batches.map((b) => <li>gönderildi: {b}</li>) : <li>{$allow ? "3 uyarı/hata biriktiğinde gönderilir." : "İzin kapalı: paketler atılır."}</li>)}</ul>
  </Demo>
}

function PerfDemo() {
  const p = perf()
  let $n = 200000
  const block = (ms: number) => { const end = performance.now() + ms; while (performance.now() < end) { /* busy */ } }
  const names: [VitalName, string][] = [["lcp", "LCP"], ["inp", "INP"], ["cls", "CLS"], ["fcp", "FCP"], ["ttfb", "TTFB"]]
  return <Demo title="Performans" desc="Core Web Vitals tarayıcının PerformanceObserver'ından, iyi / iyileştirilmeli / kötü sınıflarıyla. INP: ağır düğmeye bas, değer güncellenir. İşaretler ve ölçümler aynı zaman çizelgesine yazılır."
    code={`perf().vital("lcp")   // { value, rating }
perf().mark("search:start"); …; perf().measure("search", "search:start")
await perf().time("users", () => net.get("/api/users"))
perf().onReport((m) => log.info(m.name, m))`}>
    <div class="sc-md-vitals">{names.map(([k, label]) => <div class="sc-md-vital">
      <span class="hm-muted">{label}</span>
      {() => { const v = p.vital(k); return v ? <><strong>{k === "cls" ? v.value : `${v.value} ms`}</strong><Badge tone={tone(v.rating)}>{v.rating}</Badge></> : <span class="hm-muted">{p.supported().length ? "ölçülüyor…" : "desteklenmiyor"}</span> }}
    </div>)}</div>
    <div class="sc-row">
      <Button variant="danger" on:click={() => block(260)}>Ağır iş (260 ms, INP)</Button>
      <Button variant="secondary" on:click={() => p.time(`sırala ${$n}`, () => Array.from({ length: $n }, () => Math.random()).sort((a, b) => a - b))}>Ölç: sıralama</Button>
      <Button variant="ghost" on:click={() => { p.mark("demo:a"); block(30); p.mark("demo:b"); p.measure("işaret a→b", "demo:a", "demo:b") }}>İşaret a → b</Button>
      <Badge tone="neutral">uzun görev: {() => p.longTasks()}</Badge>
    </div>
    <ul class="sc-mgr-log">{() => p.measures().slice(0, 5).map((m) => <li><code>{m.name}</code> {m.duration} ms</li>)}</ul>
    <Card title="Seçenekler" subtitle="Performance">
      <Field label="Sıralanacak sayı"><Slider bind:value={$n} min={50000} max={1000000} step={50000} /></Field>
    </Card>
  </Demo>
}

function RateDemo() {
  const r = rateLimit()
  let $ms = 400
  let $keys = 0
  let $searches: string[] = []
  let $raw = 0
  let $throttled = 0
  const now = ticker(200)
  let search = r.debounce((q: string) => { $searches = [`“${q}”`, ...$searches].slice(0, 4) }, $ms, { maxWait: 2000 })
  const setMs = (v: number) => { $ms = v; search.cancel(); search = r.debounce((q: string) => { $searches = [`“${q}”`, ...$searches].slice(0, 4) }, v, { maxWait: 2000 }) }
  const move = r.throttle(() => { $throttled++ }, 100)
  const q = r.quota("demo.export", { limit: 3, per: "10s" })
  return <Demo title="Hız sınırı" desc="Debounce (en geç maxWait), throttle (baş + son) ve anahtar başına kayan pencereli kota. Bekleyen çağrı, kalan hak ve sıfırlanma süresi canlı."
    code={`const search = rateLimit().debounce((q) => api.search(q), 400, { maxWait: 2000 })
const onMove = rateLimit().throttle(draw, 100)
const quota = rateLimit().quota("export", { limit: 3, per: "10s" })
if (!quota.take()) toast(\`\${Math.ceil(quota.resetIn() / 1000)} sn sonra\`)`}>
    <Field label="Ara (her tuş bir çağrı)"><TextInput on:input={(e: Event) => { $keys++; search((e.target as HTMLInputElement).value) }} placeholder="Yazmaya başla…" /></Field>
    <p class="hm-muted">{() => `${$keys} tuş → ${$searches.length ? "son aramalar: " + $searches.join(", ") : "henüz arama yok"}${search.pending() ? " · bekliyor…" : ""}`}</p>
    <div class="sc-md-pad" on:pointermove={() => { $raw++; move() }}>Fareyi burada gezdir: {() => `${$raw} olay → ${$throttled} çizim`}</div>
    <div class="sc-row">
      <Button variant="primary" on:click={() => { if (q.take()) toast("Dışa aktarıldı"); else toast(`Kota doldu: ${Math.ceil(q.resetIn() / 1000)} sn sonra tekrar dene`, { kind: "warning" }) }}>Dışa aktar</Button>
      <Badge tone={() => (q.remaining() ? "success" : "danger")} dot>{() => { now(); return `kalan ${q.remaining()}/3${q.remaining() < 3 ? ` · ${Math.ceil(q.resetIn() / 1000)} sn` : ""}` }}</Badge>
      <Button variant="ghost" on:click={() => r.pause("demo.export", 5000)}>429 geldi: 5 sn duraklat</Button>
    </div>
    <Card title="Seçenekler" subtitle="RateLimit">
      <Field label="Debounce süresi (ms)"><Slider value={$ms} onChange={setMs} min={100} max={1500} step={100} /></Field>
    </Card>
  </Demo>
}

export default function ManagersOps(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "flags": () => <><ChannelPanel /><FlagsDemo /></>,
    "log": () => <><ChannelPanel /><LogDemo /></>,
    "perf": () => <><ChannelPanel /><PerfDemo /></>,
    "rate": () => <><ChannelPanel /><RateDemo /></>,
  }
  return <Hub section="/managers-ops" kicker="Temel › Yöneticiler" title="Bayrak, günlük, performans ve hız yöneticileri" lead="Özellik bayrakları, günlük, Web Vitals ve hız sınırı: her biri tek örnek, ilk kullanımda başlar, olaylarını kanala yayınlar." render={RENDER} params={props.params} />
}
