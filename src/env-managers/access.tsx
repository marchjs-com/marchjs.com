// Permission, Location and Notification demos of the environment managers page.
import { onCleanup } from "hadi-march";
import { Button, Card, Badge, Toggle, Segmented, Field, TextInput, confirm, toast } from "hadi-march/ui";
import { permissions, configurePermissions, type PermissionKind } from "hadi-march/managers/permission";
import { locator, configureLocation, type GeoPoint } from "hadi-march/managers/location";
import { notifications, configureNotifications } from "hadi-march/managers/notification";
import { consent } from "hadi-march/managers/consent";
import { Demo } from "../demo.tsx";
import { time, Signals, STATE_TONE, STATE_TEXT } from "./common.tsx";

// ------------------------------------------------------------------ Permission
const PERMS: [PermissionKind, string][] = [["geolocation", "Konum"], ["notifications", "Bildirim"], ["camera", "Kamera"], ["microphone", "Mikrofon"], ["clipboard-read", "Pano okuma"], ["persistent-storage", "Kalıcı depolama"], ["screen-wake-lock", "Ekranı açık tut"], ["midi", "MIDI"]]
export function PermissionDemo() {
  let $needConsent = false
  let $explain = true
  let $last = ""
  const setNeed = (v: boolean) => { $needConsent = v; configurePermissions({ consent: v ? { geolocation: "preferences", notifications: "preferences" } : {} }) }
  onCleanup(() => configurePermissions({ consent: {} }))
  const ask = async (name: PermissionKind, label: string) => {
    const r = await permissions().request(name, $explain ? { rationale: () => confirm({ title: `${label} izni`, message: `Bu demo, ${label.toLowerCase()} iznini tarayıcının kendi penceresiyle ister. Devam edilsin mi?`, ok: "Devam", cancel: "Vazgeç" }) } : {})
    $last = `${label}: ${STATE_TEXT[r] ?? r}`
  }
  return <Demo wide title="Permission: izin durumu ve istek akışı" desc="Her iznin durumu sinyal olarak izlenir (site ayarlarından değişince de güncellenir). İstek yalnız tıklamayla yapılır; önce kendi açıklamanı gösterebilirsin. Bir izin rıza kategorisine bağlanırsa, kullanıcı o kategoriye onay vermeden tarayıcı penceresi hiç açılmaz."
    code={`configurePermissions({ consent: { geolocation: "preferences" } })
permissions().state("camera")      // granted | denied | prompt | unsupported
button.onclick = () => permissions().request("camera", { rationale: () => confirm({ … }) })`}>
    <ul class="sc-mgr-queue">{PERMS.map(([name, label]) => <li class="sc-mgr-qrow">
      <span><strong>{label}</strong> <code class="m-muted">{name}</code></span>
      <span class="sc-row">
        {() => <Badge tone={STATE_TONE[permissions().state(name)] ?? "neutral"} dot>{STATE_TEXT[permissions().state(name)]}</Badge>}
        {() => (!permissions().consented(name) ? <Badge tone="warn">rıza yok</Badge> : null)}
        {() => (permissions().state(name) === "prompt" ? <Button size="sm" disabled={() => permissions().pending(name)} on:click={() => ask(name, label)}>İste</Button> : null)}
        {() => (permissions().state(name) === "denied" ? <span class="m-muted">site ayarlarından açılır</span> : null)}
      </span>
    </li>)}</ul>
    {() => ($last ? <p>Son sonuç: <strong>{$last}</strong></p> : null)}
    <Card title="Seçenekler" subtitle="Permission">
      <Toggle bind:value={$explain} label="Tarayıcı penceresinden önce açıklama göster (rationale)" />
      <Toggle value={$needConsent} onChange={setNeed} label="Konum ve bildirim için Tercihler rızası gereksin" />
      {() => ($needConsent ? <div class="sc-row">{() => (consent.has("preferences") ? <Badge tone="success" dot>Tercihler rızası var</Badge> : <Badge tone="warn" dot>Tercihler rızası yok</Badge>)}
        <Button size="sm" variant="secondary" on:click={() => consent.save({ ...consent.choices(), preferences: !consent.has("preferences") })}>{() => (consent.has("preferences") ? "Rızayı kaldır" : "Rıza ver")}</Button></div> : null)}
    </Card>
  </Demo>
}

// ------------------------------------------------------------------ Location
const PLACES: Record<string, GeoPoint & { label: string }> = { ist: { label: "İstanbul", lat: 41.0082, lng: 28.9784 }, ank: { label: "Ankara", lat: 39.9334, lng: 32.8597 }, izm: { label: "İzmir", lat: 38.4237, lng: 27.1428 }, ldn: { label: "Londra", lat: 51.5072, lng: -0.1276 } }
const LOC_TEXT: Record<string, string> = { idle: "hazır", locating: "konum alınıyor…", watching: "izleniyor", denied: "izin verilmedi", blocked: "rıza yok", unavailable: "konum bulunamadı", timeout: "zaman aşımı", unsupported: "desteklenmiyor" }
export function LocationDemo() {
  let $place = "ank"
  let $high = false
  const setHigh = (v: boolean) => { $high = v; configureLocation({ highAccuracy: v }) }
  onCleanup(() => { locator().stop(); configureLocation({ highAccuracy: false }) })
  const km = () => { const d = locator().distanceTo(PLACES[$place]!); return Number.isNaN(d) ? "—" : `${(d / 1000).toLocaleString("tr", { maximumFractionDigits: 1 })} km` }
  return <Demo title="Location: konum" desc="Hiçbir şey sorulmaz; konum yalnız düğmeye basınca istenir. Sonuç, hata ve izleme durumu sinyaldir; mesafe yerleşik."
    code={`button.onclick = () => locator().locate()
locator().position()?.lat   locator().status()   locator().watch()   locator().distanceTo(point)`}>
    <div class="sc-row">
      <Button variant="primary" disabled={() => locator().status() === "locating"} on:click={() => locator().locate().catch(() => {})}>Konumumu bul</Button>
      {() => (locator().watching() ? <Button variant="secondary" on:click={() => locator().stop()}>İzlemeyi durdur</Button> : <Button variant="secondary" on:click={() => locator().watch()}>İzle</Button>)}
      <Badge tone={() => (["denied", "blocked", "unavailable", "timeout"].includes(locator().status()) ? "danger" : locator().position() ? "success" : "neutral")} dot>{() => LOC_TEXT[locator().status()]}</Badge>
    </div>
    <Signals rows={[
      ["position()", () => { const p = locator().position(); return p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : "—" }],
      ["accuracy", () => { const p = locator().position(); return p ? `± ${Math.round(p.accuracy)} m` : "—" }],
      ["error()", () => locator().error() ?? "—"],
      [`distanceTo(${PLACES[$place]!.label})`, km],
    ]} />
    <Card title="Seçenekler" subtitle="Location">
      <Field label="Mesafe"><Segmented bind:value={$place} options={Object.entries(PLACES).map(([value, p]) => ({ value, label: p.label }))} /></Field>
      <Toggle value={$high} onChange={setHigh} label="Yüksek doğruluk (GPS; sonraki istekte)" />
    </Card>
  </Demo>
}

// ------------------------------------------------------------------ Notification
const KIND_TONE: Record<string, string> = { info: "info", success: "success", warn: "warn", danger: "danger" }
const KIND_TEXT: Record<string, string> = { info: "bilgi", success: "başarılı", warn: "uyarı", danger: "hata" }
export function NotificationDemo() {
  let $title = "Yükleme bitti"
  let $body = "rapor.pdf hazır"
  let $kind = "success"
  let $via = "auto"
  let $native = "hidden"
  onCleanup(() => configureNotifications({ native: "hidden" }))
  const setNative = (v: string) => { $native = v; configureNotifications({ native: v as "hidden" | "always" | "never" }) }
  const send = () => notifications().notify({ title: $title, body: $body, kind: $kind as "success", via: $via as "auto", onClick: () => toast("Bildirime tıklandı") })
  const later = () => { setTimeout(send, 5000); toast("5 sn içinde gönderilecek: başka sekmeye geç") }
  return <Demo wide title="Notification: tarayıcı bildirimi ve uygulama içi toast" desc="Tek notify(). Sekme görünürken ya da izin yokken mesaj uygulama içi toast'a gider; sekme gizliyken ve izin varken sistem bildirimine. Hepsi gelen kutusunda okunmamış sayısıyla tutulur."
    code={`notifications().notify({ title: "Yükleme bitti", body: "rapor.pdf", onClick: () => open(…) })
button.onclick = () => notifications().request()       // yalnız tıklamayla
configureNotifications({ native: "always", toast: (n) => mySnackbar(n) })`}>
    <div class="sc-row">
      <Field label="Başlık"><TextInput bind:value={$title} /></Field>
      <Field label="Metin"><TextInput bind:value={$body} /></Field>
    </div>
    <div class="sc-row">
      <Button variant="primary" data-audit-try on:click={send}>Gönder</Button>
      <Button variant="secondary" on:click={later}>5 sn sonra gönder</Button>
      {() => (notifications().permission() === "prompt" ? <Button variant="ghost" on:click={() => notifications().request()}>Bildirim izni iste</Button> : <Badge tone={STATE_TONE[notifications().permission()] ?? "neutral"} dot>{`bildirim izni: ${STATE_TEXT[notifications().permission()]}`}</Badge>)}
    </div>
    <div class="sc-row"><strong>Gelen kutusu</strong><Badge count={() => notifications().unread()} />
      <Button size="sm" variant="ghost" on:click={() => notifications().markRead()}>Tümünü okundu say</Button>
      <Button size="sm" variant="ghost" on:click={() => notifications().clear()}>Temizle</Button></div>
    <ul class="sc-mgr-queue">{() => notifications().inbox().length ? notifications().inbox().slice(0, 6).map((r) => <li class="sc-mgr-qrow">
      <span class={r.read ? "m-muted" : ""}><strong>{r.title}</strong> {r.body}</span>
      <span class="sc-row"><Badge tone={KIND_TONE[r.kind] ?? "neutral"}>{KIND_TEXT[r.kind] ?? r.kind}</Badge><Badge tone="neutral">{r.via === "native" ? "sistem" : r.via === "toast" ? "toast" : "gitmedi"}</Badge><span class="m-muted">{time(r.at)}</span></span>
    </li>) : <li class="m-muted">Boş.</li>}</ul>
    <Card title="Seçenekler" subtitle="Notification">
      <Field label="Tür"><Segmented bind:value={$kind} options={[{ value: "info", label: "Bilgi" }, { value: "success", label: "Başarılı" }, { value: "warn", label: "Uyarı" }, { value: "danger", label: "Hata" }]} /></Field>
      {() => (notifications().permission() === "granted" ? <>
        <Field label="Bu mesaj"><Segmented bind:value={$via} options={[{ value: "auto", label: "Otomatik" }, { value: "native", label: "Sistem" }, { value: "toast", label: "Toast" }]} /></Field>
        <Field label="Sistem bildirimi ne zaman"><Segmented value={$native} onChange={setNative} options={[{ value: "hidden", label: "Sekme gizliyken" }, { value: "always", label: "Her zaman" }, { value: "never", label: "Hiç" }]} /></Field>
      </> : <p class="m-muted">İzin verilince sistem bildirimi seçenekleri burada görünür.</p>)}
    </Card>
  </Demo>
}

