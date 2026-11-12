// API examples of hadi-march/net/mock (in-memory server), hadi-march/sw (shown without registering or removing a
// worker) and hadi-march/errors. Layout and rules: tools/api-examples.js.
import { signal, effect, onCleanup } from "hadi-march";
import { Button, Badge } from "hadi-march/ui";
import { Net, createNet, AppError, ManagedSocket } from "hadi-march/net";
import { crud, fake, fromOpenApi, mock, MockReply, mockRequested, mockSocketServer, MockTransport, reply, rng, sample } from "hadi-march/net/mock";
import { registerServiceWorker, applyUpdate, swState, unregisterServiceWorker } from "hadi-march/sw";
import { emitError, ErrorInline, ErrorPage, errors, setErrorSink } from "hadi-march/errors";
import { Out, Log, Row } from "./_kit.tsx";
import { J, msg, now, lines, Text, Pre, Tags } from "./_net.tsx";
import { mockNet } from "./_mocknet.ts";
import { examples } from "./types.ts";
export { default as SIG } from "./mock.sig.gen.ts";

const PETS = {
  openapi: "3.0.0",
  paths: {
    "/pets": { get: { responses: { "200": { content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Pet" } } } } } } } },
    "/pets/{id}": { get: { responses: { "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } } } } },
  },
  components: { schemas: { Pet: { type: "object", properties: { id: { type: "integer", minimum: 1, maximum: 99 }, name: { type: "string" }, kind: { type: "string", enum: ["kedi", "köpek", "kuş"] } } } } },
};

/** True when hadi-march/errors collects reported errors now (probe with a unique, silent error, then drop it). */
function collectorOn(): boolean {
  const probe = new AppError(`probe-${Date.now()}-${Math.random()}`, { severity: "info" });
  let hit = false;
  const off = errors.on("error:captured", (c) => { if (c.error === probe) hit = true; });
  emitError(probe);
  off();
  if (hit) errors.list.set(errors.list.peek().filter((c) => c.error !== probe));
  return hit;
}
/** Put back the collector that was there before (or none). */
const restoreSink = (had: boolean): void => setErrorSink(had ? (e) => { errors.capture(e); } : null);

export default examples({
  "hadi-march/net/mock": {
    crud: {
      code: `net.mock({ ...crud("/todos", [{ id: "1", title: "Süt al" }]) })
await net.post("/todos", { title: "Ekmek" })   // 201, stored in memory
await net.get("/todos", { query: { q: "süt" } })`,
      run: () => {
        const todos = crud("/todos", [{ id: "1", title: "Süt al" }, { id: "2", title: "Faturayı öde" }])
        const n = mockNet(todos, 80), list = signal<{ id: string; title: string }[]>([]), title = signal("Ekmek al")
        const refresh = () => n.get<{ id: string; title: string }[]>("/todos", { policy: "parallel" }).then((l) => list.set(l))
        void refresh()
        return <div class="sc-ex-stack"><Row><Text label="Başlık" value={title} /><Button onClick={() => n.post("/todos", { title: title() }).then(refresh)}>Ekle</Button></Row>
          <ul class="sc-ex-net-tags" aria-label="Görevler">{() => list().map((t) => <li>{t.title} <Button size="sm" variant="ghost" aria-label={`${t.title} sil`} onClick={() => n.delete(`/todos/${t.id}`).then(refresh)}>×</Button></li>)}</ul></div>
      },
    },
    fake: {
      code: `const f = fake(7)
f.name()    // same seed → same names
f.list(3, () => ({ id: f.id(), email: f.email() }))`,
      run: () => {
        const seed = signal(7)
        const rows = () => { const f = fake(seed()); return f.list(3, () => { const name = f.name(); return `${name} · ${f.email(name)} · ${f.date(30)}` }) }
        return <div class="sc-ex-stack"><Row>{[1, 7, 42].map((s) => <Button variant={() => (seed() === s ? "primary" : "secondary")} onClick={() => seed.set(s)}>{`seed ${s}`}</Button>)}</Row><Tags label="Sahte veri" items={rows} /></div>
      },
    },
    fromOpenApi: {
      code: `const handlers = fromOpenApi(openapiDoc)   // examples, else data from the schemas
net.mock(handlers)   // net.mock(openapiDoc) does the same`,
      run: () => {
        const h = fromOpenApi(PETS), n = mockNet(h, 80), out = signal("—")
        return <div class="sc-ex-stack"><Tags label="Rotalar" items={() => Object.keys(h)} />
          <Row><Button onClick={() => n.get("/pets", { policy: "parallel" }).then((r) => out.set(J(r)))}>GET /pets</Button><Button variant="ghost" onClick={() => n.get("/pets/3", { policy: "parallel" }).then((r) => out.set(J(r)))}>GET /pets/3</Button></Row><Pre text={out} /></div>
      },
    },
    mock: {
      code: `const m = mock(net, { "GET /me": { name: "Ada" } }, { delay: [80, 250] })
m.set({ errorRate: 0.3 })   // flaky network
m.restore()                 // back to the real transport`,
      run: () => {
        const n = createNet(), log = lines(), rate = signal(0)
        const m = mock(n, { "GET /me": { name: "Ada" } }, { delay: [80, 250], seed: 3 })
        onCleanup(() => m.restore())
        const setRate = (r: number) => { rate.set(r); m.set({ errorRate: r }) }
        const go = () => n.get<{ name: string }>("/me", { policy: "parallel", retry: 0, report: false }).then((u) => log.push(`✓ ${u.name}`), (e) => log.push(`✖ ${msg(e)}`))
        return <div class="sc-ex-stack"><Row><Button onClick={go}>GET /me</Button>{[0, 0.5].map((r) => <Button variant={() => (rate() === r ? "primary" : "ghost")} onClick={() => setRate(r)}>{`hata %${r * 100}`}</Button>)}
          <Out label="Yanıtlanan" value={m.transport.hits} /></Row><Log lines={log} /></div>
      },
    },
    MockReply: {
      code: `net.mock({ "POST /files": () => new MockReply(201, { id: "f1" }, { location: "/files/f1" }) })`,
      run: () => {
        const out = signal("—")
        const n = mockNet({ "POST /files": () => new MockReply(201, { id: "f1" }, { location: "/files/f1" }) }, 80)
        return <Row><Button onClick={() => n.send({ url: "/files", method: "POST", body: {} }).then((r) => out.set(`${r.status} · location: ${r.headers["location"]} · ${J(r.data)}`))}>POST /files</Button><Out label="Yanıt" value={out} /></Row>
      },
    },
    mockRequested: {
      code: `if (mockRequested()) net.mock(handlers)   // march dev --mock, or ?mock in the url`,
      run: () => <Row><Out label="mockRequested()" value={String(mockRequested())} /><Out label="Sayfa sorgusu" value={location.search || "(boş)"} /></Row>,
    },
    mockSocketServer: {
      code: `const srv = mockSocketServer()
srv.ws("/prices", (client) => client.send({ type: "hello" }))
const s = new ManagedSocket("ws://x/prices", { factory: srv.factory })
srv.publish("/prices", "EURTRY", 36.1)   // to subscribers of the topic`,
      run: () => {
        const srv = mockSocketServer(() => 100), log = lines(), price = signal(36)
        srv.ws("/prices")
        const s = new ManagedSocket<{ topic: string; data: number }>("ws://mock.local/prices", { factory: srv.factory, heartbeat: false })
        const off = s.subscribe("EURTRY", (m) => log.push(`EURTRY ${m.data.toFixed(2)}`))
        onCleanup(() => { off(); s.close() })
        const pub = () => { price.update((p) => p + 0.13); log.push(`publish → ${srv.publish("/prices", "EURTRY", price.peek())} istemci`) }
        return <div class="sc-ex-stack"><Row><Button onClick={pub}>Yayınla</Button><Button variant="ghost" onClick={() => srv.drop("/prices")}>Bağlantıları düşür</Button><Out label="Durum" value={() => s.state()} /></Row><Log lines={log} /></div>
      },
    },
    MockTransport: {
      code: `const t = new MockTransport({ "GET /stock": { left: 3 } }, { delay: 100, errorRate: 0.2, seed: 1 })
const n = new Net().transport(t, "http")
t.set({ delay: 2000 })   // slow network at run time`,
      run: () => {
        const t = new MockTransport({ "GET /stock": (r) => ({ left: r.fake.int(0, 9) }) }, { delay: 40, errorRate: 0.3, seed: 5 })
        const n = new Net().transport(t, "http"), ok = signal(0), bad = signal(0)
        const burst = () => { for (let i = 0; i < 10; i++) n.get("/stock", { policy: "parallel", retry: 0, report: false }).then(() => ok.update((x) => x + 1), () => bad.update((x) => x + 1)) }
        return <Row><Button onClick={burst}>10 istek (%30 hata)</Button><Out label="Başarılı" value={ok} /><Out label="503" value={bad} /><Out label="hits" value={t.hits} /></Row>
      },
    },
    reply: {
      code: `net.mock({
  "POST /login": (r) => r.body.password === "doğru" ? { token: "t1" } : reply(401, { message: "Şifre yanlış" }),
})`,
      run: () => {
        const pw = signal("yanlış"), out = signal("—")
        const n = mockNet({ "POST /login": (r) => (r.body.password === "doğru" ? { token: "t1" } : reply(401, { message: "Şifre yanlış" })) }, 80)
        const go = () => n.post<{ token: string }>("/login", { password: pw() }, { report: false }).then((r) => out.set(`token: ${r.token}`), (e: AppError) => out.set(`${e.status} · ${e.message}`))
        return <Row><Text label="Şifre" value={pw} /><Button onClick={go}>Giriş</Button><Button variant="ghost" onClick={() => pw.set("doğru")}>Doğru şifre</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    rng: {
      code: `const r = rng(42)
r()   // 0.6011… — the same sequence for the same seed`,
      run: () => {
        const seed = signal("42")
        return <div class="sc-ex-stack"><Text label="Tohum" value={seed} /><Tags label="Sayılar" items={() => { const r = rng(Number(seed()) || 0); return [1, 2, 3, 4, 5].map(() => r().toFixed(4)) }} /></div>
      },
    },
    sample: {
      code: `sample({ type: "object", properties: { id: { type: "integer" }, email: { type: "string" } } }, doc, fake(1))
// { id: 412, email: "sam.reed@example.com" }`,
      run: () => {
        const seed = signal(1)
        const schema = { type: "object", properties: { id: { type: "integer", minimum: 1, maximum: 500 }, name: { type: "string" }, email: { type: "string", format: "email" }, joined: { type: "string", format: "date" }, plan: { type: "string", enum: ["free", "pro", "team"] } } }
        return <div class="sc-ex-stack"><Row><Button onClick={() => seed.update((s) => s + 1)}>Yeni tohum</Button><Out label="seed" value={seed} /></Row><Pre text={() => J(sample(schema, {}, fake(seed())))} /></div>
      },
    },
  },
  "hadi-march/sw": {
    applyUpdate: {
      code: `registerServiceWorker({ onUpdate: () => toast("Yeni sürüm hazır", { action: { label: "Yenile", onClick: applyUpdate } }) })`,
      run: () => {
        const out = signal("—")
        const go = () => { if (swState() === "update") { applyUpdate(); return } applyUpdate(); out.set("bekleyen sürüm yok: çağrı etkisiz kaldı") }
        return <Row><Button onClick={go}>applyUpdate()</Button><Out label="swState" value={swState} /><Out label="Sonuç" value={out} /></Row>
      },
    },
    registerServiceWorker: {
      code: `const reg = await registerServiceWorker({
  onUpdate: () => showUpdateBanner(),
  onReady: () => console.log("offline ready"),
})   // null where unsupported (file://, old browsers)`,
      run: () => {
        const plan = signal("—")
        const dry = () => {
          const ok = "serviceWorker" in navigator && /^https?:$/.test(location.protocol)
          plan.set(ok ? `kaydedilecek: ${new URL("sw.js", location.href).pathname} (burada çağrılmadı)` : "desteklenmiyor → null döner")
        }
        return <div class="sc-ex-stack"><Row><Button onClick={dry}>Kuru deneme</Button><Out label="Parametre sayısı" value={String(registerServiceWorker.length)} /><Out label="swState" value={swState} /></Row><Out label="Plan" value={plan} /></div>
      },
    },
    swState: {
      code: `<Badge>{() => swState()}</Badge>   // off | installing | ready | update | blocked | error`,
      run: () => <Row><Badge tone={() => (swState() === "ready" ? "success" : swState() === "update" ? "warn" : "neutral")}>{swState}</Badge>
        <Out label="Çevrimdışı önbellek" value={() => (swState() === "ready" ? "etkin" : "kapalı")} /></Row>,
    },
    unregisterServiceWorker: {
      code: `await unregisterServiceWorker()   // removes the worker and its march-* caches
toast("Çevrimdışı veriler silindi")`,
      run: () => {
        const names = signal<string[]>([])
        const look = async () => { const all = globalThis.caches ? await caches.keys() : []; names.set(all.filter((k) => k.startsWith("march-")).concat(all.some((k) => k.startsWith("march-")) ? [] : ["(march-* önbelleği yok)"])) }
        void look()
        return <div class="sc-ex-stack"><Row><Button variant="ghost" onClick={look}>Yenile</Button><Out label="Silinecekler" value={() => `${names().length} kayıt`} /><Out label="İşlev" value={typeof unregisterServiceWorker} /></Row><Tags label="Önbellekler" items={names} /></div>
      },
    },
  },
  "hadi-march/errors": {
    emitError: {
      code: `emitError(new AppError("Senkron başarısız", { type: "server", source: "manual" }))
// goes to the collector of hadi-march/errors (nothing happens until it is installed)`,
      run: () => {
        const log = lines()
        const go = () => {
          const had = collectorOn()
          setErrorSink((e) => log.push(`toplayıcı aldı: ${e.type} · ${e.message}`))
          try { emitError(new AppError("Senkron başarısız", { type: "server" })) } finally { restoreSink(had) }
          log.push(`önceki toplayıcı ${had ? "geri kondu" : "yoktu, yine yok"}`)
        }
        return <div class="sc-ex-stack"><Button onClick={go}>emitError()</Button><Log lines={log} /></div>
      },
    },
    ErrorInline: {
      code: `errors.rule({ type: "validation" }, "inline")
<ErrorInline target="profile" />   // shows errors whose context.target is "profile"`,
      play: { options: [{ key: "type", label: "Tür", default: "validation", options: [{ value: "validation", label: "Doğrulama" }, { value: "conflict", label: "Çakışma" }] }, { key: "fields", label: "Alan hataları", default: true }] },
      run: (p: { values: { type: "validation" | "conflict"; fields: boolean } }) => {
        const target = "ex-profile"
        const show = () => errors.inline(target).set(new AppError(p.values.type === "conflict" ? "Profil başka bir sekmede değişti" : "Profil kaydedilemedi", { type: p.values.type, context: { target, ...(p.values.fields ? { fields: { email: "Geçerli bir e-posta girin", phone: "En az 10 hane" } } : {}) } }))
        effect(() => { p.values.type; p.values.fields; if (errors.inline(target).peek()) show() })
        onCleanup(() => errors.clear({ target }))
        return <div class="sc-ex-stack"><ErrorInline target={target} /><Row><Button onClick={show}>Hatayı göster</Button></Row></div>
      },
    },
    ErrorPage: {
      code: `errors.rule({ type: "auth" }, "page")
<ErrorPage><Outlet /></ErrorPage>   // the page error replaces the content`,
      play: { options: [{ key: "type", label: "Tür", default: "auth", options: [{ value: "auth", label: "Oturum" }, { value: "server", label: "Sunucu" }, { value: "notFound", label: "Bulunamadı" }] }, { key: "retry", label: "Yeniden dene", default: true }] },
      run: (p: { values: { type: "auth" | "server" | "notFound"; retry: boolean } }) => {
        const tries = signal(0)
        const show = () => errors.page.set(new AppError("Sayfa açılamadı", { type: p.values.type, status: { auth: 401, server: 503, notFound: 404 }[p.values.type], context: p.values.retry ? { retry: () => tries.update((x) => x + 1) } : {} }))
        effect(() => { p.values.type; p.values.retry; if (errors.page.peek()) show() })
        onCleanup(() => errors.clear("page"))
        return <div class="sc-ex-stack"><Row><Button onClick={show}>Hata sayfasını göster</Button><Out label="Yeniden deneme" value={tries} /></Row>
          <ErrorPage><p class="hm-muted">Sayfa içeriği: hata yokken burada görünür.</p></ErrorPage></div>
      },
    },
    errors: {
      code: `errors.install()                              // window errors, rejections, net
errors.rule({ type: "auth" }, "page")
errors.capture(new AppError("Kayıt yok", { status: 404 }))   // → toast
errors.list()   // recent, de-duplicated`,
      run: () => {
        const last = signal("—")
        const go = (status: number) => { const e = errors.capture(new AppError(`Örnek hata ${status}`, { status, context: { ex: "api" } })); last.set(errors.message(e)) }
        const mine = () => errors.list().filter((c) => c.error.context["ex"] === "api").map((c) => `${c.error.type} ×${c.count}`)
        return <div class="sc-ex-stack"><Row>{[404, 429, 503].map((s) => <Button onClick={() => go(s)}>{String(s)}</Button>)}<Out label="Kullanıcıya" value={last} /></Row><Tags label="errors.list()" items={mine} /></div>
      },
    },
    setErrorSink: {
      code: `setErrorSink((e) => myLogger.send(e))   // without hadi-march/errors (smaller apps)
setErrorSink(null)                       // reported errors go nowhere`,
      run: () => {
        const log = lines()
        const n = mockNet({ "GET /down": () => reply(500, { message: "Sunucu çöktü" }) }, 80)
        const go = () => {
          const had = collectorOn()
          setErrorSink((e) => log.push(`kendi kaydedicin: ${e.source} · ${e.status} · ${e.message}`))
          n.get("/down", { retry: 0, policy: "parallel" }).catch(() => undefined).finally(() => restoreSink(had))
        }
        return <div class="sc-ex-stack"><Button onClick={go}>Başarısız istek</Button><Log lines={log} /></div>
      },
    },
  },
})
