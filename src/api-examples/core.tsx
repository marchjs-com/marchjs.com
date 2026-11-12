// API examples of the core entry (hadi-march): reactivity, rendering, control flow, portals, pipes, i18n, sx.
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import {
  signal, computed, effect, batch, untrack, selector, onCleanup, createRoot, getOwner, runWithOwner, catchError, context, provide,
  useContext, reactive, isReactive, read, DEV, _enter, _leave, _tpl, _prop, store, patch, unwrap, h, Fragment, insert, lazyChildren,
  safeUrl, registerTransition, If, Else, For, Switch, Match, Try, Await, Dynamic, setFlipHook, Portal, PortalTarget,
  portalTarget, openLayer, layers, render, define, pipe, applyPipe, toDate, t, locale, messages, missing,
  setFallbackLocale, sx, sxValue, version,
} from "hadi-march";
import { Button, Badge, Segmented } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
export { default as SIG } from "./core.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")

function Counter(props: { label?: string }) {
  const n = signal(0)
  return <Button onClick={() => n.update((x) => x + 1)}>{() => `${props.label ?? "Sayaç"}: ${n()}`}</Button>
}

export default examples({
  "hadi-march": {
    _enter: {
      code: `// written by the compiler, not by hand:
async function Profile() {
  const user = await load()      // → _enter(owner, await _leave(load()))
  onCleanup(() => …)             // still belongs to Profile
}`,
      run: () => {
        const lines = signal<string[]>([])
        const go = async () => {
          const owner = getOwner()
          const v = _enter(owner, await _leave(new Promise<string>((r) => setTimeout(() => r("veri"), 300))))
          lines.update((l) => [...l, `${now()} await sonrası sahip: ${getOwner() ? "var" : "yok"} (${v})`])
        }
        return <Row><Button onClick={go}>Bekle ve devam et</Button><Log lines={lines} /></Row>
      },
    },
    _prop: {
      code: `// written by the compiler for a template clone, not by hand:
<a class={$cls} onClick={go}>…</a>   // → _prop(a, "a", "class", …); _prop(a, "a", "onClick", go)`,
      run: () => {
        const on = signal(false)
        const a = _tpl(["button", [["type", "button"], ["class", "hm-btn"]], "Değiştir"])()
        _prop(a, "button", "aria-pressed", reactive(() => String(on())))
        _prop(a, "button", "onClick", () => on.update((x) => !x))
        return <Row>{a}<Out label="aria-pressed" value={() => String(on())} /></Row>
      },
    },
    _tpl: {
      code: `// written by the compiler, not by hand: <tr class="row"><td>{id}</td></tr> →
const _$t1 = _tpl(["tr", [["class", "row"]], ["td", []]])   // built once, cloned per row
_$t1((r) => { insert(r.firstChild, () => row().id, null) })`,
      run: () => {
        const row = _tpl(["li", [["class", "sc-tpl-row"]], "Satır ", ["b", [], ""]])
        const n = signal(0)
        const list = <ul class="sc-stack">{() => Array.from({ length: n() }, (_, i) => row((r) => { (r.lastChild as Element).textContent = String(i + 1) }))}</ul>
        return <div class="sc-stack"><Row><Button onClick={() => n.update((x) => x + 1)}>Satır ekle (kopya)</Button></Row>{list}</div>
      },
    },
    _leave: {
      code: `const v = _enter(owner, await _leave(promise))   // compiler output around every await`,
      run: () => {
        const out = signal("—")
        const go = async () => { out.set("bekleniyor…"); out.set(await _leave(new Promise<string>((r) => setTimeout(() => r("geldi"), 400)))) }
        return <Row><Button onClick={go}>_leave ile bekle</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    applyPipe: {
      code: `applyPipe("money", 1499.9)        // "₺1.499,90"
applyPipe("bytes", 3_500_000)     // "3,5 MB"
applyPipe("relative", Date.now() - 90_000)`,
      run: () => {
        const v = signal(1499.9)
        return <div class="sc-ex-stack">
          <Row><Button onClick={() => v.update((x) => x * 7.3)}>Değeri büyüt</Button><Button variant="ghost" onClick={() => v.set(1499.9)}>Sıfırla</Button></Row>
          {(["money", "number", "compact", "bytes", "percent"] as const).map((p) => <Out label={p} value={() => applyPipe(p, p === "percent" ? v() / 10000 : v())} />)}
        </div>
      },
    },
    Await: {
      code: `<Await for={fetchUser(id)} loading={<Spinner />} catch={(e) => <p>{e.message}</p>}>
  {(user) => <p>Merhaba {user.name}</p>}
</Await>`,
      play: { options: [{ key: "result", label: "Sonuç", default: "ok", options: [{ value: "ok", label: "Başarılı" }, { value: "fail", label: "Hata" }] }, { key: "ms", label: "Gecikme", default: 600, options: [{ value: 300, label: "0,3 sn" }, { value: 600, label: "0,6 sn" }, { value: 1500, label: "1,5 sn" }] }] },
      run: (p: { values: { result: string; ms: number } }) => {
        const tick = signal(0)
        const load = () => { tick(); const fail = p.values.result === "fail", ms = p.values.ms; return new Promise<string>((ok, no) => setTimeout(() => (fail ? no(new Error("Sunucu yanıt vermedi")) : ok("Acme")), ms)) }
        return <div class="sc-ex-stack">
          <Await for={load} loading={<p class="hm-muted">Yükleniyor…</p>} catch={(e: Error) => <p role="alert">{e.message}</p>}>
            {(name: string) => <p>Merhaba, <strong>{name}</strong></p>}
          </Await>
          <Button variant="ghost" onClick={() => tick.update((x) => x + 1)}>Yeniden yükle</Button>
        </div>
      },
    },
    batch: {
      code: `batch(() => { first.set("Ada"); last.set("Lovelace") })   // effects run once`,
      run: () => {
        const a = signal(0), b = signal(0), runs = signal(0)
        effect(() => { a(); b(); runs.update((x) => x + 1) })
        return <Row>
          <Button onClick={() => { a.update((x) => x + 1); b.update((x) => x + 1) }}>İki yazma</Button>
          <Button variant="primary" onClick={() => batch(() => { a.update((x) => x + 1); b.update((x) => x + 1) })}>batch ile</Button>
          <Out label="efekt çalıştı" value={runs} />
        </Row>
      },
    },
    catchError: {
      code: `catchError(() => riskyComputation(), (e) => report(e))`,
      run: () => {
        const msg = signal("—")
        const go = () => catchError(() => { effect(() => { throw new Error("hesaplama patladı") }) }, (e) => msg.set(`yakalandı: ${(e as Error).message}`))
        return <Row><Button onClick={go}>Hata fırlat</Button><Out label="Sonuç" value={msg} /></Row>
      },
    },
    computed: {
      code: `const price = signal(120), qty = signal(2)
const total = computed(() => price() * qty())   // cached, lazy`,
      run: () => {
        const price = signal(120), qty = signal(2), runs = signal(0)
        const total = computed(() => { runs.update((x) => x + 1); return price() * qty() })
        return <Row>
          <Button onClick={() => qty.update((x) => x + 1)}>Adet +1</Button>
          <Button onClick={() => price.update((x) => x + 10)}>Fiyat +10</Button>
          <Out label="adet" value={qty} /><Out label="toplam" value={total} /><Out label="hesaplama" value={runs} />
        </Row>
      },
    },
    context: {
      code: `const Theme = context("açık")
<Theme.Provider value="koyu"><Child /></Theme.Provider>
function Child() { return <p>{useContext(Theme)}</p> }`,
      run: () => {
        const Tone = context<"neutral" | "primary" | "success">("neutral")
        const Child = () => <Badge tone={useContext(Tone)}>{useContext(Tone)}</Badge>
        return <Row><Child /><Tone.Provider value="primary"><Child /></Tone.Provider><Tone.Provider value="success"><Child /></Tone.Provider></Row>
      },
    },
    createRoot: {
      code: `const stop = createRoot((dispose) => {
  effect(() => console.log(count()))
  return dispose
})
stop()   // the effect is gone`,
      run: () => {
        const n = signal(0), log = signal<string[]>([])
        let stop: (() => void) | null = null
        const start = () => { if (stop) return; stop = createRoot((dispose) => { effect(() => { const v = n(); untrack(() => log.update((l) => [...l, `efekt: ${v}`])) }); return dispose }) }
        return <div class="sc-ex-stack"><Row>
          <Button onClick={start}>Kök aç</Button><Button onClick={() => n.update((x) => x + 1)}>Değer +1</Button>
          <Button variant="ghost" onClick={() => { stop?.(); stop = null; log.update((l) => [...l, "kök kapandı"]) }}>dispose()</Button>
        </Row><Log lines={log} /></div>
      },
    },
    define: {
      code: `define("acme-greet", (p) => <b>Merhaba {p.name ?? "dünya"}</b>, { props: ["name"] })
// <acme-greet name="Ada"></acme-greet>`,
      run: () => {
        const tag = "acme-greet-demo"
        if (!customElements.get(tag)) define<"name">(tag, (p) => <strong>Merhaba, {() => p.name ?? "dünya"}</strong>, { props: ["name"] })
        const el = document.createElement(tag)
        const names = ["Ada", "Grace", "Linus"]
        let i = 0
        return <Row>{el}<Button onClick={() => el.setAttribute("name", names[i++ % names.length]!)}>name özniteliğini değiştir</Button></Row>
      },
    },
    DEV: {
      code: `DEV.enabled = true                       // dev warnings on
DEV.warn = (...a) => myLogger.warn(...a)  // where they go`,
      run: () => <Row><Out label="DEV.enabled" value={String(DEV.enabled)} /><Out label="DEV.warn" value={typeof DEV.warn} /></Row>,
    },
    Dynamic: {
      code: `const views = { kart: CardView, liste: ListView }
<Dynamic component={views[$mode]} items={items} />`,
      play: { options: [{ key: "view", label: "Bileşen", default: "badge", options: [{ value: "badge", label: "Badge" }, { value: "button", label: "Button" }, { value: "out", label: "Out" }] }] },
      run: (p: { values: { view: string } }) => {
        const views: Record<string, (q: { name: string }) => unknown> = {
          badge: (q) => <Badge tone="primary">{q.name}</Badge>,
          button: (q) => <Button>{q.name}</Button>,
          out: (q) => <Out label="ad" value={q.name} />,
        }
        const view = computed(() => views[p.values.view] as never)
        return <Dynamic component={view} name="Acme" />
      },
    },
    effect: {
      code: `const stop = effect(() => document.title = \`\${count()} yeni\`)
stop()   // dispose`,
      run: () => {
        const n = signal(0), log = signal<string[]>([])
        effect(() => { const v = n(); untrack(() => log.update((l) => [...l.slice(-5), `${now()} n = ${v}`])) })
        return <div class="sc-ex-stack"><Button onClick={() => n.update((x) => x + 1)}>n +1</Button><Log lines={log} /></div>
      },
    },
    Else: {
      code: `<If when={$user}>
  <p>Hoş geldin</p>
  <Else><button>Giriş yap</button></Else>
</If>`,
      play: { options: [{ key: "signed", label: "Oturum açık", default: false }] },
      run: (p: { values: { signed: boolean } }) => <If when={() => p.values.signed}><p>Hoş geldin, Ada</p><Else><Button variant="primary">Giriş yap</Button></Else></If>,
    },
    For: {
      code: `<For each={$todos} key="id">
  {(todo, i) => <li>{i() + 1}. {todo().text}</li>}
</For>`,
      play: { options: [{ key: "order", label: "Sıra", default: "asc", options: [{ value: "asc", label: "A→Z" }, { value: "desc", label: "Z→A" }] }, { key: "empty", label: "Boş liste", default: false }] },
      run: (p: { values: { order: string; empty: boolean } }) => {
        const items = signal([{ id: 1, name: "Ankara" }, { id: 2, name: "İzmir" }, { id: 3, name: "Bursa" }])
        let next = 4
        const shown = () => (p.values.empty ? [] : [...items()].sort((a, b) => a.name.localeCompare(b.name, "tr") * (p.values.order === "asc" ? 1 : -1)))
        return <div class="sc-ex-stack">
          <Button onClick={() => items.update((l) => [...l, { id: next, name: ["Antalya", "Eskişehir", "Konya", "Trabzon"][next++ % 4]! }])}>Şehir ekle</Button>
          <ol class="sc-ex-log"><For each={shown} key="id" fallback={<li>Liste boş</li>}>{(c: () => { name: string }, i: () => number) => <li>{() => `${i() + 1}. ${c().name}`}</li>}</For></ol>
        </div>
      },
    },
    Fragment: {
      code: `<><dt>Ad</dt><dd>Ada</dd></>   // siblings, no wrapper element`,
      play: { options: [{ key: "n", label: "Satır", default: 2, options: [1, 2, 3] }] },
      run: (p: { values: { n: number } }) => {
        const rows = [["Ad", "Ada"], ["Şehir", "İzmir"], ["Rol", "Yönetici"]]
        return <dl class="sc-row">{() => rows.slice(0, p.values.n).map(([k, v]) => <Fragment><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
      },
    },
    getOwner: {
      code: `const owner = getOwner()
const data = await load()
runWithOwner(owner, () => effect(() => …))   // cleaned up with the component`,
      run: () => <Out label="getOwner()" value={getOwner() ? "bu bileşenin sahibi" : "null"} />,
    },
    h: {
      code: `h("button", { class: "hm-btn", onClick: save }, "Kaydet")
h(Badge, { tone: "primary" }, "Yeni")`,
      run: () => <Row>{h("button", { type: "button", class: "hm-btn", onClick: () => alert("h() ile oluşturuldu") }, "h() düğmesi")}{h(Badge, { tone: "primary" }, "h(Badge)")}</Row>,
    },
    If: {
      code: `<If when={$count > 3} else={<p>Az</p>}>
  <p>Çok</p>
</If>`,
      play: { options: [{ key: "n", label: "Sayı", default: 2, options: [0, 2, 4, 8] }] },
      run: (p: { values: { n: number } }) => <If when={() => p.values.n > 3} else={<Badge>{() => `${p.values.n}: az`}</Badge>}><Badge tone="success">{() => `${p.values.n}: çok`}</Badge></If>,
    },
    insert: {
      code: `insert(document.body, () => \`Saat: \${clock()}\`)   // a live region`,
      run: () => {
        const host = document.createElement("div")
        const c = signal(now())
        const id = setInterval(() => c.set(now()), 1000)
        onCleanup(() => clearInterval(id))
        insert(host, () => `Saat: ${c()}`)
        return host
      },
    },
    isReactive: {
      code: `isReactive(signal(1))   // true
isReactive(() => 1)      // false (plain function)`,
      run: () => <Row><Out label="signal" value={String(isReactive(signal(1)))} /><Out label="computed" value={String(isReactive(computed(() => 1)))} /><Out label="() => 1" value={String(isReactive(() => 1))} /></Row>,
    },
    layers: {
      code: `layers()   // [{ kind: "dialog", el }, { kind: "toast", el }]`,
      run: () => {
        const list = signal<string[]>([])
        const read = () => list.set(layers().map((l, i) => `${i + 1}. ${l.kind}`))
        return <div class="sc-ex-stack"><Button onClick={read}>Açık katmanları oku</Button><Log lines={list} /></div>
      },
    },
    lazyChildren: {
      code: `// compiler output for component children:
h(Card, null, lazyChildren(() => [h("p", null, "…")]))`,
      run: () => {
        const made = signal(0)
        const kids = lazyChildren(() => { made.update((x) => x + 1); return <p>Çocuklar şimdi oluşturuldu</p> })
        const show = signal(false)
        return <div class="sc-ex-stack"><Row><Button onClick={() => show.set(true)}>Göster</Button><Out label="oluşturma" value={made} /></Row>{() => (show() ? kids() : null)}</div>
      },
    },
    locale: {
      code: `locale()          // "tr"
effect(() => console.log(locale()))`,
      run: () => <Out label="locale()" value={locale} />,
    },
    Match: {
      code: `<Switch fallback={<p>Bilinmiyor</p>}>
  <Match when={$status === "ok"}>Tamam</Match>
  <Match when={$status === "err"}>Hata</Match>
</Switch>`,
      play: { options: [{ key: "status", label: "Durum", default: "ok", options: [{ value: "ok", label: "ok" }, { value: "err", label: "err" }, { value: "x", label: "başka" }] }] },
      run: (p: { values: { status: string } }) => <Switch fallback={<Badge>Bilinmiyor</Badge>}>
        <Match when={() => p.values.status === "ok"}><Badge tone="success">Tamam</Badge></Match>
        <Match when={() => p.values.status === "err"}><Badge tone="danger">Hata</Badge></Match>
      </Switch>,
    },
    messages: {
      code: `messages("tr", { greet: "Merhaba {name}" })
t("greet", { name: "Ada" })   // "Merhaba Ada"`,
      run: () => { messages("tr", { "api.ex.greet": "Merhaba {name}" }); messages("en", { "api.ex.greet": "Hello {name}" }); return <Out label='t("api.ex.greet")' value={() => t("api.ex.greet", { name: "Ada" })} /> },
    },
    missing: {
      code: `missing()   // { tr: ["checkout.title"] } — keys looked up but not translated`,
      run: () => {
        const out = signal("—")
        return <Row><Button onClick={() => { t("api.ex.yok"); out.set(JSON.stringify(missing()["tr"]?.slice(-3) ?? [])) }}>Eksik anahtarı ara</Button><Out label="missing().tr (son 3)" value={out} /></Row>
      },
    },
    onCleanup: {
      code: `const id = setInterval(tick, 1000)
onCleanup(() => clearInterval(id))`,
      run: () => {
        const on = signal(true), log = signal<string[]>([])
        const Timer = () => { const n = signal(0); const id = setInterval(() => n.update((x) => x + 1), 500); onCleanup(() => { clearInterval(id); log.update((l) => [...l, "onCleanup: zamanlayıcı durdu"]) }); return <Out label="sayaç" value={n} /> }
        return <div class="sc-ex-stack"><Row><Button onClick={() => on.update((x) => !x)}>{() => (on() ? "Kaldır" : "Geri ekle")}</Button>{() => (on() ? <Timer /> : null)}</Row><Log lines={log} /></div>
      },
    },
    openLayer: {
      code: `const close = openLayer("toast", el)   // stacked above the page
close()`,
      run: () => {
        const open = () => {
          const el = <div class="hm-card sc-ex-layer" role="status">openLayer("toast") ile açıldı</div> as HTMLElement
          const close = openLayer("toast", el)
          setTimeout(close, 1800)
        }
        return <Button onClick={open}>Katman aç (1,8 sn)</Button>
      },
    },
    patch: {
      code: `const user = store({ name: "Ada", address: { city: "İzmir" } })
patch(user, { address: { city: "Ankara" } })   // one batch, deep merge`,
      run: () => {
        const s = store({ name: "Ada", address: { city: "İzmir", zip: "35000" } })
        return <Row><Button onClick={() => patch(s, { address: { city: s.address.city === "İzmir" ? "Ankara" : "İzmir" } })}>Şehri değiştir</Button><Out label="adres" value={() => `${s.address.city} ${s.address.zip}`} /></Row>
      },
    },
    pipe: {
      code: `pipe("stars", (n: number) => "★".repeat(n))
<p>{rating | stars}</p>`,
      run: () => {
        pipe("stars", (n: unknown) => "★".repeat(Number(n)) + "☆".repeat(5 - Number(n)))
        const n = signal(3)
        return <Row><Button onClick={() => n.set((n() % 5) + 1)}>Puan</Button><Out label="rating | stars" value={() => applyPipe("stars", n()) as string} /></Row>
      },
    },
    Portal: {
      code: `<Portal to="toolbar"><button>Kaydet</button></Portal>   // rendered in <PortalTarget name="toolbar">
<Portal layer="popover">…</Portal>`,
      play: { options: [{ key: "show", label: "Portal açık", default: true }] },
      run: (p: { values: { show: boolean } }) => <div class="sc-ex-stack">
        <PortalTarget name="api-ex-bar" class="sc-row sc-ex-target" label="Hedef" />
        <p class="hm-muted">Bu satırdaki kaynak, düğmeyi yukarıdaki hedefe çizer:</p>
        {() => (p.values.show ? <Portal to="api-ex-bar"><Button variant="primary">Kaydet (portal)</Button></Portal> : null)}
      </div>,
    },
    portalTarget: {
      code: `effect(() => console.log(portalTarget("toolbar")))   // Element | null`,
      run: () => {
        const on = signal(false)
        return <div class="sc-ex-stack"><Row><Button onClick={() => on.update((x) => !x)}>Hedefi aç / kapat</Button><Out label='portalTarget("api-ex-t")' value={() => (portalTarget("api-ex-t") ? "Element" : "null")} /></Row>{() => (on() ? <PortalTarget name="api-ex-t" /> : null)}</div>
      },
    },
    PortalTarget: {
      code: `<PortalTarget name="actions" class="toolbar" />
// anywhere below: <Portal to="actions">…</Portal>`,
      play: { options: [{ key: "n", label: "Kaynak sayısı", default: 2, options: [1, 2, 3] }] },
      run: (p: { values: { n: number } }) => <div class="sc-ex-stack">
        <PortalTarget name="api-ex-actions" class="sc-row sc-ex-target" label="Eylemler" />
        {() => Array.from({ length: p.values.n }, (_, i) => <Portal to="api-ex-actions" order={i}><Badge tone="primary">{`kaynak ${i + 1}`}</Badge></Portal>)}
      </div>,
    },
    provide: {
      code: `const Lang = context("tr")
provide(Lang, "en")   // for everything created after this call`,
      run: () => {
        const Lang = context("tr")
        const Show = () => <Out label="useContext(Lang)" value={useContext(Lang)} />
        const Inner = () => { provide(Lang, "en"); return <Show /> }
        return <Row><Show /><Inner /></Row>
      },
    },
    reactive: {
      code: `const label = reactive(() => \`\${n()} öğe\`)
isReactive(label)   // true: h() keeps it live`,
      run: () => {
        const n = signal(1)
        const label = reactive(() => `${n()} öğe`)
        return <Row><Button onClick={() => n.update((x) => x + 1)}>+1</Button>{h("span", { class: "sc-ex-val" }, label)}<Out label="isReactive" value={String(isReactive(label))} /></Row>
      },
    },
    read: {
      code: `read(5)               // 5
read(() => count())   // the current value`,
      run: () => { const n = signal(7); return <Row><Out label="read(5)" value={String(read(5))} /><Out label="read(signal)" value={String(read(n))} /></Row> },
    },
    registerTransition: {
      code: `registerTransition("fade", (el, dir, done) => fade(el, dir).then(done))
<div transition="fade">…</div>`,
      run: () => <p class="hm-muted">hadi-march/motion bu kancayla geçişlerini kaydeder; <code>transition="fade"</code> gibi her öğe onu kullanır.</p>,
    },
    render: {
      code: `const dispose = render(() => <App />, document.getElementById("app"))
dispose()   // unmount`,
      run: () => {
        const host = document.createElement("div")
        let dispose: (() => void) | null = null
        const mount = signal(false)
        const toggle = () => { if (dispose) { dispose(); dispose = null; mount.set(false) } else { dispose = render(() => <Counter label="Ayrı kök" />, host); mount.set(true) } }
        onCleanup(() => dispose?.())
        return <Row><Button onClick={toggle}>{() => (mount() ? "dispose()" : "render()")}</Button>{host}</Row>
      },
    },
    runWithOwner: {
      code: `const owner = getOwner()
setTimeout(() => runWithOwner(owner, () => onCleanup(stop)), 100)`,
      run: () => {
        const owner = getOwner(), log = signal<string[]>([])
        setTimeout(() => runWithOwner(owner, () => { log.update((l) => [...l, "zamanlayıcıdan sonra: sahibe bağlandı"]); onCleanup(() => console.info("temizlendi")) }), 300)
        return <Log lines={log} />
      },
    },
    safeUrl: {
      code: `safeUrl("https://acme.example")     // kept
safeUrl("javascript:alert(1)")      // "about:blank"`,
      run: () => <div class="sc-ex-stack">{["https://acme.example", "/docs", "mailto:info@acme.example", "javascript:alert(1)"].map((u) => <Out label={u} value={safeUrl(u)} />)}</div>,
    },
    setFallbackLocale: {
      code: `setFallbackLocale("en")   // missing Turkish keys show English`,
      run: () => { messages("en", { "api.ex.only-en": "Only in English" }); setFallbackLocale("en"); return <Out label='t("api.ex.only-en")' value={() => t("api.ex.only-en")} /> },
    },
    setFlipHook: {
      code: `import { installFlip } from "hadi-march/motion"
installFlip()   // calls setFlipHook(flip): <For animate> moves rows smoothly`,
      run: () => <p class="hm-muted"><code>{"<For animate>"}</code> yeniden sıralamayı bu kancayla canlandırır; hadi-march/motion içindeki installFlip() onu kurar.</p>,
    },
    setLocale: {
      code: `await setLocale("en")   // loads a lazy pack first, updates <html lang dir>`,
      run: () => {
        messages("en", { "api.ex.hello": "Hello" }); messages("tr", { "api.ex.hello": "Merhaba" })
        const lang = signal("tr")
        // only this demo's text: the page language stays as it is
        return <Row><Segmented value={lang} onChange={(v: string) => lang.set(v)} options={[{ value: "tr", label: "tr" }, { value: "en", label: "en" }]} aria-label="Dil" />
          <Out label='t("api.ex.hello")' value={() => (lang() === locale() ? t("api.ex.hello") : lang() === "en" ? "Hello" : "Merhaba")} /></Row>
      },
    },
    selector: {
      code: `const isSelected = selector(() => $selected)
<For each={$rows} key="id">{(row) =>
  <tr class={isSelected(row().id) ? "danger" : ""}>…</tr>}</For>
// choosing a row wakes two rows (the old and the new one), not all of them`,
      run: () => {
        const sel = signal(2), wakes = signal(0)
        const isSel = selector(sel)
        const ids = [1, 2, 3, 4, 5]
        // one effect per row, counting how often a row wakes up
        for (const id of ids) effect(() => { isSel(id); untrack(() => wakes.update((x) => x + 1)) })
        return <div class="sc-stack"><Row>{ids.map((id) => <Button variant={isSel(id) ? "primary" : "secondary"} onClick={() => sel.set(id)}>{id}</Button>)}</Row><Out label="satır uyanması (toplam)" value={wakes} /></div>
      },
    },
    signal: {
      code: `const count = signal(0)
count()            // read
count.set(1)       // write
count.update((n) => n + 1)`,
      run: () => <Counter />,
    },
    store: {
      code: `const cart = store({ items: [] as Item[] })
cart.items.push({ name: "Kalem" })   // only what read items updates`,
      run: () => {
        const cart = store({ items: [{ name: "Kalem" }] })
        return <div class="sc-ex-stack"><Row><Button onClick={() => cart.items.push({ name: `Ürün ${cart.items.length + 1}` })}>Ekle</Button><Out label="adet" value={() => cart.items.length} /></Row>
          <ol class="sc-ex-log"><For each={() => cart.items}>{(i: () => { name: string }) => <li>{() => i().name}</li>}</For></ol></div>
      },
    },
    Switch: {
      code: `<Switch fallback={<Empty />}>
  <Match when={$loading}><Spinner /></Match>
  <Match when={$error}>{(e) => <ErrorBox error={e} />}</Match>
</Switch>`,
      play: { options: [{ key: "state", label: "Durum", default: "loading", options: [{ value: "loading", label: "Yükleniyor" }, { value: "error", label: "Hata" }, { value: "empty", label: "Boş" }] }] },
      run: (p: { values: { state: string } }) => <Switch fallback={<p class="hm-muted">Kayıt yok</p>}>
        <Match when={() => p.values.state === "loading"}><p aria-live="polite">Yükleniyor…</p></Match>
        <Match when={() => (p.values.state === "error" ? "Bağlantı koptu" : null)}>{(e: string) => <p role="alert">Hata: {e}</p>}</Match>
      </Switch>,
    },
    sx: {
      code: `sx({ p: 3, radius: 2, shadow: 1 })   // "hm-p-3 hm-radius-2 hm-shadow-1"`,
      run: () => <div class="sc-ex-stack"><Out label="sx({ p: 3, radius: 2 })" value={sx({ p: 3, radius: 2 })} /><div class={sx({ p: 3, radius: 2 })}>sx ile kenar boşluğu ve köşe</div></div>,
    },
    sxValue: {
      code: `<div sx={$big ? { p: 4 } : { p: 1 }} />   // compiler: class={sxValue(…)}`,
      run: () => { const big = signal(false); return <Row><Button onClick={() => big.update((x) => !x)}>Değiştir</Button><Out label="sxValue" value={() => sxValue(big() ? { p: 4 } : { p: 1 })} /></Row> },
    },
    t: {
      code: `t\`Merhaba \${name}\`                    // key "Merhaba {0}"
t("cart.items", { n: 3 })              // ICU plural`,
      run: () => {
        messages("tr", { "api.ex.items": "{n, plural, =0 {Sepet boş} one {# ürün} other {# ürün}}" })
        messages("en", { "api.ex.items": "{n, plural, =0 {Empty cart} one {# item} other {# items}}" })
        const n = signal(0)
        return <Row><Button onClick={() => n.update((x) => x + 1)}>Ürün ekle</Button><Button variant="ghost" onClick={() => n.set(0)}>Boşalt</Button><Out label="t" value={() => t("api.ex.items", { n: n() })} /></Row>
      },
    },
    toDate: {
      code: `toDate(1700000000)            // epoch seconds
toDate({ seconds: 1700000000 }) // Firestore-style
toDate("bozuk")               // null`,
      run: () => <div class="sc-ex-stack">{[["1700000000", 1700000000], ["\"2026-11-12\"", "2026-11-12"], ["{ seconds }", { seconds: 1700000000 }], ["\"bozuk\"", "bozuk"]].map(([l, v]) => <Out label={l as string} value={toDate(v)?.toLocaleDateString("tr-TR") ?? "null"} />)}</div>,
    },
    Try: {
      code: `<Try fallback={(e, reset) => <ErrorBox error={e} onRetry={reset} />}>
  <Chart data={data} />
</Try>`,
      play: { options: [{ key: "fail", label: "Bileşen hata versin", default: false }] },
      run: (p: { values: { fail: boolean } }) => {
        const Risky = () => { if (p.values.fail) throw new Error("Grafik verisi bozuk"); return <Badge tone="success">Çizildi</Badge> }
        return <div>{() => { const fail = p.values.fail; return <Try log={false} fallback={(e: Error, reset: () => void) => <Row><span role="alert">{e.message}</span><Button size="sm" onClick={reset}>Yeniden dene</Button></Row>}><Risky /></Try> }}</div>
      },
    },
    untrack: {
      code: `effect(() => log(a(), untrack(() => b())))   // re-runs only when a changes`,
      run: () => {
        const a = signal(0), b = signal(0), runs = signal(0)
        effect(() => { a(); untrack(() => b()); untrack(() => runs.update((x) => x + 1)) })
        return <Row><Button onClick={() => a.update((x) => x + 1)}>a +1</Button><Button onClick={() => b.update((x) => x + 1)}>b +1 (untrack)</Button><Out label="efekt" value={runs} /></Row>
      },
    },
    unwrap: {
      code: `const s = store({ a: 1 })
JSON.stringify(unwrap(s))   // the plain object, no tracking`,
      run: () => { const s = store({ name: "Acme", tags: ["a", "b"] }); return <Out label="unwrap(s)" value={JSON.stringify(unwrap(s))} /> },
    },
    useContext: {
      code: `const Size = context<"sm" | "md">("md")
const size = useContext(Size)`,
      run: () => {
        const Size = context<"sm" | "md" | "lg">("md")
        const B = () => <Button size={useContext(Size)}>{useContext(Size)}</Button>
        return <Row><Size.Provider value="sm"><B /></Size.Provider><B /><Size.Provider value="lg"><B /></Size.Provider></Row>
      },
    },
    version: {
      code: `import { version } from "hadi-march"   // "0.1.0"`,
      run: () => <Out label="version" value={version} />,
    },
  },
})
