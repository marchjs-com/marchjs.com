// API examples of the app toolkit: hadi-march/store, hadi-march/i18n and hadi-march/lazy (router: app-router.tsx).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, effect, untrack, onCleanup, locale, setLocale, messages, t } from "hadi-march";
import { store, derive, history, on, persist, readonly, snapshot, storeLog, subscribe, type StoreEvent } from "hadi-march/store";
import { dir, format, loadLocale, tKey, typed, unused } from "hadi-march/i18n";
import {
  lazy, skeleton, chunksOf, loadDelay, loaderKey, prefetchCommon, preloadChunks, preloadFiles, runLoad, saveData,
  setLoadDelay, setLoadRunner, setPreloadManifest, whenIdle, type LazyPlaceholder, type LazyWhen,
} from "hadi-march/lazy";
import { Button, Badge, Card, Segmented, TextInput, Checkbox } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./app.css";
export { default as SIG } from "./app.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
type Lines = (() => string[]) & { update(fn: (l: string[]) => string[]): unknown }
const push = (s: Lines, line: string, keep = 6) => s.update((l) => [...l.slice(1 - keep), `${now()} ${line}`])
const json = (v: unknown) => JSON.stringify(v)
const wait = <T,>(ms: number, v: T) => new Promise<T>((r) => setTimeout(() => r(v), ms))
/** Count of <link> tags the preloader added to <head>. */
const preloadLinks = () => document.head.querySelectorAll("link[data-march-preload]").length
/** Source keys of the build manifest of this page (index.html), pages first. */
const manifestKeys = (): string[] => {
  try { return Object.keys(JSON.parse(document.getElementById("march-manifest")?.textContent ?? "{}") as object).filter((k) => !k.startsWith("march:")).sort((a, b) => Number(b.includes("/pages/")) - Number(a.includes("/pages/"))) } catch { return [] }
}
const shortKey = (k: string) => k.split("/").slice(-2).join("/")

function Sales(props: { name: string }) {
  return <Card title={`${props.name} satışları`}><Row><Badge tone="success">+12%</Badge><Out label="ciro" value="₺48.200" /><Out label="sipariş" value="317" /></Row></Card>
}

export default examples({
  "hadi-march/store": {
    derive: {
      code: `const total = derive(() => cart.items.reduce((s, i) => s + i.price * i.qty, 0))
total()   // recomputed only when an item changes`,
      run: () => {
        const cart = store({ items: [{ name: "Kalem", price: 25, qty: 2 }, { name: "Defter", price: 60, qty: 1 }] })
        const total = derive(() => cart.items.reduce((s, i) => s + i.price * i.qty, 0))
        return <Row>
          <Button onClick={() => { cart.items[0]!.qty++ }}>Kalem +1</Button>
          <Button onClick={() => cart.items.push({ name: "Silgi", price: 10, qty: 1 })}>Silgi ekle</Button>
          <Out label="kalem" value={() => String(cart.items.length)} /><Out label="total()" value={() => format("{n, number, currency/TRY}", { n: total() }, "tr")} />
        </Row>
      },
    },
    history: {
      code: `const h = history(doc, { limit: 50 })
h.undo(); h.redo()
h.canUndo()   // reactive`,
      run: () => {
        const doc = store({ title: "Taslak", tags: [] as string[] })
        const hist = history(doc)
        onCleanup(hist.dispose)
        const TAGS = ["acil", "satış", "destek", "arşiv"]
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => doc.tags.push(TAGS[doc.tags.length % TAGS.length]!)}>Etiket ekle</Button>
          <Button onClick={() => { doc.title = doc.title === "Taslak" ? "Teklif · HADİ" : "Taslak" }}>Başlığı değiştir</Button>
          <Button variant="secondary" disabled={() => !hist.canUndo()} onClick={() => hist.undo()}>Geri al</Button>
          <Button variant="secondary" disabled={() => !hist.canRedo()} onClick={() => hist.redo()}>Yinele</Button>
        </Row><Out label="doc" value={() => json({ title: doc.title, tags: [...doc.tags] })} /></div>
      },
    },
    on: {
      code: `on(app, "users.*.name", (e) => console.log(e.path, e.value))
on(app, "cart.**", …)   // anything below cart`,
      run: () => {
        const app = store({ users: [{ name: "Ada" }, { name: "Can" }], theme: "açık" })
        const log = signal<string[]>([])
        onCleanup(on(app, "users.*.name", (e) => push(log, `${e.path} = ${String((e as { value?: unknown }).value)}`)))
        const NAMES = ["Ada", "Ece", "Deniz", "Can"]
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => { app.users[0]!.name = NAMES[(NAMES.indexOf(app.users[0]!.name) + 1) % NAMES.length]! }}>1. kişinin adı</Button>
          <Button onClick={() => { app.users[1]!.name = NAMES[(NAMES.indexOf(app.users[1]!.name) + 1) % NAMES.length]! }}>2. kişinin adı</Button>
          <Button variant="ghost" onClick={() => { app.theme = app.theme === "açık" ? "koyu" : "açık" }}>Tema (dinlenmiyor)</Button>
        </Row><Log lines={log} /></div>
      },
    },
    persist: {
      code: `const prefs = store({ size: 14 })
persist(prefs, "hadi.prefs")   // loads now; saves 200 ms after a change`,
      run: () => {
        const KEY = "hm-ex-app.prefs"
        const prefs = store({ size: 14 })
        const saved = signal(globalThis.sessionStorage?.getItem(KEY) ?? "—")
        let t: ReturnType<typeof setTimeout> | undefined
        onCleanup(persist(prefs, KEY, { storage: globalThis.sessionStorage }))
        onCleanup(subscribe(prefs, () => { clearTimeout(t); t = setTimeout(() => saved.set(globalThis.sessionStorage?.getItem(KEY) ?? "—"), 300) }))
        onCleanup(() => clearTimeout(t))
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => { prefs.size-- }}>A−</Button><Button onClick={() => { prefs.size++ }}>A+</Button>
          <Out label="prefs.size" value={() => String(prefs.size)} /><Out label="sessionStorage" value={saved} />
        </Row><p class="hm-muted">Kartı kapatıp yeniden aç: değer kayıttan geri gelir.</p></div>
      },
    },
    readonly: {
      code: `export const user = readonly(state.user)   // others read (reactively), only this module writes
user.name = "x"   // TypeError`,
      run: () => {
        const user = store({ name: "Ada" })
        const view = readonly(user)
        const msg = signal("—")
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => { try { (view as { name: string }).name = "Can"; msg.set("yazıldı") } catch (e) { msg.set((e as Error).message) } }}>view.name = "Can"</Button>
          <Button variant="secondary" onClick={() => { user.name = user.name === "Ada" ? "Can" : "Ada" }}>user.name değiştir</Button>
          <Out label="view.name" value={() => view.name} />
        </Row><Out label="sonuç" value={msg} /></div>
      },
    },
    snapshot: {
      code: `const saved = snapshot(form)   // deeply frozen plain copy
Object.isFrozen(saved)          // true`,
      run: () => {
        const form = store({ qty: 1, note: "" })
        const snaps = signal<string[]>([])
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => { form.qty++ }}>qty +1</Button>
          <Button variant="secondary" onClick={() => { const s = snapshot(form); push(snaps, `${json(s)} · donmuş: ${Object.isFrozen(s)}`) }}>snapshot(form)</Button>
          <Out label="form.qty" value={() => String(form.qty)} />
        </Row><Log lines={snaps} /></div>
      },
    },
    storeLog: {
      code: `storeLog(app).slice(-3)   // [{ path: "items", op: "push", … }] — development only`,
      run: () => {
        const app = store({ items: [] as string[], count: 0 })
        const lines = signal<string[]>([])
        const refresh = () => lines.set(storeLog(app).slice(-6).map((c) => `${c.op} ${c.path || "(kök)"} ${c.value === undefined ? "" : json(c.value)}`))
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => { app.items.push(`öğe ${app.items.length + 1}`); refresh() }}>items.push</Button>
          <Button onClick={() => { app.count++; refresh() }}>count++</Button>
          <Button variant="ghost" onClick={() => { app.items.pop(); refresh() }}>items.pop</Button>
          <Out label="kayıt" value={() => String(lines().length)} />
        </Row><Log lines={lines} /></div>
      },
    },
    subscribe: {
      code: `const off = subscribe(app.cart, (e) => console.log(e.op, e.path))
off()`,
      run: () => {
        const app = store({ cart: { items: [] as string[], coupon: "" }, user: "Ada" })
        const log = signal<string[]>([])
        onCleanup(subscribe(app.cart, (e: StoreEvent) => push(log, `${e.op} ${e.path}`)))
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => app.cart.items.push("Kalem")}>Ürün ekle</Button>
          <Button onClick={() => { app.cart.coupon = app.cart.coupon ? "" : "HADI10" }}>Kupon</Button>
          <Button variant="ghost" onClick={() => { app.user = app.user === "Ada" ? "Can" : "Ada" }}>user (sepet dışı)</Button>
        </Row><Log lines={log} /></div>
      },
    },
  },
  "hadi-march/i18n": {
    dir: {
      code: `<div dir={dir()}>…</div>   // "rtl" for ar, he, fa…; setLocale() also sets <html dir>`,
      run: () => {
        messages("ar", { "api.ex.app.hello": "مرحبا" })
        const prev = untrack(locale), cur = signal(prev)
        effect(() => cur.set(locale() === "ar" ? "ar" : prev))
        onCleanup(() => { if (untrack(locale) !== prev) void setLocale(prev) })
        return <div class="sc-ex-app-stack"><Row>
          <Segmented value={cur} onChange={(v: string) => void setLocale(v)} options={[{ value: prev, label: prev }, { value: "ar", label: "ar (tüm sayfa)" }]} aria-label="Dil" />
          <Out label="dir()" value={dir} /><Out label="<html dir>" value={() => { dir(); locale(); return document.documentElement.getAttribute("dir") ?? "—" }} />
        </Row><p class="hm-muted">"ar" tüm sayfayı sağdan sola çevirir; geri dönmek için ilk seçeneğe bas (kart kapanınca da geri döner).</p></div>
      },
    },
    format: {
      code: `format("{n, plural, =0 {Sepet boş} other {# ürün}}", { n: 3 })   // "3 ürün"
format("{p, number, currency/TRY}", { p: 1499.9 }, "tr")          // "₺1.499,90"`,
      run: () => {
        const n = signal(1)
        return <div class="sc-ex-app-stack">
          <Row><Button onClick={() => n.set(Math.max(0, n() - 1))}>−</Button><Button onClick={() => n.update((x) => x + 1)}>+</Button><Out label="n" value={n} /></Row>
          <Out label="tr" value={() => format("{n, plural, =0 {Sepet boş} other {Sepette # ürün}} · {p, number, currency/TRY}", { n: n(), p: n() * 49.9 }, "tr")} />
          <Out label="en" value={() => format("{n, plural, =0 {Cart is empty} one {# item} other {# items}} · {p, number, currency/USD}", { n: n(), p: n() * 4.5 }, "en")} />
          <Out label="date" value={() => format("{d, date, long}", { d: Date.now() + n() * 86_400_000 }, "tr")} />
        </div>
      },
    },
    loadLocale: {
      code: `loadLocale("de", () => import("./locales/de.ts"))
await setLocale("de")   // the pack downloads the first time only`,
      run: () => {
        const log = signal<string[]>([])
        const prev = untrack(locale)
        messages(prev, { "api.ex.app.cart": "{n} ürün sepette" })
        loadLocale("de", async () => { push(log, "de paketi yükleniyor…"); return { default: { "api.ex.app.cart": "{n} Artikel im Warenkorb" } } })
        onCleanup(() => { if (untrack(locale) !== prev) void setLocale(prev) })
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={() => setLocale("de").then(() => push(log, `locale() = ${locale()}`))}>setLocale("de")</Button>
          <Button variant="ghost" onClick={() => setLocale(prev).then(() => push(log, `locale() = ${locale()}`))}>{`Geri al (${prev})`}</Button>
          <Out label='t("api.ex.app.cart")' value={() => t("api.ex.app.cart", { n: 3 })} />
        </Row><Log lines={log} /></div>
      },
    },
    tKey: {
      code: "tKey([\"Merhaba \", \", \", \" yeni ileti\"])   // \"Merhaba {0}, {1} yeni ileti\" — the key t`Merhaba ${a}, ${b} yeni ileti` looks up",
      run: () => {
        const key = (s: TemplateStringsArray, ..._v: unknown[]) => tKey(s)
        const keys = [key`Merhaba ${"Ada"}`, key`${3} dosya silindi`, key`${"HADİ"} ekibine ${"Can"} katıldı`]
        const i = signal(0)
        return <div class="sc-ex-app-stack">
          <Segmented value={i} options={keys.map((_, n) => ({ value: n, label: `şablon ${n + 1}` }))} aria-label="Şablon" />
          <Out label="tKey" value={() => keys[i()]!} />
        </div>
      },
    },
    typed: {
      code: `const tr = { "cart.items": "Sepette {n} ürün", hi: "Merhaba {name}" }
messages("tr", tr)
const tt = typed<typeof tr>()
tt("cart.items", { n: 2 })   // tt("cart.items") or tt("cart.item", …) do not compile`,
      run: () => {
        const cat = { "api.ex.app.items": "{n, plural, =0 {Sepet boş} other {Sepette # ürün}}", "api.ex.app.hi": "Merhaba {name}" }
        messages(untrack(locale), cat)
        const tt = typed<typeof cat>()
        const n = signal(2), name = signal("Ada")
        return <div class="sc-ex-app-stack">
          <Row><Button onClick={() => n.set(Math.max(0, n() - 1))}>−</Button><Button onClick={() => n.update((x) => x + 1)}>+</Button><TextInput value={name} aria-label="Ad" /></Row>
          <Row><Out label='tt("api.ex.app.items")' value={() => tt("api.ex.app.items", { n: n() })} /><Out label='tt("api.ex.app.hi")' value={() => tt("api.ex.app.hi", { name: name() })} /></Row>
        </div>
      },
    },
    unused: {
      code: `unused("tr", usedKeys)   // ["old.banner"] — translations no code looks up any more`,
      run: () => {
        const KEYS = ["menu.home", "menu.cart", "menu.orders", "old.banner"]
        messages("x-hadi", Object.fromEntries(KEYS.map((k) => [k, k])))
        const on = KEYS.map((k) => signal(k === "menu.home" || k === "menu.cart"))
        const used = () => KEYS.filter((_, i) => on[i]!())
        return <div class="sc-ex-app-stack">
          <Row>{KEYS.map((k, i) => <Checkbox value={on[i]!} label={k} />)}</Row>
          <Out label='unused("x-hadi", kullanılan)' value={() => json(unused("x-hadi", used()))} />
        </div>
      },
    },
  },
  "hadi-march/lazy": {
    chunksOf: {
      code: `chunksOf("src/pages/users.tsx")   // ["assets/chunks/users-H.js", "assets/chunks/table-H.css", …] | null`,
      run: () => {
        const keys = manifestKeys().slice(0, 4), key = signal(keys[0] ?? "")
        return <div class="sc-ex-app-stack">
          {keys.length ? <Segmented value={key} options={keys.map((k) => ({ value: k, label: shortKey(k) }))} aria-label="Parça" /> : <p class="hm-muted">Bu derlemede manifesto yok.</p>}
          <Out label="chunksOf(key)" value={() => json(chunksOf(key()))} />
        </div>
      },
    },
    lazy: {
      code: `const Sales = lazy(() => import("./SalesCard.tsx"), { when: "visible", placeholder: "card", height: "8rem" })
<Sales name="HADİ" />
Sales.preload()   // e.g. on hover`,
      play: { options: [{ key: "placeholder", label: "placeholder", default: "card", options: [{ value: "card", label: "card" }, { value: "chart", label: "chart" }, { value: "text", label: "text" }] }, { key: "when", label: "when", default: "immediate", options: [{ value: "immediate", label: "immediate" }, { value: "interaction", label: "interaction" }] }] },
      run: (p: { values: { placeholder: LazyPlaceholder; when: LazyWhen } }) => {
        const n = signal(0)
        return <div class="sc-ex-app-stack">
          <Row><Button onClick={() => n.update((x) => x + 1)}>Yeniden yükle (900 ms)</Button>{() => (p.values.when === "interaction" ? <span class="hm-muted">Yüklemek için alanın üzerine gel.</span> : null)}</Row>
          {() => { n(); const ph = p.values.placeholder, when = p.values.when; return untrack(() => { const C = lazy<{ name: string }>(() => wait(900, { default: Sales }), { placeholder: ph, when, height: "7.5rem" }); return <C name="HADİ" /> }) }}
        </div>
      },
    },
    loadDelay: {
      code: `if (loadDelay()) console.info(\`slow mode: +\${loadDelay()} ms per chunk\`)`,
      run: () => {
        const v = signal(loadDelay())
        return <Row><Button size="sm" variant="ghost" onClick={() => v.set(loadDelay())}>Oku</Button><Out label="loadDelay()" value={() => `${v()} ms`} /><span class="hm-muted">0 = kapalı; setLoadDelay ile değişir.</span></Row>
      },
    },
    loaderKey: {
      code: `const load = () => import("./pages/users.tsx")
loaderKey(load)   // "src/pages/users.tsx" (the compiler tags dynamic imports)`,
      run: () => {
        const tagged = () => import("./_kit.tsx")
        const plain = () => Promise.resolve({})
        return <Row><Out label='loaderKey(() => import("./_kit.tsx"))' value={String(loaderKey(tagged) ?? "undefined")} /><Out label="loaderKey(plain)" value={String(loaderKey(plain) ?? "undefined")} /></Row>
      },
    },
    prefetchCommon: {
      code: `whenIdle(() => prefetchCommon())   // the router does this after the first page`,
      run: () => {
        const out = signal("—"), count = signal(preloadLinks())
        return <Row><Button onClick={() => { out.set(String(prefetchCommon())); count.set(preloadLinks()) }}>prefetchCommon()</Button><Out label="sonuç" value={out} /><Out label='chunksOf("march:common")' value={() => { count(); return String(chunksOf("march:common")?.length ?? 0) + " dosya" }} /></Row>
      },
    },
    preloadChunks: {
      code: `preloadChunks(loaderKey(load))   // every chunk of that import at once: no waterfall
preloadChunks("src/pages/users.tsx", true)   // low priority (<link rel="prefetch">)`,
      run: () => {
        const keys = manifestKeys().slice(4, 8), key = signal(keys[0] ?? "")
        const out = signal("—"), count = signal(preloadLinks())
        return <div class="sc-ex-app-stack">
          {keys.length ? <Segmented value={key} options={keys.map((k) => ({ value: k, label: shortKey(k) }))} aria-label="Parça" /> : null}
          <Row><Button onClick={() => { out.set(String(preloadChunks(key() || null, true))); count.set(preloadLinks()) }}>preloadChunks(key, true)</Button>
            <Out label="sonuç" value={out} /><Out label="<link> ön yükleme" value={count} /></Row>
        </div>
      },
    },
    preloadFiles: {
      code: `preloadFiles(["assets/chunks/chart-H.js", "assets/chunks/chart-H.css"])        // modulepreload / preload
preloadFiles(files, true)                                                        // prefetch (idle)`,
      run: () => {
        const files = chunksOf(manifestKeys()[8] ?? "") ?? []
        const count = signal(preloadLinks())
        return <div class="sc-ex-app-stack">
          <Out label="files" value={json(files.slice(0, 3))} />
          <Row><Button onClick={() => { preloadFiles(files, true); count.set(preloadLinks()) }}>preloadFiles(files, true)</Button><Out label="<link> ön yükleme" value={count} /></Row>
        </div>
      },
    },
    runLoad: {
      code: `const mod = await runLoad(() => import("./report.tsx"), { kind: "part", key: "report" })
// preloads its chunks, honours setLoadDelay, goes through the load runner (hadi-march/net)`,
      run: () => {
        const out = signal("—")
        const go = async () => { out.set("yükleniyor…"); const t0 = performance.now(); const m = await runLoad(() => wait(250, { rows: 3 }), { kind: "part", key: "api-ex-report" }); out.set(`${json(m)} · ${Math.round(performance.now() - t0)} ms`) }
        return <Row><Button onClick={go}>runLoad(…)</Button><Out label="sonuç" value={out} /></Row>
      },
    },
    saveData: {
      code: `if (!saveData()) preloadChunks(key, true)   // skip speculative downloads on Save-Data / 2G`,
      run: () => {
        const conn = () => (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
        const v = signal(saveData()), type = signal(conn()?.effectiveType ?? "bilinmiyor")
        return <Row><Button size="sm" variant="ghost" onClick={() => { v.set(saveData()); type.set(conn()?.effectiveType ?? "bilinmiyor") }}>Yeniden oku</Button>
          <Out label="saveData()" value={() => String(v())} /><Out label="effectiveType" value={type} /></Row>
      },
    },
    setLoadDelay: {
      code: `setLoadDelay(1200)   // demo: every lazy part and route chunk waits 1.2 s ("slow 3G")
setLoadDelay(0)`,
      run: () => {
        const prev = loadDelay(), v = signal(prev), took = signal("—")
        onCleanup(() => setLoadDelay(prev))
        const set = (ms: number) => { setLoadDelay(ms); v.set(loadDelay()) }
        const probe = async () => { took.set("…"); const t0 = performance.now(); await runLoad(() => Promise.resolve(1), { kind: "part", key: "api-ex-delay" }); took.set(`${Math.round(performance.now() - t0)} ms`) }
        return <div class="sc-ex-app-stack">
          <Segmented value={v} onChange={(ms: number) => set(ms)} options={[{ value: 0, label: "0" }, { value: 400, label: "400 ms" }, { value: 1200, label: "1200 ms" }]} aria-label="Gecikme" />
          <Row><Button onClick={probe}>Bir parça yükle</Button><Out label="süre" value={took} /><span class="hm-muted">Kart kapanınca eski değere döner.</span></Row>
        </div>
      },
    },
    setLoadRunner: {
      code: `setLoadRunner((load, info) => {
  console.time(info.key); return load().finally(() => console.timeEnd(info.key))
})`,
      run: () => {
        const log = signal<string[]>([])
        const go = async () => {
          // is a runner installed (hadi-march/net)? with none and no delay runLoad calls the loader at once
          const delay = loadDelay(); setLoadDelay(0)
          let direct = false
          void runLoad(() => { direct = true; return Promise.resolve(0) }, { kind: "part", key: "api-ex-probe" })
          setLoadDelay(delay)
          setLoadRunner((load, info) => { push(log, `runner: ${info.kind} "${info.key}"`); const t0 = performance.now(); return load().finally(() => push(log, `bitti: ${Math.round(performance.now() - t0)} ms`)) })
          try { await runLoad(() => wait(200, 0), { kind: "part", key: "api-ex-runner" }) } finally {
            // put back what was there: hadi-march/net's runner (already loaded when it was installed) or none
            if (direct) setLoadRunner(null); else (await import("hadi-march/net")).routeLoads()
            push(log, direct ? "runner kaldırıldı" : "hadi-march/net runner'ı geri kuruldu")
          }
        }
        return <div class="sc-ex-app-stack"><Row><Button onClick={go}>Kaydedici runner ile yükle</Button></Row><Log lines={log} /></div>
      },
    },
    setPreloadManifest: {
      code: `setPreloadManifest({ "src/pages/users.tsx": ["chunks/users-1.js", "chunks/users-1.css"] }, "https://cdn.hadisosyal.com/app/")`,
      run: () => {
        const out = signal(json(chunksOf("demo/report.tsx")))
        // undefined (not part of the type): the next read takes the page's own manifest from index.html again
        const restore = () => { setPreloadManifest(undefined as never); out.set(json(chunksOf("demo/report.tsx"))) }
        onCleanup(() => setPreloadManifest(undefined as never))
        return <Row>
          <Button onClick={() => { setPreloadManifest({ "demo/report.tsx": ["chunks/report-1.js", "chunks/report-1.css"] }); out.set(json(chunksOf("demo/report.tsx"))) }}>Sahte manifesto kur</Button>
          <Button variant="ghost" onClick={restore}>Sayfanınkine dön</Button>
          <Out label='chunksOf("demo/report.tsx")' value={out} />
        </Row>
      },
    },
    skeleton: {
      code: `const el = skeleton("table")   // one element; the shape is drawn by CSS
<Show when={ready()} fallback={skeleton("card")}>…</Show>`,
      play: { options: [{ key: "kind", label: "kind", default: "card", options: ["block", "text", "card", "table", "chart", "form"] }] },
      run: (p: { values: { kind: LazyPlaceholder } }) => <div class="sc-ex-app-stack">
        <Out label="skeleton" value={() => `skeleton("${p.values.kind}")`} />
        <div class="sc-ex-app-skel">{() => skeleton(p.values.kind)}</div>
      </div>,
    },
    whenIdle: {
      code: `const cancel = whenIdle(() => warmCache(), 2000)   // requestIdleCallback, at most 2 s later
cancel()`,
      run: () => {
        const log = signal<string[]>([])
        let cancel: (() => void) | null = null
        onCleanup(() => cancel?.())
        const plan = () => { const t0 = performance.now(); cancel?.(); push(log, "planlandı"); cancel = whenIdle(() => { cancel = null; push(log, `boşta çalıştı (${Math.round(performance.now() - t0)} ms sonra)`) }, 2000) }
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={plan}>whenIdle(…)</Button>
          <Button variant="ghost" onClick={() => { if (cancel) { cancel(); cancel = null; push(log, "iptal edildi") } }}>cancel()</Button>
        </Row><Log lines={log} /></div>
      },
    },
  },
})
