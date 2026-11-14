// Environment managers: Idle, Sync (offline queue over net), Device, Permission, Location, Notification, Window,
// Scroll, Session and Presence — each with a live demo — and the `managers` channel every one of them reports to.
// The demos live in env-managers/; Sync brings net, the mock server and its manager as a lazy part (sync-server.ts).
import { onCleanup, untrack } from "hadi-march";
import { Button, Card, Badge, Toggle, Slider, Field, TextInput, Progress, Chip } from "hadi-march/ui";
import { onManager, managerChannel, type ManagerMessage } from "hadi-march/managers/channels";
import { idle, configureIdle } from "hadi-march/managers/idle";
import { device, configureDevice, type DeviceFeature } from "hadi-march/managers/device";
import { appWindow } from "hadi-march/managers/window";
import { scroll, configureScroll } from "hadi-march/managers/scroll";
import { presence, configurePresence, type PresenceState } from "hadi-march/managers/presence";
import { Demo } from "../demo.tsx";
import { Hub } from "../hub.tsx";
import { yes, time, secs, clock, Signals } from "../env-managers/common.tsx";

import { SyncDemo } from "../env-managers/sync.tsx";
import { SessionDemo } from "../env-managers/session.tsx";
import { PermissionDemo, LocationDemo, NotificationDemo } from "../env-managers/access.tsx";

// ------------------------------------------------------------------ the managers channel
const NAMES = ["idle", "sync", "device", "permission", "location", "notification", "window", "scroll", "session", "presence"]
function EventFeed() {
  let $log: ManagerMessage[] = managerChannel.history().filter((m) => NAMES.includes(m.manager)).slice(-12).reverse()
  let $only = new Set<string>()
  let $paused = false
  onManager("*", (m) => { if (!$paused && NAMES.includes(m.manager)) $log = [m, ...$log].slice(0, 40) })
  const toggle = (n: string) => { const s = new Set($only); s.has(n) ? s.delete(n) : s.add(n); $only = s }
  const shown = () => $log.filter((m) => !$only.size || $only.has(m.manager)).slice(0, 12)
  return <Demo wide title="Olay akışı: managers kanalı" desc="Her yönetici olaylarını kanala yayınlar (konu <yönetici>:<olay>; ayrıca managers.<yönetici> kanalı). Bağlamak gerekmez; bileşenler yöneticiyi tanımadan, istedikleri kadar dinleyiciyle dinler. Aşağıdaki demoları kullan: olaylar burada anında görünür."
    code={`onManager("session:*", (m) => …)            // m.topic "session:warn", m.detail
onManager("*", log)                          // her şey; bileşenle birlikte kalkar
managerChannelOf("undo").on((e) => …)       // tek yöneticinin kanalı: { type, detail }
onChannels("managers.*", (m) => …)           // hadi-march/channel joker karakteriyle`}>
    <div class="sc-row">{NAMES.map((n) => <Chip selected={() => $only.has(n)} on:click={() => toggle(n)}>{n}</Chip>)}</div>
    <div class="sc-row"><Toggle bind:value={$paused} label="Akışı duraklat" /><Button variant="ghost" on:click={() => { $log = [] }}>Temizle</Button></div>
    <ol class="sc-mgr-feed" aria-live="polite">{() => shown().length ? shown().map((m) => <li><code>{m.topic}</code><span class="m-muted">{time(m.at)}</span>{m.detail !== undefined ? <span class="sc-mgr-detail">{JSON.stringify(m.detail)}</span> : null}</li>) : <li class="m-muted">Henüz olay yok.</li>}</ol>
  </Demo>
}

// ------------------------------------------------------------------ Idle
function IdleDemo() {
  let $timeout = 10
  configureIdle({ timeout: $timeout * 1000 })
  const set = (v: number) => { $timeout = v; configureIdle({ timeout: v * 1000 }) }
  onCleanup(() => configureIdle({ timeout: 60_000 }))
  const now = clock()
  const left = () => (idle().idle() || idle().paused() ? 0 : Math.max(0, $timeout * 1000 - (now() - idle().lastActive())))
  return <Demo title="Idle: kullanıcı boşta mı?" desc="İşaretçi, klavye, tekerlek, dokunma ve kaydırma etkinlik sayılır. Süre dolunca idle() true olur; ilk hareket onActive çağırır. Fareyi bırak ve bekle."
    code={`configureIdle({ timeout: 5 * 60_000 })
idle().idle()   idle().onIdle(pauseVideo)   idle().onActive(refresh)
idle().pause()  // uzun yükleme sürerken boşta sayılmaz`}>
    <div class="sc-row">{() => idle().idle() ? <Badge tone="warn" dot>Boşta</Badge> : <Badge tone="success" dot>Etkin</Badge>}<span class="m-muted">son etkinlik {() => time(idle().lastActive())}</span></div>
    <Progress value={() => (left() / ($timeout * 1000)) * 100} label={() => `Boşta sayılmaya ${secs(left())}`} showValue={false} />
    <Field label={() => `Süre: ${$timeout} sn`}><Slider value={$timeout} onChange={set} min={3} max={60} step={1} /></Field>
    <Toggle value={idle().paused()} onChange={(v: boolean) => (v ? idle().pause() : idle().resume())} label="Duraklat (ör. video oynarken)" />
  </Demo>
}

// ------------------------------------------------------------------ Device
const FEATURE_LABEL: Partial<Record<DeviceFeature, string>> = { serviceWorker: "Service Worker", webgl2: "WebGL 2", webgpu: "WebGPU", share: "Paylaş", clipboard: "Pano", vibrate: "Titreşim",
  notifications: "Bildirim", geolocation: "Konum", bluetooth: "Bluetooth", usb: "USB", nfc: "NFC", wakeLock: "Ekranı açık tut", webAuthn: "Passkey", paymentRequest: "Ödeme isteği",
  speechSynthesis: "Konuşma", mediaDevices: "Kamera/mikrofon", offscreenCanvas: "OffscreenCanvas", viewTransitions: "View Transitions", indexedDB: "IndexedDB", battery: "Pil" }
function DeviceDemo() {
  const d = () => device()
  let $storage = ""
  let $lowMem = 2
  let $lowCores = 2
  // read once: configureDevice() re-creates the manager, so a region that reads d() redraws on every slider step
  // (the slider would be rebuilt mid-drag); memory and cores never change while the page is open
  const hasMem = untrack(() => d().memory() !== null), hasCores = untrack(() => d().cores() !== null)
  onCleanup(() => configureDevice({ lowMemory: 2, lowCores: 2 }))
  const measure = async () => { const s = await device().storage(); $storage = s ? `${(s.usage / 1e6).toFixed(1)} MB / ${(s.quota / 1e9).toFixed(1)} GB${s.persisted ? " · kalıcı" : ""}` : "bu tarayıcıda yok" }
  return <Demo wide title="Device: bu cihaz neler yapabilir?" desc="Bellek, çekirdek, dokunma noktası, piksel oranı, ağ türü ve pil sinyal olarak; yeteneklerin listesi. Ağ ayarını (DevTools › Network) değiştir ya da pencereyi başka ekrana taşı: değerler güncellenir."
    code={`const d = device()
d().network().effectiveType   d().slowNetwork()   d().lowEnd()   d().battery()?.level
d().supports("share")   await d().storage()   d().vibrate(40)`}>
    <Signals rows={[
      ["memory()", () => (d().memory() === null ? "bilinmiyor" : `${d().memory()} GB`)],
      ["cores()", () => d().cores() ?? "bilinmiyor"],
      ["touchPoints()", () => d().touchPoints()],
      ["pixelRatio()", () => d().pixelRatio()],
      ["mobile() / platform()", () => `${d().mobile() ? "mobil" : "masaüstü"} · ${d().platform()}`],
      ["network()", () => { const n = d().network(); return `${n.type} · ${n.effectiveType}${n.downlink !== null ? ` · ${n.downlink} Mbit/s` : ""}${n.rtt !== null ? ` · ${n.rtt} ms` : ""}` }],
      ["slowNetwork()", () => yes(d().slowNetwork())],
      ["lowEnd()", () => yes(d().lowEnd())],
      ["battery()", () => { const b = d().battery(); return b ? `%${Math.round(b.level * 100)}${b.charging ? " · şarj oluyor" : ""}` : d().supports("battery") ? "okunuyor…" : "bu tarayıcıda yok" }],
    ]} />
    <div class="sc-row">{(Object.keys(FEATURE_LABEL) as DeviceFeature[]).map((f) => <Badge tone={d().supports(f) ? "success" : "neutral"} dot>{FEATURE_LABEL[f]}</Badge>)}</div>
    <div class="sc-row">
      <Button variant="secondary" on:click={measure}>Depolamayı ölç</Button>{() => ($storage ? <span>{$storage}</span> : null)}
      {d().supports("vibrate") ? <Button variant="ghost" on:click={() => d().vibrate([60, 40, 60])}>Titret</Button> : null}
    </div>
    {hasMem || hasCores ? <Card title="Seçenekler" subtitle="lowEnd() eşikleri">
      {hasMem ? <Field label={() => `Bellek ≤ ${$lowMem} GB`}><Slider value={$lowMem} onChange={(v: number) => { $lowMem = v; configureDevice({ lowMemory: v }) }} min={0.5} max={16} step={0.5} /></Field> : null}
      {hasCores ? <Field label={() => `Çekirdek ≤ ${$lowCores}`}><Slider value={$lowCores} onChange={(v: number) => { $lowCores = v; configureDevice({ lowCores: v }) }} min={1} max={32} step={1} /></Field> : null}
      <p class="m-muted">lowEnd() şimdi: {() => (device().lowEnd() ? "düşük donanım — efektleri azalt" : "yeterli")}</p>
    </Card> : null}
  </Demo>
}

// ------------------------------------------------------------------ Window
function WindowDemo() {
  const w = appWindow()
  let $text = "Merhaba diğer sekme"
  let $inbox: string[] = []
  w.on("demo.note", (data, from) => { $inbox = [`${time(Date.now())} · ${from}: ${String(data)}`, ...$inbox].slice(0, 5) })
  return <Demo title="Window: görünürlük, odak, sekmeler" desc="Bu sayfayı ikinci bir sekmede aç: sekme sayısı, lider sekme ve mesajlar BroadcastChannel üzerinden canlı. Lider, ortak işi (yoklama, soket) tek sekmede çalıştırır."
    code={`appWindow().count()   appWindow().leader()   appWindow().visible()   appWindow().focused()
appWindow().broadcast("cart", { count: 3 });   appWindow().on("cart", (data, from) => …)`}>
    <Signals rows={[
      ["id", () => w.id],
      ["visible() / focused()", () => <>{yes(w.visible())} {yes(w.focused())}</>],
      ["count()", () => <strong>{w.count()}</strong>],
      ["leader()", () => yes(w.leader())],
    ]} />
    <ul class="sc-mgr-log">{() => w.tabs().map((t) => <li>{t.self ? <strong>{t.id} (bu sekme)</strong> : t.id} · {t.visible ? "görünür" : "gizli"}{t.focused ? " · odakta" : ""}</li>)}</ul>
    <div class="sc-row">
      <TextInput bind:value={$text} />
      <Button variant="primary" disabled={() => w.count() < 2} on:click={() => w.broadcast("demo.note", $text)}>Diğer sekmelere gönder</Button>
    </div>
    <ul class="sc-mgr-log">{() => ($inbox.length ? $inbox.map((m) => <li>{m}</li>) : <li>Başka sekmeden mesaj yok.</li>)}</ul>
  </Demo>
}

// ------------------------------------------------------------------ Scroll
const SPY = [["intro", "Giriş"], ["setup", "Kurulum"], ["usage", "Kullanım"], ["faq", "Sorular"]]
function ScrollDemo() {
  const s = scroll()
  let $locks: (() => void)[] = []
  let $saved = ""
  let $offset = 8
  onCleanup(() => { for (const r of $locks) r(); configureScroll({ offset: 64 }) })
  const box = <div class="sc-mgr-spybox" tabindex="0" aria-label="Kaydırılabilir belge">{SPY.map(([id, title]) => <section id={`spy-${id}`}><h3>{title}</h3><p class="m-muted">Bu bölümü kaydır; soldaki içindekiler okunan bölümü işaretler. scrollspy kutunun kendisini dinler.</p><p class="m-muted">Uzun metin yerine boşluk: bölüm yüksekliği gerçek bir belgeyi taklit eder.</p></section>)}</div> as HTMLElement
  let $spyVersion = 0
  let spy = s.spy(SPY.map(([id]) => `spy-${id}`), { root: box, offset: $offset })
  onCleanup(() => spy.stop())
  const setOffset = (v: number) => { $offset = v; spy.stop(); spy = s.spy(SPY.map(([id]) => `spy-${id}`), { root: box, offset: v }); $spyVersion++ }
  const active = () => { $spyVersion; return spy.active() }
  const jump = (id: string) => { const el = box.querySelector<HTMLElement>(`#spy-${id}`); if (el) box.scrollTo({ top: el.offsetTop - box.offsetTop - $offset, behavior: "smooth" }) }
  return <Demo wide title="Scroll: konum, kilit, geri yükleme, scrollspy" desc="Sayfa konumu, yönü ve ilerlemesi sinyal. Kilit iç içe sayılır ve kaydırma çubuğu genişliği korunur (sayfa kaymaz). Konum anahtarla kaydedilir ve geri yüklenir (sessionStorage)."
    code={`scroll().y()  scroll().direction()  scroll().progress()
const release = scroll().lock()          // iç içe kilitler sayılır
scroll().save("liste");  scroll().restore("liste")
const spy = scroll().spy(["giris", "kurulum"]);  spy.active()`}>
    <Signals rows={[
      ["y()", () => `${Math.round(s.y())} px`],
      ["direction()", () => ({ up: "yukarı", down: "aşağı", none: "—" })[s.direction()]],
      ["progress()", () => `%${Math.round(s.progress() * 100)}`],
      ["locked()", () => yes(s.locked())],
    ]} />
    <Progress value={() => s.progress() * 100} label="Sayfa ilerlemesi" />
    <div class="sc-row">
      <Button variant="secondary" on:click={() => { $locks = [...$locks, s.lock()] }}>Kilitle ({() => $locks.length})</Button>
      <Button variant="secondary" disabled={() => !$locks.length} on:click={() => { const l = $locks[$locks.length - 1]; l?.(); $locks = $locks.slice(0, -1) }}>Bir kilidi aç</Button>
      <Button variant="ghost" on:click={() => { s.save("demo"); $saved = `${Math.round(s.y())} px kaydedildi` }}>Konumu kaydet</Button>
      <Button variant="ghost" disabled={() => !$saved} on:click={() => s.restore("demo")}>Kaydedilen konuma dön</Button>
      {() => ($saved ? <span class="m-muted">{$saved}</span> : null)}
    </div>
    <div class="sc-mgr-spy">
      <nav aria-label="İçindekiler"><ol class="sc-mgr-toc">{SPY.map(([id, title]) => <li><a href={`#spy-${id}`} aria-current={() => (active() === `spy-${id}` ? "true" : null)} on:click={(e: Event) => { e.preventDefault(); jump(id!) }}>{title}</a></li>)}</ol></nav>
      {box}
    </div>
    <Field label={() => `Scrollspy payı: ${$offset} px`}><Slider value={$offset} onChange={setOffset} min={0} max={160} step={4} /></Field>
  </Demo>
}

// ------------------------------------------------------------------ Presence
const P_TEXT: Record<PresenceState, string> = { active: "etkin", idle: "boşta", away: "uzakta", offline: "çevrimdışı" }
const P_TONE: Record<PresenceState, string> = { active: "success", idle: "warn", away: "neutral", offline: "danger" }
const TEAM = ["Deniz", "Ece", "Mert", "Ada"]
function PresenceDemo() {
  let $sent: string[] = []
  let $team = false
  configurePresence({ report: (s) => { $sent = [`${time(Date.now())} · sunucuya: ${P_TEXT[s]}`, ...$sent].slice(0, 5) }, heartbeat: 0 })
  let timer: ReturnType<typeof setInterval> | null = null
  const STATES: PresenceState[] = ["active", "active", "idle", "away", "offline"]
  const simulate = (on: boolean) => {
    $team = on
    if (timer) clearInterval(timer)
    timer = null
    if (!on) { for (const n of TEAM) presence().removePeer(n); return }
    const step = () => { for (const n of TEAM) if (Math.random() < 0.5 || !presence().peers().some((p) => p.id === n)) presence().setPeer(n, STATES[Math.floor(Math.random() * STATES.length)]!) }
    step()
    timer = setInterval(step, 3000)
  }
  onCleanup(() => { simulate(false); configurePresence({ report: null, heartbeat: 30_000 }) })
  const dot = (s: PresenceState) => <Badge tone={P_TONE[s]} dot>{P_TEXT[s]}</Badge>
  return <Demo title="Presence: kullanıcı burada mı?" desc="Idle, Window ve bağlantıdan tek durum: etkin, boşta, uzakta (sekme gizli), çevrimdışı. Birden çok sekmede en etkin olanı kazanır; durum değişince report ile sunucuya bildirilir. Başka kişilerin durumu setPeer ile tutulur."
    code={`configurePresence({ report: (s) => socket.send({ type: "presence", state: s }) })
presence().state()   presence().overall()   presence().tabs()   presence().setPeer(id, "idle")`}>
    <Signals rows={[
      ["state()", () => dot(presence().state())],
      ["overall()", () => dot(presence().overall())],
      ["since()", () => time(presence().since())],
      ["tabs()", () => presence().tabs().length ? presence().tabs().map((t) => `${t.id}: ${P_TEXT[t.state]}`).join(", ") : "yalnız bu sekme"],
    ]} />
    <ul class="sc-mgr-log">{() => ($sent.length ? $sent.map((m) => <li>{m}</li>) : <li>Henüz bildirim yok.</li>)}</ul>
    <Toggle value={$team} onChange={simulate} label="Takımı canlandır (sunucudan gelen durumlar)" />
    {() => ($team ? <div class="sc-row">{presence().peers().map((p) => <span class="sc-mgr-peer"><strong>{p.id}</strong>{dot(p.state)}</span>)}</div> : null)}
  </Demo>
}

export default function ManagersEnv(props: { params?: { rest?: string } }) {
  const RENDER: Record<string, () => unknown> = {
    "idle": () => <><EventFeed /><IdleDemo /></>,
    "presence": () => <><EventFeed /><PresenceDemo /></>,
    "sync": () => <><EventFeed /><SyncDemo /></>,
    "session": () => <><EventFeed /><SessionDemo /></>,
    "permission": () => <><EventFeed /><PermissionDemo /></>,
    "location": () => <><EventFeed /><LocationDemo /></>,
    "notification": () => <><EventFeed /><NotificationDemo /></>,
    "window": () => <><EventFeed /><WindowDemo /></>,
    "scroll": () => <><EventFeed /><ScrollDemo /></>,
    "device": () => <><EventFeed /><DeviceDemo /></>,
  }
  return <Hub section="/managers-env" kicker="Temel › Yöneticiler" title="Ortam yöneticileri" lead="Kullanıcının ve cihazın durumu için uygulama genelinde hizmetler: boşta olma, çevrimdışı eşitleme, cihaz yetenekleri, izinler, konum, bildirimler, sekmeler, kaydırma, oturum süresi ve varlık. Hepsi tek örnek, ilk kullanımda başlar ve olaylarını managers kanalına yayınlar." render={RENDER} params={props.params} />
}
