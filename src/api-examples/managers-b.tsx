// API examples of hadi-march/managers, second half (disposeIdle … windowManager): dispose functions, the manager
// handles, and the environment / data / ops managers. Layout and rules: tools/api-examples.js.
// Every example leaves the global state as it found it: a manager it configures is put back (or disposed when it was not
// running), what it binds is removed with the example, and nothing is left in storage.
import { signal, computed, onCleanup } from "hadi-march";
import { Button, Badge, Segmented, TextInput } from "hadi-march/ui";
import type { Manager } from "hadi-march/managers";
import { disposeIdle, idle, idleManager } from "hadi-march/managers/idle";
import { disposeLayers, layer, layerManager, type LayerHandle } from "hadi-march/managers/layer";
import { disposeLocation, distance, locationManager, locator } from "hadi-march/managers/location";
import { disposeLog, logger, logManager, memoryTransport, type Level } from "hadi-march/managers/log";
import { disposeNotifications, notificationManager, notifications } from "hadi-march/managers/notification";
import { disposePerf, perf, perfManager, rateVital, THRESHOLDS, type VitalName } from "hadi-march/managers/perf";
import { disposePermissions, permissionManager, permissions } from "hadi-march/managers/permission";
import { disposePresence, presence, presenceManager } from "hadi-march/managers/presence";
import { disposeRateLimit, rateLimit, rateManager } from "hadi-march/managers/rate";
import { disposeScroll, scroll, scrollManager } from "hadi-march/managers/scroll";
import { disposeSession, session, sessionManager } from "hadi-march/managers/session";
import { disposeShortcutHints, shortcutHintManager, shortcutHints } from "hadi-march/managers/shortcut-hint";
import { disposeStorage, persisted, storage, storageManager } from "hadi-march/managers/storage";
import { disposeSync, sync, syncManager } from "hadi-march/managers/sync";
import { disposeUndo, undoCommands, undoManager, undoStack } from "hadi-march/managers/undo";
import { disposeViewport, viewport, viewportManager } from "hadi-march/managers/viewport";
import { disposeWindow, windowManager } from "hadi-march/managers/window";
import { flags, flagsManager } from "hadi-march/managers/flags";
import { focus, focusManager } from "hadi-march/managers/focus";
import { hotkeyLabel, hotkeyManager, hotkeys } from "hadi-march/managers/hotkey";
import { command, commandManager, normalizeShortcut, onCommandRun, pickCommands } from "hadi-march/managers/command";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
export { default as SIG } from "./managers-b.sig.gen.ts";

type Api = Record<string, any>
/** The core exports (emit, onManager …) only come from the whole-package entry; it loads when its card opens. */
function Lazy(p: { children: (api: Api) => unknown }) {
  const api = signal<Api | null>(null)
  import("hadi-march/managers").then((m) => api.set(m))
  return <div class="sc-stack">{() => { const m = api(); return m ? p.children(m) : <span class="hm-muted">Yükleniyor…</span> }}</div>
}
const clock = () => new Date().toLocaleTimeString("tr-TR")
const yes = (b: boolean) => (b ? "evet" : "hayır")
const keep = (l: string[], line: string, n = 5) => [...l, line].slice(-n)

type Dep = [Manager<any, any>, Record<string, unknown>?, boolean?]
/** Lends a manager to an example: applies `patch`, and on cleanup puts the old values back (or stops a manager that was not running). */
function lend(...items: Dep[]) {
  for (const [m, patch = {}, apply = true] of items) {
    const was = m.alive()
    const cfg = m.config() as Record<string, unknown>
    const old = Object.fromEntries(Object.keys(patch).map((k) => [k, cfg[k]]))
    if (apply && Object.keys(patch).length) m.configure(patch)
    onCleanup(() => { if (Object.keys(old).length) m.configure(old); else if (!was) m.dispose() })
  }
}
const clearTimeline = () => {
  for (const e of [...performance.getEntriesByType("mark"), ...performance.getEntriesByType("measure")]) {
    if (e.name.startsWith("hm:")) { performance.clearMarks(e.name); performance.clearMeasures(e.name) }
  }
}

/** The dispose* examples: start the manager, stop it, watch alive() and the lifecycle events. */
function Dispose(p: { m: Manager<any, any>; start: string; stop: string; run: () => unknown; off: () => void; deps?: Dep[] }) {
  lend([p.m], ...(p.deps ?? []))
  const alive = signal(p.m.alive())
  const lines = signal<string[]>([])
  onManager(`${p.m.name}:*`, (m) => lines.update((l) => keep(l, `${clock()} ${m.topic}`, 4)))
  const after = (f: () => unknown) => () => { f(); alive.set(p.m.alive()) }
  return <div class="sc-stack">
    <Row><Button onClick={after(p.run)}>{p.start}</Button><Button variant="secondary" onClick={after(p.off)}>{p.stop}</Button><Out label="Çalışıyor" value={() => yes(alive())} /></Row>
    <Log lines={lines} label="Yaşam döngüsü" />
  </div>
}
const disposeEx = (m: Manager<any, any>, start: string, stop: string, run: () => unknown, off: () => void, deps?: Dep[]) =>
  () => <Dispose m={m} start={start} stop={stop} run={run} off={off} deps={deps} />

/** The *Manager handles: get / configure / dispose and the live config. */
function Handle(p: { m: Manager<any, any>; patch: Record<string, unknown>; deps?: Dep[] }) {
  lend([p.m, p.patch, false], ...(p.deps ?? []))
  const tick = signal(0)
  const go = (f: () => unknown) => () => { f(); tick.update((n) => n + 1) }
  const keys = Object.keys(p.patch)
  const view = () => { tick(); const c = p.m.config() as Record<string, unknown>; return JSON.stringify(Object.fromEntries(keys.map((k) => [k, c[k]]))) }
  return <div class="sc-stack">
    <Row>
      <Button onClick={go(() => p.m.get())}>get()</Button>
      <Button variant="secondary" onClick={go(() => p.m.configure(p.patch))}>configure(…)</Button>
      <Button variant="ghost" onClick={go(() => p.m.dispose())}>dispose()</Button>
    </Row>
    <Out label={`${p.m.name}.alive()`} value={() => (tick(), yes(p.m.alive()))} />
    <Out label="config()" value={view} />
  </div>
}
const handleEx = (m: Manager<any, any>, patch: Record<string, unknown>, deps?: Dep[]) => () => <Handle m={m} patch={patch} deps={deps} />

// ---- environment managers
function IdleDemo() {
  lend([idleManager, { timeout: 4000 }])
  const i = idle()
  const left = signal(Math.ceil(i.remaining() / 1000))
  const lines = signal<string[]>([])
  const timer = setInterval(() => left.set(Math.ceil(i.remaining() / 1000)), 300)
  onCleanup(() => clearInterval(timer))
  onCleanup(i.onIdle(() => lines.update((l) => keep(l, `${clock()} boşa düştü`, 3))))
  onCleanup(i.onActive((ms) => lines.update((l) => keep(l, `${clock()} döndü (${Math.round(ms / 1000)} sn sonra)`, 3))))
  return <div class="sc-stack">
    <Row><Out label="Durum" value={() => (i.paused() ? "durduruldu" : i.idle() ? "boşta" : "etkin")} /><Out label="Kalan" value={() => `${left()} sn`} /></Row>
    <Row><Button variant="secondary" onClick={() => i.pause()}>pause()</Button><Button variant="secondary" onClick={() => i.resume()}>resume()</Button><Button variant="ghost" onClick={() => i.reset()}>reset()</Button></Row>
    <Log lines={lines} label="Boşta olayları" />
  </div>
}

function LayerDemo() {
  lend([layerManager])
  const open = signal<LayerHandle[]>([])
  onCleanup(() => open().forEach((h) => h.close()))
  let n = 0
  const add = () => {
    const label = `Katman ${++n}`
    const idx = open().length
    const node = <div class="sc-ex-layer" style={`inset-block-end: ${1 + idx * 4}rem; background: var(--hm-surface-2); border: 1px solid var(--hm-border); border-radius: var(--hm-radius-1);`}>
      <span>{label}</span> <Button size="sm" variant="ghost" onClick={() => h.close()}>Kapat</Button>
    </div>
    const h: LayerHandle = layer.open("popover", node, { label, lockScroll: false, onEscape: () => { h.close() } })
    open.update((l) => [...l, h])
  }
  const live = () => layer.stack().filter((l) => l.label?.startsWith("Katman")).length
  return <div class="sc-stack">
    <Row><Button onClick={add}>Katman aç</Button><Button variant="ghost" onClick={() => layer.escape()}>escape()</Button></Row>
    <Row><Out label="Açık örnek katmanı" value={live} /><Out label="Üstteki" value={() => layer.top()?.label ?? "—"} /><Out label="Kaydırma kilidi" value={() => yes(layer.scrollLocked())} /></Row>
  </div>
}

const ANKARA = { lat: 39.9334, lng: 32.8597 }
const ISTANBUL = { lat: 41.0082, lng: 28.9784 }
function LocatorDemo() {
  lend([locationManager])
  const loc = locator()
  onCleanup(() => loc.stop())
  const pos = () => { const p = loc.position(); return p ? `${p.lat.toFixed(3)}, ${p.lng.toFixed(3)} (±${Math.round(p.accuracy)} m)` : "—" }
  const far = () => { const d = loc.distanceTo(ANKARA); return Number.isNaN(d) ? "—" : `${Math.round(d / 1000)} km` }
  return <div class="sc-stack">
    <Row><Button onClick={() => { loc.locate().catch(() => undefined) }}>Konumumu bul</Button><Out label="Durum" value={() => loc.status()} /></Row>
    <Out label="Konum" value={pos} />
    <Out label="Ankara'ya uzaklık" value={far} />
    <Out label="İstanbul → Ankara" value={`${Math.round(loc.distanceTo(ANKARA, ISTANBUL) / 1000)} km`} />
  </div>
}

function DistanceDemo() {
  const cities: [string, { lat: number; lng: number }][] = [["Ankara", ANKARA], ["İzmir", { lat: 38.4237, lng: 27.1428 }], ["Antalya", { lat: 36.8969, lng: 30.7133 }]]
  const to = signal("Ankara")
  const km = () => Math.round(distance(ISTANBUL, cities.find((c) => c[0] === to())![1]) / 1000)
  return <div class="sc-stack">
    <Segmented value={to} onChange={(v: string) => to.set(v)} options={cities.map(([v]) => ({ value: v, label: v }))} aria-label="Hedef" />
    <Out label="İstanbul'dan uzaklık" value={() => `${km()} km`} />
  </div>
}

function NotifyDemo() {
  lend([notificationManager, { native: "never" }])
  const n = notifications()
  const count = signal(0)
  const send = () => {
    count.update((c) => c + 1)
    const r = n.notify({ title: `Rapor ${count.peek()} hazır`, body: "rapor.pdf", kind: "success", onClick: () => undefined })
    last.set(r.via)
  }
  const last = signal("—")
  return <div class="sc-stack">
    <Row><Button onClick={send}>notify()</Button><Button variant="secondary" onClick={() => n.markRead()}>Hepsini okundu yap</Button><Button variant="ghost" onClick={() => n.clear()}>clear()</Button></Row>
    <Row><Out label="Okunmamış" value={() => n.unread()} /><Out label="Gelen kutusu" value={() => n.inbox().length} /><Out label="Giden yol" value={last} /><Out label="Tarayıcı izni" value={() => n.permission()} /></Row>
  </div>
}

function PerfDemo() {
  lend([perfManager])
  const p = perf()
  onCleanup(clearTimeline)
  const busy = signal(false)
  const run = async () => {
    busy.set(true)
    p.mark("hesap:basla")
    await p.time("toplam", () => { let s = 0; for (let i = 0; i < 4e6; i++) s += i % 7; return s })
    p.measure("başlangıçtan beri", "hesap:basla")
    busy.set(false)
  }
  const vital = (n: VitalName) => { const v = p.vital(n); return v ? `${Math.round(v.value * 100) / 100} (${v.rating})` : "ölçülmedi" }
  return <div class="sc-stack">
    <Row><Button disabled={busy} onClick={run}>Ölç</Button><Out label="FCP" value={() => vital("fcp")} /><Out label="Uzun görev" value={() => p.longTasks()} /></Row>
    <Log lines={() => p.measures().map((m) => `${m.name}: ${m.duration.toFixed(1)} ms`)} label="Ölçümler" />
  </div>
}

function PermissionDemo() {
  lend([permissionManager, { consent: { geolocation: "ex-demo" } }])
  const p = permissions()
  const result = signal("—")
  const asked = () => { p.request("geolocation").then((r) => result.set(r)) }
  return <div class="sc-stack">
    <Row>{(["notifications", "camera", "geolocation"] as const).map((k) => <Badge tone={p.state(k) === "granted" ? "success" : "neutral"} dot>{() => `${k}: ${p.state(k)}`}</Badge>)}</Row>
    <Row><Button onClick={asked}>Konum iste (onay gerekli)</Button><Out label="Sonuç" value={result} /><Out label="Onaylı mı" value={() => yes(p.consented("geolocation"))} /></Row>
  </div>
}

function PresenceDemo() {
  lend([presenceManager, { shareTabs: false }], [idleManager, { timeout: 5000 }], [windowManager])
  const p = presence()
  return <div class="sc-stack">
    <Row><Out label="Bu sekme" value={() => p.state()} /><Out label="Genel" value={() => p.overall()} /><Out label="Sekme" value={() => p.tabs().length} /></Row>
    <Row><Button variant="secondary" onClick={() => p.setPeer("ada", "active", { name: "Ada" })}>Ada çevrimiçi</Button><Button variant="secondary" onClick={() => p.setPeer("ada", "away")}>Ada uzakta</Button><Button variant="ghost" onClick={() => p.removePeer("ada")}>Ada'yı kaldır</Button></Row>
    <Log lines={() => p.peers().map((x) => `${x.id}: ${x.state}`)} label="Kişiler" />
  </div>
}

function ScrollDemo() {
  lend([scrollManager, { storageKey: null }])
  const s = scroll()
  const saved = signal("—")
  const release = signal<(() => void) | null>(null)
  onCleanup(() => release()?.())
  const lock = () => { const r = release(); if (r) { r(); release.set(null) } else release.set(s.lock()) }
  return <div class="sc-stack">
    <Row><Out label="y" value={() => Math.round(s.y())} /><Out label="Yön" value={() => s.direction()} /><Out label="İlerleme" value={() => `${Math.round(s.progress() * 100)}%`} /></Row>
    <Row><Button variant="secondary" onClick={() => { s.save("ex"); saved.set(`${Math.round(s.y())} px`) }}>Konumu kaydet</Button><Button variant="secondary" onClick={() => { if (!s.restore("ex")) saved.set("kayıt yok") }}>Geri dön</Button><Button variant="ghost" onClick={lock}>{() => (release() ? "Kilidi aç" : "Kaydırmayı kilitle")}</Button></Row>
    <Row><Out label="Kayıtlı" value={saved} /><Out label="Kilitli" value={() => yes(s.locked())} /></Row>
  </div>
}

function SessionDemo() {
  lend([sessionManager, { duration: 20_000, warnBefore: 8000, storageKey: null, extendOnActivity: false }], [idleManager])
  const s = session()
  return <div class="sc-stack">
    <Row><Button onClick={() => s.start()}>start()</Button><Button variant="secondary" onClick={() => s.extend()}>extend()</Button><Button variant="ghost" onClick={() => s.end()}>end()</Button></Row>
    <Row><Out label="Etkin" value={() => yes(s.active())} /><Out label="Kalan" value={() => `${Math.ceil(s.remaining() / 1000)} sn`} />
      {() => (s.warning() ? <Badge tone="warn" dot>Süre bitiyor</Badge> : s.expired() ? <Badge tone="danger" dot>Süre doldu</Badge> : null)}</Row>
  </div>
}

function ShortcutHintDemo() {
  lend([shortcutHintManager], [hotkeyManager])
  const hits = signal(0)
  hotkeys.bind("alt+shift+k", () => hits.update((n) => n + 1), { description: "Örnek eylem", group: "Örnek" })
  onCleanup(() => shortcutHints.hide())
  return <div class="sc-stack">
    <Row><Button onClick={() => shortcutHints.show()}>show()</Button><Button variant="secondary" onClick={() => shortcutHints.hide()}>hide()</Button><Out label="Görünür" value={() => yes(shortcutHints.visible())} /></Row>
    <Log lines={() => shortcutHints.entries().map((e) => `${e.label} · ${e.description}${e.group ? ` (${e.group})` : ""}`)} label="Kısayollar" />
  </div>
}

function ViewportDemo() {
  lend([viewportManager])
  const vp = viewport()
  return <div class="sc-stack">
    <Row><Out label="Kırılım" value={() => vp.breakpoint()} /><Out label="Genişlik" value={() => `${vp.width()} px`} /><Out label="Mobil" value={() => yes(vp.mobile())} /><Out label="Masaüstü" value={() => yes(vp.desktop())} /></Row>
    <Row><Out label="Koyu" value={() => yes(vp.dark())} /><Out label="Az hareket" value={() => yes(vp.reducedMotion())} /><Out label="Dokunmatik" value={() => yes(vp.touch())} /><Out label="Çevrimiçi" value={() => yes(vp.online())} /></Row>
  </div>
}

function WindowDemo() {
  lend([windowManager, { channel: "hm-ex:window" }])
  return <div class="sc-stack"><Row><Out label="Açık sekme" value={() => windowManager.get().count()} /><Out label="Lider" value={() => yes(windowManager.get().leader())} /><Out label="Görünür" value={() => yes(windowManager.get().visible())} /></Row></div>
}

// ---- data and ops managers
function FlagsDemo() {
  lend([flagsManager, { flags: { beta: true, newCheckout: { percent: 50 }, pricing: { variants: { control: 50, annual: 50 } } }, user: () => "ada", overrideKey: null }])
  const f = flags()
  return <div class="sc-stack">
    <Row><Button variant="secondary" onClick={() => f.override("beta", !f.on("beta"))}>beta'yı çevir</Button><Button variant="ghost" onClick={() => f.clearOverrides()}>Geçersiz kılmaları sil</Button></Row>
    <Row><Out label="beta" value={() => yes(f.on("beta"))} /><Out label="pricing" value={() => f.variant("pricing")} /></Row>
    <Log lines={() => f.list().map((x) => `${x.name} = ${x.value} · ${x.source} · ${x.rule}`)} label="Bayraklar" />
  </div>
}

function FlagsHandleDemo() {
  lend([flagsManager, { flags: {}, overrideKey: null }])
  const names = signal<string[]>(Object.keys(flagsManager.config().flags))
  const add = () => { flagsManager.configure({ flags: { ...flagsManager.config().flags, [`ozellik${names().length + 1}`]: true } }); names.set(Object.keys(flagsManager.config().flags)) }
  return <div class="sc-stack">
    <Row><Button onClick={add}>Bayrak ekle</Button><Out label="Çalışıyor" value={() => (names(), yes(flagsManager.alive()))} /></Row>
    <Out label="Bayraklar" value={() => names().join(", ") || "—"} />
  </div>
}

function FocusDemo() {
  lend([focusManager])
  let release: (() => void) | null = null
  const panel = (<div class="sc-ex-target"><Row>
    <Button size="sm" variant="secondary">Bir</Button><Button size="sm" variant="secondary">İki</Button>
    <Button size="sm" onClick={() => { release?.(); release = null }}>Bırak</Button></Row></div>) as HTMLElement
  onCleanup(() => release?.())
  return <div class="sc-stack">
    <Row><Button onClick={() => { if (!release) release = focus.trap(panel, { contain: false }) }}>Tuzağı kur</Button><Out label="Tuzak" value={() => yes(focus.trapped())} /><Out label="Giriş" value={() => focus.modality()} /></Row>
    {panel}
  </div>
}

function HotkeyDemo() {
  lend([hotkeyManager])
  const hits = signal(0)
  const seq = signal(0)
  hotkeys.bind("alt+shift+j", () => hits.update((n) => n + 1), { description: "Say", group: "Örnek" })
  hotkeys.bind("g j", () => seq.update((n) => n + 1), { description: "Diziyle say", group: "Örnek" })
  return <div class="sc-stack">
    <Row><Button onClick={() => hotkeys.trigger("alt+shift+j")}>trigger("alt+shift+j")</Button><Out label="Alt+Shift+J" value={hits} /><Out label="G, J" value={seq} /><Out label="Bekleyen" value={() => hotkeys.pending() || "—"} /></Row>
    <Log lines={() => hotkeys.list().map((i) => `${i.label} · ${i.description}`)} label="Bağlamalar" />
  </div>
}

function HotkeyLabelDemo() {
  const combo = signal("mod+shift+k")
  const label = () => { try { return hotkeyLabel(combo()) } catch { return "geçersiz" } }
  return <div class="sc-stack">
    <TextInput value={combo} on:input={(e: Event) => combo.set((e.target as HTMLInputElement).value)} aria-label="Kısayol" />
    <Out label="Etiket" value={label} />
  </div>
}

function LoggerDemo() {
  const mem = memoryTransport(8)
  lend([logManager, { transports: [mem], level: "debug" }])
  const log = logger().child("ödeme", { sepet: 3 })
  const level = signal<Level>("debug")
  return <div class="sc-stack">
    <Row><Button onClick={() => log.info("ödendi", { tutar: 42, card: "4242 4242" })}>info</Button><Button variant="secondary" onClick={() => log.warn("yavaş yanıt")}>warn</Button><Button variant="secondary" onClick={() => log.error(new Error("Bağlantı koptu"))}>error</Button><Button variant="secondary" onClick={() => log.debug("ayrıntı")}>debug</Button></Row>
    <Segmented value={level} onChange={(v: Level) => { level.set(v); logger().setLevel(v) }} options={(["debug", "info", "warn", "error"] as const).map((v) => ({ value: v, label: v }))} aria-label="Seviye" />
    <Log lines={() => mem.entries().map((e) => `${e.level} [${e.scope}] ${e.msg} ${e.data ? JSON.stringify({ ...e.data, error: undefined }) : ""}`)} label="Günlük" />
  </div>
}

function MemoryDemo() {
  const mem = memoryTransport(3)
  lend([logManager, { transports: [mem], level: "info" }])
  let n = 0
  return <div class="sc-stack">
    <Row><Button onClick={() => logger().info(`kayıt ${++n}`)}>Kayıt yaz</Button><Button variant="ghost" onClick={() => mem.clear()}>clear()</Button><Out label="Tutulan" value={() => mem.entries().length} /></Row>
    <Log lines={() => mem.entries().map((e) => e.msg)} label="Son 3 kayıt (yeni üstte)" />
  </div>
}

function ChannelDemo(p: { own: boolean; api: Api }) {
  const { emit, managerChannel, managerChannelOf } = p.api
  const lines = signal<string[]>([])
  const note = (s: string) => lines.update((l) => keep(l, s, 4))
  if (p.own) managerChannelOf("sepet").on((m) => note(`${m.type} ${JSON.stringify(m.detail ?? "")}`))
  else managerChannel.on((m) => { if (m.manager === "sepet") note(`${m.topic} @ ${clock()}`) })
  return <div class="sc-stack">
    <Row><Button onClick={() => emit("sepet", "ekle", { urun: "çay" })}>sepet:ekle</Button><Button variant="secondary" onClick={() => emit("sepet", "bosalt")}>sepet:bosalt</Button></Row>
    <Log lines={lines} label="Gelen mesajlar" />
  </div>
}

function NormalizeDemo() {
  const combo = signal("mod+shift+k")
  const out = () => { try { return normalizeShortcut(combo()) } catch { return "geçersiz" } }
  return <div class="sc-stack">
    <TextInput value={combo} on:input={(e: Event) => combo.set((e.target as HTMLInputElement).value)} aria-label="Kısayol" />
    <Out label="Kurallı biçim" value={out} />
  </div>
}

function CommandRunDemo() {
  lend([commandManager])
  const lines = signal<string[]>([])
  const save = command({ id: "ex.save", title: "Kaydet", run: () => "kaydedildi" })
  onCleanup(onCommandRun((r) => lines.update((l) => keep(l, `${clock()} ${r.id} → ${String(r.result)}`, 4))))
  return <div class="sc-stack"><Row><Button onClick={() => save.run()}>Kaydet komutunu çalıştır</Button></Row><Log lines={lines} label="Çalışan komutlar" /></div>
}

function PatternDemo(p: { api: Api }) {
  const { emit, onManager } = p.api
  const pats = ["demo:kaydet", "demo:*", "*"]
  const counts = pats.map(() => signal(0))
  pats.forEach((pt, i) => onManager(pt, () => counts[i]!.update((n) => n + 1)))
  return <div class="sc-stack">
    <Row><Button onClick={() => emit("demo", "kaydet")}>demo:kaydet</Button><Button variant="secondary" onClick={() => emit("demo", "sil")}>demo:sil</Button></Row>
    <Row>{pats.map((pt, i) => <Out label={pt} value={counts[i]!} />)}</Row>
  </div>
}

function PublisherDemo(p: { api: Api }) {
  const { onManager, publisher } = p.api
  const lines = signal<string[]>([])
  onManager("fatura:*", (m) => lines.update((l) => keep(l, `${m.topic} ${JSON.stringify(m.detail ?? "")}`, 4)))
  const pub = publisher("fatura")
  let n = 0
  return <div class="sc-stack"><Row><Button onClick={() => pub("kesildi", { no: ++n })}>pub("kesildi", …)</Button><Button variant="secondary" onClick={() => pub("iptal")}>pub("iptal")</Button></Row><Log lines={lines} label="fatura:*" /></div>
}

function PersistedDemo() {
  lend([storageManager])
  const s = storage()
  const count = persisted("ex.sayac", 0, { area: "session" })
  onCleanup(() => s.session.removeSync("ex.sayac"))
  return <div class="sc-stack"><Row><Button onClick={() => count.update((n) => n + 1)}>Artır</Button><Button variant="ghost" onClick={() => count.set(0)}>Sıfırla</Button><Out label="Kalıcı sayaç" value={count} /></Row></div>
}

function PickDemo() {
  lend([commandManager])
  const mk = (id: string, title: string, group: string) => command({ id, title, group, run: () => undefined })
  mk("ex.open", "Aç", "Dosya"); mk("ex.save", "Kaydet", "Dosya"); mk("ex.undo", "Geri al", "Düzen")
  const kind = signal("group")
  const picks: Record<string, () => string[]> = {
    group: () => pickCommands({ group: "Dosya" })().map((c) => c.title()),
    ids: () => pickCommands(["ex.undo", "ex.open"])().map((c) => c.title()),
    filter: () => pickCommands((c) => c.id.endsWith("e") || c.id === "ex.open")().map((c) => c.title()),
  }
  return <div class="sc-stack">
    <Segmented value={kind} onChange={(v: string) => kind.set(v)} options={[{ value: "group", label: "grup" }, { value: "ids", label: "kimlikler" }, { value: "filter", label: "süzgeç" }]} aria-label="Seçim" />
    <Out label="Seçilen" value={() => picks[kind()]!().join(", ") || "—"} />
  </div>
}

function RateDemo() {
  lend([rateManager])
  const r = rateLimit()
  const last = signal("—")
  const search = r.debounce((q: string) => last.set(q || "—"), 400)
  const q = r.quota("ex.export", { limit: 3, per: "10s" })
  const sent = signal(0)
  const tries = signal(0)
  const left = signal(q.remaining())
  const timer = setInterval(() => left.set(q.remaining()), 300)
  onCleanup(() => clearInterval(timer))
  return <div class="sc-stack">
    <TextInput placeholder="Ara…" on:input={(e: Event) => search((e.target as HTMLInputElement).value)} aria-label="Arama" />
    <Row><Out label="Arama çalıştı" value={last} /><Out label="Bekliyor" value={() => yes(search.pending())} /></Row>
    <Row><Button onClick={() => { tries.update((n) => n + 1); if (q.take()) sent.update((n) => n + 1); left.set(q.remaining()) }}>Dışa aktar (3 / 10 sn)</Button>
      <Out label="Giden" value={sent} /><Out label="Deneme" value={tries} /><Out label="Kalan hak" value={left} /></Row>
  </div>
}

function RateVitalDemo() {
  const name = signal<VitalName>("lcp")
  const step = signal(0)
  const value = computed(() => { const [good, poor] = THRESHOLDS[name()]; return [good * 0.5, (good + poor) / 2, poor * 1.5][step()]! })
  const rating = computed(() => rateVital(name(), value()))
  const tone = () => (rating() === "good" ? "success" : rating() === "poor" ? "danger" : "warn")
  return <div class="sc-stack">
    <Segmented value={name} onChange={(v: VitalName) => name.set(v)} options={(["lcp", "cls", "inp", "fcp", "ttfb"] as const).map((v) => ({ value: v, label: v }))} aria-label="Ölçüt" />
    <Segmented value={() => String(step())} onChange={(v: string) => step.set(Number(v))} options={[{ value: "0", label: "düşük" }, { value: "1", label: "orta" }, { value: "2", label: "yüksek" }]} aria-label="Değer" />
    <Row><Out label="Değer" value={() => String(Math.round(value() * 100) / 100)} /><Badge tone={tone()} dot>{rating}</Badge></Row>
  </div>
}

function StorageDemo() {
  lend([storageManager, { prefix: "ex." }])
  const s = storage()
  const text = signal("Merhaba")
  const area = signal<"local" | "session" | "memory">("local")
  const out = signal("—")
  onCleanup(() => { for (const a of ["local", "session", "memory"] as const) s[a].removeSync("not") })
  const save = () => { s.area(area()).set("not", text(), { ttl: "1m" }).then(() => out.set("yazıldı")) }
  const read = () => { s.area(area()).get<string>("not").then((v) => out.set(v ?? "yok")) }
  return <div class="sc-stack">
    <Row><TextInput value={text} on:input={(e: Event) => text.set((e.target as HTMLInputElement).value)} aria-label="Not" />
      <Segmented value={area} onChange={(v: "local" | "session" | "memory") => area.set(v)} options={["local", "session", "memory"].map((v) => ({ value: v, label: v }))} aria-label="Alan" /></Row>
    <Row><Button onClick={save}>Kaydet (1 dk)</Button><Button variant="secondary" onClick={read}>Oku</Button><Out label="Sonuç" value={out} /><Out label="Kalıcı" value={() => yes(s.persistent(area()))} /></Row>
  </div>
}

function SyncDemo() {
  const net = signal<any>(null)
  Promise.all([import("hadi-march/net"), import("hadi-march/net/mock")]).then(([{ createNet }]) => {
    const n = createNet()
    n.mock({ "POST /demo/notes": () => ({ saved: true }) }, { delay: 400 })
    net.set(n)
  })
  return <div class="sc-stack">{() => (net() ? <SyncBody n={net()} /> : <span class="hm-muted">Yükleniyor…</span>)}</div>
}
function SyncBody(p: { n: any }) {
  const n = p.n
  lend([syncManager, { net: n, storageKey: null, retry: { delay: 500, factor: 2, max: 4000, count: 4 } }])
  const s = sync()
  const online = signal(true)
  let k = 0
  return <div class="sc-stack">
    <Row><Button onClick={() => s.enqueue({ url: "/demo/notes", method: "POST", body: { text: `Not ${++k}` } })}>Not ekle</Button>
      <Segmented value={() => (online() ? "on" : "off")} onChange={(v: string) => { online.set(v === "on"); n.setOnline(v === "on") }} options={[{ value: "on", label: "çevrimiçi" }, { value: "off", label: "çevrimdışı" }]} aria-label="Bağlantı" /></Row>
    <Row><Out label="Durum" value={() => s.status()} /><Out label="Bekleyen" value={() => s.pending()} /><Out label="Başarısız" value={() => s.failed()} /></Row>
    <Log lines={() => s.queue().map((x) => `${x.method} ${x.url} · deneme ${x.tries}`)} label="Kuyruk" />
  </div>
}

function UndoDemo() {
  lend([undoManager], [commandManager])
  const u = undoStack()
  const n = signal(0)
  const step = (d: number) => u.run(d > 0 ? "Artır" : "Azalt", () => n.update((x) => x + d), () => n.update((x) => x - d))
  return <div class="sc-stack">
    <Row><Button onClick={() => step(1)}>Artır</Button><Button variant="secondary" onClick={() => step(-1)}>Azalt</Button><Button variant="ghost" disabled={() => !u.canUndo()} onClick={() => u.undo()}>Geri al</Button><Button variant="ghost" disabled={() => !u.canRedo()} onClick={() => u.redo()}>İleri al</Button></Row>
    <Out label="Değer" value={n} />
    <Log lines={() => u.past()} label="Geri alınabilir adımlar (yeni üstte)" />
  </div>
}

function UndoCommandsDemo() {
  lend([undoManager], [commandManager])
  const u = undoStack()
  const rows = signal<string[]>([])
  const [undo, redo] = undoCommands("Düzen")
  const add = () => { const row = `Satır ${rows().length + 1}`; u.run("Satır ekle", () => rows.update((l) => [...l, row]), () => rows.update((l) => l.slice(0, -1))) }
  return <div class="sc-stack">
    <Row><Button onClick={add}>Satır ekle</Button><Button variant="secondary" disabled={() => !undo.enabled()} onClick={() => undo.run()}>{() => undo.title()}</Button><Button variant="secondary" disabled={() => !redo.enabled()} onClick={() => redo.run()}>{() => redo.title()}</Button></Row>
    <Out label="Satırlar" value={() => rows().join(", ") || "—"} />
  </div>
}

export default examples({
  "hadi-march/managers": {
    disposeIdle: { code: `idle()                       // dinlemeye başlar
disposeIdle()                // dinleyiciler kalkar
idle()                       // yeniden başlar`, run: disposeEx(idleManager, "idle()", "disposeIdle()", () => idle(), disposeIdle) },
    disposeLayers: { code: `const l = layer.open("popover", node)
disposeLayers()              // açık katmanlar kapanır, kilit kalkar`, run: disposeEx(layerManager, "layer.top()", "disposeLayers()", () => layer.top(), disposeLayers) },
    disposeLocation: { code: `locator().watch()            // konumu izler
disposeLocation()            // izleme durur`, run: disposeEx(locationManager, "locator()", "disposeLocation()", () => locator(), disposeLocation) },
    disposeLog: { code: `logger().info("açıldı")
disposeLog()                 // taşıyıcılar boşaltılır ve kapanır`, run: disposeEx(logManager, "logger()", "disposeLog()", () => logger(), disposeLog, undefined) },
    disposeNotifications: { code: `notifications().notify({ title: "Merhaba" })
disposeNotifications()       // gelen kutusu sıfırlanır`, run: disposeEx(notificationManager, "notifications()", "disposeNotifications()", () => notifications(), disposeNotifications) },
    disposePerf: { code: `perf().mark("a:basla")
disposePerf()                // gözlemciler kapanır`, run: disposeEx(perfManager, "perf()", "disposePerf()", () => perf(), disposePerf) },
    disposePermissions: { code: `permissions().state("camera")
disposePermissions()         // durum izleyicileri kalkar`, run: disposeEx(permissionManager, "permissions()", "disposePermissions()", () => permissions(), disposePermissions) },
    disposePresence: { code: `presence().overall()
disposePresence()            // durum yayını ve kalp atışı durur`, run: disposeEx(presenceManager, "presence()", "disposePresence()", () => presence(), disposePresence, [[presenceManager, { shareTabs: false }], [idleManager], [windowManager]]) },
    disposeRateLimit: { code: `const save = rateLimit().debounce(send, 500)
disposeRateLimit()           // bekleyen zamanlayıcılar ve kotalar silinir`, run: disposeEx(rateManager, "rateLimit()", "disposeRateLimit()", () => rateLimit(), disposeRateLimit) },
    disposeScroll: { code: `scroll().y()
disposeScroll()              // dinleyiciler kalkar, kilitler açılır`, run: disposeEx(scrollManager, "scroll()", "disposeScroll()", () => scroll(), disposeScroll, [[scrollManager, { storageKey: null }]]) },
    disposeSession: { code: `session().start()
disposeSession()             // geri sayım durur (oturumu bitirmez)`, run: disposeEx(sessionManager, "session()", "disposeSession()", () => session(), disposeSession, [[sessionManager, { storageKey: null }], [idleManager]]) },
    disposeShortcutHints: { code: `shortcutHints.show()
disposeShortcutHints()       // tuş dinleyicileri kalkar`, run: disposeEx(shortcutHintManager, "shortcutHints.entries()", "disposeShortcutHints()", () => shortcutHints.entries(), disposeShortcutHints, [[hotkeyManager]]) },
    disposeStorage: { code: `storage().local.setSync("k", 1)
disposeStorage()             // sekmeler arası dinleyici kalkar (veri durur)`, run: disposeEx(storageManager, "storage()", "disposeStorage()", () => storage(), disposeStorage) },
    disposeSync: { code: `sync().enqueue({ url: "/api/notes", body: note })
disposeSync()                // gönderim durur; kuyruk depoda kalır`, run: disposeEx(syncManager, "sync()", "disposeSync()", () => sync(), disposeSync, [[syncManager, { storageKey: null }]]) },
    disposeUndo: { code: `undoStack().push({ label: "Ad", undo, redo })
disposeUndo()                // geçmiş unutulur`, run: disposeEx(undoManager, "undoStack()", "disposeUndo()", () => undoStack(), disposeUndo, [[commandManager]]) },
    disposeViewport: { code: `viewport().dark()
disposeViewport()            // medya dinleyicileri kalkar`, run: disposeEx(viewportManager, "viewport()", "disposeViewport()", () => viewport(), disposeViewport) },
    disposeWindow: { code: `appWindow().count()
disposeWindow()              // sekme kanalı kapanır`, run: disposeEx(windowManager, "windowManager.get()", "disposeWindow()", () => windowManager.get(), disposeWindow, [[windowManager, { channel: "hm-ex:window" }]]) },
    distance: { code: `distance({ lat: 41.0082, lng: 28.9784 }, { lat: 39.9334, lng: 32.8597 })
// ≈ 350 000 (metre)`, run: () => <DistanceDemo /> },
    emit: { code: `emit("sepet", "ekle", { urun: "çay" })      // topic: sepet:ekle
onManager("sepet:*", (m) => console.log(m.topic))`, run: () => <Lazy>{(api) => <ChannelDemo own={false} api={api} />}</Lazy> },
    flags: { code: `configureFlags({ flags: { beta: true, pricing: { variants: { control: 50, annual: 50 } } } })
flags().on("beta")    flags().variant("pricing")
flags().override("beta", false)`, run: () => <FlagsDemo /> },
    flagsManager: { code: `flagsManager.configure({ flags: { ...flagsManager.config().flags, promo: true } })
flagsManager.alive()    flagsManager.dispose()`, run: () => <FlagsHandleDemo /> },
    focus: { code: `const release = focus.trap(panel)    // Tab panelin içinde kalır
focus.visible()    focus.modality()
release()                            // odak önceki yere döner`, run: () => <FocusDemo /> },
    focusManager: { code: `focusManager.configure({ markRoot: false })
focusManager.get()    focusManager.dispose()`, run: handleEx(focusManager, { markRoot: false }) },
    hotkeyLabel: { code: `hotkeyLabel("mod+shift+k")      // "Ctrl Shift K" (macOS: "⌘ ⇧ K")`, run: () => <HotkeyLabelDemo /> },
    hotkeyManager: { code: `hotkeyManager.configure({ sequenceTimeout: 600 })
hotkeyManager.get()    hotkeyManager.dispose()`, run: handleEx(hotkeyManager, { sequenceTimeout: 600 }) },
    hotkeys: { code: `hotkeys.bind("alt+shift+j", count, { description: "Say", group: "Örnek" })
hotkeys.bind("g j", goJump)        // dizi: g, sonra j
hotkeys.list()    hotkeys.pending()    hotkeys.trigger("alt+shift+j")`, run: () => <HotkeyDemo /> },
    idle: { code: `configureIdle({ timeout: 4000 })
idle().idle()    idle().remaining()
idle().onIdle(() => pause())    idle().onActive(() => refresh())`, run: () => <IdleDemo /> },
    idleManager: { code: `idleManager.configure({ timeout: 5000 })
idleManager.alive()    idleManager.dispose()`, run: handleEx(idleManager, { timeout: 5000 }) },
    layer: { code: `const h = layer.open("popover", node, { label: "Not", onEscape: () => h.close() })
layer.top()?.label    layer.stack()    layer.scrollLocked()
layer.escape()        // üstteki kapanır`, run: () => <LayerDemo /> },
    layerManager: { code: `layerManager.configure({ escape: false })
layerManager.get()    layerManager.dispose()`, run: handleEx(layerManager, { escape: false }) },
    locationManager: { code: `locationManager.configure({ highAccuracy: true, timeout: 8000 })
locationManager.get()    locationManager.dispose()`, run: handleEx(locationManager, { highAccuracy: true, timeout: 8000 }) },
    locator: { code: `const loc = locator()
button.onclick = () => loc.locate()          // tıklamadan istenir
loc.position()    loc.status()    loc.distanceTo({ lat: 39.93, lng: 32.86 })`, run: () => <LocatorDemo /> },
    logger: { code: `const log = logger().child("ödeme", { sepet: 3 })
log.info("ödendi", { tutar: 42, card: "4242…" })   // card gizlenir
logger().setLevel("warn")`, run: () => <LoggerDemo /> },
    logManager: { code: `logManager.configure({ level: "debug" })
logManager.get()    logManager.dispose()`, run: handleEx(logManager, { level: "debug" }) },
    managerChannel: { code: `managerChannel.on((m) => console.log(m.topic, m.detail))
managerChannel.history().length      // son 50 mesaj`, run: () => <Lazy>{(api) => <ChannelDemo own={false} api={api} />}</Lazy> },
    managerChannelOf: { code: `managerChannelOf("sepet").on(({ type, detail }) => show(type, detail))`, run: () => <Lazy>{(api) => <ChannelDemo own api={api} />}</Lazy> },
    memoryTransport: { code: `const mem = memoryTransport(3)
configureLog({ transports: [mem] })
mem.entries()    mem.clear()      // en yeni üstte`, run: () => <MemoryDemo /> },
    normalizeShortcut: { code: `normalizeShortcut("mod+shift+K")     // "ctrl+shift+k" (macOS: "meta+shift+k")`, run: () => <NormalizeDemo /> },
    notificationManager: { code: `notificationManager.configure({ native: "never", keep: 20 })
notificationManager.get()    notificationManager.dispose()`, run: handleEx(notificationManager, { native: "never", keep: 20 }) },
    notifications: { code: `notifications().notify({ title: "Rapor hazır", body: "rapor.pdf", kind: "success", onClick: open })
notifications().unread()    notifications().markRead()`, run: () => <NotifyDemo /> },
    onCommandRun: { code: `const off = onCommandRun(({ id, result }) => audit(id, result))
command({ id: "doc.save", title: "Kaydet", run: () => "ok" }).run()
off()`, run: () => <CommandRunDemo /> },
    onManager: { code: `onManager("sepet:ekle", fn)    // tek konu
onManager("sepet:*", fn)       // bir yöneticinin hepsi
onManager("*", fn)             // her şey`, run: () => <Lazy>{(api) => <PatternDemo api={api} />}</Lazy> },
    perf: { code: `const p = perf()
p.mark("a:basla")
await p.time("hesap", () => compute())
p.measure("toplam", "a:basla")    p.measures()    p.vital("fcp")`, run: () => <PerfDemo /> },
    perfManager: { code: `perfManager.configure({ keep: 20, prefix: "uyg:" })
perfManager.get()    perfManager.dispose()`, run: handleEx(perfManager, { keep: 20 }) },
    permissionManager: { code: `permissionManager.configure({ consent: { geolocation: "preferences" } })
permissionManager.get()    permissionManager.dispose()`, run: handleEx(permissionManager, { consent: { geolocation: "preferences" } }) },
    permissions: { code: `configurePermissions({ consent: { geolocation: "preferences" } })
permissions().state("camera")
await permissions().request("geolocation")    // onay yoksa "blocked", tarayıcı sormaz`, run: () => <PermissionDemo /> },
    persisted: { code: `const count = persisted("sayac", 0, { area: "session" })
count.update((n) => n + 1)       // depoya yazılır, sekmeler arası eşitlenir`, run: () => <PersistedDemo /> },
    pickCommands: { code: `pickCommands({ group: "Dosya" })()          // gruba göre
pickCommands(["ex.undo", "ex.open"])()      // kimliklere göre
pickCommands((c) => c.id.endsWith("e"))()   // süzgeçle`, run: () => <PickDemo /> },
    presence: { code: `presence().state()    presence().overall()
presence().setPeer("ada", "active", { name: "Ada" })
presence().peers()`, run: () => <PresenceDemo /> },
    presenceManager: { code: `presenceManager.configure({ shareTabs: false, heartbeat: 10_000 })
presenceManager.get()    presenceManager.dispose()`, run: handleEx(presenceManager, { shareTabs: false, heartbeat: 10_000 }, [[idleManager], [windowManager]]) },
    publisher: { code: `const pub = publisher("fatura")
pub("kesildi", { no: 7 })        // fatura:kesildi`, run: () => <Lazy>{(api) => <PublisherDemo api={api} />}</Lazy> },
    rateLimit: { code: `const search = rateLimit().debounce(find, 400)
const q = rateLimit().quota("export", { limit: 3, per: "10s" })
if (q.take()) run(); else wait(q.resetIn())`, run: () => <RateDemo /> },
    rateManager: { code: `rateManager.get()    rateManager.alive()
rateManager.dispose()            // kotalar ve zamanlayıcılar silinir`, run: handleEx(rateManager, {}) },
    rateVital: { code: `rateVital("lcp", 1800)     // "good"
rateVital("cls", 0.18)     // "needs-improvement"
rateVital("inp", 650)      // "poor"`, run: () => <RateVitalDemo /> },
    scroll: { code: `const s = scroll()
s.y()    s.direction()    s.progress()
s.save("liste")    s.restore("liste")
const release = s.lock()    release()`, run: () => <ScrollDemo /> },
    scrollManager: { code: `scrollManager.configure({ offset: 80, storageKey: null })
scrollManager.get()    scrollManager.dispose()`, run: handleEx(scrollManager, { offset: 80, storageKey: null }) },
    session: { code: `configureSession({ duration: 20_000, warnBefore: 8000 })
session().start()    session().remaining()    session().warning()
session().extend()   session().end()`, run: () => <SessionDemo /> },
    sessionManager: { code: `sessionManager.configure({ duration: 600_000, storageKey: null })
sessionManager.get()    sessionManager.dispose()`, run: handleEx(sessionManager, { duration: 600_000, storageKey: null }, [[idleManager]]) },
    shortcutHintManager: { code: `shortcutHintManager.configure({ holdKey: "Shift", holdMs: 300 })
shortcutHintManager.get()    shortcutHintManager.dispose()`, run: handleEx(shortcutHintManager, { holdKey: "Shift", holdMs: 300 }, [[hotkeyManager]]) },
    shortcutHints: { code: `hotkeys.bind("alt+shift+k", act, { description: "Örnek eylem" })
shortcutHints.entries()    // yardım listesi
shortcutHints.show()    shortcutHints.hide()    shortcutHints.visible()`, run: () => <ShortcutHintDemo /> },
    storage: { code: `configureStorage({ prefix: "ex." })
await storage().area("session").set("not", "Merhaba", { ttl: "1m" })
await storage().area("session").get("not")    // "Merhaba"`, run: () => <StorageDemo /> },
    storageManager: { code: `storageManager.configure({ prefix: "uyg.", version: 2 })
storageManager.get()    storageManager.dispose()`, run: handleEx(storageManager, { prefix: "uyg.", version: 2 }) },
    sync: { code: `sync().enqueue({ url: "/api/notes", method: "POST", body: note })
sync().pending()    sync().status()    sync().queue()
sync().retry(id)    sync().remove(id)`, run: () => <SyncDemo /> },
    syncManager: { code: `syncManager.configure({ storageKey: null, timeout: 5000 })
syncManager.get()    syncManager.dispose()`, run: handleEx(syncManager, { storageKey: null, timeout: 5000 }) },
    undoCommands: { code: `const [undo, redo] = undoCommands("Düzen")     // edit.undo (mod+z), edit.redo
undoStack().run("Satır ekle", add, remove)
undo.run()    undo.title()`, run: () => <UndoCommandsDemo /> },
    undoManager: { code: `undoManager.configure({ limit: 20, mergeMs: 400 })
undoManager.get()    undoManager.dispose()`, run: handleEx(undoManager, { limit: 20, mergeMs: 400 }, [[commandManager]]) },
    undoStack: { code: `const u = undoStack()
u.run("Artır", () => n.update((x) => x + 1), () => n.update((x) => x - 1))
u.undo()    u.redo()    u.canUndo()    u.past()`, run: () => <UndoDemo /> },
    viewport: { code: `const vp = viewport()
vp.breakpoint()    vp.up("lg")    vp.mobile()
vp.dark()    vp.reducedMotion()    vp.online()`, run: () => <ViewportDemo /> },
    viewportManager: { code: `viewportManager.configure({ mobile: "lg", desktop: "xl" })
viewportManager.get()    viewportManager.dispose()`, run: handleEx(viewportManager, { mobile: "lg", desktop: "xl" }) },
    windowManager: { code: `windowManager.configure({ channel: "uyg:pencere", heartbeat: 1000 })
windowManager.get().count()    windowManager.dispose()`, run: () => <WindowDemo /> },
  },
})
