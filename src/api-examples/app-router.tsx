// API examples of hadi-march/router (the app group continues in app.tsx: store, i18n, lazy).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
// The page has one router (the showcase's own, hash mode): these examples never change its route. They read its live
// state, change only the query string of this page (?color=…, ?~aside=…) or show what a call returns without making it.
import { signal, effect, untrack, onCleanup, createRoot, h } from "hadi-march";
import {
  _router, back, beforeLeave, closeModal, compilePath, fillPath, Link, matchRoute, navigate, navigating,
  navigationSignal, onRouteChange, openOutlet, Outlet, outletRoute, params, path, prefetch, prefetchLinks, preload, query,
  queryParam, route, routeError, setMeta, setQuery, transitionOutlet, type CompiledRoute, type RouteTarget,
} from "hadi-march/router";
import { skeleton } from "hadi-march/lazy";
import { Button, Card, Segmented, TextInput, Checkbox } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./app.css";
export { default as SIG } from "./app-router.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
type Lines = (() => string[]) & { update(fn: (l: string[]) => string[]): unknown }
const push = (s: Lines, line: string, keep = 6) => s.update((l) => [...l.slice(1 - keep), `${now()} ${line}`])
const json = (v: unknown) => JSON.stringify(v)
const wait = <T,>(ms: number, v: T) => new Promise<T>((r) => setTimeout(() => r(v), ms))
/** Count of <link> tags the preloader added to <head>. */
const preloadLinks = () => document.head.querySelectorAll("link[data-march-preload]").length

// Route events outlive a card (it closes when the page changes): one small watcher for the whole visit, started the
// first time one of these examples opens; come back to this page to read what happened meanwhile.
let watcher: { routes: Lines; busy: Lines; aborts: Lines } | null = null
const watch = () => watcher ??= createRoot(() => {
  const routes = signal<string[]>([]), busy = signal<string[]>([]), aborts = signal<string[]>([])
  onRouteChange((m) => push(routes, `→ ${m?.path ?? "bulunamadı"}`))
  let t0 = 0
  effect(() => { const n = navigating(); untrack(() => { if (n) t0 = performance.now(); else if (t0) { push(busy, `navigating() true → false: ${Math.round(performance.now() - t0)} ms`); t0 = 0 } }) })
  return { routes, busy, aborts }
})

// a small route table of an imagined app (pure helpers only: the page's router stays as it is)
const TABLE: CompiledRoute[] = ["/", "/orders", "/orders/:id", "/orders/:id/edit", "/files/*path", "/team/:slug?"]
  .map((p) => ({ path: p, ...compilePath(p) })).sort((a, b) => b.score - a.score)
const PEOPLE = ["1", "2", "3"]

export default examples({
  "hadi-march/router": {
    _resetRouter: {
      code: `afterEach(() => _resetRouter())   // tests: drop the router, its guards and its page cache`,
      run: () => <div class="sc-ex-app-stack">
        <p class="hm-muted">Testlerde her senaryodan önce çağrılır. Burada çağrılmaz: bu sayfayı yöneten yönlendiriciyi kapatırdı. Sıfırlayacağı durum:</p>
        <Row><Out label="path()" value={path} /><Out label="route()" value={() => route()?.route.pattern ?? "null"} /><Out label="sonrası" value='"/" · null' /></Row>
      </div>,
    },
    _router: {
      code: `_router.S.router?.routes.length   // internals for the outlets module (not public API)`,
      run: () => <Row>
        <Out label="mode" value={() => _router.S.router?.mode ?? "—"} />
        <Out label="rota" value={() => String(_router.S.router?.routes.length ?? 0)} />
        <Out label="adlı outlet" value={() => [...(_router.S.router?.outlets.keys() ?? [])].join(", ") || "—"} />
        <Out label="pending" value={() => String(_router.S.pending())} />
      </Row>,
    },
    back: {
      code: `await setQuery({ step: 2 }, { replace: false })   // a new history entry
back()                                            // and back to the previous one`,
      run: () => {
        const pushed = signal(false), log = signal<string[]>([])
        const step = () => { void setQuery({ step: String(Number(query()["step"] ?? 1) + 1) }, { replace: false }).then(() => { pushed.set(true); push(log, `ileri: ?step=${query()["step"]}`) }) }
        const goBack = () => { back(); push(log, "back()") ; if (!query()["step"]) pushed.set(false) }
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={step}>Adım ekle (geçmişe yazar)</Button>
          <Button variant="secondary" disabled={() => !pushed() || !query()["step"]} onClick={goBack}>back()</Button>
          <Out label="?step" value={() => String(query()["step"] ?? "—")} />
        </Row><Log lines={log} /></div>
      },
    },
    beforeLeave: {
      code: `beforeLeave(() => !dirty() || confirm("Değişiklikler kaybolsun mu?"))
// links, navigate(), back/forward and closing the tab ask first`,
      run: () => {
        const dirty = signal(false), log = signal<string[]>([])
        beforeLeave(() => { if (!dirty()) return true; push(log, "ayrılma engellendi: kaydedilmemiş değişiklik var"); return false })
        return <div class="sc-ex-app-stack">
          <Checkbox value={dirty} label="Kaydedilmemiş değişiklik var" />
          <p class="hm-muted">İşaretliyken menüden başka bir sayfa seçmeyi dene: sayfa yerinde kalır. Kart kapanınca denetim de kalkar.</p>
          <Log lines={log} />
        </div>
      },
    },
    closeModal: {
      code: `<Button onClick={closeModal}>Kapat</Button>   // inside a page opened with navigate(to, { modal: true })`,
      run: () => {
        const isModal = () => { path(); return !!(globalThis.history.state as { hmModal?: boolean } | null)?.hmModal }
        return <Row>
          <Out label="modal açık" value={() => String(isModal())} />
          <Button variant="secondary" disabled={() => !isModal()} onClick={closeModal}>closeModal()</Button>
          <p class="hm-muted">Bu sayfa modal olarak açılmadı; düğme yalnız modal bir rotada çalışır.</p>
        </Row>
      },
    },
    compilePath: {
      code: `compilePath("/users/:id/*rest")
// { keys: ["id", "rest"], re: /^\\/users\\/([^/]+)(?:\\/(.*))?\\/?$/, score: 6 }`,
      run: () => {
        const src = signal("/orders/:id/*rest")
        const c = () => compilePath(src())
        return <div class="sc-ex-app-stack">
          <TextInput value={src} aria-label="Yol kalıbı" />
          <Row><Out label="keys" value={() => json(c().keys)} /><Out label="score" value={() => String(c().score)} /></Row>
          <Out label="re" value={() => String(c().re)} />
        </div>
      },
    },
    createRouter: {
      code: `createRouter({
  mode: "hash",
  routes: { "/": () => import("./home.tsx"), "/users/:id": { load: () => import("./user.tsx"), title: "Kişi" } },
  redirects: { "/people/:id": "/users/:id" },
})
render(() => <Router />, app)`,
      run: () => {
        // this page's own router (created once at start-up): its compiled table, tried against any path
        const to = signal("/navigation/router/item/2")
        const routes = () => _router.S.router?.routes ?? []
        const m = () => matchRoute(routes(), to())
        return <div class="sc-ex-app-stack">
          <Row><Out label="mode" value={() => _router.S.router?.mode ?? "—"} /><Out label="routes" value={() => String(routes().length)} /></Row>
          <TextInput value={to} aria-label="Denenecek yol" />
          <Row><Out label="eşleşen" value={() => m()?.route.pattern ?? "yok"} /><Out label="params" value={() => json(m()?.params ?? {})} /></Row>
        </div>
      },
    },
    fillPath: {
      code: `fillPath("/users/:id/files/*path", { id: 7, path: "a/b.txt" })   // "/users/7/files/a/b.txt"`,
      run: () => {
        const id = signal("42"), tab = signal("edit")
        return <div class="sc-ex-app-stack">
          <Row><TextInput value={id} aria-label="id" /><Segmented value={tab} options={[{ value: "edit", label: "edit" }, { value: "", label: "yok" }]} aria-label="tab" /></Row>
          <Out label='fillPath("/orders/:id/:tab?")' value={() => fillPath("/orders/:id/:tab?", { id: id(), tab: tab() })} />
        </div>
      },
    },
    Link: {
      code: `<Link href="/users" exact>Kişiler</Link>            // aria-current="page" when active
<Link href="/users/7" outlet="aside">Yanda aç</Link>
<Link href="/photos/3" modal replace>Fotoğraf</Link>`,
      play: { options: [{ key: "target", label: "Hedef", default: "query", options: [{ value: "query", label: "Bu sayfa (?color)" }, { value: "aside", label: "Yan panel" }] }, { key: "replace", label: "replace", default: false }] },
      run: (p: { values: { target: string; replace: boolean } }) => {
        const len = signal(globalThis.history.length)
        effect(() => { query(); len.set(globalThis.history.length) })
        const COLORS = [["mavi", "Mavi"], ["yesil", "Yeşil"], ["turuncu", "Turuncu"]] as const
        return <div class="sc-ex-app-stack">
          {() => { const tg = p.values.target, rep = p.values.replace; return untrack(() => tg === "aside"
            ? <Row>{PEOPLE.map((id) => <Link href={`/item/${id}`} outlet="aside" replace={rep} class="hm-btn hm-btn-secondary hm-btn-sm">{`Kayıt ${id}`}</Link>)}</Row>
            : <Row>{COLORS.map(([v, l]) => <Link href={() => `${path()}?color=${v}`} replace={rep} class="hm-btn hm-btn-secondary hm-btn-sm">{l}</Link>)}</Row>) }}
          <Row><Out label="?color" value={() => String(query()["color"] ?? "—")} /><Out label="history.length" value={() => String(len())} />
            <Button variant="ghost" size="sm" onClick={() => setQuery({ color: null, "~aside": null })}>Temizle</Button></Row>
          {() => (p.values.target === "aside" ? <div class="sc-ex-app-frame"><Outlet name="aside" empty={<p class="hm-muted">Yan panel boş.</p>} /></div> : null)}
        </div>
      },
    },
    matchRoute: {
      code: `const routes = ["/orders/:id", "/files/*path"].map((p) => ({ path: p, ...compilePath(p) }))
matchRoute(routes, "/orders/42")   // { route, params: { id: "42" }, path }`,
      run: () => {
        const to = signal("/orders/42/edit")
        const m = () => matchRoute(TABLE, to())
        return <div class="sc-ex-app-stack">
          <Row>{["/orders", "/orders/42/edit", "/files/a/b.pdf", "/team", "/yok/burada"].map((x) => <Button size="sm" variant="ghost" onClick={() => to.set(x)}>{x}</Button>)}</Row>
          <TextInput value={to} aria-label="Yol" />
          <Row><Out label="route" value={() => m()?.route.pattern ?? "null"} /><Out label="params" value={() => json(m()?.params ?? {})} /></Row>
        </div>
      },
    },
    navigate: {
      code: `await navigate("/users/42")
await navigate("/search?q=acme", { replace: true })
navigate("/photos/3", { modal: true })   // over the current page`,
      run: () => {
        // same page, other query: the route stays, only ?tab changes
        const go = (v: string) => navigate(`${path()}?tab=${v}` as never, { replace: true })
        return <Row>
          {["genel", "ayarlar", "uyeler"].map((v) => <Button size="sm" variant="secondary" onClick={() => go(v)}>{`navigate("…?tab=${v}")`}</Button>)}
          <Out label="query().tab" value={() => String(query()["tab"] ?? "—")} />
          <Button size="sm" variant="ghost" onClick={() => setQuery({ tab: null })}>Temizle</Button>
        </Row>
      },
    },
    navigating: {
      code: `<div class="bar" hidden={!navigating()} />   // true while a lazy page or a guard resolves`,
      run: () => {
        const w = watch()
        return <div class="sc-ex-app-stack">
          <Out label="navigating()" value={() => String(navigating())} />
          <p class="hm-muted">Menüden başka bir sayfaya geçip geri dön: süreler aşağıda birikir.</p>
          <Log lines={w.busy} />
        </div>
      },
    },
    navigationSignal: {
      code: `const res = await fetch("/api/orders", { signal: navigationSignal() })   // aborted when the user moves on`,
      run: () => {
        const w = watch(), active = signal(0)
        const start = () => {
          const s = navigationSignal()
          if (!s) return
          active.update((n) => n + 1)
          push(w.aborts, "istek başladı (20 sn)")
          const id = setTimeout(() => { active.update((n) => n - 1); push(w.aborts, "istek bitti") }, 20000)
          s.addEventListener("abort", () => { clearTimeout(id); active.update((n) => n - 1); push(w.aborts, "istek iptal edildi: sayfa değişti") }, { once: true })
        }
        return <div class="sc-ex-app-stack"><Row>
          <Button onClick={start}>Uzun istek başlat</Button>
          <Out label="aborted" value={() => { path(); return String(navigationSignal()?.aborted ?? "—") }} /><Out label="süren" value={active} />
        </Row><p class="hm-muted">Başlat, sonra başka sayfaya geçip geri dön.</p><Log lines={w.aborts} /></div>
      },
    },
    onRouteChange: {
      code: `onRouteChange((m) => analytics.page(m?.path))   // not on the first page; cleaned up with the owner`,
      run: () => {
        const w = watch()
        return <div class="sc-ex-app-stack">
          <Out label="şimdi" value={() => route()?.path ?? "—"} />
          <p class="hm-muted">Bu kart açıldığından beri gezilen sayfalar (başka sayfaya geçip geri dön):</p>
          <Log lines={w.routes} />
        </div>
      },
    },
    openOutlet: {
      code: `openOutlet("aside", "/users/7")   // URL: ?~aside=/users/7
openOutlet("aside", null)         // close`,
      run: () => <div class="sc-ex-app-stack">
        <Row>{PEOPLE.map((id) => <Button size="sm" variant="secondary" onClick={() => openOutlet("aside", `/item/${id}`)}>{`openOutlet("aside", "/item/${id}")`}</Button>)}
          <Button size="sm" variant="ghost" onClick={() => openOutlet("aside", null)}>null</Button></Row>
        <div class="sc-ex-app-frame"><Outlet name="aside" empty={<p class="hm-muted">Yan panel boş.</p>} /></div>
      </div>,
    },
    Outlet: {
      code: `function TeamLayout() {
  return <div class="cols"><Outlet /><Outlet name="aside" empty={<p>Bir kişi seç</p>} /></div>
}
<Outlet name="modal">{(page, close) => <Dialog open onClose={close}>{page()}</Dialog>}</Outlet>`,
      play: { options: [{ key: "frame", label: "children", default: "card", options: [{ value: "card", label: "Kart ile sar" }, { value: "none", label: "Yok" }] }, { key: "empty", label: "empty", default: true }] },
      run: (p: { values: { frame: string; empty: boolean } }) => <div class="sc-ex-app-stack">
        <Row>{PEOPLE.map((id) => <Button size="sm" variant="secondary" onClick={() => openOutlet("aside", `/item/${id}`)}>{`Kayıt ${id}`}</Button>)}
          <Button size="sm" variant="ghost" onClick={() => openOutlet("aside", null)}>Kapat</Button></Row>
        {() => {
          const fr = p.values.frame, em = p.values.empty
          const wrap = (page: () => unknown, close: () => void, to: RouteTarget) => <Card title={`Kayıt ${to.params["id"] ?? ""}`} >{page()}</Card>
          return untrack(() => <div class="sc-ex-app-frame">{h(Outlet, { name: "aside", empty: em ? <p class="hm-muted">Yan panel boş: bir kayıt seç.</p> : undefined, children: fr === "card" ? wrap : undefined })}</div>)
        }}
      </div>,
    },
    outletRoute: {
      code: `const open = () => outletRoute("aside")   // { path, params, query, meta } | null
<If when={open()}>…</If>`,
      run: () => <div class="sc-ex-app-stack">
        <Row>{PEOPLE.map((id) => <Button size="sm" variant="secondary" onClick={() => openOutlet("aside", `/item/${id}`)}>{`Kayıt ${id}`}</Button>)}
          <Button size="sm" variant="ghost" onClick={() => openOutlet("aside", null)}>Kapat</Button></Row>
        <Row><Out label='outletRoute("aside")?.path' value={() => outletRoute("aside")?.path ?? "null"} /><Out label="params" value={() => json(outletRoute("aside")?.params ?? null)} /></Row>
        <div hidden><Outlet name="aside" /></div>
      </div>,
    },
    params: {
      code: `// route "/users/:id", URL /users/42
params().id   // "42" (reactive)`,
      run: () => {
        const to = signal("/navigation/router/item/3")
        const m = () => matchRoute(_router.S.router?.routes ?? [], to())
        return <div class="sc-ex-app-stack">
          <Out label="params() (bu sayfa)" value={() => json(params())} />
          <TextInput value={to} aria-label="Yol" />
          <Out label="o yolda params()" value={() => json(m()?.params ?? {})} />
        </div>
      },
    },
    path: {
      code: `effect(() => console.log(path()))   // "/users/42"`,
      run: () => <Row><Out label="path()" value={path} /><Out label="location.hash" value={() => { query(); return globalThis.location.hash }} />
        <Button size="sm" variant="ghost" onClick={() => setQuery({ demo: String(Date.now() % 1000) })}>Sorguyu değiştir</Button></Row>,
    },
    prefetch: {
      code: `<a onPointerEnter={() => prefetch("/reports")}>Raporlar</a>   // downloads its chunks, runs nothing`,
      run: () => {
        const count = signal(preloadLinks()), to = signal("/themes")
        return <div class="sc-ex-app-stack">
          <Segmented value={to} options={["/themes", "/icons", "/forms", "/charts"].map((v) => ({ value: v, label: v }))} aria-label="Sayfa" />
          <Row><Button onClick={() => { prefetch(to()); count.set(preloadLinks()) }}>{() => `prefetch("${to()}")`}</Button><Out label="<link> ön yükleme" value={count} /></Row>
        </div>
      },
    },
    prefetchLinks: {
      code: `prefetchLinks(6)   // the routes linked from what is on screen (lowest priority)`,
      run: () => {
        const count = signal(preloadLinks())
        return <Row><Button onClick={() => { prefetchLinks(6); count.set(preloadLinks()) }}>prefetchLinks(6)</Button><Out label="<link> ön yükleme" value={count} /><Out label="görünen bağlantı" value={() => String(document.querySelectorAll("a[href^='#/']").length)} /></Row>
      },
    },
    preload: {
      code: `<Link href="/reports" onPointerEnter={() => preload("/reports")}>Raporlar</Link>   // loads (runs) the page module`,
      run: () => {
        const to = signal("/icons"), out = signal("—")
        const go = async () => { const t0 = performance.now(); await preload(to()); out.set(`${Math.round(performance.now() - t0)} ms`) }
        return <div class="sc-ex-app-stack">
          <Segmented value={to} options={["/icons", "/buttons", "/themes"].map((v) => ({ value: v, label: v }))} aria-label="Sayfa" />
          <Row><Button onClick={go}>{() => `preload("${to()}")`}</Button><Out label="süre (ikincisi önbellekten)" value={out} /></Row>
        </div>
      },
    },
    query: {
      code: `// URL /search?q=acme&tag=a&tag=b
query()   // { q: "acme", tag: ["a", "b"] }`,
      run: () => <div class="sc-ex-app-stack">
        <Row>
          <Button size="sm" variant="secondary" onClick={() => setQuery({ q: "acme" })}>q=acme</Button>
          <Button size="sm" variant="secondary" onClick={() => setQuery({ tag: ["a", "b"] })}>tag=a&tag=b</Button>
          <Button size="sm" variant="ghost" onClick={() => setQuery({ q: null, tag: null })}>Temizle</Button>
        </Row>
        <Out label="query()" value={() => json(query())} />
      </div>,
    },
    queryParam: {
      code: `const tab = queryParam("tab", "genel")
<Segmented value={tab()} onChange={tab.set} />   // the tab lives in the URL`,
      run: () => {
        const tab = queryParam("tab", "genel")
        return <Row>
          <Segmented value={tab} onChange={(v: string) => void tab.set(v === "genel" ? null : v)} options={[{ value: "genel", label: "Genel" }, { value: "ayarlar", label: "Ayarlar" }, { value: "uyeler", label: "Üyeler" }]} aria-label="Sekme" />
          <Out label="tab()" value={tab} /><Out label="location.hash" value={() => { query(); return globalThis.location.hash }} />
        </Row>
      },
    },
    route: {
      code: `route()?.route.pattern   // "/users/:id"
route()?.meta.title`,
      run: () => <Row><Out label="pattern" value={() => route()?.route.pattern ?? "null"} /><Out label="path" value={() => route()?.path ?? "—"} /><Out label="title" value={() => String(route()?.route.title ?? "—")} /></Row>,
    },
    routeError: {
      code: `<Try fallback={(e, reset) => routeError(e, reset)}><Report /></Try>`,
      run: () => {
        const on = signal(false)
        return <div class="sc-ex-app-stack">
          <Row><Button onClick={() => on.set(true)}>Yükleme hatası göster</Button></Row>
          {() => (on() ? routeError(new Error("Parça indirilemedi (ağ kesildi)"), () => on.set(false)) : null)}
        </div>
      },
    },
    Router: {
      code: `render(() => <Router
  loading={<Spinner />}        // first load
  skeleton={<PageSkeleton />}  // a page that is not here 100 ms after a click
  notFound={<NotFound />}
/>, app)`,
      play: { options: [{ key: "state", label: "Seviye", default: "page", options: [{ value: "page", label: "Sayfa" }, { value: "skeleton", label: "skeleton" }, { value: "notFound", label: "notFound" }] }] },
      run: (p: { values: { state: string } }) => <div class="sc-ex-app-stack">
        <p class="hm-muted">Bu sayfanın kendi Router'ı bir outlet seviyesinde şunları gösterir (ikinci bir Router açılmaz):</p>
        <div class="sc-ex-app-frame hm-outlet">
          <span class="sc-ex-app-tag">{() => `.hm-outlet · ${p.values.state}`}</span>
          {() => p.values.state === "skeleton" ? skeleton("card") : p.values.state === "notFound" ? h(_router.notFoundComp, {}) : <Card title="Siparişler"><p>Acme · 3 açık sipariş</p></Card>}
        </div>
        <Row><Out label="bu sayfadaki outlet" value={() => { path(); return String(document.querySelectorAll(".hm-outlet[data-depth]").length) }} /><Out label="route()" value={() => route()?.route.pattern ?? "—"} /></Row>
      </div>,
    },
    setHeadHandler: {
      code: `setHeadHandler((to, head, title) => applyHead(head, title))   // hadi-march/seo installs this`,
      run: () => <div class="sc-ex-app-stack">
        <p class="hm-muted">Bu sayfada kurulu işleyici değiştirilmez. Bir sonraki gezinmede şunları alır:</p>
        <Row><Out label="to.path" value={() => route()?.path ?? "null"} /><Out label="title" value={() => { path(); return document.title }} /></Row>
      </div>,
    },
    setMeta: {
      code: `setMeta({ title: "Sipariş 42 · Acme", description: "Sipariş ayrıntısı" })`,
      run: () => {
        const prev = document.title, title = signal(document.title)
        onCleanup(() => setMeta({ title: prev }))
        const set = (v: string) => { setMeta({ title: v }); title.set(document.title) }
        return <Row>
          <Button onClick={() => set("Sipariş 42 · Acme")}>Başlığı değiştir</Button>
          <Button variant="ghost" onClick={() => set(prev)}>Geri al</Button>
          <Out label="document.title" value={title} />
        </Row>
      },
    },
    setNavigationWrapper: {
      code: `setNavigationWrapper(async (apply, { pop }) => {
  await fadeOut(main); apply(); await fadeIn(main)   // hadi-march/motion uses it for View Transitions
})`,
      run: () => {
        // the page's own wrapper (page transitions) stays: the same kind of function, called by hand
        const log = signal<string[]>([])
        const wrapper = async (apply: () => void, o: { pop: boolean }) => { push(log, `önce (pop: ${o.pop})`); await wait(200, 0); apply(); push(log, "sonra") }
        return <div class="sc-ex-app-stack"><Row><Button onClick={() => void wrapper(() => push(log, "apply(): sayfa değişti"), { pop: false })}>Sarmalayıcıyı dene</Button></Row><Log lines={log} /></div>
      },
    },
    setQuery: {
      code: `setQuery({ page: 2, sort: "name" })   // merged into ?…, replaces history
setQuery({ sort: null })              // removes a key`,
      run: () => <div class="sc-ex-app-stack">
        <Row>
          <Button size="sm" variant="secondary" onClick={() => setQuery({ page: Number(query()["page"] ?? 1) + 1 })}>page +1</Button>
          <Button size="sm" variant="secondary" onClick={() => setQuery({ sort: query()["sort"] === "ad" ? "tarih" : "ad" })}>sort</Button>
          <Button size="sm" variant="ghost" onClick={() => setQuery({ page: null, sort: null })}>Temizle</Button>
        </Row>
        <Out label="location.hash" value={() => { query(); return globalThis.location.hash }} />
      </div>,
    },
    transitionOutlet: {
      code: `document.startViewTransition(() => apply())
transitionOutlet()?.style.setProperty("view-transition-name", "page")`,
      run: () => {
        const out = signal("—")
        const read = () => { const el = transitionOutlet() as HTMLElement | null; out.set(el ? `.hm-outlet[data-depth="${el.dataset["depth"]}"] · ${el.childElementCount} çocuk` : "null") }
        read()
        return <Row><Button onClick={read}>transitionOutlet()</Button><Out label="sonuç" value={out} /></Row>
      },
    },
  },
})
