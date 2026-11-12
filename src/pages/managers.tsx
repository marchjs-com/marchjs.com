// Managers: ViewportManager (live signal panel, when: props, container sizes), ConsentManager (banner, preferences,
// analytics off without consent, third-party placeholder), CommandManager (one command in palette, menu, toolbar, button).
import { onCleanup } from "hadi-march";
import { Button, Menu, Card, Badge, Toggle, Segmented, Slider, Field, Alert, Kbd, openPalette } from "hadi-march/ui";
import { command as commandIcon, refresh, trash, download, copy, settings } from "hadi-march/icons";
import { viewport, configureViewport } from "hadi-march/managers/viewport";
import { consent, configureConsent } from "hadi-march/managers/consent";
import { ConsentBanner, ConsentGate, openConsentPreferences, showConsentBanner } from "hadi-march/managers/consent/ui";
import { command, commands, onCommandRun } from "hadi-march/managers/command";
import { commandItems, CommandButton, CommandToolbar, bindCommandKeys } from "hadi-march/managers/command/ui";
import { Demo, Section } from "../demo.tsx";

const yes = (v: boolean) => <Badge tone={v ? "success" : "neutral"} dot>{v ? "evet" : "hayır"}</Badge>

/** Live panel: every ViewportManager signal, updating as the window, settings or connection change. */
function SignalPanel() {
  const vp = viewport()
  const rows: [string, () => unknown][] = [
    ["breakpoint()", () => <strong>{vp.breakpoint()}</strong>],
    ["width() × height()", () => `${vp.width()} × ${vp.height()}`],
    ["mobile / tablet / desktop", () => (vp.mobile() ? "mobile" : vp.tablet() ? "tablet" : "desktop")],
    ["dark()", () => yes(vp.dark())],
    ["reducedMotion()", () => yes(vp.reducedMotion())],
    ["reducedData()", () => yes(vp.reducedData())],
    ["highContrast()", () => yes(vp.highContrast())],
    ["touch() / pointer()", () => `${vp.touch() ? "dokunmatik" : "dokunmatik değil"} · ${vp.pointer()}`],
    ["hover()", () => yes(vp.hover())],
    ["online()", () => yes(vp.online())],
    ["visible()", () => yes(vp.visible())],
    ["orientation()", () => vp.orientation()],
    ["safeArea()", () => { const a = vp.safeArea(); return `${a.top} ${a.right} ${a.bottom} ${a.left}` }],
  ]
  return <dl class="sc-mgr-signals">{rows.map(([k, v]) => <div class="sc-mgr-signal"><dt><code>{k}</code></dt><dd>{v}</dd></div>)}</dl>
}

/** A box the user can resize: its own breakpoint comes from container(), not from the window. */
function ContainerBox() {
  const el = <div class="sc-mgr-box"><p class="hm-muted">Köşeden sürükleyip boyutlandır.</p></div> as HTMLElement
  const size = viewport().container(el, { xs: 0, sm: 280, md: 420, lg: 560 })
  el.appendChild(<p>Kutu: <strong>{size.name()}</strong> · {size.width()} px</p> as Node)
  return el
}

function ViewportDemo() {
  let $tight = "default"
  const pick = (v: string) => { $tight = v; configureViewport(v === "tight" ? { breakpoints: { xs: 0, sm: 480, md: 600, lg: 900, xl: 1100, xxl: 1400 } } : { breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 } }) }
  onCleanup(() => configureViewport({ breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 } }))
  return <>
    <Demo wide title="Viewport: canlı sinyal paneli" desc="Tek kaynak: her matchMedia ve pencere dinleyicisi burada, ilk okunduğunda başlar. Pencereyi daralt, karanlık modu ya da hareketi azalt ayarını değiştir, sekmeyi değiştir, ağı kes: değerler anında güncellenir."
      code={`const vp = viewport()
vp.breakpoint()  vp.mobile()  vp.dark()  vp.reducedMotion()  vp.online()  vp.visible()  vp.safeArea()
<aside when:desktop>…</aside>   <p when:offline>Çevrimdışı</p>   <video when:reducedData={false} />`}>
      <SignalPanel />
      <div class="sc-row">
        <span when:mobile><Badge tone="info">when:mobile — telefondasın</Badge></span>
        <span when:tablet><Badge tone="info">when:tablet — tablet genişliği</Badge></span>
        <span when:desktop><Badge tone="info">when:desktop — geniş ekran</Badge></span>
        <span when:offline><Badge tone="warning">when:offline — bağlantı yok</Badge></span>
        <span when:reducedMotion><Badge tone="neutral">when:reducedMotion — hareket azaltıldı</Badge></span>
        <span when:dark><Badge tone="neutral">when:dark — karanlık tercih</Badge></span>
      </div>
    </Demo>
    <Demo title="Kapsayıcı kırılma noktaları" desc="container(el): boyut sınıfı pencereye değil kutunun kendisine göre; data-hm-bp özniteliğine de yazılır."
      code={`const size = viewport().container(el, { sm: 280, md: 420, lg: 560 })
size.name()   size.up("md")   // [data-hm-bp="md"] ile CSS de kullanabilir`}>
      <ContainerBox />
    </Demo>
    <Card title="Seçenekler" subtitle="Viewport">
      <Field label="Kırılma noktaları"><Segmented bind:value={$tight} onChange={pick} options={[{ value: "default", label: "Varsayılan (640/768/1024)" }, { value: "tight", label: "Sıkı (480/600/900)" }]} /></Field>
      <p class="hm-muted">configureViewport(): bağlı her gösterim yeni örneğe geçer; sayfadan çıkınca varsayılana döner.</p>
    </Card>
  </>
}

function ConsentDemo() {
  configureConsent({ storageKey: "sc.consent.demo", version: "1", policyHref: null })
  let $version = "1"
  let $inline = false
  let $log: string[] = []
  const send = consent.gate("analytics", (name: string) => { $log = [`gönderildi: ${name}`, ...$log].slice(0, 5); return true })
  const track = (name: string) => { if (!send(name)) $log = [`engellendi (rıza yok): ${name}`, ...$log].slice(0, 5) }
  const setVersion = (v: string) => { $version = v; configureConsent({ version: v }) }
  onCleanup(() => configureConsent({ storageKey: "hm.consent", version: "1" }))
  return <>
    <Demo wide title="Rıza: banner ve tercihler" desc="Zorunlu, tercih, analitik, pazarlama ve üçüncü taraf kategorileri. Reddet ile Kabul et aynı ağırlıkta; ikisi de banner'ı kapatır. Banner en üst katmanda (toast). Kayıt sürümlü ve tarihli; politika sürümü değişince yeniden sorulur."
      code={`configureConsent({ version: "2026-11", policyHref: "/gizlilik" })
<ConsentBanner text={t\`…uygulamanın hukuki metni…\`} />
openConsentPreferences()   showConsentBanner()   consent.withdraw()   consent.record()`}>
      {() => ($inline ? <ConsentBanner inline always /> : <ConsentBanner />)}
      <div class="sc-row">
        <Button variant="secondary" on:click={() => showConsentBanner()}>Banner'ı yeniden göster</Button>
        <Button icon={settings} on:click={() => openConsentPreferences()}>Tercihler</Button>
        <Button variant="ghost" on:click={() => consent.withdraw()}>Rızayı geri çek</Button>
      </div>
      <p class="hm-muted">Politika sürümü {() => $version} · kayıt: {() => { const r = consent.record(); return r ? `${r.method} · sürüm ${r.version} · ${new Date(r.date).toLocaleString()}` : "karar yok" }}</p>
      <div class="sc-row">{() => consent.categories().map((c) => <Badge tone={consent.has(c.id) ? "success" : "neutral"} dot>{c.id}</Badge>)}</div>
    </Demo>
    <Demo title="Rıza yokken analitik kapalı" desc="consent.gate('analytics', gönder): rıza yoksa gönder hiç çalışmaz. Log gönderimi ve üçüncü taraf kancaları da aynı kapıdan geçer."
      code={`const send = consent.gate("analytics", (name) => api.track(name))
send("tıklama")   // rıza yoksa undefined, ağ isteği yok`}>
      <div class="sc-row"><Button on:click={() => track("düğme tıklaması")}>Olay gönder</Button>{() => yes(consent.has("analytics"))}<span class="hm-muted">analitik izni</span></div>
      <ul class="sc-mgr-log">{() => $log.map((l) => <li>{l}</li>)}</ul>
    </Demo>
    <Demo title="Üçüncü taraf içerik" desc="ConsentGate: izin verilene kadar yer tutucu; yerinde izin verilebilir. whenGranted() yükler, geri çekilince kaldırır.">
      <ConsentGate category="thirdParty"><div class="sc-mgr-map"><strong>Harita yüklendi</strong><span class="hm-muted">(örnek gömülü içerik)</span></div></ConsentGate>
    </Demo>
    <Card title="Seçenekler" subtitle="Consent">
      <Toggle bind:value={$inline} label="Banner'ı sayfanın içinde göster (kapalıysa sayfanın altında, en üst katmanda)" />
      <Field label="Politika sürümü"><Segmented bind:value={$version} onChange={setVersion} options={[{ value: "1", label: "1" }, { value: "2", label: "2 (yeniden sor)" }]} /></Field>
    </Card>
  </>
}

function CommandDemo() {
  let $dirty = true
  let $canDelete = true
  let $ms = 1200
  let $history: string[] = []
  const wait = (ms: number, signal: AbortSignal) => new Promise<void>((res, rej) => { const id = setTimeout(res, ms); signal.addEventListener("abort", () => { clearTimeout(id); rej(Object.assign(new Error("iptal"), { name: "AbortError" })) }) })
  const save = command({ id: "demo.save", title: "Kaydet", icon: download, shortcut: "mod+shift+s", group: "Belge", when: () => $dirty,
    run: async ({ signal }) => { await wait($ms, signal); $dirty = false } })
  command({ id: "demo.copy", title: "Bağlantıyı kopyala", icon: copy, shortcut: "mod+shift+c", group: "Belge", run: () => "kopyalandı" })
  command({ id: "demo.refresh", title: "Yenile", icon: refresh, shortcut: "mod+shift+r", group: "Belge", concurrency: "restart", run: ({ signal }) => wait(800, signal) })
  command({ id: "demo.delete", title: "Sil", icon: trash, group: "Belge", danger: true, can: () => $canDelete, run: () => { $dirty = true } })
  command({ id: "demo.conflict", title: "Çakışan kısayol", group: "Deneme", shortcut: "mod+shift+c", palette: false, run: () => {} })
  bindCommandKeys()
  onCommandRun((r) => { if (r.id.startsWith("demo.")) $history = [`${new Date(r.at).toLocaleTimeString()} · ${r.title}`, ...$history].slice(0, 5) })
  return <>
    <Demo wide title="Komut: tek kayıt, her yerde aynı" desc="Aynı komut paletteki satırda, menüde, araç çubuğunda ve düz bir düğmede görünür; meşgul durumu, kullanılabilirlik (when) ve yetki (can) hepsinde aynı. Kaydet çalışırken iptal edilebilir."
      code={`command({ id: "demo.save", title: "Kaydet", shortcut: "mod+shift+s", group: "Belge", when: () => $dirty,
  run: async ({ signal }) => api.save(doc, { signal }) })
<Menu label="Belge" items={commandItems({ group: "Belge" })} />
<CommandToolbar pick={{ group: "Belge" }} />   <button command:demo.save>Kaydet</button>`}>
      <div class="sc-row">
        <Menu label="Belge" items={commandItems({ group: "Belge" })} />
        <CommandToolbar label="Belge araçları" pick={{ group: "Belge" }} />
        <Button variant="primary" icon={commandIcon} on:click={openPalette}>Palette aç</Button>
      </div>
      <div class="sc-row">
        <button type="button" class="hm-btn" command:demo.save>Düz düğme: command:demo.save</button>
        <CommandButton command="demo.save" variant="primary" />
        <Button variant="ghost" disabled={() => !save.busy()} on:click={() => save.cancel()}>İptal et</Button>
        <Kbd keys="mod+shift+s" />
      </div>
      <p class="hm-muted">Değişiklik var: {() => ($dirty ? "evet" : "hayır")} · Kaydediliyor: {() => (save.busy() ? "evet" : "hayır")}</p>
    </Demo>
    <Demo title="Kısayol çakışması ve geçmiş" desc="Aynı kısayol iki komuta verilince kayıt anında yakalanır. onCommandRun: geri alma ve denetim kaydı için geçmiş kancası.">
      {() => commands.conflicts().map((c) => <Alert tone="warning" title={`Çakışma: ${c.shortcut}`}>{c.ids.join(" ve ")}</Alert>)}
      <ul class="sc-mgr-log">{() => ($history.length ? $history.map((l) => <li>{l}</li>) : <li class="hm-muted">Henüz çalışan komut yok.</li>)}</ul>
    </Demo>
    <Card title="Seçenekler" subtitle="Command">
      <Toggle bind:value={$dirty} label="Kaydedilmemiş değişiklik var (when)" />
      <Toggle bind:value={$canDelete} label="Silme yetkisi (can): kapalıyken Sil hiçbir yerde görünmez" />
      <Field label="Kaydetme süresi (ms)"><Slider bind:value={$ms} min={200} max={4000} step={100} /></Field>
    </Card>
  </>
}

export default function Managers() {
  return <Section kicker="Temel" title="Yöneticiler" lead="Uygulama genelindeki hizmetler: tek örnek, ilk kullanımda başlar, tek yerden yapılandırılır ve kapatılır. Viewport ortamın tek sinyal kaynağı, Consent çerez ve KVKK/GDPR rızası, Command tek eylem kaydı.">
    <ViewportDemo />
    <ConsentDemo />
    <CommandDemo />
  </Section>
}
