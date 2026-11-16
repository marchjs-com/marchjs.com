// Home page sections (a lazy part): what an app needs around its components. Lazy pages, one chunk each; state that
// survives a reload (store + persist, the storage manager); the device as signals (presence, viewport, device,
// clipboard, idle); every language's plurals, numbers and dates; and the offline app with its updates (service
// worker). Real March APIs throughout; the numbers come from home-stats.gen.ts.
import "./app.css";
import { onCleanup } from "march";
import { inView, reducedMotion } from "march/motion";
import { store, persist } from "march/store";
import { storage } from "march/managers/storage";
import { presence } from "march/managers/presence";
import { viewport } from "march/managers/viewport";
import { device } from "march/managers/device";
import { clipboard } from "march/managers/clipboard";
import { idle } from "march/managers/idle";
import { format } from "march/i18n";
import { swState } from "march/sw";
import { Badge, Button, CodeView, Slider, TextInput } from "march/ui";
import { Reveal } from "march/components/landing/index.ts";
import { Icon, check, copy, globe, zap } from "march/icons";
import { HOME_STATS as S } from "../../home-stats.gen.ts";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

const kb = (bytes: number): string => `${Math.round(bytes / 1024)} KB`

// ── router: lazy pages, one chunk each ──────────────────────────────────────────────────────────────────────────

/** The pages of a small app; each one's bar is how much of the page budget its chunk takes (a picture, not a measure). */
const ROUTES: readonly { path: string; name: string; fill: number }[] = [
  { path: "/", name: "Ana sayfa", fill: 0.42 },
  { path: "/products", name: "Ürünler", fill: 0.68 },
  { path: "/cart", name: "Sepet", fill: 0.35 },
  { path: "/account", name: "Hesap", fill: 0.52 },
  { path: "/panel", name: "Panel", fill: 0.86 },
]
const LOAD_MS = 900

function Router() {
  let $loaded: readonly boolean[] = ROUTES.map(() => false)
  let $at = -1
  const load = (i: number): void => { $at = i; $loaded = $loaded.map((x, k) => x || k === i) }
  const play = (box: Element) => {
    let stop: (() => void) | undefined
    const off = inView(box, { once: true, threshold: 0.4, rootMargin: "0px",
      enter: () => {
        if (reducedMotion()) { $loaded = ROUTES.map(() => true); return }
        let i = 0
        stop = every(LOAD_MS, () => { if (i < ROUTES.length) load(i++); else { stop?.(); stop = undefined } })
      } })
    onCleanup(() => { off(); stop?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-ap-route-h">
    <Head id="sc-ap-route-h" kicker="Yönlendirici" color="brand-blue" title="Sayfaları parça parça yükleyen yönlendirici" example="Her sayfa kendi parçası, istenince gelir"
      lead={`Uygulamanın kabuğu ${kb(S.budget.entry)} ile açılır; her sayfa ayrı bir parça olarak gezinirken yüklenir ve hiçbiri ${kb(S.budget.route)} sınırını aşamaz. Bağlantının üstüne gelince önceden yüklenir.`} />
    <Reveal class="sc-ap-route" effect="up" stagger={100}>
      <div class="sc-ap-shell sc-card" ref={play}>
        <div class="sc-ap-shell-top"><Icon of={zap} size="md" /><b>Kabuk</b><Badge tone="success">{kb(S.budget.entry)}</Badge></div>
        <ol class="sc-ap-routes">
          {ROUTES.map((r, i) => <li>
            <button type="button" class={() => `sc-ap-routebtn${$loaded[i] ? " is-loaded" : ""}${$at === i ? " is-current" : ""}`} aria-pressed={() => String($at === i)}
              on:click={() => { $loaded = $loaded.map((x, k) => (k === i ? false : x)); queueMicrotask(() => load(i)) }}>
              <code>{r.path}</code><span class="sc-ap-routename">{r.name}</span>
              <span class="sc-ap-bar" aria-hidden="true"><i style={{ "--sc-ap-fill": String(r.fill) }} /></span>
              <span class="sc-ap-state">{() => ($loaded[i] ? "yüklendi" : "bekliyor")}</span>
            </button>
          </li>)}
        </ol>
      </div>
      <ul class="sc-ap-points">
        <li><Icon of={check} size="lg" /><span>Sayfa listesi ve kodu girişe girmez; sayfa eklemek açılışı büyütmez</span></li>
        <li><Icon of={check} size="lg" /><span>Bağlantıya gelince önceden yükleme, tıklayınca anında geçiş</span></li>
        <li><Icon of={check} size="lg" /><span>{`Her parça için bütçe: ${kb(S.budget.route)}; aşan derleme başarısız olur`}</span></li>
      </ul>
    </Reveal>
  </section>
}

// ── state that survives a reload ────────────────────────────────────────────────────────────────────────────────

/** The demo's own key (localStorage): a counter and a note. */
const KEY = "sc.home.keep"

function Keep() {
  const state = store({ count: 0, note: "" })
  onCleanup(persist(state, KEY))
  const saved = storage().persistent("local")
  return <section class="sc-sec" aria-labelledby="sc-ap-keep-h">
    <Head id="sc-ap-keep-h" kicker="Kalıcı durum" color="brand-green" title="Tarayıcıya yazılan kalıcı durum" example="Sayfayı yenile, yerinde kalır"
      lead="Reaktif bir depo tek satırla tarayıcıya yazılır; sürümler arası taşıma, süre sonu ve sekmeler arası eşitleme depolama yöneticisinde hazır." />
    <Reveal class="sc-ap-keep" effect="up" stagger={100}>
      <div class="sc-ap-keep-card sc-card">
        <div class="sc-ap-count"><b>{() => String(state.count)}</b><span>tıklama</span></div>
        <div class="sc-ap-keep-actions">
          <Button variant="primary" on:click={() => { state.count++ }}>Artır</Button>
          <Button variant="ghost" on:click={() => { state.count = 0; state.note = "" }}>Sıfırla</Button>
        </div>
        <TextInput value={state.note} onChange={(v: string) => { state.note = v }} placeholder="Bir not yaz, sonra sayfayı yenile" aria-label="Not" />
        <p class="sc-ap-keep-hint"><Icon of={check} size="sm" />{saved ? "Bu tarayıcıda kalıcı olarak saklanıyor" : "Bu tarayıcıda depolama kapalı: bellekte tutuluyor"}</p>
      </div>
      <CodeView class="sc-ap-code" lang="ts" label="Kod" code={`const state = store({ count: 0, note: "" })
persist(state, "${KEY}")

state.count++          // ekran ve depo birlikte güncellenir`} />
    </Reveal>
  </section>
}

// ── the device, as signals ──────────────────────────────────────────────────────────────────────────────────────

const PRESENCE: Record<string, string> = { active: "Etkin", idle: "Boşta", away: "Sekme arkada", offline: "Çevrimdışı" }

function Device() {
  const v = viewport(), d = device(), c = clipboard(), p = presence(), i = idle()
  let $copyText = "MarchJS 🧡"
  const ago = (): string => { const s = Math.max(0, Math.round((Date.now() - i.lastActive()) / 1000)); return s < 2 ? "şimdi" : `${s} sn önce` }
  return <section class="sc-sec" aria-labelledby="sc-ap-dev-h">
    <Head id="sc-ap-dev-h" kicker="Cihaz" color="brand-orange" title="Cihaz yöneticileri tarayıcıyı sinyale çevirir" example="Tarayıcının gücü, sinyal olarak"
      lead={`Bağlantı, ekran, pano, boşta kalma, konum, bildirim, izinler: ${S.managers} yönetici her şeyi okunur bir sinyale çevirir. Değişince yalnız ona bakan yer güncellenir.`} />
    <Reveal class="sc-ap-dev" effect="scale" stagger={70}>
      <div class="sc-ap-tile sc-card"><span class="sc-ap-cap">Durum</span>
        <b class={() => `sc-ap-presence is-${p.state()}`}>{() => PRESENCE[p.state()] ?? p.state()}</b>
        <span class="sc-ap-note">Bağlantıyı kes ya da sekmeyi değiştir</span></div>
      <div class="sc-ap-tile sc-card"><span class="sc-ap-cap">Ekran</span>
        <b>{() => `${v.width()} × ${v.height()}`}</b>
        <span class="sc-ap-note">{() => `kırılım: ${v.breakpoint()} · ${v.touch() ? "dokunmatik" : "fare"}`}</span></div>
      <div class="sc-ap-tile sc-card"><span class="sc-ap-cap">Cihaz</span>
        <b>{() => `${d.cores() ?? "?"} çekirdek`}</b>
        <span class="sc-ap-note">{() => `piksel oranı ${d.pixelRatio()} · ağ ${d.network().effectiveType}`}</span></div>
      <div class="sc-ap-tile sc-card"><span class="sc-ap-cap">Son hareket</span>
        <b>{() => (i.idle() ? "boşta" : ago())}</b>
        <span class="sc-ap-note">Hiçbir şeye dokunma, bekle</span></div>
      <div class="sc-ap-tile sc-card"><span class="sc-ap-cap">Pano</span>
        <TextInput bind:value={$copyText} aria-label="Kopyalanacak metin" />
        <Button size="sm" icon={copy} on:click={() => void c.copy($copyText)}>{() => (c.copied() ? "Kopyalandı" : "Kopyala")}</Button></div>
    </Reveal>
  </section>
}

// ── every language: plurals, numbers, dates ─────────────────────────────────────────────────────────────────────

/** The same three lines in four languages: a plural message, a price, a date and a relative time. */
const LOCALES: readonly { code: string; name: string; dir: "ltr" | "rtl"; msg: string }[] = [
  { code: "tr", name: "Türkçe", dir: "ltr", msg: "{n, plural, =0 {Yeni mesaj yok} other {# yeni mesaj}}" },
  { code: "en", name: "English", dir: "ltr", msg: "{n, plural, =0 {No new messages} one {# new message} other {# new messages}}" },
  { code: "ar", name: "العربية", dir: "rtl", msg: "{n, plural, zero {لا رسائل جديدة} one {رسالة جديدة واحدة} two {رسالتان جديدتان} few {# رسائل جديدة} many {# رسالة جديدة} other {# رسالة جديدة}}" },
  { code: "de", name: "Deutsch", dir: "ltr", msg: "{n, plural, =0 {Keine neuen Nachrichten} one {# neue Nachricht} other {# neue Nachrichten}}" },
]

function Locales() {
  let $n = 3
  const at = Date.now()
  const ago = (code: string): string => new Intl.RelativeTimeFormat(code, { numeric: "auto" }).format(-$n, "day")
  return <section class="sc-sec" aria-labelledby="sc-ap-intl-h">
    <Head id="sc-ap-intl-h" kicker="Çeviri" color="brand-purple" title="Her dilin kendi kuralıyla çeviri" example="Bir sayı, dört dil, doğru dilbilgisi"
      lead="Çoğul kuralları, para birimleri, tarihler ve göreli zaman her dilin kendi kuralıyla yazılır. Kaydırıcıyı oynat: Arapçanın altı çoğul biçimi bile doğru seçilir." />
    <div class="sc-ap-intl">
      <label class="sc-ap-intl-n"><span>Sayı</span><Slider bind:value={$n} min={0} max={24} aria-label="Sayı" /><b>{() => String($n)}</b></label>
      <Reveal class="sc-ap-intl-grid" effect="up" stagger={80}>
        {LOCALES.map((l) => <div class="sc-ap-intl-card sc-card" dir={l.dir} lang={l.code}>
          <span class="sc-ap-cap"><Icon of={globe} size="sm" /> {l.name}</span>
          <b>{() => format(l.msg, { n: $n }, l.code)}</b>
          <span>{() => format("{p, number, currency/EUR}", { p: $n * 12.5 }, l.code)}</span>
          <span>{() => format("{d, date, long}", { d: at + $n * 86400000 }, l.code)}</span>
          <span class="sc-ap-note">{() => ago(l.code)}</span>
        </div>)}
      </Reveal>
    </div>
  </section>
}

// ── offline, and the updates ────────────────────────────────────────────────────────────────────────────────────

/** The life of an offline app, step by step (the stage lights up in turn while on screen). */
const STEPS: readonly { title: string; text: string }[] = [
  { title: "Kurulur", text: "İlk ziyarette servis çalışanı kabuğu ve parçaları önbelleğe alır." },
  { title: "Çevrimdışı açılır", text: "Bağlantı yokken de uygulama anında açılır; veriler kuyrukta bekler." },
  { title: "Yeni sürüm iner", text: "Arka planda yeni sürüm hazırlanır, eski önbellek silinmez." },
  { title: "Tek dokunuşla güncellenir", text: "Kullanıcıya sorulur; onaylayınca sayfa yeni sürüme geçer." },
]
const SW_LABEL: Record<string, string> = { off: "kapalı (bu sayfada kayıtlı değil)", unsupported: "desteklenmiyor", installing: "kuruluyor", ready: "hazır", update: "yeni sürüm bekliyor", blocked: "engellendi", error: "hata" }
const STEP_MS = 1600

function Offline() {
  let $step = 0
  const play = (box: Element) => {
    let stop: (() => void) | undefined
    const off = inView(box, { once: false, threshold: 0.4, rootMargin: "0px",
      enter: () => { if (!reducedMotion()) stop ??= every(STEP_MS, () => { $step = ($step + 1) % STEPS.length }) },
      leave: () => { stop?.(); stop = undefined } })
    onCleanup(() => { off(); stop?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-ap-sw-h">
    <Head id="sc-ap-sw-h" kicker="Çevrimdışı" color="brand-green" title="Çevrimdışı da çalışan uygulamalar" example="İnternet gitse de uygulama açık kalır"
      lead="Servis çalışanı tek çağrıyla kurulur: önbellek sürüm başına ayrılır, eski sürümler temizlenir, yeni sürüm hazır olunca bir bant sorar." />
    <div class="sc-ap-sw" ref={play}>
      <ol class="sc-ap-steps">
        {STEPS.map((s, i) => <li class={() => `sc-ap-step sc-card${$step === i ? " is-on" : ""}${$step > i ? " is-done" : ""}`}>
          <span class="sc-ap-dot" aria-hidden="true">{() => ($step > i ? "✓" : String(i + 1))}</span>
          <b>{s.title}</b><span>{s.text}</span>
        </li>)}
      </ol>
      <p class="sc-ap-sw-live"><span class="sc-ap-cap">Bu sayfada</span> <Badge tone="info">{() => SW_LABEL[swState()] ?? swState()}</Badge></p>
    </div>
  </section>
}

export default function MoreApp() {
  return <>
    <Router />
    <Keep />
    <Device />
    <Locales />
    <Offline />
  </>
}
