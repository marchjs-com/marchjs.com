// API examples of hadi-march/managers, first half (DEFAULT_CATEGORIES … disposeHotkeys). Layout and rules: tools/api-examples.js.
// A manager is app-wide, so every demo leaves it as it found it: the config it changed is put back, the memory-only
// storage it used is gone with the instance, and a manager it started is disposed when the card closes.
import { signal, onCleanup, effect, untrack } from "hadi-march";
import { createNet } from "hadi-march/net";
import { Button, Badge, Segmented } from "hadi-march/ui";
import { TextInput } from "hadi-march/forms";
import {
  DEFAULT_CATEGORIES, DEFAULT_PREFS, LEVELS, THRESHOLDS, a11y, a11yManager, announce, announcer, announcerManager, appCache,
  appConfig, appWindow, ariaKeys, audit, beaconTransport, bucket, cacheManager, clipboard, clipboardManager, command,
  commandManager, commands, configManager, configureA11y, configureAnnouncer, configureAppConfig, configureCache,
  configureClipboard, configureCommands, configureConsent, configureDevice, configureDirty, configureFlags, configureFocus,
  configureHotkeys, configureIdle, configureLayers, configureLocation, configureLog, configureNotifications, configurePerf,
  configurePermissions, configurePresence, configureScroll, configureSession, configureShortcutHints, configureStorage,
  configureSync, configureUndo, configureViewport, configureWindow, consent, consentManager, consoleTransport, defineManager,
  device, deviceManager, dirtyManager, dirtyState, disposeA11y, disposeAnnouncer, disposeAppConfig, disposeCache,
  disposeClipboard, disposeCommands, disposeConsent, disposeDevice, disposeDirty, disposeFlags, disposeFocus, disposeHotkeys,
  flags, flagsManager, focus, focusManager, hotkeyManager, hotkeys, idle, idleManager, layer, layerManager, locationManager, locator, logManager,
  logger, memoryTransport, notificationManager, notifications, onManager, perf, perfManager, permissionManager, permissions,
  presence, presenceManager, scroll, scrollManager, session, sessionManager, shortcutHintManager, shortcutHints, storage,
  storageManager, sync, syncManager, undoManager, undoStack, viewport, viewportManager, windowManager,
} from "hadi-march/managers";
import type { Manager } from "hadi-march/managers";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./managers-a.css";
export { default as SIG } from "./managers-a.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
/** A value as one short line (functions as ƒ). */
const fmt = (v: unknown): string => { const s = JSON.stringify(v, (_k, x) => (typeof x === "function" ? "ƒ" : x)) ?? "undefined"; return s.length > 150 ? s.slice(0, 147) + "…" : s }
const yes = (v: boolean) => (v ? "evet" : "hayır")
const wait = (ms: number, s?: AbortSignal) => new Promise<void>((ok, no) => {
  const t = setTimeout(ok, ms)
  s?.addEventListener("abort", () => { clearTimeout(t); no(new DOMException("Aborted", "AbortError")) })
})
/** Re-read a manager's non-reactive state after one of its events (written in a microtask: events may fire inside a binding). */
const refresh = (m: Manager<any, any>) => {
  const n = signal(0)
  const off = onManager(`${m.name}:*`, () => queueMicrotask(() => n.update((x) => x + 1)))
  onCleanup(off)
  return n
}
/** A manager the demo starts is stopped with the card, unless it was already running. */
const leaveAsFound = (m: Manager<any, any>) => { const was = m.alive(); onCleanup(() => { if (!was) m.dispose() }) }
/** Set a manager's config for the lifetime of the demo; the old values come back with the card. */
function useConfig<C extends object>(m: Manager<any, C>, patch: Partial<C>): void {
  const was = m.alive()
  const cur = m.config()
  const prev = {} as Partial<C>
  for (const k of Object.keys(patch) as (keyof C)[]) prev[k] = cur[k]
  m.configure(patch)
  onCleanup(() => { m.configure(prev); if (!was) m.dispose() })
}

/** `configureX(patch)` on a button: the patched keys read live, the old config comes back on the second button or with the card. */
function Cfg<C extends object>(p: { m: Manager<any, C>; fn: (c: Partial<C>) => void; patch: Partial<C>; after?: () => (() => void) | void; view?: (on: () => boolean) => unknown }) {
  const on = signal(false)
  const was = p.m.alive()
  let prev: Partial<C> = {}
  let undoAfter: (() => void) | void
  const apply = () => {
    if (on.peek()) return
    const cur = p.m.config()
    prev = {}
    for (const k of Object.keys(p.patch) as (keyof C)[]) prev[k] = cur[k]
    p.fn(p.patch)
    on.set(true)
    undoAfter = p.after?.()
  }
  const undo = () => {
    if (!on.peek()) return
    undoAfter?.()
    undoAfter = undefined
    p.m.configure(prev)
    on.set(false)
  }
  onCleanup(() => { undo(); if (!was) p.m.dispose() })
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={apply} disabled={on}>Yapılandırmayı uygula</Button>
      <Button variant="ghost" onClick={undo} disabled={() => !on()}>Eski haline döndür</Button>
      {() => <Badge tone={on() ? "success" : "neutral"} dot>{on() ? "uygulandı" : "varsayılan"}</Badge>}
    </Row>
    {Object.keys(p.patch).map((k) => <Out label={k} value={() => { on(); return fmt((p.m.config() as Record<string, unknown>)[k]) }} />)}
    {p.view?.(on)}
  </div>
}

/** The `…Manager` object of a manager: get, config, alive, dispose, and the events it reports. */
function ManagerPanel(p: { m: Manager<any, any> }) {
  const n = refresh(p.m)
  const log = signal<string[]>([])
  const off = onManager(`${p.m.name}:*`, (e) => queueMicrotask(() => log.update((l) => [...l.slice(-4), `${now()} ${e.topic}`])))
  onCleanup(off)
  leaveAsFound(p.m)
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => { p.m.get(); n.update((x) => x + 1) }}>get()</Button>
      <Button variant="ghost" onClick={() => { p.m.dispose(); n.update((x) => x + 1) }}>dispose()</Button>
      <Out label="name" value={p.m.name} />
      <Out label="alive()" value={() => { n(); return yes(p.m.alive()) }} />
    </Row>
    <Out label="config()" value={() => { n(); return fmt(p.m.config()) }} />
    <Log lines={log} label="Yönetici olayları" />
  </div>
}

/** A dispose function: use the manager, dispose it, and read what survived. */
function Dispose(p: { m: Manager<any, any>; use: () => void; stop: () => void; read: () => unknown; label: string; useLabel: string; stopLabel: string; end?: () => void }) {
  const n = refresh(p.m)
  leaveAsFound(p.m)
  onCleanup(() => p.end?.())
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => { p.use(); n.update((x) => x + 1) }}>{p.useLabel}</Button>
      <Button variant="secondary" onClick={() => { p.stop(); n.update((x) => x + 1) }}>{p.stopLabel}</Button>
    </Row>
    <Row>
      <Out label="alive()" value={() => { n(); return yes(p.m.alive()) }} />
      <Out label={p.label} value={() => { n(); return p.m.alive() ? fmt(p.read()) : "— (durdu, sonraki kullanımda yeniden başlar)" }} />
    </Row>
  </div>
}

// ------------------------------------------------------------------ constants
function CategoriesDemo() {
  const list = signal<{ id: string; title: string; required?: boolean }[]>([...DEFAULT_CATEGORIES])
  return <div class="sc-ex-stack">
    <div class="sc-ex-managers-a-grid">{() => list().map((c) => <div class="sc-ex-managers-a-cell"><code>{c.id}</code><span>{c.title}</span>{c.required ? <Badge tone="warning">her zaman açık</Badge> : <Badge tone="neutral">isteğe bağlı</Badge>}</div>)}</div>
    <Row>
      <Button onClick={() => list.update((l) => (l.some((c) => c.id === "survey") ? l : [...l, { id: "survey", title: "Anketler" }]))}>Kendi kategorini ekle</Button>
      <Button variant="ghost" onClick={() => list.set([...DEFAULT_CATEGORIES])}>Varsayılana dön</Button>
      <Out label="DEFAULT_CATEGORIES.length" value={String(DEFAULT_CATEGORIES.length)} />
    </Row>
  </div>
}

function PrefsDemo() {
  const changed = signal<Record<string, unknown>>({})
  const flip = (k: "strongFocus" | "contrast" | "underlineLinks") => changed.update((c) => ({ ...c, [k]: !(c[k] ?? DEFAULT_PREFS[k]) }))
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => flip("strongFocus")}>strongFocus</Button>
      <Button onClick={() => flip("contrast")}>contrast</Button>
      <Button onClick={() => flip("underlineLinks")}>underlineLinks</Button>
      <Button variant="ghost" onClick={() => changed.set({})}>Sıfırla</Button>
    </Row>
    <Out label="{ ...DEFAULT_PREFS, ...değişen }" value={() => fmt({ ...DEFAULT_PREFS, ...changed() })} />
    <Out label="DEFAULT_PREFS (değişmez)" value={fmt(DEFAULT_PREFS)} />
  </div>
}

function LevelsDemo() {
  const min = signal<string>("warn")
  return <div class="sc-ex-stack">
    <Segmented aria-label="En düşük düzey" value={min()} onChange={(v: string) => min.set(v)} options={LEVELS.map((l) => ({ value: l, label: l }))} />
    <div class="sc-ex-managers-a-grid">{() => LEVELS.map((l, i) => {
      const written = i >= LEVELS.indexOf(min() as (typeof LEVELS)[number])
      return <div class="sc-ex-managers-a-cell" data-off={written ? null : ""}><code>{l}</code><span>sıra {i}</span><Badge tone={written ? "success" : "neutral"}>{written ? "yazılır" : "atlanır"}</Badge></div>
    })}</div>
  </div>
}

function ThresholdsDemo() {
  const name = signal<keyof typeof THRESHOLDS>("lcp")
  const pos = signal(1)
  const names = Object.keys(THRESHOLDS) as (keyof typeof THRESHOLDS)[]
  const value = () => { const [good, poor] = THRESHOLDS[name()]; return [good * 0.6, (good + poor) / 2, poor * 1.4][pos()]! }
  const rating = () => { const [good, poor] = THRESHOLDS[name()]; const v = value(); return v <= good ? "good" : v <= poor ? "needs-improvement" : "poor" }
  return <div class="sc-ex-stack">
    <Segmented aria-label="Ölçüm" value={name()} onChange={(v: keyof typeof THRESHOLDS) => name.set(v)} options={names.map((k) => ({ value: k, label: k }))} />
    <Segmented aria-label="Örnek değer" value={pos()} onChange={(v: number) => pos.set(v)} options={[{ value: 0, label: "düşük" }, { value: 1, label: "orta" }, { value: 2, label: "yüksek" }]} />
    <Out label={() => `THRESHOLDS.${name()}`} value={() => fmt(THRESHOLDS[name()])} />
    <Out label="örnek değer" value={() => fmt(Math.round(value() * 1000) / 1000)} />
    <Row>{() => <Badge tone={rating() === "good" ? "success" : rating() === "poor" ? "danger" : "warning"}>{rating()}</Badge>}</Row>
  </div>
}

// ------------------------------------------------------------------ accessibility
function A11yDemo(p: { values: { fontScale: number; strongFocus: boolean } }) {
  useConfig(a11yManager, { storage: null })
  effect(() => { const fontScale = p.values.fontScale, strongFocus = p.values.strongFocus; untrack(() => a11y.set({ fontScale, strongFocus })) })
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => a11y.set({ contrast: !a11y.prefs().contrast })}>Yüksek karşıtlık</Button>
      <Button onClick={() => a11y.set({ underlineLinks: !a11y.prefs().underlineLinks })}>Bağlantıları altı çizili yap</Button>
      <Button variant="ghost" onClick={() => a11y.reset()}>Sıfırla</Button>
    </Row>
    <Out label="a11y.prefs()" value={() => fmt(a11y.prefs())} />
    <p class="hm-muted">Tercihler yalnız bellekte tutulur; kart kapanınca sayfa eski haline döner.</p>
  </div>
}

function AnnounceDemo(p: { values: { politeness: "polite" | "assertive" } }) {
  leaveAsFound(announcerManager)
  let n = 0
  const say = (text: string) => announce(text, { politeness: p.values.politeness })
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => say("Kaydedildi")}>"Kaydedildi"</Button>
      <Button onClick={() => say(`${++n + 2} sonuç bulundu`)}>Sonuç sayısı</Button>
      <Button variant="ghost" onClick={() => say("Bağlantı koptu")}>"Bağlantı koptu"</Button>
    </Row>
    <Log lines={() => announcer.history().map((a) => `${a.politeness}: ${a.text}`)} label="Duyurular (yeniden eskiye)" />
  </div>
}

function AnnouncerDemo() {
  leaveAsFound(announcerManager)
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => announcer.announce("Dosya yüklendi")}>Nazikçe duyur</Button>
      <Button onClick={() => announcer.announce("Oturum süresi doldu", { politeness: "assertive" })}>Hemen duyur</Button>
      <Button variant="ghost" onClick={() => announcer.clear()}>Bölgeleri boşalt</Button>
    </Row>
    <Out label="history().length" value={() => String(announcer.history().length)} />
    <Log lines={() => announcer.history().map((a) => `${now()} · ${a.politeness} · ${a.text}`)} label="Geçmiş" />
  </div>
}

function AuditDemo() {
  const fixed = signal(false)
  const issues = () => {
    const ok = fixed()
    const root = (<div>
      <h2>Başlık</h2>
      {ok ? <h3>Alt başlık</h3> : <h4>Alt başlık</h4>}
      {ok ? <img alt="Acme logosu" /> : <img />}
      <button type="button">{ok ? "Kaydet" : ""}</button>
      <input type="text" aria-label={ok ? "Ad" : undefined} />
    </div>) as HTMLElement
    return audit(root)
  }
  return <div class="sc-ex-stack">
    <Row><Button onClick={() => fixed.update((v) => !v)}>{() => (fixed() ? "Sorunları geri getir" : "Sorunları düzelt")}</Button><Out label="bulunan" value={() => String(issues().length)} /></Row>
    <ul class="sc-ex-managers-a-sample">{() => (issues().length ? issues().map((i) => <li><code>{i.rule}</code> {i.message}</li>) : <li>Sorun bulunmadı.</li>)}</ul>
  </div>
}

function AriaKeysDemo() {
  const combo = signal("mod+shift+k")
  return <div class="sc-ex-stack">
    <Segmented aria-label="Kısayol" value={combo()} onChange={(v: string) => combo.set(v)} options={["mod+s", "mod+shift+k", "alt+enter"].map((v) => ({ value: v, label: v }))} />
    <Out label="ariaKeys(combo)" value={() => ariaKeys(combo())} />
  </div>
}

// ------------------------------------------------------------------ log, flags, perf helpers
function BeaconDemo(p: { values: { batch: number } }) {
  const sent = signal<string[]>([])
  const allow = signal(true)
  const queued = signal(0)
  let transport = beaconTransport("/log", { batch: 3, interval: 60_000, minLevel: "warn", allow: () => allow(), send: (_u, body) => { sent.update((l) => [`${now()} · ${(JSON.parse(body) as unknown[]).length} kayıt gönderildi`, ...l].slice(0, 4)); return true } })
  effect(() => {
    const batch = p.values.batch
    untrack(() => { transport.dispose?.(); queued.set(0); transport = beaconTransport("/log", { batch, interval: 60_000, minLevel: "warn", allow: () => allow.peek(), send: (_u, body) => { sent.update((l) => [`${now()} · ${(JSON.parse(body) as unknown[]).length} kayıt gönderildi`, ...l].slice(0, 4)); return true } }) })
  })
  onCleanup(() => transport.dispose?.())
  let seq = 0
  const write = (level: "info" | "warn" | "error") => { transport.write({ level, scope: "demo", msg: `olay ${++seq}`, at: Date.now(), seq }); queued.set(transport.queued()) }
  return <div class="sc-ex-stack">
    <Row>
      <Button variant="ghost" onClick={() => write("info")}>info (atlanır)</Button>
      <Button onClick={() => write("warn")}>warn</Button>
      <Button onClick={() => write("error")}>error</Button>
      <Button variant="secondary" onClick={() => { transport.flush?.(); queued.set(transport.queued()) }}>Şimdi gönder</Button>
      <Button variant="ghost" onClick={() => allow.update((v) => !v)}>{() => (allow() ? "İzin: açık" : "İzin: kapalı")}</Button>
    </Row>
    <Out label="queued()" value={queued} />
    <Log lines={sent} label="Gönderilen toplu paketler" />
  </div>
}

function BucketDemo(p: { values: { percent: number } }) {
  let $id = "ada"
  return <div class="sc-ex-stack">
    <TextInput bind:value={$id} aria-label="Kullanıcı kimliği" />
    <Out label={() => `bucket("${$id}", "newCheckout")`} value={() => String(bucket($id, "newCheckout"))} />
    <Out label={() => `bucket("${$id}", "pricing")`} value={() => String(bucket($id, "pricing"))} />
    <Row>{() => { const on = bucket($id, "newCheckout") < p.values.percent; return <Badge tone={on ? "success" : "neutral"} dot>{`newCheckout %${p.values.percent}: ${on ? "açık" : "kapalı"}`}</Badge> }}</Row>
  </div>
}

function ConsoleTransportDemo() {
  const t = consoleTransport()
  const level = signal<"debug" | "info" | "warn" | "error">("info")
  const last = signal("—")
  const write = () => { const msg = `${level()} kaydı`; t.write({ level: level(), scope: "demo", msg, at: Date.now(), seq: 1, data: { user: "Ada" } }); last.set(`[demo] ${msg}`) }
  return <div class="sc-ex-stack">
    <Segmented aria-label="Düzey" value={level()} onChange={(v: "debug" | "info" | "warn" | "error") => level.set(v)} options={LEVELS.map((l) => ({ value: l, label: l }))} />
    <Row><Button onClick={write}>Konsola yaz</Button><Out label="transport.name" value={t.name} /><Out label="yazılan" value={last} /></Row>
    <p class="hm-muted">Tarayıcı konsolunu açın: satır seçilen düzeyin yöntemiyle (console.info, console.warn…) yazılır.</p>
  </div>
}

// ------------------------------------------------------------------ cache, config, clipboard, commands
function CacheDemo(p: { values: { ttl: string } }) {
  leaveAsFound(cacheManager)
  const loads = signal(0)
  const shown = signal("—")
  onCleanup(() => appCache().invalidate("demo"))
  const get = async () => {
    const user = await appCache().wrap("demo:user", async () => { loads.update((n) => n + 1); await wait(250); return { name: "Ada", at: now() } }, { ttl: p.values.ttl, tags: ["demo"] })
    shown.set(`${user.name} · alındığı an ${user.at}`)
  }
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={get}>Kullanıcıyı getir</Button>
      <Button variant="secondary" onClick={() => appCache().invalidate("demo")}>"demo" etiketini geçersiz kıl</Button>
    </Row>
    <Out label="yükleyici kaç kez çalıştı" value={loads} />
    <Out label="sonuç" value={shown} />
    <Out label="stats()" value={() => fmt(appCache().stats())} />
  </div>
}

function ConfigDemo() {
  useConfig(configManager, { defaults: { ui: { density: "comfortable" }, api: { timeout: 30000 } } })
  const c = () => appConfig()
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => c().set("ui.density", "compact")}>set("ui.density", "compact")</Button>
      <Button variant="ghost" onClick={() => c().reset("ui.density")}>reset("ui.density")</Button>
    </Row>
    <Out label='get("ui.density")' value={() => c().get("ui.density")} />
    <Out label='source("ui.density")' value={() => c().source("ui.density") ?? "—"} />
    <Out label="paths()" value={() => c().paths().join(", ")} />
  </div>
}

function WindowDemo() {
  leaveAsFound(windowManager)
  const w = appWindow()
  const log = signal<string[]>([])
  w.on("demo:ping", (data, from) => log.update((l) => [...l.slice(-4), `${now()} · ${from.slice(0, 6)}: ${fmt(data)}`]))
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => w.broadcast("demo:ping", { hello: "Ada" })}>Diğer sekmelere mesaj gönder</Button>
      <Out label="id" value={w.id.slice(0, 8)} />
    </Row>
    <Row>
      <Out label="visible()" value={() => yes(w.visible())} />
      <Out label="focused()" value={() => yes(w.focused())} />
      <Out label="count()" value={() => String(w.count())} />
      <Out label="leader()" value={() => yes(w.leader())} />
    </Row>
    <Log lines={log} label="Başka sekmelerden gelenler" />
    <p class="hm-muted">Bu sayfayı bir sekme daha açın: sayı artar, mesaj öbür sekmede görünür.</p>
  </div>
}

function ClipboardDemo() {
  leaveAsFound(clipboardManager)
  onCleanup(() => clipboard().clearHistory())
  const text = signal("INV-2026-001")
  const board = clipboard()
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => { void clipboard().copy(text()) }}>{() => (clipboard().copied() ? "Kopyalandı" : "Kopyala")}</Button>
      <Button variant="ghost" onClick={() => clipboard().clearHistory()}>Geçmişi temizle</Button>
      <Segmented aria-label="Metin" value={text()} onChange={(v: string) => text.set(v)} options={["INV-2026-001", "Acme Ltd.", "ada@example.com"].map((v) => ({ value: v, label: v }))} />
    </Row>
    <Out label="supported()" value={yes(board.supported())} />
    <Out label="last()" value={() => clipboard().last() ?? "—"} />
    <Log lines={() => clipboard().history().map((e) => `${e.kind}: ${e.text}`)} label="Geçmiş" />
  </div>
}

function CommandDemo() {
  leaveAsFound(commandManager)
  const log = signal<string[]>([])
  const save = command<[], string>({
    id: "demo.save", title: () => "Kaydet", shortcut: "mod+s", group: "Dosya", palette: false,
    run: async ({ signal }) => { await wait(1500, signal); return "Kaydedildi" },
  })
  const run = async () => { const r = await save.run(); log.update((l) => [...l.slice(-4), `${now()} · ${r ?? "atlandı ya da iptal edildi"}`]) }
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={run} disabled={() => !save.enabled()}>{() => (save.busy() ? "Kaydediliyor…" : save.title())}</Button>
      <Button variant="ghost" onClick={() => save.cancel()} disabled={() => !save.busy()}>İptal et</Button>
    </Row>
    <Row><Out label="busy()" value={() => yes(save.busy())} /><Out label="enabled()" value={() => yes(save.enabled())} /><Out label="visible()" value={() => yes(save.visible())} /></Row>
    <Log lines={log} label="Sonuçlar" />
  </div>
}

function CommandsDemo() {
  leaveAsFound(commandManager)
  const tick = signal(0)
  command({ id: "demo.open", title: () => "Aç", shortcut: "mod+o", group: "Dosya", palette: false, run: () => "açıldı" })
  command({ id: "demo.close", title: () => "Kapat", shortcut: "mod+w", group: "Dosya", palette: false, run: () => "kapandı" })
  let extra: { dispose(): void } | null = null
  onCleanup(() => extra?.dispose())
  const result = signal("—")
  const toggleConflict = () => {
    if (extra) { extra.dispose(); extra = null } else extra = command({ id: "demo.open2", title: () => "Aç (ikinci)", shortcut: "mod+o", palette: false, run: () => "ikinci" })
    tick.update((n) => n + 1)
  }
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={async () => result.set(String(await commands.run("demo.open")))}>commands.run("demo.open")</Button>
      <Button variant="ghost" onClick={toggleConflict}>{() => { tick(); return extra ? "Çakışmayı kaldır" : "Aynı kısayolla ikinci komut ekle" }}</Button>
    </Row>
    <Out label="sonuç" value={result} />
    <Out label="list()" value={() => commands.list().map((c) => `${c.id} (${c.spec.shortcut ?? "—"})`).join(", ")} />
    <Out label="conflicts()" value={() => fmt(commands.conflicts())} />
    <Out label='get("demo.close")' value={() => commands.get("demo.close")?.title() ?? "—"} />
  </div>
}

// ------------------------------------------------------------------ consent, device, dirty, defineManager
function ConsentDemo() {
  useConfig(consentManager, { storage: null, version: "demo-1" })
  const log = signal<string[]>([])
  const track = consent.gate("analytics", (event: string) => log.update((l) => [...l.slice(-4), `${now()} · gönderildi: ${event}`]))
  const send = () => { if (track("sayfa_görüldü") === undefined) log.update((l) => [...l.slice(-4), `${now()} · engellendi (onay yok)`]) }
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => consent.acceptAll()}>acceptAll()</Button>
      <Button variant="secondary" onClick={() => consent.rejectAll()}>rejectAll()</Button>
      <Button variant="ghost" onClick={() => consent.save({ analytics: true })}>save({"{ analytics: true }"})</Button>
      <Button variant="ghost" onClick={() => consent.withdraw()}>withdraw()</Button>
    </Row>
    <Out label="decided()" value={() => yes(consent.decided())} />
    <Out label="choices()" value={() => fmt(consent.choices())} />
    <Out label="record()?.method" value={() => consent.record()?.method ?? "—"} />
    <Row><Button onClick={send}>Analitik olayı gönder</Button></Row>
    <Log lines={log} label="Kapıdan geçenler" />
  </div>
}

function DeviceDemo() {
  leaveAsFound(deviceManager)
  const d = device()
  const store = signal("—")
  const checks = ["share", "vibrate", "webgl2", "serviceWorker", "clipboard"] as const
  return <div class="sc-ex-stack">
    <Row>
      <Out label="mobile()" value={yes(d.mobile())} /><Out label="touch()" value={yes(d.touch())} /><Out label="platform()" value={d.platform()} />
      <Out label="cores()" value={String(d.cores() ?? "—")} /><Out label="memory()" value={String(d.memory() ?? "—")} />
    </Row>
    <Out label="pixelRatio()" value={() => String(d.pixelRatio())} />
    <Out label="network()" value={() => fmt(d.network())} />
    <Out label="lowEnd() / slowNetwork()" value={() => `${yes(d.lowEnd())} / ${yes(d.slowNetwork())}`} />
    <Row>{checks.map((f) => <Badge tone={d.supports(f) ? "success" : "neutral"} dot>{f}</Badge>)}</Row>
    <Row><Button onClick={async () => { const s = await d.storage(); store.set(s ? `${Math.round(s.usage / 1024)} KB / ${Math.round(s.quota / 1048576)} MB` : "desteklenmiyor") }}>storage() ölç</Button><Out label="kullanım" value={store} /></Row>
  </div>
}

function DirtyDemo() {
  useConfig(dirtyManager, { warnOnUnload: false, guardRoutes: false })
  let $text = "Ada"
  const saved = signal("Ada")
  const d = dirtyState()
  const answer = signal("—")
  d.track("note", () => $text !== saved(), "Not", () => saved.set($text))
  return <div class="sc-ex-stack">
    <TextInput bind:value={$text} aria-label="Not" />
    <Out label="any()" value={() => yes(d.any())} />
    <Out label="list()" value={() => d.list().map((e) => e.label).join(", ") || "—"} />
    <Row>
      <Button onClick={async () => { await d.saveAll() }}>saveAll()</Button>
      <Button variant="secondary" onClick={async () => answer.set((await d.confirmLeave()) ? "ayrılınabilir" : "kalındı")}>confirmLeave()</Button>
      <Out label="sonuç" value={answer} />
    </Row>
  </div>
}

function DefineDemo() {
  const counter = defineManager<{ count: () => number; inc(): void; dispose(): void }, { step: number }>("api-demo-counter", (cfg) => {
    const count = signal(0)
    return { count, inc: () => count.update((n) => n + cfg.step), dispose() {} }
  }, { step: 1 })
  const n = refresh(counter)
  const log = signal<string[]>([])
  const off = onManager("api-demo-counter:*", (e) => queueMicrotask(() => log.update((l) => [...l.slice(-4), `${now()} · ${e.topic}`])))
  onCleanup(() => { off(); counter.dispose() })
  return <div class="sc-ex-stack">
    <Row>
      <Button onClick={() => counter.get().inc()}>get().inc()</Button>
      <Button variant="secondary" onClick={() => counter.configure({ step: 5 })}>configure({"{ step: 5 }"})</Button>
      <Button variant="ghost" onClick={() => counter.dispose()}>dispose()</Button>
    </Row>
    <Row>
      <Out label="alive()" value={() => { n(); return yes(counter.alive()) }} />
      <Out label="config()" value={() => { n(); return fmt(counter.config()) }} />
      <Out label="sayaç" value={() => { n(); return counter.alive() ? String(counter.get().count()) : "—" }} />
    </Row>
    <Log lines={log} label="Yönetici olayları" />
  </div>
}

// ------------------------------------------------------------------ configure…
function CfgA11y() {
  return <Cfg m={a11yManager} fn={configureA11y} patch={{ storage: null, defaults: { ...DEFAULT_PREFS, strongFocus: true } }}
    view={(on) => <Out label="a11y.prefs().strongFocus" value={() => { on(); return yes(a11y.prefs().strongFocus) }} />} />
}
function CfgAnnouncer() {
  let n = 0
  return <Cfg m={announcerManager} fn={configureAnnouncer} patch={{ historySize: 3, dedupeMs: 0 }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => announce(`Satır ${++n}`)}>Duyur</Button><Out label="history().length" value={() => { on(); return String(announcer.history().length) }} /></Row>
      <Log lines={() => { on(); return announcer.history().map((a) => a.text) }} label="Geçmiş (en çok 3)" />
    </>} />
}
function CfgAppConfig() {
  return <Cfg m={configManager} fn={configureAppConfig} patch={{ defaults: { ui: { density: "comfortable" } }, validate: (c: any) => (c.ui?.density === "huge" ? ["ui.density geçersiz"] : []) }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => appConfig().set("ui.density", "compact")}>compact</Button>
        <Button disabled={() => !on()} onClick={() => appConfig().set("ui.density", "huge")}>huge (geçersiz)</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => appConfig().reset()}>reset()</Button>
      </Row>
      <Out label='get("ui.density")' value={() => { on(); return appConfig().get("ui.density") }} />
      <Out label="errors()" value={() => { on(); return fmt(appConfig().errors()) }} />
    </>} />
}
function CfgCache(p: { values: { max: number } }) {
  let n = 0
  return <Cfg m={cacheManager} fn={configureCache} patch={{ maxEntries: p.values.max, ttl: "30s" }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => appCache().set(`demo:${++n}`, n)}>Yeni kayıt ekle</Button></Row>
      <Out label="stats().size" value={() => { on(); return String(appCache().stats().size) }} />
      <Out label="stats().evictions" value={() => { on(); return String(appCache().stats().evictions) }} />
    </>} />
}
function CfgClipboard() {
  let n = 0
  return <Cfg m={clipboardManager} fn={configureClipboard} patch={{ historySize: 2, resetMs: 3000 }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => { void clipboard().copy(`Satır ${++n}`) }}>Kopyala</Button><Out label="copied()" value={() => { on(); return yes(clipboard().copied()) }} /></Row>
      <Log lines={() => { on(); return clipboard().history().map((e) => e.text) }} label="Geçmiş (en çok 2)" />
    </>} />
}
function CfgCommands() {
  return <Cfg m={commandManager} fn={configureCommands} patch={{ palette: false }}
    view={(on) => <Out label="commandManager.config().palette" value={() => { on(); return yes(commandManager.config().palette) }} />} />
}
function CfgConsent() {
  return <Cfg m={consentManager} fn={configureConsent} patch={{ storage: null, version: "demo-1", maxAgeDays: 30, categories: DEFAULT_CATEGORIES.slice(0, 3) }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => consent.acceptAll()}>acceptAll()</Button><Button variant="ghost" disabled={() => !on()} onClick={() => consent.withdraw()}>withdraw()</Button></Row>
      <Out label="categories()" value={() => { on(); return consent.categories().map((c) => c.id).join(", ") }} />
      <Out label="choices()" value={() => { on(); return fmt(consent.choices()) }} />
    </>} />
}
function CfgDevice() {
  return <Cfg m={deviceManager} fn={configureDevice} patch={{ lowMemory: 1024, lowCores: 1024 }}
    view={(on) => <>
      <Out label="lowEnd()" value={() => { on(); return yes(device().lowEnd()) }} />
      <Out label="memory() / cores()" value={() => { on(); return `${device().memory() ?? "—"} GB / ${device().cores() ?? "—"}` }} />
    </>} />
}
function CfgDirty() {
  const asked = signal("—")
  const saved = signal(false)
  return <Cfg m={dirtyManager} fn={configureDirty} patch={{ warnOnUnload: false, guardRoutes: false, confirm: (items: { label: string }[]) => { asked.set(items.map((i) => i.label).join(", ")); return true } }}
    after={() => { dirtyState().mark("demo.note", "Taslak not"); saved.set(false); return () => { if (dirtyManager.alive()) dirtyState().clean("demo.note") } }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={async () => { await dirtyState().confirmLeave() }}>confirmLeave()</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => { dirtyState().clean("demo.note"); saved.set(true) }}>clean("demo.note")</Button>
      </Row>
      <Out label="any()" value={() => { on(); saved(); return yes(dirtyState().any()) }} />
      <Out label="özel confirm() gördü" value={asked} />
    </>} />
}
function CfgFlags() {
  return <Cfg m={flagsManager} fn={configureFlags} patch={{ user: () => "ada", overrideKey: null, flags: { darkCharts: true, beta: { percent: 50 }, pricing: { variants: { monthly: 50, annual: 50 } } } }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => flags().override("beta", !flags().on("beta"))}>beta bayrağını çevir</Button><Button variant="ghost" disabled={() => !on()} onClick={() => flags().clearOverrides()}>clearOverrides()</Button></Row>
      <Out label='on("darkCharts")' value={() => { on(); return yes(flags().on("darkCharts")) }} />
      <Out label='on("beta")' value={() => { on(); return yes(flags().on("beta")) }} />
      <Out label='variant("pricing")' value={() => { on(); return flags().variant("pricing") }} />
    </>} />
}
function CfgFocus() {
  const root = signal(false)
  const sync = () => setTimeout(() => root.set(document.documentElement.hasAttribute("data-hm-focus-visible")), 0)
  document.addEventListener("keydown", sync, true)
  document.addEventListener("pointerdown", sync, true)
  onCleanup(() => { document.removeEventListener("keydown", sync, true); document.removeEventListener("pointerdown", sync, true) })
  return <Cfg m={focusManager} fn={configureFocus} patch={{ markRoot: false }}
    view={(on) => <>
      <Row><Button variant="secondary">Tab ile bana gel</Button><Button variant="secondary">Sonra ben</Button></Row>
      <Out label="focus.modality()" value={() => { on(); return focus.modality() }} />
      <Out label="<html data-hm-focus-visible>" value={() => yes(root())} />
    </>} />
}
function CfgHotkeys() {
  const log = signal<string[]>([])
  let off: (() => void) | undefined
  return <Cfg m={hotkeyManager} fn={configureHotkeys} patch={{ sequenceTimeout: 4000 }}
    after={() => { off = hotkeys.bind("g h", () => log.update((l) => [...l.slice(-3), `${now()} · g h çalıştı`]), { description: "Ana sayfaya git" }); return () => off?.() }}
    view={(on) => <>
      <p class="hm-muted">Sayfada <kbd>g</kbd> tuşuna, en geç 4 saniye içinde <kbd>h</kbd> tuşuna basın.</p>
      <Out label="pending()" value={() => { on(); return hotkeys.pending() || "—" }} />
      <Log lines={log} label="Çalışanlar" />
    </>} />
}
function CfgIdle() {
  const t = signal(0)
  const id = setInterval(() => t.update((x) => x + 1), 500)
  onCleanup(() => clearInterval(id))
  return <Cfg m={idleManager} fn={configureIdle} patch={{ timeout: 5000, throttle: 50 }}
    view={(on) => <>
      <p class="hm-muted">Sayfada 5 saniye hiçbir şey yapmayın (fare, tuş, kaydırma).</p>
      <Out label="idle()" value={() => { on(); return yes(idle().idle()) }} />
      <Out label="remaining()" value={() => { on(); t(); return `${Math.ceil(idle().remaining() / 1000)} sn` }} />
    </>} />
}
function CfgLayers() {
  const opened = signal(0)
  const open = () => {
    const card = (<div class="sc-ex-managers-a-layer" role="group" aria-label="Deneme katmanı"><strong>Katman</strong><span class="hm-muted">Esc ile kapanmaya çalışın.</span><Button size="sm" onClick={() => h.close()}>Kapat</Button></div>) as HTMLElement
    const h = layer.open("popover", card, { label: "api-demo", onEscape: () => h.close() })
    opened.update((n) => n + 1)
    return h
  }
  const handles: ReturnType<typeof open>[] = []
  onCleanup(() => { for (const h of handles) h.close() })
  return <Cfg m={layerManager} fn={configureLayers} patch={{ escape: false, keepGutter: false }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => handles.push(open())}>Katman aç</Button><Button variant="ghost" disabled={() => !on()} onClick={() => { layer.escape() }}>layer.escape()</Button></Row>
      <Out label="açılan" value={opened} />
      <Out label='açık "api-demo" katmanı' value={() => { on(); return String(layer.stack().filter((l) => l.label === "api-demo").length) }} />
    </>} />
}
function CfgLocation() {
  const msg = signal("—")
  return <Cfg m={locationManager} fn={configureLocation} patch={{ highAccuracy: true, timeout: 5000, maxAge: 0 }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={async () => { try { const p = await locator().locate(); msg.set(`${p.lat.toFixed(2)}, ${p.lng.toFixed(2)} (±${Math.round(p.accuracy)} m)`) } catch (e) { msg.set((e as Error).message) } }}>Konumu iste (tarayıcı sorar)</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => locator().stop()}>stop()</Button>
      </Row>
      <Out label="status()" value={() => { on(); return locator().status() }} />
      <Out label="sonuç" value={msg} />
    </>} />
}
function CfgLog() {
  const mem = memoryTransport(10)
  return <Cfg m={logManager} fn={configureLog} patch={{ level: "warn", transports: [mem], redact: ["pin"] }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} variant="ghost" onClick={() => logger().info("açıldı", { user: "Ada" })}>info (atlanır)</Button>
        <Button disabled={() => !on()} onClick={() => logger().warn("yavaş yanıt", { user: "Ada", pin: "1234" })}>warn + pin</Button>
        <Button disabled={() => !on()} onClick={() => logger().error(new Error("Ödeme reddedildi"))}>error</Button>
      </Row>
      <Log lines={() => mem.entries().map((e) => `${e.level} · ${e.msg} ${e.data ? fmt(e.data) : ""}`)} label="Bellek taşıyıcısı" />
    </>} />
}
function CfgNotifications() {
  const shown = signal<string[]>([])
  let n = 0
  return <Cfg m={notificationManager} fn={configureNotifications} patch={{ native: "never", keep: 3, toast: (x: { title: string }) => shown.update((l) => [...l.slice(-4), `${now()} · ${x.title}`]) }}
    view={(on) => <>
      <Row><Button disabled={() => !on()} onClick={() => notifications().notify({ title: `Mesaj ${++n}`, body: "Acme" })}>notify()</Button><Button variant="ghost" disabled={() => !on()} onClick={() => notifications().clear()}>clear()</Button></Row>
      <Out label="inbox().length (en çok 3)" value={() => { on(); return String(notifications().inbox().length) }} />
      <Out label="unread()" value={() => { on(); return String(notifications().unread()) }} />
      <Log lines={shown} label="Özel toast köprüsü" />
    </>} />
}
function CfgPerf() {
  const used: string[] = []
  onCleanup(() => { for (const n of used) { try { performance.clearMarks(`demo:${n}`); performance.clearMeasures(`demo:${n}`) } catch {} } })
  return <Cfg m={perfManager} fn={configurePerf} patch={{ keep: 3, prefix: "demo:" }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => perf().time("döngü", () => { let s = 0; for (let i = 0; i < 2e6; i++) s += i; return s })}>time()</Button>
        <Button disabled={() => !on()} onClick={() => { used.push("a", "b"); perf().mark("a"); perf().mark("b"); perf().measure("a→b", "a", "b") }}>mark + measure</Button>
      </Row>
      <Log lines={() => { on(); return perf().measures().map((m) => `${m.name}: ${m.duration} ms`) }} label="measures() (en çok 3)" />
    </>} />
}
function CfgPermissions() {
  useConfig(consentManager, { storage: null })
  const result = signal("—")
  return <Cfg m={permissionManager} fn={configurePermissions} patch={{ consent: { demo: "analytics" }, requesters: { demo: async () => "granted" } }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={async () => result.set(await permissions().request("demo"))}>request("demo")</Button>
        <Button variant="secondary" onClick={() => consent.acceptAll()}>Analitiğe onay ver</Button>
        <Button variant="ghost" onClick={() => consent.withdraw()}>Onayı geri al</Button>
      </Row>
      <Out label='consented("demo")' value={() => { on(); return yes(permissions().consented("demo")) }} />
      <Out label="request() sonucu" value={result} />
    </>} />
}
function CfgPresence() {
  const reports = signal<string[]>([])
  return <Cfg m={presenceManager} fn={configurePresence} patch={{ shareTabs: false, heartbeat: 0, report: (state: string) => reports.update((l) => [...l.slice(-4), `${now()} · ${state}`]) }}
    view={(on) => <>
      <Out label="state()" value={() => { on(); return presence().state() }} />
      <Out label="overall()" value={() => { on(); return presence().overall() }} />
      <Row><Button disabled={() => !on()} onClick={() => presence().setPeer("ada", "active", { name: "Ada" })}>setPeer("ada")</Button><Button variant="ghost" disabled={() => !on()} onClick={() => presence().removePeer("ada")}>removePeer("ada")</Button></Row>
      <Out label="peers()" value={() => { on(); return presence().peers().map((x) => `${x.id}:${x.state}`).join(", ") || "—" }} />
      <Log lines={reports} label="report() çağrıları" />
    </>} />
}
function CfgScroll() {
  return <Cfg m={scrollManager} fn={configureScroll} patch={{ storageKey: null, offset: 100, keep: 5 }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => scroll().save("demo")}>save("demo")</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => scroll().to(0)}>Başa git</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => scroll().restore("demo")}>restore("demo")</Button>
      </Row>
      <Out label="y()" value={() => { on(); return String(Math.round(scroll().y())) }} />
      <Out label="direction()" value={() => { on(); return scroll().direction() }} />
    </>} />
}
function CfgSession() {
  const t = signal(0)
  const id = setInterval(() => t.update((x) => x + 1), 500)
  onCleanup(() => clearInterval(id))
  const expired = signal(0)
  return <Cfg m={sessionManager} fn={configureSession} patch={{ duration: 20_000, warnBefore: 8000, storageKey: null, extendOnActivity: false, onExpire: () => expired.update((n) => n + 1) }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => session().start()}>start()</Button>
        <Button variant="secondary" disabled={() => !on()} onClick={() => session().extend()}>extend()</Button>
        <Button variant="ghost" disabled={() => !on()} onClick={() => session().end()}>end()</Button>
      </Row>
      <Out label="active() / warning()" value={() => { on(); t(); return `${yes(session().active())} / ${yes(session().warning())}` }} />
      <Out label="remaining()" value={() => { on(); t(); return `${Math.ceil(session().remaining() / 1000)} sn` }} />
      <Out label="onExpire çağrıldı" value={expired} />
    </>} />
}
function CfgHints() {
  return <Cfg m={shortcutHintManager} fn={configureShortcutHints} patch={{ holdKey: "Shift", holdMs: 200, helpKey: null }}
    view={(on) => <>
      <p class="hm-muted">Shift tuşunu 0,2 saniye basılı tutun ya da düğmeleri kullanın.</p>
      <Row><Button disabled={() => !on()} onClick={() => shortcutHints.show()}>show()</Button><Button variant="ghost" disabled={() => !on()} onClick={() => shortcutHints.hide()}>hide()</Button></Row>
      <Out label="visible()" value={() => { on(); return yes(shortcutHints.visible()) }} />
    </>} />
}
function CfgStorage() {
  const keys = signal<string[]>([])
  const text = signal("Merhaba")
  return <Cfg m={storageManager} fn={configureStorage} patch={{ prefix: "demo.", version: 2, dbName: null }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={async () => { await storage().area("memory").set("note", text()); keys.set(await storage().area("memory").keys()) }}>Belleğe yaz</Button>
        <Segmented aria-label="Değer" value={text()} onChange={(v: string) => text.set(v)} options={["Merhaba", "Acme"].map((v) => ({ value: v, label: v }))} />
      </Row>
      <Out label='area("memory").keys()' value={() => fmt(keys())} />
      <Out label='persistent("memory")' value={() => { on(); return yes(storage().persistent("memory")) }} />
    </>} />
}
function CfgSync() {
  const n = createNet()
  const received = signal<string[]>([])
  const mock = n.mock({ "POST /demo/notes": (r: { body: { text: string } }) => { received.update((l) => [r.body.text, ...l].slice(0, 4)); return { saved: true } } }, { delay: 300 })
  onCleanup(() => mock.restore())
  let id = 0
  return <Cfg m={syncManager} fn={configureSync} patch={{ net: n, storageKey: null, retry: { delay: 300, factor: 1, max: 300, count: 3 }, timeout: 2000 }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => sync().enqueue({ url: "/demo/notes", method: "POST", body: { text: `Not ${++id}` } })}>enqueue()</Button>
        <Button variant="secondary" disabled={() => !on()} onClick={() => n.setOnline(!n.online.peek())}>{() => (n.online() ? "Çevrimdışı ol" : "Çevrimiçi ol")}</Button>
      </Row>
      <Out label="status() / pending()" value={() => { on(); return `${sync().status()} / ${sync().pending()}` }} />
      <Out label="sunucuya ulaşan" value={() => received().join(", ") || "—"} />
    </>} />
}
function CfgUndo() {
  const value = signal(0)
  return <Cfg m={undoManager} fn={configureUndo} patch={{ limit: 3, mergeMs: 0, commands: false }}
    view={(on) => <>
      <Row>
        <Button disabled={() => !on()} onClick={() => { const from = value.peek(), to = from + 1; value.set(to); undoStack().push({ label: `${from} → ${to}`, undo: () => value.set(from), redo: () => value.set(to) }) }}>Değeri artır</Button>
        <Button variant="secondary" disabled={() => !on() || !undoStack().canUndo()} onClick={() => undoStack().undo()}>undo()</Button>
        <Button variant="ghost" disabled={() => !on() || !undoStack().canRedo()} onClick={() => undoStack().redo()}>redo()</Button>
      </Row>
      <Out label="değer" value={value} />
      <Out label="past() (en çok 3)" value={() => { on(); return undoStack().past().join(" | ") || "—" }} />
    </>} />
}
function CfgViewport() {
  return <Cfg m={viewportManager} fn={configureViewport} patch={{ breakpoints: { xs: 0, sm: 400, md: 600, lg: 900, xl: 1400 }, mobile: "md", desktop: "xl" }}
    view={(on) => <>
      <p class="hm-muted">Tarayıcı penceresini yeniden boyutlandırın.</p>
      <Out label="width()" value={() => { on(); return `${viewport().width()} px` }} />
      <Out label="breakpoint()" value={() => { on(); return viewport().breakpoint() }} />
      <Out label="mobile() / tablet() / desktop()" value={() => { on(); return `${yes(viewport().mobile())} / ${yes(viewport().tablet())} / ${yes(viewport().desktop())}` }} />
    </>} />
}
function CfgWindow() {
  return <Cfg m={windowManager} fn={configureWindow} patch={{ channel: "api-demo:window", heartbeat: 500, ttl: 1500 }}
    view={(on) => <>
      <Out label="id" value={() => { on(); return appWindow().id.slice(0, 8) }} />
      <Out label="count() / leader()" value={() => { on(); return `${appWindow().count()} / ${yes(appWindow().leader())}` }} />
      <p class="hm-muted">Ayrı bir kanal adı, uygulamanın kendi sekme sayımından ayrı bir grup kurar.</p>
    </>} />
}

// ------------------------------------------------------------------ dispose…
function DisposeA11y() {
  useConfig(a11yManager, { storage: null })
  return <Dispose m={a11yManager} label="html yazı boyutu" useLabel='a11y.set({ fontScale: 1.25 })' stopLabel="disposeA11y()"
    use={() => { a11y.set({ fontScale: 1.25, strongFocus: true }) }} stop={() => disposeA11y()}
    read={() => `${document.documentElement.style.fontSize || "varsayılan"} · strongFocus ${yes(a11y.prefs().strongFocus)}`} />
}
function DisposeAnnouncer() {
  return <Dispose m={announcerManager} label="history().length" useLabel='announce("Merhaba")' stopLabel="disposeAnnouncer()"
    use={() => announce("Merhaba " + Date.now() % 1000)} stop={() => disposeAnnouncer()} read={() => announcer.history().length} />
}
function DisposeAppConfig() {
  useConfig(configManager, { defaults: { theme: "light" } })
  return <Dispose m={configManager} label='get("theme")' useLabel='set("theme", "dark")' stopLabel="disposeAppConfig()"
    use={() => appConfig().set("theme", "dark")} stop={() => disposeAppConfig()} read={() => appConfig().get("theme")} />
}
function DisposeCache() {
  return <Dispose m={cacheManager} label="stats().size" useLabel='set("demo:k", 1)' stopLabel="disposeCache()"
    use={() => appCache().set(`demo:${Date.now() % 1000}`, 1)} stop={() => disposeCache()} read={() => appCache().stats().size} />
}
function DisposeClipboard() {
  return <Dispose m={clipboardManager} label="history().length" useLabel='copy("Acme")' stopLabel="disposeClipboard()"
    use={() => { void clipboard().copy("Acme " + Date.now() % 1000) }} stop={() => disposeClipboard()} read={() => clipboard().history().length}
    end={() => { if (clipboardManager.alive()) clipboard().clearHistory() }} />
}
function DisposeCommands() {
  let made: { dispose(): void } | null = null
  return <Dispose m={commandManager} label="commands.list()" useLabel='command({ id: "demo.hello" })' stopLabel="disposeCommands()"
    use={() => { made?.dispose(); made = command({ id: "demo.hello", title: "Merhaba", palette: false, run: () => "merhaba" }) }}
    stop={() => disposeCommands()} read={() => commands.list().map((c) => c.id)} end={() => made?.dispose()} />
}
function DisposeConsent() {
  useConfig(consentManager, { storage: null })
  return <Dispose m={consentManager} label="record()?.method" useLabel="acceptAll()" stopLabel="disposeConsent()"
    use={() => consent.acceptAll()} stop={() => disposeConsent()} read={() => consent.record()?.method ?? null} />
}
function DisposeDevice() {
  return <Dispose m={deviceManager} label="desteklenen özellik" useLabel="device().features()" stopLabel="disposeDevice()"
    use={() => { device().features() }} stop={() => disposeDevice()} read={() => Object.values(device().features()).filter(Boolean).length} />
}
function DisposeDirty() {
  useConfig(dirtyManager, { warnOnUnload: false, guardRoutes: false })
  return <Dispose m={dirtyManager} label="any()" useLabel='mark("demo.note")' stopLabel="disposeDirty()"
    use={() => dirtyState().mark("demo.note", "Taslak not")} stop={() => disposeDirty()} read={() => dirtyState().any()}
    end={() => { if (dirtyManager.alive()) dirtyState().clean("demo.note") }} />
}
function DisposeFlags() {
  useConfig(flagsManager, { user: () => "ada", overrideKey: null, flags: { beta: false } })
  return <Dispose m={flagsManager} label='on("beta")' useLabel='override("beta", true)' stopLabel="disposeFlags()"
    use={() => flags().override("beta", true)} stop={() => disposeFlags()} read={() => flags().on("beta")} />
}
function DisposeFocus() {
  const box = (<div class="sc-ex-managers-a-box"><Button size="sm" variant="secondary">İçerideki düğme</Button></div>) as HTMLElement
  let release: (() => void) | null = null
  return <div class="sc-ex-stack">{box}<Dispose m={focusManager} label="trapped()" useLabel="focus.trap(kutu)" stopLabel="disposeFocus()"
    use={() => { release?.(); release = focus.trap(box, { contain: false }) }} stop={() => disposeFocus()}
    read={() => { const t = focus.trapped(); if (t) box.setAttribute("data-on", ""); else box.removeAttribute("data-on"); return t }}
    end={() => release?.()} /></div>
}
function DisposeHotkeys() {
  let off: (() => void) | null = null
  return <Dispose m={hotkeyManager} label="list().length" useLabel='bind("g h")' stopLabel="disposeHotkeys()"
    use={() => { off?.(); off = hotkeys.bind("g h", () => {}, { description: "Ana sayfaya git" }) }}
    stop={() => disposeHotkeys()} read={() => hotkeys.list().length} end={() => off?.()} />
}

export default examples({
  "hadi-march/managers": {
    DEFAULT_CATEGORIES: {
      code: `configureConsent({ categories: [...DEFAULT_CATEGORIES, { id: "survey", title: "Surveys", description: "Short feedback prompts." }] })
DEFAULT_CATEGORIES.map((c) => c.id)   // necessary, preferences, analytics, marketing, thirdParty`,
      run: () => <CategoriesDemo />,
    },
    DEFAULT_PREFS: {
      code: `configureA11y({ defaults: { ...DEFAULT_PREFS, strongFocus: true } })   // start with a thick focus ring
a11y.reset()                                                              // back to those defaults`,
      run: () => <PrefsDemo />,
    },
    LEVELS: {
      code: `const written = (level, min) => LEVELS.indexOf(level) >= LEVELS.indexOf(min)
written("info", "warn")    // false
written("error", "warn")   // true`,
      run: () => <LevelsDemo />,
    },
    THRESHOLDS: {
      code: `const [good, poor] = THRESHOLDS.lcp          // [2500, 4000] ms
const rating = value <= good ? "good" : value <= poor ? "needs-improvement" : "poor"`,
      run: () => <ThresholdsDemo />,
    },
    a11y: {
      code: `a11y.set({ fontScale: 1.25, strongFocus: true })   // saved and applied to <html> at once
a11y.prefs()                                         // reactive
a11y.reset()`,
      play: { options: [
        { key: "fontScale", label: "Yazı ölçeği", default: 1, options: [{ value: 1, label: "%100" }, { value: 1.25, label: "%125" }, { value: 1.5, label: "%150" }] },
        { key: "strongFocus", label: "Kalın odak halkası", default: false },
      ] },
      run: (p: { values: { fontScale: number; strongFocus: boolean } }) => <A11yDemo values={p.values} />,
    },
    a11yManager: {
      code: `a11yManager.get()          // the instance, created now
a11yManager.alive()        // true
a11yManager.dispose()      // listeners removed, <html> back to normal`,
      run: () => <ManagerPanel m={a11yManager} />,
    },
    announce: {
      code: `announce("Saved")                                        // polite
announce("Connection lost", { politeness: "assertive" })   // interrupts`,
      play: { options: [{ key: "politeness", label: "Öncelik", default: "polite", options: [{ value: "polite", label: "Nazik" }, { value: "assertive", label: "Acil" }] }] },
      run: (p: { values: { politeness: "polite" | "assertive" } }) => <AnnounceDemo values={p.values} />,
    },
    announcer: {
      code: `announcer.announce("File uploaded")
announcer.history()   // newest first, reactive
announcer.clear()     // empty both live regions`,
      run: () => <AnnouncerDemo />,
    },
    announcerManager: {
      code: `announcerManager.config()    // { clearAfter, historySize, dedupeMs }
announcerManager.dispose()   // regions leave the layer stack`,
      run: () => <ManagerPanel m={announcerManager} />,
    },
    appCache: {
      code: `const user = await appCache().wrap("user:1", () => net.get("/api/users/1"), { ttl: "1m", tags: ["users"] })
appCache().invalidate("users")   // drops every entry with that tag or key prefix`,
      play: { options: [{ key: "ttl", label: "Geçerlilik", default: "10s", options: [{ value: "1s", label: "1 sn" }, { value: "10s", label: "10 sn" }, { value: "1m", label: "1 dk" }] }] },
      run: (p: { values: { ttl: string } }) => <CacheDemo values={p.values} />,
    },
    appConfig: {
      code: `configureAppConfig({ defaults: { ui: { density: "comfortable" } } })
appConfig().set("ui.density", "compact")   // override layer
appConfig().source("ui.density")           // "override"`,
      run: () => <ConfigDemo />,
    },
    appWindow: {
      code: `const w = appWindow()
w.count()   w.leader()   w.visible()
w.broadcast("cart", { count: 3 })   w.on("cart", (data, from) => …)`,
      run: () => <WindowDemo />,
    },
    ariaKeys: {
      code: `ariaKeys("mod+shift+k")   // "Control+Shift+K" (Meta on macOS)
<button aria-keyshortcuts={ariaKeys("mod+s")}>Save</button>`,
      run: () => <AriaKeysDemo />,
    },
    audit: {
      code: `const issues = audit(document.querySelector("main")!)
issues.map((i) => i.rule + ": " + i.message)   // img-alt, name, label, heading-order…`,
      run: () => <AuditDemo />,
    },
    beaconTransport: {
      code: `configureLog({ transports: [beaconTransport("/log", { batch: 20, allow: () => consent.has("analytics") })] })
// warn and error entries are sent in batches; nothing leaves while allow() says no`,
      play: { options: [{ key: "batch", label: "Paket boyu", default: 3, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 5, label: "5" }] }] },
      run: (p: { values: { batch: number } }) => <BeaconDemo values={p.values} />,
    },
    bucket: {
      code: `bucket("ada", "newCheckout")             // 0..99, the same every time
const on = bucket(user.id, "newCheckout") < 30   // a 30 % rollout`,
      play: { options: [{ key: "percent", label: "Açılış yüzdesi", default: 30, options: [{ value: 10, label: "%10" }, { value: 30, label: "%30" }, { value: 60, label: "%60" }, { value: 90, label: "%90" }] }] },
      run: (p: { values: { percent: number } }) => <BucketDemo values={p.values} />,
    },
    cacheManager: {
      code: `cacheManager.config()    // { maxEntries: 500, ttl: "5m", staleFor: "1h" }
cacheManager.dispose()   // every entry is forgotten`,
      run: () => <ManagerPanel m={cacheManager} />,
    },
    clipboard: {
      code: `await clipboard().copy("INV-2026-001")   // true when it worked
clipboard().copied()                     // true for a moment: button feedback
clipboard().history()                    // newest first`,
      run: () => <ClipboardDemo />,
    },
    clipboardManager: {
      code: `clipboardManager.config()   // { resetMs: 1500, historySize: 10 }
clipboardManager.alive()`,
      run: () => <ManagerPanel m={clipboardManager} />,
    },
    command: {
      code: `const save = command({ id: "doc.save", title: () => "Save", shortcut: "mod+s",
  run: async ({ signal }) => { await upload({ signal }); return "Saved" } })
save.run()   save.busy()   save.cancel()`,
      run: () => <CommandDemo />,
    },
    commandManager: {
      code: `commandManager.config()    // { palette: true }
commandManager.dispose()   // commands registered so far are gone`,
      run: () => <ManagerPanel m={commandManager} />,
    },
    commands: {
      code: `commands.list()              // every command, registration order
commands.run("doc.open")     // by id
commands.conflicts()         // [{ shortcut: "ctrl+o", ids: ["doc.open", "doc.open2"] }]`,
      run: () => <CommandsDemo />,
    },
    configManager: {
      code: `configManager.config()    // { defaults, env, validate }
configManager.dispose()   // runtime overrides are dropped`,
      run: () => <ManagerPanel m={configManager} />,
    },
    configureA11y: {
      code: `configureA11y({ storage: null, defaults: { ...DEFAULT_PREFS, strongFocus: true } })   // memory only, thick focus ring by default`,
      run: () => <CfgA11y />,
    },
    configureAnnouncer: {
      code: `configureAnnouncer({ historySize: 3, dedupeMs: 0 })   // keep 3 messages, read repeats`,
      run: () => <CfgAnnouncer />,
    },
    configureAppConfig: {
      code: `configureAppConfig({ defaults: { ui: { density: "comfortable" } }, validate: (c) => c.ui.density === "huge" ? ["invalid density"] : [] })
appConfig().errors()`,
      run: () => <CfgAppConfig />,
    },
    configureCache: {
      code: `configureCache({ maxEntries: 3, ttl: "30s" })   // the least recently used entry goes first`,
      play: { options: [{ key: "max", label: "En çok kayıt", default: 3, options: [{ value: 2, label: "2" }, { value: 3, label: "3" }, { value: 5, label: "5" }] }] },
      run: (p: { values: { max: number } }) => <CfgCache values={p.values} />,
    },
    configureClipboard: {
      code: `configureClipboard({ historySize: 2, resetMs: 3000 })   // copied() stays true for 3 s`,
      run: () => <CfgClipboard />,
    },
    configureCommands: {
      code: `configureCommands({ palette: false })   // no command is listed in the palette by default`,
      run: () => <CfgCommands />,
    },
    configureConsent: {
      code: `configureConsent({ version: "2026-11", maxAgeDays: 30, categories: DEFAULT_CATEGORIES.slice(0, 3) })
consent.acceptAll()`,
      run: () => <CfgConsent />,
    },
    configureDevice: {
      code: `configureDevice({ lowMemory: 4, lowCores: 4 })   // lowEnd() is true at or below these`,
      run: () => <CfgDevice />,
    },
    configureDirty: {
      code: `configureDirty({ guardRoutes: false, confirm: (items) => askInMyDialog(items) })
dirtyState().mark("note", "Draft note")`,
      run: () => <CfgDirty />,
    },
    configureFlags: {
      code: `configureFlags({ user: () => session.id, flags: { darkCharts: true, beta: { percent: 50 }, pricing: { variants: { monthly: 50, annual: 50 } } } })
flags().on("beta")   flags().variant("pricing")`,
      run: () => <CfgFlags />,
    },
    configureFocus: {
      code: `configureFocus({ markRoot: false })   // no data-hm-focus-visible on <html>; focus.visible() still works`,
      run: () => <CfgFocus />,
    },
    configureHotkeys: {
      code: `configureHotkeys({ sequenceTimeout: 4000 })   // 4 s between the keys of "g h"
hotkeys.bind("g h", goHome)`,
      run: () => <CfgHotkeys />,
    },
    configureIdle: {
      code: `configureIdle({ timeout: 5 * 60_000, throttle: 250 })
idle().onIdle(() => pauseVideo())`,
      run: () => <CfgIdle />,
    },
    configureLayers: {
      code: `configureLayers({ escape: false, keepGutter: false })   // Escape no longer closes the top layer`,
      run: () => <CfgLayers />,
    },
    configureLocation: {
      code: `configureLocation({ highAccuracy: true, timeout: 5000, maxAge: 0 })
button.onclick = () => locator().locate()`,
      run: () => <CfgLocation />,
    },
    configureLog: {
      code: `configureLog({ level: "warn", transports: [memoryTransport(10)], redact: ["pin"] })
logger().warn("slow response", { pin: "1234" })   // pin is stored as [redacted]`,
      run: () => <CfgLog />,
    },
    configureNotifications: {
      code: `configureNotifications({ native: "never", keep: 3, toast: (n) => mySnackbar(n) })
notifications().notify({ title: "Upload finished" })`,
      run: () => <CfgNotifications />,
    },
    configurePerf: {
      code: `configurePerf({ keep: 3, prefix: "app:" })   // marks and measures are named app:…
perf().time("loop", work)`,
      run: () => <CfgPerf />,
    },
    configurePermissions: {
      code: `configurePermissions({ consent: { demo: "analytics" }, requesters: { demo: async () => "granted" } })
await permissions().request("demo")   // "blocked" until analytics is granted`,
      run: () => <CfgPermissions />,
    },
    configurePresence: {
      code: `configurePresence({ report: (state) => socket.send({ type: "presence", state }), heartbeat: 0, shareTabs: false })`,
      run: () => <CfgPresence />,
    },
    configureScroll: {
      code: `configureScroll({ storageKey: null, offset: 100, keep: 5 })   // positions in memory, 100 px for a fixed header
scroll().save("inbox")   scroll().restore("inbox")`,
      run: () => <CfgScroll />,
    },
    configureSession: {
      code: `configureSession({ duration: 20_000, warnBefore: 8000, storageKey: null, onExpire: () => signOut() })
session().start()`,
      run: () => <CfgSession />,
    },
    configureShortcutHints: {
      code: `configureShortcutHints({ holdKey: "Shift", holdMs: 200, helpKey: null })   // hold Shift for badges, no "?" help`,
      run: () => <CfgHints />,
    },
    configureStorage: {
      code: `configureStorage({ prefix: "acme.", version: 2 })
await storage().area("memory").set("note", "Hello")`,
      run: () => <CfgStorage />,
    },
    configureSync: {
      code: `configureSync({ net: myNet, storageKey: null, retry: { delay: 300, factor: 1, max: 300, count: 3 } })
sync().enqueue({ url: "/demo/notes", method: "POST", body: { text: "Note" } })`,
      run: () => <CfgSync />,
    },
    configureUndo: {
      code: `configureUndo({ limit: 3, mergeMs: 0, commands: false })   // 3 steps kept, no merging
undoStack().push({ label: "Rename", undo, redo })`,
      run: () => <CfgUndo />,
    },
    configureViewport: {
      code: `configureViewport({ breakpoints: { xs: 0, sm: 400, md: 600, lg: 900, xl: 1400 }, desktop: "xl" })
viewport().breakpoint()`,
      run: () => <CfgViewport />,
    },
    configureWindow: {
      code: `configureWindow({ channel: "acme:window", heartbeat: 500, ttl: 1500 })   // a group of tabs of its own
appWindow().count()`,
      run: () => <CfgWindow />,
    },
    consent: {
      code: `consent.acceptAll()   consent.rejectAll()   consent.save({ analytics: true })   consent.withdraw()
const track = consent.gate("analytics", send)   // runs send only while analytics is granted
track("page_view")`,
      run: () => <ConsentDemo />,
    },
    consentManager: {
      code: `consentManager.config()    // { version, categories, storageKey, … }
consentManager.dispose()   // listeners removed; the record stays in storage`,
      run: () => <ManagerPanel m={consentManager} />,
    },
    consoleTransport: {
      code: `configureLog({ transports: [consoleTransport()] })
logger().warn("slow response")   // console.warn("[app] slow response")`,
      run: () => <ConsoleTransportDemo />,
    },
    defineManager: {
      code: `const counter = defineManager("counter", (cfg) => { const count = signal(0); return { count, inc: () => count.update((n) => n + cfg.step) } }, { step: 1 })
counter.get().inc()   counter.configure({ step: 5 })   counter.dispose()`,
      run: () => <DefineDemo />,
    },
    device: {
      code: `const d = device()
d.network().effectiveType   d.lowEnd()   d.supports("share")   await d.storage()`,
      run: () => <DeviceDemo />,
    },
    deviceManager: {
      code: `deviceManager.config()    // { lowMemory: 2, lowCores: 2 }
deviceManager.dispose()`,
      run: () => <ManagerPanel m={deviceManager} />,
    },
    dirtyManager: {
      code: `dirtyManager.config()    // { warnOnUnload, guardRoutes, confirm }
dirtyManager.dispose()   // beforeunload and route guards removed`,
      run: () => <ManagerPanel m={dirtyManager} />,
    },
    dirtyState: {
      code: `const d = dirtyState()
d.track("note", () => text !== saved, "Note", () => save(text))   // removed with the component
d.any()   await d.confirmLeave()   await d.saveAll()`,
      run: () => <DirtyDemo />,
    },
    disposeA11y: {
      code: `a11y.set({ fontScale: 1.25 })
disposeA11y()   // <html> is back to normal; the next use starts again`,
      run: () => <DisposeA11y />,
    },
    disposeAnnouncer: {
      code: `announce("Hello")
disposeAnnouncer()   // live regions removed, history emptied`,
      run: () => <DisposeAnnouncer />,
    },
    disposeAppConfig: {
      code: `appConfig().set("theme", "dark")
disposeAppConfig()   // the override layer is gone`,
      run: () => <DisposeAppConfig />,
    },
    disposeCache: {
      code: `appCache().set("k", 1)
disposeCache()   // every entry is forgotten`,
      run: () => <DisposeCache />,
    },
    disposeClipboard: {
      code: `await clipboard().copy("Acme")
disposeClipboard()   // history is gone`,
      run: () => <DisposeClipboard />,
    },
    disposeCommands: {
      code: `command({ id: "demo.hello", title: "Hello", run: () => "hello" })
disposeCommands()   // the registry is emptied`,
      run: () => <DisposeCommands />,
    },
    disposeConsent: {
      code: `consent.acceptAll()
disposeConsent()   // listeners removed; the next use reads the record again`,
      run: () => <DisposeConsent />,
    },
    disposeDevice: {
      code: `device().features()
disposeDevice()   // network and pixel-ratio listeners removed`,
      run: () => <DisposeDevice />,
    },
    disposeDirty: {
      code: `dirtyState().mark("note", "Draft note")
disposeDirty()   // beforeunload and route guards removed, entries gone`,
      run: () => <DisposeDirty />,
    },
    disposeFlags: {
      code: `flags().override("beta", true)
disposeFlags()   // the next use reads the rules again`,
      run: () => <DisposeFlags />,
    },
    disposeFocus: {
      code: `const release = focus.trap(dialogEl)
disposeFocus()   // listeners removed, traps forgotten`,
      run: () => <DisposeFocus />,
    },
    disposeHotkeys: {
      code: `hotkeys.bind("g h", goHome, { description: "Go home" })
disposeHotkeys()   // keydown listener and every binding removed`,
      run: () => <DisposeHotkeys />,
    },
  },
})
