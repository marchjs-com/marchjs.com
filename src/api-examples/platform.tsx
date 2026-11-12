// API examples of the platform subpaths: channels, the behaviors (drag, roving focus, resize handle, list navigation,
// dropzone, swipe, dismiss), theme definitions, icons, the context menu and the manager UIs (consent, command, undo,
// accessibility, shortcut hints). Layout and rules: tools/api-examples.js. Examples that touch app-wide state (consent,
// accessibility preferences, error handler, devtools switch) put it back when they close.
import "./platform.css";
import { signal, computed, effect, untrack, onCleanup, DEV, Await } from "hadi-march";
import { Button, Badge, Kbd, Segmented, resolvedTheme } from "hadi-march/ui";
import { TextInput } from "hadi-march/forms";
import {
  channel, channelDevtools, channelScope, ChannelScope, defineChannels, of as spec, onChannels, resetChannelTabs,
  setChannelErrorHandler, useChannel,
} from "hadi-march/channel";
import { arrowStep, draggable, track } from "hadi-march/behaviors/drag";
import { rovingFocus } from "hadi-march/behaviors/roving-focus";
import { resizeHandle } from "hadi-march/behaviors/resize-handle";
import { listNav, moveCursor } from "hadi-march/behaviors/list-nav";
import { dropzone } from "hadi-march/behaviors/dropzone";
import { fling, nearest, rubberBand, swipeable } from "hadi-march/behaviors/swipe";
import { dismiss } from "hadi-march/behaviors/dismiss";
import {
  COLOR_TOKENS, contrast, contrastTheme, cream, DEFAULT_THEME, defineTheme, ensureContrast, HADI, hadi, indigo, minimal,
  neon, night, onBrandFill, themeCss, THEMES, type ThemeDef,
} from "hadi-march/theme";
import { Icon, defineIcon, isIconDef, svgIcon, users, search, star, bell, heart, zap } from "hadi-march/icons";
import { consent } from "hadi-march/managers/consent";
import { command } from "hadi-march/managers/command";
import { undoHistory } from "hadi-march/managers/undo";
import { create as createUndo } from "hadi-march/managers/undo/history";
import { a11y } from "hadi-march/managers/accessibility";
import { hotkeys } from "hadi-march/managers/hotkey";
import { comboOf, shortcutHints, disposeShortcutHints } from "hadi-march/managers/shortcut-hint";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
export { default as SIG } from "./platform.sig.gen.ts";

// The manager UIs, the context menu and the icon catalog load on demand (as their docs advise), not with this part.
const catalogLib = () => import("hadi-march/icons/catalog")
const menuLib = () => import("hadi-march/components/overlays/context-menu")
const consentLib = () => import("hadi-march/managers/consent/ui")
const commandLib = () => Promise.all([import("hadi-march/managers/command/ui"), import("hadi-march/ui/menu.ts"), menuLib()]).then(([c, m, x]) => ({ ...c, Menu: m.Menu, ContextMenu: x.ContextMenu }))
const a11yLib = () => import("hadi-march/managers/accessibility/ui")
const hintLib = () => import("hadi-march/managers/shortcut-hint/ui")
/** Renders `children(module)` once the module has loaded. */
function Load<M>(p: { from: () => Promise<M>; children: (m: M) => unknown }) {
  return <Await for={p.from} loading={<p class="hm-muted">Yükleniyor…</p>}>{p.children}</Await>
}

/** A short log: [lines, add]. */
const useLog = (max = 5) => {
  const lines = signal<string[]>([])
  return [lines, (s: string) => lines.update((l) => [...l, s].slice(-max))] as const
}
const Stack = (p: { children?: unknown }) => <div class="sc-ex-platform-stack">{p.children}</div>
/** A JSX element typed as an HTMLElement (for the behaviors, which take an element). */
const asEl = (x: unknown) => x as HTMLElement
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ------------------------------------------------------------------ channels
/** Two copies of a picker; with a scope each hears only its own messages. */
const picked = channel<string>("ex.scope.picked", { scoped: true, sticky: true })
function Picker(p: { name: string }) {
  const ch = useChannel(picked)
  const last = ch.toSignal()
  return <div class="sc-ex-platform-sample">
    <strong>{p.name}</strong>
    <Row>{["Elma", "Armut"].map((f) => <Button size="sm" onClick={() => ch.emit(`${p.name}: ${f}`)}>{f}</Button>)}</Row>
    <Out label="duyulan" value={() => last() ?? "—"} />
  </div>
}

// ------------------------------------------------------------------ theme preview on a sub-tree (the page theme stays)
/** The custom properties themeCss() writes for one mode, read from its own output. */
function themeVars(def: ThemeDef, dark: boolean): [string, string][] {
  const blocks = [...themeCss(def).matchAll(/\{([^{}]*)\}/g)].map((m) => m[1] ?? "")
  const text = (blocks[0] ?? "") + (dark ? blocks[2] ?? "" : "")
  return [...text.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()])
}
/** A box drawn in `def` (its variables set on the box only), following the page's light / dark mode. */
function ThemeBox(p: { def: () => ThemeDef; children?: unknown }) {
  const el = asEl(<div class="sc-ex-platform-theme">
    <p class="sc-ex-platform-theme-title">{() => p.def().name}</p>
    <p class="sc-ex-platform-theme-text">{() => p.def().description ?? "HADİ panosu"}</p>
    <div class="sc-ex-platform-swatches">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span class="sc-ex-platform-sw" style={{ background: `var(--hm-cat-${i})` }} />)}</div>
    <Row><Button variant="primary" size="sm">Kaydet</Button><Button size="sm">Vazgeç</Button></Row>
    {p.children}
  </div>)
  effect(() => { for (const [k, v] of themeVars(p.def(), resolvedTheme() === "dark")) el.style.setProperty(k, v) })
  return el
}
const preset = (def: ThemeDef, code: string) => ({
  code,
  run: () => <Stack><ThemeBox def={() => def} /><Row><Out label="id" value={def.id} /><Out label="köşe" value={`${def.radius}px`} /><Out label="hep koyu" value={String(!!def.alwaysDark)} /></Row></Stack>,
})
const brand = (Object.entries(HADI) as [string, string][]).slice(0, 7)

// ------------------------------------------------------------------ app-wide state that examples put back
/** Remember the consent decision; `restore()` (and closing the example) puts it back. */
function keepConsent() {
  const before = untrack(() => consent.record())
  const restore = () => { if (untrack(() => consent.record()) === before) return; if (before) consent.save(before.choices); else consent.withdraw() }
  onCleanup(restore)
  return restore
}
function keepA11y() {
  const before = { ...untrack(() => a11y.prefs()) }
  const restore = () => a11y.set(before)
  onCleanup(restore)
  return restore
}
const choices = () => Object.entries(consent.choices()).filter(([, v]) => v).map(([k]) => k).join(", ") || "—"

/** Demo commands (removed with the example). */
function docCommands(add: (s: string) => void) {
  const dirty = signal(true)
  const save = command({ id: "ex.doc.save", title: "Kaydet", icon: star, shortcut: "alt+shift+s", group: "Belge", when: () => dirty(),
    run: async () => { await wait(700); dirty.set(false); add("Kaydedildi") } })
  const share = command({ id: "ex.doc.share", title: "Paylaş", icon: users, group: "Belge", run: () => add("Paylaşıldı") })
  const remove = command({ id: "ex.doc.remove", title: "Sil", icon: bell, group: "Belge", danger: true, run: () => add("Silindi") })
  return { dirty, save, share, remove }
}

export default examples({
  "hadi-march/channel": {
    channel: {
      code: `const saved = channel<{ id: number }>("doc.saved", { sticky: true })
saved.on((p) => console.log("kaydedildi", p.id))
saved.emit({ id: 7 })   // a listener added later still gets { id: 7 }`,
      run: () => {
        const saved = channel<{ id: number }>("ex.doc.saved", { sticky: true })
        const [lines, add] = useLog(), last = saved.toSignal(), offs: (() => void)[] = []
        let n = 0
        saved.on((p) => add(`ilk dinleyici: #${p.id}`))
        onCleanup(() => offs.forEach((off) => off()))
        return <Stack><Row>
          <Button variant="primary" onClick={() => saved.emit({ id: ++n })}>emit</Button>
          <Button onClick={() => offs.push(saved.on((p) => add(`geç dinleyici: #${p.id}`)))}>Geç dinleyici ekle</Button>
          <Out label="last()" value={() => last()?.id ?? "—"} />
        </Row><Log lines={lines} /></Stack>
      },
    },
    channelDevtools: {
      code: `channelDevtools.configure({ enabled: true })
channelDevtools.watch((e) => console.log(e.seq, e.name, e.listeners))
channelDevtools.traffic()   // the last messages`,
      run: () => {
        const was = DEV.enabled
        channelDevtools.configure({ enabled: true })
        onCleanup(() => channelDevtools.configure({ enabled: was }))
        const ping = channel<number>("ex.devtools.ping")
        const [lines, add] = useLog()
        channelDevtools.watch((e) => add(`#${e.seq} ${e.name} → ${String(e.payload)} (${e.listeners} dinleyici, ${e.scope})`))
        let n = 0
        return <Stack><Row>
          <Button variant="primary" onClick={() => ping.emit(++n)}>Mesaj gönder</Button>
          <Button variant="ghost" onClick={() => channelDevtools.clear()}>clear()</Button>
        </Row><Log lines={lines} /></Stack>
      },
    },
    channelScope: {
      code: `function Cart() {
  channelScope("cart")                 // scoped channels below get their own bus
  const picked = useChannel(pickedCh)  // { scoped: true }
}`,
      run: () => {
        const Scoped = (p: { name: string }) => { channelScope(p.name); return <Picker name={p.name} /> }
        return <Row><Scoped name="Sol" /><Scoped name="Sağ" /></Row>
      },
    },
    ChannelScope: {
      code: `<ChannelScope label="sol">{() => <Picker />}</ChannelScope>
<ChannelScope label="sağ">{() => <Picker />}</ChannelScope>`,
      play: { options: [{ key: "scoped", label: "Kapsam", default: true }] },
      run: (p: { values: { scoped: boolean } }) => () => (p.values.scoped
        ? <Row><ChannelScope label="sol">{() => <Picker name="Sol" />}</ChannelScope><ChannelScope label="sağ">{() => <Picker name="Sağ" />}</ChannelScope></Row>
        : <Row><Picker name="Sol" /><Picker name="Sağ" /></Row>),
    },
    defineChannels: {
      code: `export const ch = defineChannels({
  "cart.added": of<{ sku: string }>(),
  "cart.cleared": of(),
})
ch["cart.added"].emit({ sku: "A-1" })
ch.on("cart.*", (m) => console.log(m.name))`,
      run: () => {
        // `of` is spelled `spec` here: the .tsx compiler reads "of<" as the start of a tag (for…of keyword)
        const ch = defineChannels({ "ex.cart.added": spec<{ sku: string }>(), "ex.cart.cleared": spec() })
        const [lines, add] = useLog()
        ch.on("ex.cart.*", (m) => add(`${m.name} ${m.payload ? JSON.stringify(m.payload) : ""}`))
        let n = 0
        return <Stack><Row>
          <Button variant="primary" onClick={() => ch["ex.cart.added"].emit({ sku: `A-${++n}` })}>Sepete ekle</Button>
          <Button onClick={() => ch["ex.cart.cleared"].emit()}>Sepeti boşalt</Button>
        </Row><Log lines={lines} /></Stack>
      },
    },
    of: {
      code: `const ch = defineChannels({ "temp.read": of<number>({ replay: 3 }) })
ch["temp.read"].on((c) => console.log(c))   // a late listener gets the last 3 first`,
      run: () => {
        const ch = defineChannels({ "ex.temp.read": spec<number>({ replay: 3 }) })
        const temp = ch["ex.temp.read"], last = temp.toSignal(), offs: (() => void)[] = []
        const [lines, add] = useLog(8)
        onCleanup(() => offs.forEach((off) => off()))
        return <Stack><Row>
          <Button onClick={() => temp.emit(18 + Math.round(Math.random() * 10))}>Ölçüm gönder</Button>
          <Button variant="primary" onClick={() => { add("— yeni dinleyici —"); offs.push(temp.on((c) => add(`${c} °C`))) }}>Dinleyici ekle</Button>
          <Out label="saklanan" value={() => (last(), temp.history().join(", ") || "—")} />
        </Row><Log lines={lines} /></Stack>
      },
    },
    onChannels: {
      code: `onChannels("order.*", (m) => audit(m.name, m.payload))   // every order.* message`,
      run: () => {
        const placed = channel<string>("ex.order.placed"), paid = channel<string>("ex.order.paid"), other = channel<string>("ex.user.seen")
        const [lines, add] = useLog()
        onChannels("ex.order.*", (m) => add(`${m.name}: ${String(m.payload)}`))
        return <Stack><Row>
          <Button onClick={() => placed.emit("HADİ #12")}>order.placed</Button>
          <Button onClick={() => paid.emit("HADİ #12")}>order.paid</Button>
          <Button variant="ghost" onClick={() => other.emit("Ada")}>user.seen (duyulmaz)</Button>
        </Row><Log lines={lines} /></Stack>
      },
    },
    resetChannelTabs: {
      code: `const theme = channel<string>("ui.theme", { crossTab: true })
resetChannelTabs()   // tests: drop the BroadcastChannel; the next emit opens a new one`,
      run: () => {
        const tab = channel<string>("ex.tabs.note", { crossTab: true })
        const [lines, add] = useLog()
        tab.on((v, from) => add(`${from === "tab" ? "başka sekme" : "bu sekme"}: ${v}`))
        let n = 0
        return <Stack><Row>
          <Button variant="primary" onClick={() => tab.emit(`not ${++n}`)}>Sekmelere gönder</Button>
          <Button onClick={() => { resetChannelTabs(); add("BroadcastChannel kapandı; sonraki gönderim yenisini açar") }}>resetChannelTabs()</Button>
        </Row><Log lines={lines} /></Stack>
      },
    },
    setChannelErrorHandler: {
      code: `setChannelErrorHandler((err, { channel, scope }) => report(err, channel))
// a failing listener never stops the others`,
      run: () => {
        const job = channel<number>("ex.job.done")
        const [lines, add] = useLog()
        setChannelErrorHandler((e, info) => add(`işleyici: ${(e as Error).message} (${info.channel})`))
        onCleanup(() => setChannelErrorHandler(null))
        job.on(() => { throw new Error("dinleyici patladı") })
        job.on((n) => add(`ikinci dinleyici yine çalıştı: iş ${n}`))
        let n = 0
        return <Stack><Button variant="primary" onClick={() => job.emit(++n)}>emit</Button><Log lines={lines} /></Stack>
      },
    },
    useChannel: {
      code: `const local = useChannel(pickedCh)   // during setup: bound to this scope
<button onClick={() => local.emit("x")}>   // a handler has no owner: use the handle`,
      run: () => {
        const Card = (p: { name: string }) => {
          channelScope(p.name)
          const local = useChannel(picked)
          const last = local.toSignal()
          return <div class="sc-ex-platform-sample"><strong>{p.name}</strong>
            <Row><Button size="sm" variant="primary" onClick={() => local.emit(`${p.name}: tutamaçla`)}>Tutamaçla</Button>
              <Button size="sm" onClick={() => picked.emit(`${p.name}: doğrudan`)}>Doğrudan</Button></Row>
            <Out label="bu kapsam" value={() => last() ?? "—"} /></div>
        }
        return <Stack><Row><Card name="A" /><Card name="B" /></Row><p class="hm-muted">“Doğrudan” uygulama geneline gider; kapsamdakiler duymaz.</p></Stack>
      },
    },
  },
  "hadi-march/behaviors/drag": {
    arrowStep: {
      code: `onKeyDown={(e) => { const s = arrowStep(e, rtl); if (s) move(s.dx, s.dy) }}   // Shift ×10`,
      run: () => {
        const pos = signal({ x: 2, y: 2 }), last = signal("—")
        const key = (e: KeyboardEvent) => {
          const s = arrowStep(e)
          if (!s) return
          e.preventDefault()
          last.set(JSON.stringify(s))
          pos.update((p) => s.home ? { x: 0, y: p.y } : s.end ? { x: 3, y: p.y } : { x: Math.min(3, Math.max(0, p.x + Math.sign(s.dx))), y: Math.min(2, Math.max(0, p.y + Math.sign(s.dy))) })
        }
        return <Stack>
          <div class="sc-ex-platform-grid" tabindex="0" aria-label="Ok tuşlarıyla hücre seç" onKeyDown={key}>
            {Array.from({ length: 12 }, (_, i) => <span class={() => `sc-ex-platform-cell${pos().y * 4 + pos().x === i ? " is-active" : ""}`}>{i + 1}</span>)}
          </div>
          <Out label="arrowStep" value={last} />
        </Stack>
      },
    },
    draggable: {
      code: `const stop = draggable(card, { handle: ".grip", onMove: (p) => move(p.dx, p.dy), onEnd: save })`,
      run: () => {
        const at = signal({ x: 0, y: 0 }), live = signal({ x: 0, y: 0 }), state = signal("bekliyor")
        const puck = asEl(<span class="sc-ex-platform-puck" style={() => ({ transform: `translate(${live().x}px, ${live().y}px)` })}><Icon of={users} /> Sürükle</span>)
        onCleanup(draggable(puck, {
          onStart: () => state.set("sürükleniyor"),
          onMove: (p) => live.set({ x: at.peek().x + p.dx, y: at.peek().y + p.dy }),
          onEnd: (_p, cancelled) => { if (cancelled) live.set(at.peek()); else at.set(live.peek()); state.set(cancelled ? "iptal (Esc)" : "bırakıldı") },
          onClick: () => state.set("tık (eşiğin altında)"),
        }))
        return <Stack><div class="sc-ex-platform-pad">{puck}</div><Row><Out label="durum" value={state} /><Out label="konum" value={() => `${Math.round(live().x)}, ${Math.round(live().y)}`} /></Row></Stack>
      },
    },
    track: {
      code: `track(area, { onMove: (p) => volume.set(p.x), rtl: () => isRtl(area) })   // p.x / p.y are 0–1`,
      run: () => {
        const x = signal(0.4), phase = signal("—")
        const area = asEl(<div class="sc-ex-platform-track" aria-hidden="true">
          <span class="sc-ex-platform-fill" style={() => ({ "inline-size": `${x() * 100}%` })} />
          <span class="sc-ex-platform-thumb" style={() => ({ "inset-inline-start": `${x() * 100}%` })} />
        </div>)
        track(area, { onStart: () => { phase.set("basıldı") }, onMove: (p) => x.set(p.x), onEnd: () => phase.set("bırakıldı"), rtl: () => getComputedStyle(area).direction === "rtl" })
        return <Stack>{area}<Row><Out label="ses" value={() => `%${Math.round(x() * 100)}`} /><Out label="durum" value={phase} /></Row></Stack>
      },
    },
  },
  "hadi-march/behaviors/roving-focus": {
    rovingFocus: {
      code: `const stop = rovingFocus(toolbar, { orientation: "horizontal", onMove: (el) => … })`,
      run: () => {
        const active = signal("Kalın")
        const bar = asEl(<div class="sc-row" role="toolbar" aria-label="Biçim">
          {["Kalın", "Eğik", "Altı çizili", "Üstü çizili"].map((l) => <Button size="sm" data-label={l}>{l}</Button>)}
        </div>)
        onCleanup(rovingFocus(bar, { orientation: "horizontal", onMove: (el) => active.set(el.dataset["label"] ?? "") }))
        return <Stack>{bar}<Row><Out label="etkin" value={active} /><span class="hm-muted">Tab bir kez, sonra <Kbd keys="←" /> <Kbd keys="→" /> <Kbd keys="Home" /> <Kbd keys="End" /></span></Row></Stack>
      },
    },
  },
  "hadi-march/behaviors/resize-handle": {
    resizeHandle: {
      code: `resizeHandle(grip, { value: () => width(), set: (w, done) => width.set(w), min: 80, max: 220, reset: () => width.set(140) })`,
      run: () => {
        const w = signal(140), saved = signal(140)
        const grip = asEl(<span class="sc-ex-platform-grip" aria-label="Kenar çubuğu genişliği" />)
        resizeHandle(grip, { value: () => w.peek(), set: (v, done) => { w.set(v); if (done) saved.set(Math.round(v)) }, min: 80, max: 220, step: 10, reset: () => { w.set(140); saved.set(140) } })
        return <Stack>
          <div class="sc-ex-platform-split"><div class="sc-ex-platform-side" style={() => ({ "inline-size": `${w()}px` })}>Kenar</div>{grip}<div class="sc-ex-platform-main">İçerik</div></div>
          <Row><Out label="genişlik" value={() => `${Math.round(w())}px`} /><Out label="kaydedilen" value={() => `${saved()}px`} /><span class="hm-muted">Çift tık ya da Enter: sıfırla</span></Row>
        </Stack>
      },
    },
  },
  "hadi-march/behaviors/list-nav": {
    listNav: {
      code: `const active = signal(-1)
const onKey = listNav({ count: () => items().length, active, onPick: (i) => choose(items()[i]) })
<input onKeyDown={(e) => onKey(e) && e.preventDefault()} />`,
      run: () => {
        const all = ["Ankara", "Antalya", "Bursa", "İzmir", "Kayseri", "Trabzon"]
        const q = signal(""), active = signal(-1), picked = signal("—")
        const items = computed(() => all.filter((c) => c.toLocaleLowerCase("tr").includes(q().toLocaleLowerCase("tr"))))
        effect(() => { items(); active.set(-1) })
        const onKey = listNav({ count: () => items().length, active, onPick: (i) => picked.set(items()[i] ?? "—") })
        return <Stack>
          <TextInput value={q} placeholder="Şehir ara, ↓ ↑ ile gez, Enter ile seç" aria-label="Şehir" onKeyDown={(e: KeyboardEvent) => { if (onKey(e)) e.preventDefault() }} />
          <ul class="sc-ex-platform-opts" role="listbox" aria-label="Şehirler">{() => items().map((c, i) => <li role="option" aria-selected={() => String(active() === i)} class={() => `sc-ex-platform-opt${active() === i ? " is-active" : ""}`}>{c}</li>)}</ul>
          <Out label="seçilen" value={picked} />
        </Stack>
      },
    },
    moveCursor: {
      code: `moveCursor({ key: "ArrowDown", index: 5, count: 12, columns: 4 })   // 9
moveCursor({ key: "End", index: 5, count: 12, columns: 4 })         // 7 (end of the row)`,
      run: () => {
        const i = signal(5), last = signal("—")
        const key = (e: KeyboardEvent) => {
          const n = moveCursor({ key: e.key, index: i.peek(), count: 12, columns: 4, page: 2, ctrl: e.ctrlKey || e.metaKey, rtl: getComputedStyle(e.currentTarget as Element).direction === "rtl" })
          last.set(`${e.key} → ${n ?? "null"}`)
          if (n != null) { e.preventDefault(); i.set(n) }
        }
        return <Stack>
          <div class="sc-ex-platform-grid" tabindex="0" aria-label="Izgara: ok, Home, End, Page tuşları" onKeyDown={key}>
            {Array.from({ length: 12 }, (_, k) => <span class={() => `sc-ex-platform-cell${i() === k ? " is-active" : ""}`}>{k}</span>)}
          </div>
          <Row><Out label="index" value={i} /><Out label="son tuş" value={last} /></Row>
        </Stack>
      },
    },
  },
  "hadi-march/behaviors/dropzone": {
    dropzone: {
      code: `dropzone(zone, { accept: "image/*,.pdf", onFiles: upload, onReject: (f) => warn(f), onOver: (on) => over.set(on), paste: true })`,
      run: () => {
        const over = signal(false)
        const [lines, add] = useLog()
        const zone = asEl(<div class="sc-ex-platform-drop" tabindex="0" aria-label="Dosya bırakma alanı">
          {() => (over() ? "Bırak!" : "Görsel, PDF ya da metin dosyası sürükle (ya da odaklayıp yapıştır)")}
        </div>)
        dropzone(zone, {
          accept: "image/*,.pdf,.txt", paste: true, onOver: (on) => over.set(on),
          onFiles: (fs) => fs.forEach((f) => add(`✓ ${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`)),
          onReject: (fs) => fs.forEach((f) => add(`✗ ${f.name}: tür kabul edilmiyor`)),
        })
        return <Stack>{zone}<Log lines={lines} /></Stack>
      },
    },
  },
  "hadi-march/behaviors/swipe": {
    fling: {
      code: `const rest = fling(pos, velocity)          // where a release would come to rest
const to = nearest([-120, 0, 120], rest)  // then snap`,
      run: () => {
        const pos = signal(40), v = signal(0.8)
        return <Stack>
          <Row><span>Konum</span><Segmented value={pos} options={[-60, 0, 40, 100].map((x) => ({ value: x, label: `${x}px` }))} aria-label="Konum" /></Row>
          <Row><span>Hız</span><Segmented value={v} options={[-1.5, -0.4, 0, 0.8, 3].map((x) => ({ value: x, label: `${x}` }))} aria-label="Hız (px/ms)" /></Row>
          <Row><Out label="fling(pos, v)" value={() => Math.round(fling(pos(), v()))} /><Out label="sınırsız" value={() => Math.round(fling(pos(), v(), 160, 99))} /></Row>
        </Stack>
      },
    },
    nearest: {
      code: `nearest([0, 50, 100], 62)   // 50`,
      run: () => {
        const target = signal(62)
        return <Stack>
          <Row><Button onClick={() => target.update((t) => t - 7)}>−7</Button><Button onClick={() => target.update((t) => t + 7)}>+7</Button><Out label="hedef" value={target} /></Row>
          <Out label="nearest([0, 50, 100], hedef)" value={() => nearest([0, 50, 100], target())} />
        </Stack>
      },
    },
    rubberBand: {
      code: `const shown = over > 0 ? limit + rubberBand(over) : pos   // resistance past the edge`,
      run: () => {
        const over = signal(25)
        return <Stack>
          <Row><Segmented value={over} options={[0, 25, 100, 400].map((x) => ({ value: x, label: `${x}px` }))} aria-label="Sınır ötesi çekme" /></Row>
          <Row><Out label="rubberBand(over)" value={() => rubberBand(over()).toFixed(1)} /><Out label="k = 2" value={() => rubberBand(over(), 2).toFixed(1)} /></Row>
        </Stack>
      },
    },
    swipeable: {
      code: `swipeable(card, { axis: "x", onMove: (p) => move(p.dx), onEnd: (p) => snap(nearest(stops, fling(x, p.vx))) })`,
      run: () => {
        const stops = [-110, 0, 110], x = signal(0), info = signal("—")
        let base = 0
        const card = asEl(<div class="sc-ex-platform-card" style={() => ({ transform: `translateX(${x()}px)` })}>Kaydır</div>)
        const fit = (v: number) => (Math.abs(v) > 110 ? Math.sign(v) * (110 + rubberBand(Math.abs(v) - 110)) : v)
        swipeable(card, {
          axis: "x",
          onStart: () => { card.classList.remove("is-settling"); base = x.peek() },
          onMove: (p) => x.set(fit(base + p.dx)),
          onEnd: (p) => { const to = nearest(stops, fling(x.peek(), p.vx)); card.classList.add("is-settling"); x.set(to); info.set(`hız ${p.vx.toFixed(2)} → ${to}px`) },
          onTap: () => info.set("dokunma"),
        })
        return <Stack><div class="sc-ex-platform-lane">{card}</div><Out label="son hareket" value={info} /></Stack>
      },
    },
  },
  "hadi-march/behaviors/dismiss": {
    dismiss: {
      code: `const stop = dismiss(panel, { inside: [trigger], onDismiss: (why) => close(why === "escape") })`,
      run: () => {
        const open = signal(false), why = signal("—")
        const panel = asEl(<div class="sc-ex-platform-panel" role="dialog" aria-label="Filtreler" hidden={() => !open()}>
          <strong>Filtreler</strong><span class="hm-muted">Dışarı bas ya da Esc.</span>
          <Button size="sm" onClick={() => open.set(false)}>Kapat</Button>
        </div>)
        effect(() => {
          if (!open()) return
          dismiss(pop, { onDismiss: (r) => { open.set(false); why.set(r); if (r === "escape") pop.querySelector("button")?.focus() } })
        })
        const pop = asEl(<div class="sc-ex-platform-pop">
          <Button aria-expanded={() => String(open())} onClick={() => open.update((o) => !o)}>Filtreler</Button>
          {panel}
        </div>)
        return <Row>{pop}<Out label="kapanma nedeni" value={why} /></Row>
      },
    },
  },
  "hadi-march/theme": {
    COLOR_TOKENS: {
      code: `<Badge color="brand-blue">Aktivite</Badge>   // a color prop takes a COLOR_TOKENS name, never a raw color`,
      run: () => <Stack><div class="sc-row">{COLOR_TOKENS.map((c) => <Badge color={c}>{c}</Badge>)}</div><Out label="adet" value={COLOR_TOKENS.length} /></Stack>,
    },
    contrast: {
      code: `contrast("#FFFFFF", HADI.orange)   // 2.68 — WCAG ratio, 4.5 is AA for text`,
      run: () => {
        const fg = signal<string>(HADI.ink), bg = signal<string>(HADI.mist)
        const opts = brand.map(([k, v]) => ({ value: v, label: k }))
        return <Stack>
          <Row><span>Metin</span><Segmented value={fg} options={opts} aria-label="Metin rengi" /></Row>
          <Row><span>Zemin</span><Segmented value={bg} options={[{ value: HADI.mist, label: "mist" }, { value: HADI.night, label: "night" }, ...opts.slice(0, 2)]} aria-label="Zemin rengi" /></Row>
          <Row><span class="sc-ex-platform-sw" style={() => ({ color: fg(), background: bg() })}>HADİ 42</span>
            <Out label="oran" value={() => contrast(fg(), bg()).toFixed(2)} />
            {() => <Badge tone={contrast(fg(), bg()) >= 4.5 ? "success" : "warn"}>{contrast(fg(), bg()) >= 4.5 ? "AA geçer" : "AA altı"}</Badge>}</Row>
        </Stack>
      },
    },
    contrastTheme: { ...preset(contrastTheme, `import { contrastTheme, themeCss } from "hadi-march/theme"
themeCss(contrastTheme)   // the high contrast preset`) },
    cream: { ...preset(cream, `import { cream } from "hadi-march/theme"
cream.light.primary   // a warm, paper-like preset`) },
    DEFAULT_THEME: {
      code: `setColorTheme(DEFAULT_THEME)   // "hadi": the theme a fresh visitor sees`,
      run: () => <Stack><Out label="DEFAULT_THEME" value={DEFAULT_THEME} /><ThemeBox def={() => THEMES.find((t) => t.id === DEFAULT_THEME) ?? hadi} /></Stack>,
    },
    defineTheme: {
      code: `export const hadiMarka = defineTheme({ ...hadi, id: "hadi-marka", name: "HADİ",
  light: { ...hadi.light, primary: HADI.purple, solid: HADI.purple } })
// build: write themeCss(hadiMarka) to themes/hadi-marka.css, then registerThemes([{ id: "hadi-marka", name: "HADİ" }])`,
      run: () => {
        const accent = signal<string>(HADI.purple), err = signal("—")
        const def = computed(() => defineTheme({ ...hadi, id: "hadi-marka", name: "HADİ", description: "defineTheme ile türetildi",
          light: { ...hadi.light, primary: ensureContrast(accent(), hadi.light.surface), solid: accent(), onSolid: onBrandFill(accent()) },
          dark: { ...hadi.dark, primary: accent(), solid: accent(), onSolid: onBrandFill(accent()) } }))
        return <Stack>
          <Row><Segmented value={accent} options={brand.slice(0, 4).map(([k, v]) => ({ value: v, label: k }))} aria-label="Vurgu rengi" />
            <Button variant="ghost" onClick={() => { try { defineTheme({ ...hadi, id: "My Theme!" }) } catch (e) { err.set((e as Error).message) } }}>Geçersiz id dene</Button></Row>
          <ThemeBox def={def} />
          <Out label="hata" value={err} />
        </Stack>
      },
    },
    ensureContrast: {
      code: `ensureContrast(HADI.orange, "#FFFFFF")        // darker orange that reads as text (4.5:1)
ensureContrast(HADI.orange, "#FFFFFF", 3)`,
      run: () => {
        const min = signal(4.5)
        return <Stack>
          <Row><Segmented value={min} options={[3, 4.5, 7].map((x) => ({ value: x, label: `${x}:1` }))} aria-label="En az oran" /></Row>
          {brand.slice(0, 4).map(([k, v]) => <Row>
            <span class="sc-ex-platform-sw" style={{ background: v }} aria-hidden="true" />
            <span class="sc-ex-platform-sw" style={() => ({ color: ensureContrast(v, hadi.light.surface, min()), background: hadi.light.surface })}>{k}</span>
            <Out label="sonuç" value={() => ensureContrast(v, hadi.light.surface, min())} />
          </Row>)}
        </Stack>
      },
    },
    HADI: {
      code: `HADI.orange   // "#F2801F" Heyecan · blue Aktivite · green Dostluk · purple İletişim`,
      run: () => <div class="sc-ex-platform-swatches">{(Object.entries(HADI) as [string, string][]).map(([k, v]) =>
        <span class="sc-ex-platform-sw" style={{ background: v, color: onBrandFill(v) }} title={v}>{k}</span>)}</div>,
    },
    hadi: { ...preset(hadi, `import { hadi } from "hadi-march/theme"
hadi.light.cat.slice(0, 4)   // the four brand colors`) },
    indigo: { ...preset(indigo, `import { indigo } from "hadi-march/theme"
<div data-hm-theme="indigo">…</div>   // after loadTheme("indigo")`) },
    minimal: { ...preset(minimal, `import { minimal } from "hadi-march/theme"
minimal.radius   // a quiet, monochrome preset`) },
    neon: { ...preset(neon, `import { neon } from "hadi-march/theme"
neon.alwaysDark   // true: light mode shows the dark colors too`) },
    night: { ...preset(night, `import { night } from "hadi-march/theme"
night.dark.bg`) },
    onBrandFill: {
      code: `const text = onBrandFill(HADI.green)   // white when it reaches 2.6:1, else near-black`,
      run: () => <div class="sc-ex-platform-swatches">{brand.map(([k, v]) =>
        <span class="sc-ex-platform-sw" style={{ background: v, color: onBrandFill(v) }}>{k}: {onBrandFill(v)}</span>)}</div>,
    },
    themeCss: {
      code: `writeFileSync("dist/themes/hadi-marka.css", themeCss(hadiMarka))
themeCss(hadi, true)   // the default also styles <html> without data-hm-theme`,
      run: () => {
        const id = signal("cream")
        const css = computed(() => themeCss(THEMES.find((t) => t.id === id()) ?? cream))
        return <Stack>
          <Segmented value={id} options={THEMES.map((t) => ({ value: t.id, label: t.name }))} aria-label="Tema" />
          <Out label="boyut" value={() => `${css().length} karakter`} />
          <pre class="sc-ex-platform-css">{() => css().split("\n").slice(0, 14).join("\n")}</pre>
        </Stack>
      },
    },
    THEMES: {
      code: `THEMES.map((t) => t.name)   // the presets, for a picker or a build step`,
      run: () => {
        const id = signal(THEMES[1]?.id ?? "hadi")
        return <Stack>
          <Segmented value={id} options={THEMES.map((t) => ({ value: t.id, label: t.name }))} aria-label="Önizlenen tema" />
          <ThemeBox def={() => THEMES.find((t) => t.id === id()) ?? hadi} />
          <p class="hm-muted">Önizleme yalnız bu kutuda; sayfanın teması değişmez.</p>
        </Stack>
      },
    },
  },
  "hadi-march/icons": {
    defineIcon: {
      code: `export const hadiLogo = defineIcon("hadi-logo", ["o:12,12,9", "M8 12h8", "M12 8v8"])
<Icon of={hadiLogo} size="xl" />`,
      run: () => {
        const filled = signal(false)
        const def = computed(() => defineIcon("hadi-logo", filled() ? ["o:12,12,9"] : ["o:12,12,9", "M8 12h8", "M12 8v8"], filled()))
        return <Row>{() => <Icon of={def()} size="xl" label="HADİ" />}
          <Button size="sm" onClick={() => filled.update((f) => !f)}>{() => (filled() ? "Çizgi" : "Dolu")}</Button>
          <Out label="donmuş" value={() => String(Object.isFrozen(def()))} /></Row>
      },
    },
    Icon: {
      code: `<Icon of={users} />                         // decorative, follows the text color
<Icon of={search} label="Ara" size="lg" />`,
      play: { options: [
        { key: "size", label: "Boyut", default: "lg", options: [{ value: "sm", label: "sm" }, { value: "md", label: "md" }, { value: "lg", label: "lg" }, { value: "xl", label: "xl" }] },
        { key: "set", label: "Takım", default: "a", options: [{ value: "a", label: "Kişiler" }, { value: "b", label: "Eylemler" }] },
      ] },
      run: (p: { values: { size: "sm" | "md" | "lg" | "xl"; set: string } }) => () => <Row>
        {(p.values.set === "a" ? [users, heart, star] : [search, bell, zap]).map((i) => <Icon of={i} size={p.values.size} label={i.name} />)}
        <Out label="size" value={p.values.size} />
      </Row>,
    },
    isIconDef: {
      code: `isIconDef(props.icon) ? <Icon of={props.icon} /> : props.icon   // icon data or any node`,
      run: () => <Stack>{([["users", users], ["\"★\"", "★"], ["{ name, d }", { name: "x", d: [] }], ["null", null]] as [string, unknown][]).map(([k, v]) =>
        <Out label={`isIconDef(${k})`} value={String(isIconDef(v))} />)}</Stack>,
    },
    svgIcon: {
      code: `const svg = svgIcon(star, "hm-svg hm-svg-xl", "Favori")   // a plain <svg> element, no JSX`,
      run: () => {
        const labelled = signal(true)
        const box = asEl(<span />)
        effect(() => box.replaceChildren(svgIcon(star, "hm-svg hm-svg-xl", labelled() ? "Favori" : undefined)))
        const attr = (n: string) => () => (labelled(), (box.firstElementChild?.getAttribute(n) ?? "—"))
        return <Row>{box}<Button size="sm" onClick={() => labelled.update((x) => !x)}>{() => (labelled() ? "Etiketi kaldır" : "Etiket ver")}</Button>
          <Out label="role" value={attr("role")} /><Out label="aria-hidden" value={attr("aria-hidden")} /></Row>
      },
    },
  },
  "hadi-march/icons/catalog": {
    ICONS: {
      code: `import { ICONS } from "hadi-march/icons/catalog"   // every icon by name: pickers and search
Object.keys(ICONS).filter((n) => n.includes(q)).map((n) => <Icon of={ICONS[n]} />)`,
      run: () => {
        const q = signal("arrow")
        return <Load from={catalogLib}>{({ ICONS }) => {
          const names = computed(() => Object.keys(ICONS).filter((n) => n.toLowerCase().includes(q().trim().toLowerCase())))
          return <Stack>
          <TextInput value={q} placeholder="Simge ara (ör. arrow, user)" aria-label="Simge ara" />
          <Out label="bulunan" value={() => `${names().length} / ${Object.keys(ICONS).length}`} />
          <div class="sc-ex-platform-icons">{() => names().slice(0, 40).map((n) => <span class="sc-ex-platform-glyph"><Icon of={ICONS[n]!} size="lg" />{n}</span>)}</div>
        </Stack>
        }}</Load>
      },
    },
  },
  "hadi-march/context-menu": {
    ContextMenu: {
      code: `<ContextMenu items={(target) => [{ label: "Yeniden adlandır", onSelect: () => rename(target) }, "-", remove]}>
  <FileList />
</ContextMenu>`,
      play: { options: [
        { key: "only", label: "Yalnız dosyalarda", default: true },
        { key: "kind", label: "Öğeler", default: "file", options: [{ value: "file", label: "Dosya" }, { value: "share", label: "Paylaşım" }] },
      ] },
      run: (p: { values: { only: boolean; kind: string } }) => {
        const [lines, add] = useLog()
        const name = (t: Element) => (t.closest("[data-file]") as HTMLElement | null)?.dataset["file"] ?? "alan"
        const items = (t: Element) => p.values.kind === "file"
          ? [{ label: "Aç", onSelect: () => add(`Aç: ${name(t)}`) }, { label: "Yeniden adlandır", shortcut: "F2", onSelect: () => add(`Ad: ${name(t)}`) }, "-" as const, { label: "Sil", danger: true, onSelect: () => add(`Sil: ${name(t)}`) }]
          : [{ label: "Bağlantıyı kopyala", onSelect: () => add(`Bağlantı: ${name(t)}`) }, { label: "Ada ile paylaş", onSelect: () => add(`Ada: ${name(t)}`) }]
        return <Load from={menuLib}>{({ ContextMenu }) => <Stack>
          <ContextMenu items={items} when={(t) => !p.values.only || !!t.closest("[data-file]")} label="Dosya işlemleri">
            <div class="sc-ex-platform-sample">
              <span class="hm-muted">Sağ tıkla ya da odaklayıp Shift+F10</span>
              <Row>{["rapor.pdf", "logo.svg", "notlar.txt"].map((f) => <Button size="sm" variant="ghost" data-file={f}>{f}</Button>)}</Row>
            </div>
          </ContextMenu>
          <Log lines={lines} />
        </Stack>}</Load>
      },
    },
  },
  "hadi-march/managers/consent/ui": {
    ConsentBanner: {
      code: `<ConsentBanner title="Gizlilik" text="Analitik için izninizi istiyoruz." />   // bottom layer, until decided`,
      play: { options: [{ key: "title", label: "Başlık", default: "Gizlilik", options: [{ value: "Gizlilik", label: "Gizlilik" }, { value: "Çerez tercihleri", label: "Çerez tercihleri" }] }] },
      run: (p: { values: { title: string } }) => {
        const restore = keepConsent()
        return <Load from={consentLib}>{({ ConsentBanner, showConsentBanner }) => <Stack>
          {() => <ConsentBanner inline always title={p.values.title} text="HADİ, ziyaretleri ölçmek için analitik çerez kullanmak istiyor." />}
          <Row><Out label="izin verilen" value={choices} /><Button size="sm" variant="ghost" onClick={() => { restore(); showConsentBanner() }}>Önceki tercihe dön</Button></Row>
        </Stack>}</Load>
      },
    },
    ConsentGate: {
      code: `<ConsentGate category="marketing" label="Kampanya videosu izninizle yüklenir.">
  {() => <VideoEmbed />}
</ConsentGate>`,
      play: { options: [
        { key: "category", label: "Kategori", default: "thirdParty", options: [{ value: "thirdParty", label: "Üçüncü taraf" }, { value: "marketing", label: "Pazarlama" }, { value: "analytics", label: "Analitik" }] },
        { key: "custom", label: "Özel metin", default: true },
      ] },
      run: (p: { values: { category: string; custom: boolean } }) => {
        const restore = keepConsent()
        return <Load from={consentLib}>{({ ConsentGate }) => <Stack>
          {() => <ConsentGate category={p.values.category} label={p.values.custom ? "Harita, izin verdiğinizde HADİ'nin sağlayıcısından yüklenir." : undefined}>
            <div class="sc-ex-platform-sample"><Icon of={bell} size="lg" /><p>İçerik yüklendi ({p.values.category}).</p></div>
          </ConsentGate>}
          <Row><Out label="consent.has(kategori)" value={() => String(consent.has(p.values.category))} /><Button size="sm" variant="ghost" onClick={restore}>Önceki tercihe dön</Button></Row>
        </Stack>}</Load>
      },
    },
    hideConsentBanner: {
      code: `hideConsentBanner()   // close it; it comes back when the stored decision changes`,
      run: () => {
        keepConsent()
        return <Load from={consentLib}>{({ ConsentBanner, showConsentBanner, hideConsentBanner }) => <Stack>
          {onCleanup(hideConsentBanner)}
          <Row><Button onClick={showConsentBanner}>Göster</Button><Button variant="primary" onClick={hideConsentBanner}>hideConsentBanner()</Button></Row>
          <ConsentBanner inline title="Çerezler" text="Bu şerit hideConsentBanner() ile kapanır." />
        </Stack>}</Load>
      },
    },
    openConsentPreferences: {
      code: `<a onClick={() => openConsentPreferences()}>Çerez ayarları</a>   // resolves true when saved`,
      run: () => {
        const restore = keepConsent(), result = signal("—")
        return <Load from={consentLib}>{({ openConsentPreferences }) => <Row>
          <Button variant="primary" onClick={async () => result.set(String(await openConsentPreferences({ title: "HADİ gizlilik tercihleri" })))}>Tercihleri aç</Button>
          <Out label="kaydedildi" value={result} /><Out label="izin verilen" value={choices} />
          <Button size="sm" variant="ghost" onClick={restore}>Önceki tercihe dön</Button>
        </Row>}</Load>
      },
    },
    showConsentBanner: {
      code: `<button onClick={showConsentBanner}>Çerez ayarları</button>   // show again, even after a decision`,
      run: () => {
        keepConsent()
        return <Load from={consentLib}>{({ ConsentBanner, showConsentBanner, hideConsentBanner }) => <Stack>
          {onCleanup(hideConsentBanner)}
          <Button variant="primary" onClick={showConsentBanner}>showConsentBanner()</Button>
          <ConsentBanner inline title="Çerezler" text="Karar verildiyse şerit gizlidir; düğme onu yeniden açar." />
        </Stack>}</Load>
      },
    },
  },
  "hadi-march/managers/command/ui": {
    bindCommandKeys: {
      code: `bindCommandKeys()   // once in the shell: every command's shortcut runs it`,
      run: () => {
        const [lines, add] = useLog()
        docCommands(add)
        let off: (() => void) | null = null
        const on = signal(false)
        onCleanup(() => off?.())
        return <Load from={commandLib}>{({ bindCommandKeys }) => <Stack><Row>
          <Button variant="primary" onClick={() => { if (off) { off(); off = null } else off = bindCommandKeys(); on.set(!!off) }}>{() => (on() ? "Kısayolları çöz" : "bindCommandKeys()")}</Button>
          <span class="hm-muted">Sonra <Kbd keys="alt+shift+s" /> dene</span>
        </Row><Log lines={lines} /></Stack>}</Load>
      },
    },
    commandBinding: {
      code: `const b = commandBinding({ command: "doc.save", label: "Şimdi kaydet" })
b.label()   b.disabled()   b.shortcut()   b.run()`,
      run: () => {
        const [lines, add] = useLog()
        const { dirty } = docCommands(add)
        return <Load from={commandLib}>{({ commandBinding }) => <Stack>{(() => { const b = commandBinding({ command: "ex.doc.save", label: "Şimdi kaydet" }); return <Row>
          <Button variant="primary" disabled={b.disabled} loading={b.busy} onClick={b.run}>{b.label}</Button>
          <Button variant="ghost" onClick={() => dirty.set(true)}>Değişiklik yap</Button>
          <Out label="shortcut()" value={() => b.shortcut() ?? "—"} /><Out label="disabled()" value={() => String(b.disabled())} />
        </Row> })()}<Log lines={lines} /></Stack>}</Load>
      },
    },
    CommandButton: {
      code: `<CommandButton command="doc.save" />          // busy → loading, when → disabled
<CommandButton command="doc.share" iconOnly />`,
      play: { options: [
        { key: "variant", label: "Görünüm", default: "primary", options: [{ value: "primary", label: "primary" }, { value: "secondary", label: "secondary" }, { value: "ghost", label: "ghost" }] },
        { key: "iconOnly", label: "Yalnız simge", default: false },
      ] },
      run: (p: { values: { variant: "primary" | "secondary" | "ghost"; iconOnly: boolean } }) => {
        const [lines, add] = useLog()
        const { dirty } = docCommands(add)
        return <Load from={commandLib}>{({ CommandButton }) => <Stack><Row>
          {() => <CommandButton command="ex.doc.save" variant={p.values.variant} iconOnly={p.values.iconOnly} />}
          {() => <CommandButton command="ex.doc.share" variant={p.values.variant} iconOnly={p.values.iconOnly} />}
          <Button variant="ghost" onClick={() => dirty.set(true)}>Değişiklik yap</Button>
        </Row><Log lines={lines} /></Stack>}</Load>
      },
    },
    commandItems: {
      code: `<Menu label="Belge" items={commandItems({ group: "Belge" })} />   // follows the registry`,
      run: () => {
        const [lines, add] = useLog()
        const { dirty } = docCommands(add)
        return <Load from={commandLib}>{({ commandItems, Menu }) => <Stack><Row>
          <Menu label="Belge" items={commandItems({ group: "Belge" })} />
          <Button variant="ghost" onClick={() => dirty.set(true)}>Değişiklik yap</Button>
        </Row><Log lines={lines} /></Stack>}</Load>
      },
    },
    commandMenuItem: {
      code: `<ContextMenu items={() => [commandMenuItem(save), "-", commandMenuItem(remove)]}>…</ContextMenu>`,
      run: () => {
        const [lines, add] = useLog()
        const { save, remove, dirty } = docCommands(add)
        return <Load from={commandLib}>{({ commandMenuItem, ContextMenu }) => <Stack>
          <ContextMenu items={() => [commandMenuItem(save), "-", commandMenuItem(remove)]} label="Belge">
            <div class="sc-ex-platform-sample" tabindex="0"><span>Sağ tıkla ya da Shift+F10: komutlardan menü</span></div>
          </ContextMenu>
          <Row><Button variant="ghost" onClick={() => dirty.set(true)}>Değişiklik yap</Button></Row>
          <Log lines={lines} />
        </Stack>}</Load>
      },
    },
    CommandToolbar: {
      code: `<CommandToolbar pick={{ group: "Belge" }} iconOnly label="Belge araçları" />`,
      play: { options: [
        { key: "iconOnly", label: "Yalnız simge", default: true },
        { key: "size", label: "Boyut", default: "sm", options: [{ value: "sm", label: "sm" }, { value: "md", label: "md" }] },
      ] },
      run: (p: { values: { iconOnly: boolean; size: "sm" | "md" } }) => {
        const [lines, add] = useLog()
        const { dirty } = docCommands(add)
        return <Load from={commandLib}>{({ CommandToolbar }) => <Stack><Row>
          {() => <CommandToolbar pick={{ group: "Belge" }} iconOnly={p.values.iconOnly} size={p.values.size} label="Belge araçları" />}
          <Button variant="ghost" onClick={() => dirty.set(true)}>Değişiklik yap</Button>
        </Row><Log lines={lines} /></Stack>}</Load>
      },
    },
  },
  "hadi-march/managers/undo": {
    undoHistory: {
      code: `const h = undoHistory({ mergeMs: 800 })   // an editor's own history, apart from the app's
h.run("Yazma", () => text.set(next), () => text.set(prev), "typing")
h.undo()   h.redo()   h.past()`,
      run: () => {
        const text = signal("HADİ")
        const h = undoHistory({ mergeMs: 800 })
        onCleanup(h.dispose)
        let shown = text.peek()
        const put = (v: string) => { text.set(v); shown = v }
        // the field already shows the new text: record the step, its undo puts the old one back
        const type = (v: string) => { const prev = shown; shown = v; h.push({ label: "Yazma", undo: () => put(prev), redo: () => put(v), merge: "typing" }) }
        return <Stack>
          <TextInput value={text} onChange={type} aria-label="Metin" />
          <Row>
            <Button disabled={() => !h.canUndo()} onClick={() => void h.undo()}>Geri al</Button>
            <Button disabled={() => !h.canRedo()} onClick={() => void h.redo()}>Yinele</Button>
            <Button variant="ghost" onClick={() => { const prev = shown; h.run("Büyük harf", () => put(prev.toLocaleUpperCase("tr")), () => put(prev)) }}>BÜYÜK HARF</Button>
          </Row>
          <Row><Out label="metin" value={text} /><Out label="geçmiş" value={() => h.past().join(" · ") || "—"} /></Row>
        </Stack>
      },
    },
  },
  "hadi-march/managers/undo/history": {
    create: {
      code: `import { create } from "hadi-march/managers/undo/history"
const stack = create({ limit: 3, mergeMs: 0, commands: false }, (type, d) => log(type, d))`,
      run: () => {
        const [lines, add] = useLog(6)
        const n = signal(0)
        const s = create({ limit: 3, mergeMs: 0, commands: false }, (type, d) => add(`${type} ${d ? JSON.stringify(d) : ""}`))
        const step = (by: number) => { const prev = n.peek(); s.run(`${by > 0 ? "+" : ""}${by}`, () => n.set(prev + by), () => n.set(prev)) }
        return <Stack><Row>
          <Button onClick={() => step(1)}>+1</Button><Button onClick={() => step(10)}>+10</Button>
          <Button variant="ghost" disabled={() => !s.canUndo()} onClick={() => void s.undo()}>undo()</Button>
          <Out label="değer" value={n} /><Out label="past (en çok 3)" value={() => s.past().join(", ") || "—"} />
        </Row><Log lines={lines} /></Stack>
      },
    },
  },
  "hadi-march/managers/accessibility/ui": {
    AccessibilitySettings: {
      code: `<AccessibilitySettings />   // motion, text size, contrast, links, spacing, focus ring — saved on the device`,
      play: { options: [{ key: "sample", label: "Örnek alan", default: true }] },
      run: (p: { values: { sample: boolean } }) => {
        const restore = keepA11y()
        return <Load from={a11yLib}>{({ AccessibilitySettings }) => <Stack>
          <AccessibilitySettings />
          {() => (p.values.sample ? <div class="sc-ex-platform-sample"><p>HADİ bülteni: <a href="#api">bağlantı</a> ve <Button size="sm">odaklanabilir düğme</Button></p></div> : null)}
          <Row><Button variant="ghost" onClick={restore}>Önceki ayarlara dön</Button></Row>
        </Stack>}</Load>
      },
    },
    openAccessibilityPanel: {
      code: `<Button onClick={openAccessibilityPanel}>Erişilebilirlik</Button>`,
      run: () => {
        const restore = keepA11y()
        return <Load from={a11yLib}>{({ openAccessibilityPanel }) => <Row>
          <Button variant="primary" onClick={() => void openAccessibilityPanel()}>Erişilebilirlik paneli</Button>
          <Out label="yazı" value={() => `%${Math.round(a11y.prefs().fontScale * 100)}`} /><Out label="hareket" value={() => a11y.prefs().motion} />
          <Button variant="ghost" onClick={restore}>Önceki ayarlara dön</Button>
        </Row>}</Load>
      },
    },
  },
  "hadi-march/managers/shortcut-hint": {
    comboOf: {
      code: `comboOf(button)   // "shift+s" from data-hotkey, else the first aria-keyshortcuts`,
      run: () => {
        const els = [<button type="button" class="hm-btn" data-hotkey="shift+s">Paylaş</button>, <button type="button" class="hm-btn" aria-keyshortcuts="Control+K Meta+K">Ara</button>, <button type="button" class="hm-btn">Kısayolsuz</button>] as HTMLElement[]
        return <Stack>{els.map((el) => <Row>{el}<Out label="comboOf" value={String(comboOf(el))} /></Row>)}</Stack>
      },
    },
  },
  "hadi-march/managers/shortcut-hint/ui": {
    holdHint: {
      code: `<p class="hm-muted">{holdHint()}</p>   // "Hold Alt to see shortcuts on the page." in the UI language`,
      run: () => {
        const key = signal("Alt")
        return <Load from={hintLib}>{({ holdHint }) => <Stack><Segmented value={key} options={["Alt", "Control", "Shift"].map((k) => ({ value: k, label: k }))} aria-label="Tuş" /><p>{() => holdHint(key())}</p></Stack>}</Load>
      },
    },
    ShortcutHelp: {
      code: `<ShortcutHelp />   // the grouped list of described shortcuts (the "?" dialog body)`,
      play: { options: [{ key: "set", label: "Kısayollar", default: "both", options: [{ value: "edit", label: "Düzen" }, { value: "view", label: "Görünüm" }, { value: "both", label: "İkisi" }] }] },
      run: (p: { values: { set: string } }) => {
        onCleanup(disposeShortcutHints)
        effect(() => {
          const s = p.values.set
          if (s !== "view") { hotkeys.bind("alt+shift+c", () => {}, { description: "Kopyala (örnek)", group: "Düzen" }); hotkeys.bind("alt+shift+v", () => {}, { description: "Yapıştır (örnek)", group: "Düzen" }) }
          if (s !== "edit") hotkeys.bind("alt+shift+z", () => {}, { description: "Yakınlaştır (örnek)", group: "Görünüm" })
        })
        return <Load from={hintLib}>{({ ShortcutHelp }) => <ShortcutHelp />}</Load>
      },
    },
    ShortcutHints: {
      code: `<ShortcutHints />   // once in the shell: badges while Alt is held, the list on "?"
<Button data-hotkey="shift+n">Yeni</Button>`,
      play: { options: [{ key: "badges", label: "Rozetler açık", default: true }] },
      run: (p: { values: { badges: boolean } }) => {
        onCleanup(disposeShortcutHints)
        effect(() => { if (p.values.badges) shortcutHints.show(); else shortcutHints.hide() })
        return <Load from={hintLib}>{({ ShortcutHints }) => <Stack>
          <ShortcutHints />
          <Row><Button data-hotkey="shift+n">Yeni</Button><Button data-hotkey="shift+e">Dışa aktar</Button><Button variant="primary" onClick={() => shortcutHints.openHelp()}>Liste <Kbd keys="?" /></Button></Row>
          <Out label="visible()" value={() => String(shortcutHints.visible())} />
        </Stack>}</Load>
      },
    },
  },
})
