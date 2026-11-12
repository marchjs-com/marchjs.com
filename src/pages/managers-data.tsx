// Data managers: Clipboard, Undo (on the command registry), DirtyState, Storage, Cache, Config, FeatureFlag, Log,
// Performance and RateLimit (the last four on managers-ops.tsx). Each demo drives the real manager; the channel panel at the top shows the events they
// publish on "managers.*".
import "./managers-data.css";
import { onCleanup } from "hadi-march";
import { Button, Card, Badge, Toggle, Segmented, Slider, Field, TextInput, Kbd, Alert, toast } from "hadi-march/ui";
import { clipboard } from "hadi-march/managers/clipboard";
import { undoStack, undoCommands, disposeUndo } from "hadi-march/managers/undo";
import { dirtyState, configureDirty } from "hadi-march/managers/dirty";
import { storage, persisted, configureStorage } from "hadi-march/managers/storage";
import { appCache, configureCache } from "hadi-march/managers/cache";
import { appConfig, configureAppConfig } from "hadi-march/managers/config";
import { command } from "hadi-march/managers/command";
import { CommandButton, bindCommandKeys } from "hadi-march/managers/command/ui";
import { Demo, Section } from "../demo.tsx";
import { ticker } from "../managers-data/ticker.ts";
import { ChannelPanel } from "../managers-data/channel-panel.tsx";

function ClipboardDemo() {
  const c = clipboard()
  let $text = "https://march.example/davet/7Q4K"
  let $pasted = "Buraya yapıştır (Ctrl+V)."
  const area = <div class="sc-md-paste" tabindex="0" role="textbox" aria-label="Yapıştırma alanı">{() => $pasted}</div> as HTMLElement
  c.onPaste(area, (p) => { $pasted = p.files.length ? `${p.files.length} dosya: ${p.files.map((f) => f.name).join(", ")}` : `${p.text.length} karakter${p.html ? " (HTML de var)" : ""}: ${p.text.slice(0, 80)}` })
  return <Demo title="Pano" desc="copy() metin, zengin (HTML) ve dosya kopyalar; async API yoksa gizli textarea ile düşer. copied() geri bildirim için kısa süre true; son kopyalar geçmişte."
    code={`await clipboard().copy("metin")      // true / false
await clipboard().copy({ text, html })
<button copy:text={() => link}>Kopyala</button>
clipboard().onPaste(el, (p) => p.text, p.files)`}>
    <Field label="Metin"><TextInput bind:value={$text} /></Field>
    <div class="sc-row">
      <button type="button" class="hm-btn hm-btn-primary" copy:text={() => $text}>{() => (c.copied() ? "Kopyalandı ✓" : "Kopyala (copy:text)")}</button>
      <Button variant="secondary" on:click={() => c.copy({ text: $text, html: `<a href="${$text}">${$text}</a>` })}>Bağlantı olarak kopyala</Button>
      <Badge tone={c.supported() ? "success" : "warning"} dot>{c.supported() ? "Clipboard API" : "yedek yol"}</Badge>
    </div>
    {area}
    <ul class="sc-mgr-log">{() => (c.history().length ? c.history().map((e) => <li><code>{e.kind}</code> {e.text}</li>) : <li>Geçmiş boş.</li>)}</ul>
  </Demo>
}

function UndoDirtyDemo() {
  disposeUndo()
  const u = undoStack()
  undoCommands("Düzen")
  bindCommandKeys()
  let $items: string[] = ["Elma", "Armut"]
  let $title = "Alışveriş listesi"
  let $form = false
  let next = 1
  const add = command({ id: "demo.list.add", title: "Öğe ekle", group: "Düzen",
    run: () => { const name = `Öğe ${next++}`; $items = [...$items, name]; return { label: `Ekle: ${name}`, undo: () => { $items = $items.filter((x) => x !== name) }, redo: () => { $items = [...$items, name] } } } })
  const remove = (name: string) => { const at = $items.indexOf(name); u.run(`Sil: ${name}`, () => { $items = $items.filter((x) => x !== name) }, () => { const l = [...$items]; l.splice(at, 0, name); $items = l }) }
  const addThree = () => u.transaction("3 öğe ekle", () => { for (let i = 0; i < 3; i++) { const name = `Toplu ${next++}`; u.run(name, () => { $items = [...$items, name] }, () => { $items = $items.filter((x) => x !== name) }) } })
  const rename = (v: string) => { const before = $title; u.run("Başlığı yaz", () => { $title = v }, () => { $title = before }, "title") }

  configureDirty({ guardRoutes: true, warnOnUnload: true })
  const d = dirtyState()
  d.track("doc", () => !u.atSaved(), "Liste", () => u.markSaved())
  d.track("form", () => $form, "Ayarlar formu", () => { $form = false })
  let $leave = ""
  onCleanup(() => configureDirty({}))
  return <>
    <Demo wide title="Geri al / yinele" desc="Komutlar run() içinden { undo, redo } döndürünce geçmişe kendiliğinden girer; etiketi komutun adı. Ctrl+Z / Ctrl+Shift+Z, palet ve düğmeler aynı edit.undo / edit.redo komutları. Yazma adımları birleşir, toplu işlem tek adım."
      code={`command({ id: "list.add", title: "Öğe ekle", run: () => { add(x); return { undo: () => drop(x), redo: () => add(x) } } })
undoCommands()                                         // edit.undo (mod+z), edit.redo (mod+shift+z)
undoStack().run("Sil", () => drop(x), () => insert(x))
undoStack().transaction("3 öğe ekle", () => { … })
undoStack().run("Başlık", set(v), set(old), "title")  // aynı anahtar: birleşir`}>
      <Field label="Başlık (yazarken adımlar birleşir)"><TextInput value={() => $title} on:input={(e: Event) => rename((e.target as HTMLInputElement).value)} /></Field>
      <ul class="sc-md-items">{() => $items.map((x) => <li><span>{x}</span><Button size="sm" variant="ghost" on:click={() => remove(x)}>Sil</Button></li>)}</ul>
      <div class="sc-row">
        <CommandButton command="demo.list.add" variant="secondary" />
        <Button variant="secondary" on:click={addThree}>3 öğe ekle (tek adım)</Button>
        <CommandButton command="edit.undo" />
        <CommandButton command="edit.redo" />
        <Kbd keys="mod+z" /><Kbd keys="mod+shift+z" />
      </div>
      <div class="sc-md-cols">
        <div><strong>Geri alınabilir</strong><ol class="sc-mgr-log">{() => u.past().map((l) => <li>{l}</li>)}</ol></div>
        <div><strong>Yinelenebilir</strong><ol class="sc-mgr-log">{() => u.future().map((l) => <li>{l}</li>)}</ol></div>
      </div>
      <p class="hm-muted">{() => `${$items.length} öğe · ${add.busy() ? "çalışıyor" : "hazır"}`}</p>
    </Demo>
    <Demo title="Kaydedilmemiş değişiklik" desc="Liste, geri alma geçmişinin kayıt noktasından ayrılınca kirli olur; ayar formu ayrı bir kaynak. Kirliyken sekmeyi kapatmak ya da menüden başka sayfaya geçmek onay ister."
      code={`dirtyState().track("doc", () => !undoStack().atSaved(), "Liste", save)
dirtyState().any()   dirtyState().list()   await dirtyState().confirmLeave()   dirtyState().saveAll()`}>
      <div class="sc-row">{() => (d.any() ? d.list().map((e) => <Badge tone="warning" dot>{e.label}</Badge>) : <Badge tone="success" dot>Her şey kaydedildi</Badge>)}</div>
      <Toggle bind:value={$form} label="Ayarlar formunda değişiklik var" />
      <div class="sc-row">
        <Button variant="primary" disabled={() => !d.any()} on:click={async () => { const n = await d.saveAll(); toast(`${n} kaynak kaydedildi`) }}>Hepsini kaydet</Button>
        <Button variant="secondary" on:click={async () => { $leave = (await d.confirmLeave()) ? "Ayrılmaya izin verildi" : "Sayfada kalındı" }}>Ayrılmayı dene</Button>
      </div>
      <p class="hm-muted">{() => $leave || "Kirliyken sayfayı yenilemeyi ya da menüden başka sayfaya gitmeyi dene."}</p>
    </Demo>
  </>
}

function StorageDemo() {
  configureStorage({ prefix: "sc.data.", version: 1, migrations: {} })
  const s = storage()
  let $area: "local" | "session" | "idb" | "memory" = "local"
  let $key = "not"
  let $value = "Merhaba"
  let $rows: { key: string; value: string }[] = []
  let $migrated = ""
  const refresh = async () => { const a = s.area($area); const keys = await a.keys(); $rows = await Promise.all(keys.map(async (k) => ({ key: k, value: JSON.stringify(await a.get(k)) }))) }
  const visits = persisted("visits", 0)
  visits.update((n) => n + 1)
  const migrate = async () => {
    localStorage.setItem("sc.data.prefs", JSON.stringify({ v: 1, d: { theme: "dark" } }))
    configureStorage({ prefix: "sc.data.", version: 3, migrations: { 2: (v) => ({ ...v, density: "comfortable" }), 3: (v) => ({ theme: v.theme, density: v.density, fontScale: 1 }) } })
    const after = storage().local.getSync("prefs")
    $migrated = `v1 {"theme":"dark"} → v3 ${JSON.stringify(after)} · kayıtta v${JSON.parse(localStorage.getItem("sc.data.prefs") ?? "{}").v}`
    configureStorage({ prefix: "sc.data.", version: 1, migrations: {} })
  }
  void refresh()
  onCleanup(() => configureStorage({ prefix: "hm.", version: 1, migrations: {} }))
  return <Demo title="Depolama" desc="local, session, memory ve IndexedDB aynı async API ile; ön ek, süre (ttl) ve sürüm zarfı. Engelli ya da dolu depoda hata atmaz, bellekte tutar. persisted() sekmeler arası eşitlenen bir sinyal."
    code={`await storage().area("idb").set("draft", data, { ttl: "1d" })
configureStorage({ version: 3, migrations: { 2: (v) => …, 3: (v) => … } })
const visits = persisted("visits", 0)   // localStorage + diğer sekmeler`}>
    <Segmented bind:value={$area} onChange={() => void refresh()} options={[{ value: "local", label: "local" }, { value: "session", label: "session" }, { value: "idb", label: "IndexedDB" }, { value: "memory", label: "bellek" }]} />
    <div class="sc-md-cols">
      <Field label="Anahtar"><TextInput bind:value={$key} /></Field>
      <Field label="Değer"><TextInput bind:value={$value} /></Field>
    </div>
    <div class="sc-row">
      <Button variant="primary" on:click={async () => { await s.area($area).set($key, $value); await refresh() }}>Kaydet</Button>
      <Button variant="secondary" on:click={async () => { await s.area($area).set($key, $value, { ttl: "5s" }); await refresh() }}>5 sn süreli kaydet</Button>
      <Button variant="ghost" on:click={async () => { await s.area($area).remove($key); await refresh() }}>Sil</Button>
      <Button variant="ghost" on:click={() => void refresh()}>Yenile</Button>
      <Badge tone={() => (s.persistent($area) ? "success" : "neutral")} dot>{() => (s.persistent($area) ? "kalıcı" : "bellekte")}</Badge>
    </div>
    <ul class="sc-mgr-log">{() => ($rows.length ? $rows.map((r) => <li><code>{r.key}</code> = {r.value}</li>) : <li>Bu alanda kayıt yok.</li>)}</ul>
    <p>Bu sayfayı açma sayın (persisted, başka sekmede de artar): <strong>{() => visits()}</strong></p>
    <div class="sc-row"><Button variant="secondary" on:click={migrate}>Eski (v1) veriyi v3'e taşı</Button></div>
    {() => ($migrated ? <Alert tone="success" title="Taşındı">{$migrated}</Alert> : null)}
  </Demo>
}

function CacheDemo() {
  let $ttl = 4000
  let $swr = true
  let $max = 5
  let $result = ""
  let $id = 1
  configureCache({ maxEntries: $max, ttl: $ttl })
  const now = ticker(250)
  const fetchRates = async (id: number) => {
    const t0 = performance.now()
    let loaded = false
    const v = await appCache().wrap(`rates:${id}`, async () => { loaded = true; await new Promise((r) => setTimeout(r, 700)); return { id, usd: (30 + Math.random()).toFixed(3), at: new Date().toLocaleTimeString() } }, { ttl: $ttl, swr: $swr, tags: ["rates"] })
    $result = `${loaded ? "yüklendi" : "önbellekten"} · ${Math.round(performance.now() - t0)} ms · ${JSON.stringify(v)}`
  }
  const setMax = (v: number) => { $max = v; configureCache({ maxEntries: v, ttl: $ttl }) }
  onCleanup(() => configureCache({ maxEntries: 500, ttl: "5m" }))
  return <Demo title="Önbellek" desc="TTL, LRU, etiket, eşzamanlı istek birleştirme ve bayat-iken-yenile. follow(onInvalidate) ile net.invalidate('rates') bu önbelleği de temizler. Sayaçlar ve kayıtlar canlı."
    code={`const kur = await appCache().wrap("rates:1", () => net.get("/kur"), { ttl: "5m", swr: true, tags: ["rates"] })
appCache().follow(onInvalidate)   // hadi-march/net: net.invalidate("rates") burayı da temizler
appCache().invalidate("rates")   appCache().stats()   appCache().entries()`}>
    <div class="sc-row">
      <Segmented bind:value={$id} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: `#${n}` }))} />
      <Button variant="primary" on:click={() => fetchRates($id)}>Getir</Button>
      <Button variant="secondary" on:click={() => { void fetchRates($id); void fetchRates($id); void fetchRates($id) }}>3 kez aynı anda</Button>
      <Button variant="ghost" on:click={() => appCache().invalidate("rates")}>Geçersiz kıl</Button>
    </div>
    <p class="sc-md-mono">{() => $result || "Bir kayıt getir: ilki 700 ms sürer, sonrakiler önbellekten gelir."}</p>
    <p class="hm-muted">{() => { const s = appCache().stats(); return `isabet ${s.hits} · ıska ${s.misses} · yazma ${s.sets} · atılan ${s.evictions} · boyut ${s.size}/${$max}` }}</p>
    <ul class="sc-md-entries">{() => { now(); return appCache().entries().filter((e) => e.key.startsWith("rates:")).map((e) => <li class={e.stale ? "is-stale" : ""}>
      <code>{e.key}</code><span class="sc-md-bar"><span style={{ "inline-size": `${Math.max(0, 100 - (e.age / Math.max(1, e.ttl)) * 100)}%` }} /></span><span>{e.stale ? "bayat" : `${Math.max(0, Math.ceil((e.ttl - e.age) / 1000))} sn`}</span>
    </li>) }}</ul>
    <Card title="Seçenekler" subtitle="Cache">
      <Field label="Tazelik (ms)"><Slider bind:value={$ttl} min={1000} max={15000} step={1000} /></Field>
      <Field label="En çok kayıt (LRU)"><Slider value={$max} onChange={setMax} min={2} max={6} step={1} /></Field>
      <Toggle bind:value={$swr} label="Bayatken eskiyi hemen göster, arkada yenile (swr)" />
    </Card>
  </Demo>
}

function ConfigDemo() {
  configureAppConfig({
    defaults: { api: { baseUrl: "/api", timeout: 30000 }, ui: { density: "comfortable", accentBar: false }, upload: { maxMb: 10 } },
    env: { api: { baseUrl: "https://staging.example/api" } },
    validate: (c) => ((c.upload as { maxMb: number }).maxMb > 50 ? ["upload.maxMb en çok 50 olabilir"] : []),
  })
  const c = appConfig()
  let $loading = false
  const load = async () => { $loading = true; try { await c.load(() => new Promise((r) => setTimeout(() => r({ ui: { accentBar: true }, upload: { maxMb: 25 } }), 500))) } finally { $loading = false } }
  const src = { default: "neutral", env: "info", remote: "success", override: "warning" } as const
  onCleanup(() => configureAppConfig({ defaults: {}, env: null, validate: null }))
  return <Demo title="Yapılandırma" desc="Katmanlar: varsayılan < ortam (<meta name=hm-config>) < uzak < çalışma anı. Her değerin hangi katmandan geldiği görünür; değişiklik bağlı her yeri günceller."
    code={`configureAppConfig({ defaults: { ui: { density: "comfortable" } } })
appConfig().get("ui.density")   appConfig().set("ui.density", "compact")
await appConfig().load(() => net.get("/config.json"))   appConfig().source("api.baseUrl")`}>
    <div class={() => `sc-md-sample is-${c.get("ui.density")}${c.get("ui.accentBar") ? " has-bar" : ""}`}>
      <strong>Örnek kart</strong><span class="hm-muted">yoğunluk: {() => c.get("ui.density")} · yükleme sınırı {() => c.get("upload.maxMb")} MB</span>
    </div>
    <div class="sc-row">
      <Segmented value={() => c.get("ui.density")} onChange={(v: string) => c.set("ui.density", v)} options={[{ value: "compact", label: "Sıkı" }, { value: "comfortable", label: "Rahat" }, { value: "spacious", label: "Geniş" }]} />
      <Button variant="secondary" disabled={() => $loading} on:click={load}>{() => ($loading ? "Yükleniyor…" : "Uzak yapılandırmayı yükle")}</Button>
      <Button variant="ghost" on:click={() => c.set("upload.maxMb", 80)}>Geçersiz değer yaz</Button>
      <Button variant="ghost" on:click={() => c.reset()}>Geçersiz kılmaları sıfırla</Button>
    </div>
    {() => c.errors().map((e) => <Alert tone="danger" title="Yapılandırma hatası">{e}</Alert>)}
    <dl class="sc-mgr-signals">{() => c.paths().map((p) => <div class="sc-mgr-signal"><dt><code>{p}</code></dt><dd>{String(c.get(p))} <Badge tone={src[c.source(p) ?? "default"]}>{c.source(p)}</Badge></dd></div>)}</dl>
  </Demo>
}

export default function ManagersData() {
  return <Section kicker="Temel › Yöneticiler" title="Veri ve durum yöneticileri" lead="Pano, geri alma, kaydedilmemiş değişiklik, depolama, önbellek ve yapılandırma: her biri tek örnek, ilk kullanımda başlar, olaylarını kanala yayınlar.">
    <ChannelPanel />
    <ClipboardDemo />
    <UndoDirtyDemo />
    <StorageDemo />
    <CacheDemo />
    <ConfigDemo />
  </Section>
}
