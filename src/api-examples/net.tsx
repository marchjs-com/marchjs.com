// API examples of hadi-march/net: the request client, middleware, transports and managed sockets. Every request is
// answered by an in-memory mock (hadi-march/net/mock): nothing leaves the page. Layout and rules: tools/api-examples.js.
import { signal, onCleanup } from "hadi-march";
import { Button, Badge } from "hadi-march/ui";
import { runLoad } from "hadi-march/lazy";
import { net, Net, createNet, Api, api, AppError, auth, acceptLanguage, idempotencyKey, retry, cache, timing, log, record, replay, normalizeErrors, compose, named, duration, buildUrl, sleep, onInvalidate, HttpTransport, SseTransport, resolveUrl, parseBody, headersOf, WsTransport, ManagedSocket, socket, closeSockets, setSocketFactory, backoff, jsonProtocol, isAbort, routeLoads, type Ctx, type Middleware, type Recording } from "hadi-march/net";
import { crud, mockSocketServer, reply } from "hadi-march/net/mock";
import { Out, Log, Row } from "./_kit.tsx";
import { J, msg, now, lines, Text, Pre, Tags } from "./_net.tsx";
import { mockNet } from "./_mocknet.ts";
import { examples } from "./types.ts";
export { default as SIG } from "./net.sig.gen.ts";



export default examples({
  "hadi-march/net": {
    acceptLanguage: {
      code: `net.use(acceptLanguage())                       // locale() of hadi-march
net.use(acceptLanguage(() => user.language))   // or your own`,
      run: () => {
        const lang = signal("tr"), out = signal("—")
        const n = mockNet({ "GET /greet": (r) => ({ lang: r.headers["accept-language"], text: ({ tr: "Merhaba", en: "Hello", de: "Hallo" } as Record<string, string>)[r.headers["accept-language"] ?? ""] }) })
        n.use(acceptLanguage(() => lang()))
        const go = (l: string) => { lang.set(l); n.get<{ lang: string; text: string }>("/greet", { policy: "parallel" }).then((r) => out.set(`${r.lang} → ${r.text}`)) }
        return <Row>{["tr", "en", "de"].map((l) => <Button variant={() => (lang() === l ? "primary" : "secondary")} onClick={() => go(l)}>{l}</Button>)}<Out label="Sunucu yanıtı" value={out} /></Row>
      },
    },
    api: {
      code: `const users = api(UsersApi)                 // one instance per class
api(UsersApi) === users                       // true
const testUsers = api(UsersApi, { net: testNet })`,
      run: () => {
        class TeamApi extends Api { base = "/team"; list = this.get<{ id: string; name: string }[]>("/") }
        const n = mockNet({ "GET /team": [{ id: "1", name: "Ada" }, { id: "2", name: "Deniz" }] })
        const team = api(TeamApi, { net: n }), out = signal("—")
        return <Row>
          <Button onClick={() => team.list().then((l) => out.set(l.map((x) => x.name).join(", ")))}>team.list()</Button>
          <Out label="Ekip" value={out} /><Out label="api(TeamApi) === api(TeamApi)" value={String(api(TeamApi) === api(TeamApi))} />
        </Row>
      },
    },
    Api: {
      code: `class UsersApi extends Api {
  base = "/users"
  byId = this.get<User, { id: string }>("/:id", { cache: "5m" })
}
await api(UsersApi).byId({ id: "7" })`,
      run: () => {
        class UsersApi extends Api { base = "/users"; byId = this.get<{ id: string; name: string }, { id: string }>("/:id") }
        const n = mockNet(crud("/users", [{ id: "1", name: "Ada" }, { id: "2", name: "Deniz" }, { id: "3", name: "Ece" }]))
        const users = api(UsersApi, { net: n }), out = signal("—"), id = signal("1")
        const go = (v: string) => { id.set(v); users.byId({ id: v }, { report: false }).then((u) => out.set(u.name), (e) => out.set(msg(e))) }
        return <div class="sc-ex-stack"><Row>{["1", "2", "3", "9"].map((v) => <Button variant={() => (id() === v ? "primary" : "secondary")} onClick={() => go(v)}>{`id ${v}`}</Button>)}</Row>
          <Row><Out label="url" value={() => users.byId.url({ id: id() })} /><Out label="Sonuç" value={out} /></Row></div>
      },
    },
    AppError: {
      code: `const e = new AppError("Çok fazla istek", { status: 429 })
e.type        // "rateLimit"
e.retryable   // true
AppError.from(anything)   // normalize whatever was thrown`,
      run: () => {
        const e = signal(new AppError("Çok fazla istek", { status: 429 }))
        return <div class="sc-ex-stack"><Row>{[401, 404, 409, 422, 429, 503].map((s) => <Button onClick={() => e.set(new AppError(`HTTP ${s}`, { status: s }))}>{String(s)}</Button>)}
          <Button variant="ghost" onClick={() => e.set(AppError.from(new TypeError("Failed to fetch"), { source: "net" }))}>TypeError</Button></Row>
          <Row><Out label="type" value={() => e().type} /><Out label="code" value={() => e().code} /><Out label="severity" value={() => e().severity} /><Out label="retryable" value={() => String(e().retryable)} /></Row></div>
      },
    },
    auth: {
      code: `net.use(auth({
  token: () => session.token,
  refresh: () => session.renew(),   // once on 401, shared by parallel requests
}))`,
      run: () => {
        let token = "eski"
        const log = lines()
        const n = mockNet({ "GET /me": (r) => (r.headers["authorization"] === "Bearer yeni" ? { name: "Ada" } : reply(401, { message: "Token süresi doldu" })) })
        n.use(auth({ token: () => token, refresh: async () => { log.push("401 → refresh()"); await sleep(250); token = "yeni" } }))
        const go = () => n.get<{ name: string }>("/me", { policy: "parallel", report: false }).then((u) => log.push(`${now()} ✓ ${u.name} (token: ${token})`), (e) => log.push(`✖ ${msg(e)}`))
        return <div class="sc-ex-stack"><Row><Button onClick={go}>GET /me</Button><Button variant="ghost" onClick={() => { token = "eski"; log.push("token eskidi") }}>Token'ı eskit</Button></Row><Log lines={log} /></div>
      },
    },
    backoff: {
      code: `backoff(0)   // ≈ 500 ms
backoff(3)   // ≈ 4000 ms (±30 % jitter)
backoff(n, { min: 200, max: 5000, factor: 3 })`,
      run: () => {
        const seed = signal(0), factor = signal(2)
        const row = () => { seed(); return [0, 1, 2, 3, 4, 5].map((n) => `${n}: ${backoff(n, { factor: factor(), max: 10_000 })} ms`) }
        return <div class="sc-ex-stack"><Row>{[2, 3].map((f) => <Button variant={() => (factor() === f ? "primary" : "secondary")} onClick={() => factor.set(f)}>{`factor ${f}`}</Button>)}
          <Button variant="ghost" onClick={() => seed.update((x) => x + 1)}>Yeniden çek</Button></Row><Tags label="Bekleme" items={row} /></div>
      },
    },
    buildUrl: {
      code: `buildUrl("/users/:id", { id: 7 }, { q: "ada", tag: ["a", "b"] })
// "/users/7?q=ada&tag=a&tag=b"`,
      run: () => {
        const id = signal("7"), q = signal("ada lovelace")
        return <div class="sc-ex-stack"><Row><Text label="id" value={id} /><Text label="q" value={q} /></Row>
          <Out label="url" value={() => buildUrl("/users/:id", { id: id() }, { q: q(), tag: ["a", "b"], empty: "" })} /></div>
      },
    },
    cache: {
      code: `net.use(cache())
net.get("/rates", { cache: "5s" })   // fresh: from cache; stale: cache + refresh in the background`,
      run: () => {
        let hits = 0
        const log = lines()
        const n = mockNet({ "GET /rates": () => ({ usd: (34 + ++hits / 100).toFixed(2), at: now() }) })
        n.use(cache())
        n.on("net:revalidate", () => log.push("arka planda yenilendi"))
        const go = () => n.send<{ usd: string; at: string }>({ url: "/rates", cache: "5s" }).then((r) => log.push(`${r.from} · ${r.data.usd} · ${r.data.at}`))
        return <div class="sc-ex-stack"><Row><Button onClick={go}>GET /rates</Button><Out label="Sunucuya giden" value={() => { log(); return String(hits) }} /></Row><Log lines={log} /></div>
      },
    },
    closeSockets: {
      code: `closeSockets()   // sign-out: close every managed socket`,
      run: () => {
        const srv = mockSocketServer(() => 120)
        srv.ws("/ex-close")
        const s = signal(socket("ws://mock.local/ex-close", { factory: srv.factory, heartbeat: false }))
        onCleanup(() => s.peek().close())
        return <Row>
          <Button onClick={() => closeSockets()}>closeSockets()</Button>
          <Button variant="ghost" onClick={() => s.set(socket("ws://mock.local/ex-close", { factory: srv.factory, heartbeat: false }))}>Yeniden aç</Button>
          <Out label="Durum" value={() => s().state()} />
        </Row>
      },
    },
    compose: {
      code: `const run = compose([auth(…), log()], (ctx) => transport.send(ctx))
await run(ctx)   // a → b → transport → b → a`,
      run: () => {
        const log = lines()
        const step = (name: string): Middleware => named(name, async (_c, next) => { log.push(`${name} →`); await next(); log.push(`← ${name}`) })
        const go = async () => {
          log.set([])
          await compose([step("a"), step("b")], async () => { log.push("taşıyıcı") })({ steps: [], start: 0, req: { transport: "demo" } } as unknown as Ctx)
        }
        return <div class="sc-ex-stack"><Button onClick={go}>Zinciri çalıştır</Button><Log lines={log} /></div>
      },
    },
    createNet: {
      code: `const shop = createNet({ baseUrl: "https://api.hadisosyal.com", timeout: 5000 })
shop.use(auth({ token }))
await shop.get("/orders")`,
      run: () => {
        const shop = createNet({ baseUrl: "https://api.hadisosyal.com", timeout: 5000 }), path = signal("/orders")
        return <div class="sc-ex-stack"><Row><Text label="Yol" value={path} /></Row>
          <Out label="İstek adresi" value={() => shop.normalize({ url: path() }).url} />
          <Row><Out label="Taşıyıcılar" value={[...shop.transports.keys()].join(", ")} /><Out label="timeout" value={`${shop.config.timeout} ms`} /></Row></div>
      },
    },
    duration: {
      code: `duration("5m")    // 300000
duration("1.5s")  // 1500
duration(250)     // 250`,
      run: () => {
        const v = signal("5m")
        return <Row><Text label="Süre" value={v} />{["30s", "1.5h", "2d", "abc"].map((x) => <Button variant="ghost" onClick={() => v.set(x)}>{x}</Button>)}<Out label="ms" value={() => String(duration(v()))} /></Row>
      },
    },
    headersOf: {
      code: `const res = await fetch(url)
headersOf(res.headers)   // { "content-type": "application/json", … }`,
      run: () => {
        const id = signal("REQ-42")
        return <div class="sc-ex-stack"><Row><Text label="X-Request-Id" value={id} /></Row>
          <Pre text={() => J(headersOf(new Headers({ "Content-Type": "application/json", "X-Request-Id": id(), "Cache-Control": "no-store" })))} /></div>
      },
    },
    HttpTransport: {
      code: `const n = new Net().transport(new HttpTransport())        // fetch()
new HttpTransport(myFetch)   // any fetch-compatible function (tests, proxies)`,
      run: () => {
        const fakeFetch = (async (url: RequestInfo | URL, init?: RequestInit) => new Response(J({ url: String(url), method: init?.method }), { status: 200, headers: { "content-type": "application/json", "x-served-by": "örnek" } })) as typeof fetch
        const n = new Net().transport(new HttpTransport(fakeFetch)), out = signal("—")
        const go = () => n.send({ url: "/api/hello", query: { q: "ada" } }).then((r) => out.set(`${r.status} · ${J(r.data)} · x-served-by: ${r.headers["x-served-by"]}`))
        return <div class="sc-ex-stack"><Button onClick={go}>Gönder</Button><Out label="Yanıt" value={out} /></div>
      },
    },
    idempotencyKey: {
      code: `net.use(idempotencyKey())   // POST / PATCH: one key, the same on every retry
net.post("/orders", order)  // retried safely`,
      run: () => {
        const log = lines()
        const n = mockNet({ "POST /orders": (r) => reply(201, { key: r.headers["idempotency-key"] }), "PUT /orders/1": (r) => ({ key: r.headers["idempotency-key"] ?? "yok" }) })
        n.use(idempotencyKey())
        return <div class="sc-ex-stack"><Row>
          <Button onClick={() => n.post<{ key: string }>("/orders", { sku: "A-1" }).then((r) => log.push(`POST → ${r.key.slice(0, 13)}…`))}>POST /orders</Button>
          <Button variant="ghost" onClick={() => n.put<{ key: string }>("/orders/1", { sku: "A-1" }).then((r) => log.push(`PUT → ${r.key}`))}>PUT /orders/1</Button>
        </Row><Log lines={log} /></div>
      },
    },
    isAbort: {
      code: `try { await net.get("/search", { signal }) }
catch (e) { if (isAbort(e)) return; showError(e) }   // a cancel is not a failure`,
      run: () => {
        const out = signal("—")
        const n = mockNet({ "GET /slow": { ok: true }, "GET /broken": () => reply(500, { message: "Sunucu hatası" }) }, 900)
        let ctl = new AbortController()
        const go = (url: string) => { ctl = new AbortController(); out.set("bekleniyor…"); n.get(url, { signal: ctl.signal, retry: 0, report: false }).then(() => out.set("tamam"), (e) => out.set(`isAbort: ${isAbort(e)} · ${msg(e)}`)) }
        return <div class="sc-ex-stack"><Row><Button onClick={() => go("/slow")}>Yavaş istek</Button><Button variant="danger" onClick={() => ctl.abort()}>İptal</Button><Button variant="ghost" onClick={() => go("/broken")}>Hatalı istek</Button></Row><Out label="Sonuç" value={out} /></div>
      },
    },
    jsonProtocol: {
      code: `jsonProtocol.withId({ type: "getUser", id: 7 }, "r1")   // request with a correlation id
jsonProtocol.replyTo({ re: "r1", data: user })           // { id: "r1", data: user }
new ManagedSocket(url, { protocol: { ...jsonProtocol, encode: msgpack } })`,
      run: () => {
        const raw = signal(`{"re":"r1","data":{"name":"Ada"}}`)
        const dec = () => jsonProtocol.decode(raw())
        return <div class="sc-ex-stack"><Text label="Gelen çerçeve" value={raw} />
          <Row>{[`{"topic":"prices","data":12}`, `{"type":"pong"}`, "düz metin"].map((x) => <Button variant="ghost" onClick={() => raw.set(x)}>{x.slice(0, 16)}</Button>)}</Row>
          <Out label="topicOf" value={() => String(jsonProtocol.topicOf(dec()))} /><Out label="replyTo" value={() => J(jsonProtocol.replyTo(dec()) ?? null)} /><Out label="isPong" value={() => String(jsonProtocol.isPong(dec()))} />
          <Out label="sub()" value={J(jsonProtocol.sub("prices"))} /></div>
      },
    },
    log: {
      code: `net.use(log())   // GET /users → 200 network 84ms  (console.debug)
net.use(log({ out: (line) => panel.add(line), filter: (ctx) => ctx.req.method !== "GET" }))`,
      run: () => {
        const out = lines()
        const n = mockNet({ "GET /users": [{ id: 1 }], "POST /users": () => reply(201, { id: 2 }) })
        n.use(log({ out: (l) => out.push(l) }))
        const go = (p: Promise<unknown>) => p.catch(() => undefined)
        return <div class="sc-ex-stack"><Row>
          <Button onClick={() => go(n.get("/users", { policy: "parallel" }))}>GET</Button><Button onClick={() => go(n.post("/users", { name: "Ada" }))}>POST</Button>
          <Button variant="ghost" onClick={() => go(n.get("/yok", { report: false }))}>404</Button>
        </Row><Log lines={out} /></div>
      },
    },
    ManagedSocket: {
      code: `const chat = new ManagedSocket("wss://chat.hadisosyal.com/live")
chat.subscribe("room:1", (m) => …)          // renewed after every reconnect
const r = await chat.request({ type: "echo", text: "selam" })
chat.state()   // "open" | "reconnecting" | …`,
      run: () => {
        const srv = mockSocketServer(() => 200), log = lines()
        srv.ws("/chat", (c) => c.send({ type: "hello", text: "Hoş geldin" }), (m: { text?: string }) => ({ text: String(m.text ?? "").toUpperCase() }))
        const chat = new ManagedSocket<unknown, { type: string; text: string }>("ws://mock.local/chat", { factory: srv.factory, heartbeat: false, reconnect: { min: 400 } })
        chat.on("*", (m) => log.push(`← ${J(m)}`))
        onCleanup(() => chat.close())
        return <div class="sc-ex-stack"><Row>
          <Button onClick={() => chat.request<{ text: string }>({ type: "echo", text: "selam" }).then((r) => log.push(`yanıt: ${r.text}`), (e) => log.push(msg(e)))}>request()</Button>
          <Button variant="ghost" onClick={() => chat.drop()}>Hattı kes</Button>
          <Badge tone={() => (chat.state() === "open" ? "success" : "warn")}>{() => chat.state()}</Badge><Out label="Deneme" value={chat.attempts} />
        </Row><Log lines={log} /></div>
      },
    },
    named: {
      code: `const trace = named("trace", (ctx, next) => { ctx.req.headers["x-trace"] = id(); return next() })
net.use(trace)   // shown as "trace" in ctx.steps and the request inspector`,
      run: () => {
        const steps = signal<string[]>([])
        const n = mockNet({ "GET /ping": { ok: true } })
        n.use(named("trace", (ctx, next) => { ctx.req.headers["x-trace"] = "t-1"; return next() }), (_ctx, next) => next())
        n.on("net:done", ({ ctx }) => steps.set(ctx.steps.map((s) => `${s.name} ${Math.round(s.ms)} ms`)))
        return <div class="sc-ex-stack"><Button onClick={() => n.get("/ping", { policy: "parallel" })}>GET /ping</Button><Tags label="Adımlar" items={steps} /></div>
      },
    },
    net: {
      code: `import { net } from "hadi-march/net"
const users = await net.get<User[]>("/api/users", { category: "users", cache: "5m" })
net.pending("users")   // reactive count of requests in flight`,
      run: () => {
        const go = () => net.request({ run: (s) => sleep(1200, s), category: "ex-net", report: false })
        return <Row><Button onClick={go}>İş başlat (1,2 sn)</Button><Out label={`net.pending("ex-net")`} value={() => String(net.pending("ex-net"))} /><Out label="online" value={() => String(net.online())} /></Row>
      },
    },
    Net: {
      code: `const n = new Net({ timeout: 8000, maxConcurrent: 4 }).transport(new HttpTransport())
n.get("/search", { query: { q }, category: "search", policy: "latest" })   // the older one is aborted`,
      run: () => {
        const q = signal(""), result = signal("—"), aborted = signal(0)
        const n = mockNet({ "GET /search": (r) => ({ q: r.query["q"], hits: r.fake.int(1, 40) }) }, [300, 700])
        const go = (v: string) => { q.set(v); n.get<{ q: string; hits: number }>("/search", { query: { q: v }, category: "search", policy: "latest", report: false }).then((r) => result.set(`"${r.q}": ${r.hits} sonuç`), (e) => isAbort(e) && aborted.update((x) => x + 1)) }
        return <div class="sc-ex-stack"><input class="m-input sc-ex-net-in" aria-label="Ara" placeholder="Hızlı yaz…" value={q} onInput={(e: Event) => go((e.target as HTMLInputElement).value)} />
          <Row><Out label="Uçuşta" value={() => String(n.pending("search"))} /><Out label="İptal edilen" value={aborted} /><Out label="Son" value={result} /></Row></div>
      },
    },
    normalizeErrors: {
      code: `net.use(normalizeErrors())   // { errors | fields } of the body → error.context.fields
catch (e) { form.setErrors(e.context.fields) }`,
      run: () => {
        const out = signal("—"), fields = signal<string[]>([])
        const n = mockNet({ "POST /signup": () => reply(422, { message: "Form hatalı", errors: { email: "Geçerli bir e-posta girin", name: "Boş olamaz" } }) })
        n.use(normalizeErrors())
        const go = () => n.post("/signup", { email: "ada@" }, { report: false }).catch((e: AppError) => { out.set(`${e.type} · ${e.message}`); fields.set(Object.entries(e.context["fields"] as Record<string, string>).map(([k, v]) => `${k}: ${v}`)) })
        return <div class="sc-ex-stack"><Row><Button onClick={go}>POST /signup</Button><Out label="Hata" value={out} /></Row><Tags label="Alanlar" items={fields} /></div>
      },
    },
    onInvalidate: {
      code: `onInvalidate((prefix) => myStore.drop(prefix))
net.invalidate("users")   // after a write: net cache + your layer`,
      run: () => {
        const log = lines(), n = new Net()
        onCleanup(onInvalidate((p) => log.push(`${now()} geçersiz: ${p}`)))
        return <div class="sc-ex-stack"><Row>{["ex-users", "ex-orders"].map((c) => <Button onClick={() => n.invalidate(c)}>{`invalidate("${c}")`}</Button>)}</Row><Log lines={log} /></div>
      },
    },
    parseBody: {
      code: `parseBody('{"id":1}', "json")   // { id: 1 }
parseBody("", "json")           // null
parseBody("<oops>", "json")     // "<oops>" (stays text)`,
      run: () => {
        const text = signal(`{"id":1,"name":"Ada"}`), type = signal("json")
        return <div class="sc-ex-stack"><Text label="Gövde" value={text} />
          <Row>{["json", "text", "none"].map((t) => <Button variant={() => (type() === t ? "primary" : "secondary")} onClick={() => type.set(t)}>{t}</Button>)}
            <Button variant="ghost" onClick={() => text.set("<oops>")}>Bozuk JSON</Button></Row>
          <Out label="Sonuç" value={() => { const v = parseBody(text(), type()); return `${v === null ? "null" : typeof v} · ${J(v)}` }} /></div>
      },
    },
    record: {
      code: `const tape: Recording = {}
net.use(record(tape))
// … use the app, then save tape as JSON for replay() in tests`,
      run: () => {
        const tape: Recording = {}, keys = signal<string[]>([])
        const n = mockNet({ "GET /users": [{ id: 1, name: "Ada" }], "GET /users/:id": (r) => ({ id: r.params["id"] }) })
        n.use(record(tape))
        const go = (url: string, query?: Record<string, unknown>) => n.get(url, { query, policy: "parallel" }).then(() => keys.set(Object.entries(tape).map(([k, v]) => `${k} → ${v.status}`)))
        return <div class="sc-ex-stack"><Row><Button onClick={() => go("/users")}>/users</Button><Button onClick={() => go("/users/7")}>/users/7</Button><Button onClick={() => go("/users", { limit: 5 })}>?limit=5</Button></Row><Tags label="Kayıt" items={keys} /></div>
      },
    },
    replay: {
      code: `const n = new Net().use(replay(tape, { strict: true }))
await n.get("/me")   // from the recording, no server`,
      run: () => {
        const tape: Recording = { "GET /me": { status: 200, headers: {}, data: { name: "Ada" } }, "GET /status": { status: 503, headers: {}, data: { message: "Bakımda" } } }
        const n = new Net().use(replay(tape, { strict: true })), out = signal("—")
        const go = (url: string) => n.send({ url, policy: "parallel", report: false }).then((r) => out.set(`${r.from} · ${J(r.data)}`), (e: AppError) => out.set(`✖ ${e.type} · ${e.message}`))
        return <div class="sc-ex-stack"><Row>{["/me", "/status", "/orders"].map((u) => <Button onClick={() => go(u)}>{u}</Button>)}</Row><Out label="Sonuç" value={out} /></div>
      },
    },
    resolveUrl: {
      code: `resolveUrl("ws:/live", "ws")      // "wss://this.site/live" on https
resolveUrl("sse:/events", "http") // "https://this.site/events"`,
      run: () => {
        const p = signal("/live?room=1")
        return <div class="sc-ex-stack"><Text label="Yol" value={p} /><Out label="ws" value={() => resolveUrl(`ws:${p()}`, "ws")} /><Out label="http" value={() => resolveUrl(`sse:${p()}`, "http")} /></div>
      },
    },
    retry: {
      code: `net.use(retry({ count: 4, delay: 200, when: (ctx) => ctx.req.category === "sync" }))
// idempotent requests only; retryable errors (network, timeout, 429, 5xx)`,
      run: () => {
        let fails = 0
        const log = lines()
        const n = mockNet({ "GET /flaky": () => (fails-- > 0 ? reply(503, { message: "Meşgul" }) : { ok: true }) })
        n.use(retry({ count: 3, delay: 120, max: 400 }))
        n.on("net:retry", ({ ctx, error }) => log.push(`deneme ${ctx.attempt + 1}: ${error?.message} → yeniden`))
        const go = (k: number) => { fails = k; log.set([]); n.get("/flaky", { policy: "parallel", report: false }).then(() => log.push("✓ başarılı"), (e) => log.push(`✖ vazgeçildi: ${msg(e)}`)) }
        return <div class="sc-ex-stack"><Row><Button onClick={() => go(2)}>2 hata, sonra başarı</Button><Button variant="ghost" onClick={() => go(5)}>5 hata</Button></Row><Log lines={log} /></div>
      },
    },
    routeLoads: {
      code: `routeLoads(net)    // pages and lazy() parts load through net (done on import)
routeLoads(null)   // load them directly`,
      run: () => {
        const n = new Net(), on = signal(false), log = lines()
        n.on("net:start", ({ ctx }) => log.push(`net:start ${ctx.req.category} · ${ctx.req.key.split(":")[1]}`))
        const set = (v: boolean) => { on.set(v); routeLoads(v ? n : net) }
        onCleanup(() => routeLoads())
        const load = () => runLoad(() => sleep(300).then(() => "ok"), { kind: "part", key: "ex-part" }).then(() => log.push(`${now()} parça yüklendi`))
        return <div class="sc-ex-stack"><Row>
          <Button variant={() => (on() ? "primary" : "secondary")} onClick={() => set(!on())}>{() => (on() ? "Bu Net'ten geçiyor" : "Varsayılan net")}</Button>
          <Button variant="ghost" onClick={load}>Parça yükle</Button>
        </Row><Log lines={log} /></div>
      },
    },
    setSocketFactory: {
      code: `setSocketFactory((url) => new MyTransportSocket(url))   // every new ManagedSocket uses it
setSocketFactory(null)   // back to WebSocket`,
      run: () => {
        const srv = mockSocketServer(() => 150), state = signal("—")
        srv.ws("/ex-factory", (c) => c.send({ type: "hello" }))
        let s: ManagedSocket | null = null
        const go = () => {
          s?.close()
          setSocketFactory(srv.factory)
          try { s = new ManagedSocket("ws://mock.local/ex-factory", { heartbeat: false, reconnect: false }) } finally { setSocketFactory(null) }
          s.on("hello", () => state.set(`açık, "hello" geldi · istemci: ${srv.clients("/ex-factory")}`))
          state.set(s.state.peek())
        }
        onCleanup(() => s?.close())
        return <Row><Button onClick={go}>Fabrika ile bağlan</Button><Out label="Durum" value={state} /></Row>
      },
    },
    sleep: {
      code: `await sleep(500)
await sleep(5000, ctl.signal)   // rejects with an abort error on cancel`,
      run: () => {
        const out = signal("—")
        let ctl = new AbortController()
        const go = () => { ctl = new AbortController(); const t0 = Date.now(); out.set("bekliyor…"); sleep(1500, ctl.signal).then(() => out.set("1,5 sn doldu"), (e) => out.set(`${Date.now() - t0} ms sonra: ${msg(e)} (isAbort ${isAbort(e)})`)) }
        return <Row><Button onClick={go}>sleep(1500)</Button><Button variant="ghost" onClick={() => ctl.abort()}>İptal</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    socket: {
      code: `const live = socket("/live")       // one ManagedSocket per url
socket("/live") === live           // true: shared by every caller`,
      run: () => {
        const srv = mockSocketServer(() => 120)
        srv.ws("/ex-shared")
        const o = { factory: srv.factory, heartbeat: false as const }
        const a = socket("ws://mock.local/ex-shared", o), b = socket("ws://mock.local/ex-shared", o)
        onCleanup(() => a.close())
        return <Row><Out label="a === b" value={String(a === b)} /><Out label="Durum" value={() => a.state()} /><Out label="Sunucudaki istemci" value={() => { a.state(); return String(srv.clients("/ex-shared")) }} /></Row>
      },
    },
    SseTransport: {
      code: `net.transport(new SseTransport({ event: "price" }))
const stop = net.transports.get("sse")!.stream!("sse:/prices", (m) => …, {})`,
      run: () => {
        class DemoSource {
          onmessage: ((e: { data: string }) => void) | null = null; onerror: (() => void) | null = null
          private n = 0; private t: ReturnType<typeof setTimeout>
          constructor() { const tick = () => { this.n++; this.onmessage?.({ data: J({ n: this.n, price: (100 + this.n * 1.7).toFixed(1) }) }); this.t = setTimeout(tick, 700) }; this.t = setTimeout(tick, 300) }
          close() { clearTimeout(this.t) }
          addEventListener() {}
        }
        const t = new SseTransport({ EventSource: DemoSource as never }), log = lines()
        let stop: (() => void) | null = null
        const on = signal(false)
        const toggle = () => { if (stop) { stop(); stop = null; on.set(false); return } stop = t.stream("sse:/prices", (m) => log.push(J(m)), {}); on.set(true) }
        onCleanup(() => stop?.())
        return <div class="sc-ex-stack"><Button onClick={toggle}>{() => (on() ? "Durdur" : "Akışı başlat")}</Button><Log lines={log} /></div>
      },
    },
    timing: {
      code: `net.use(timing())
net.on("net:done", ({ ctx }) => console.log(ctx.state.ms, ctx.state.serverTiming))`,
      run: () => {
        const out = signal("—")
        const n = mockNet({ "GET /report": (r) => reply(200, { ok: true }, { "server-timing": `db;dur=${r.fake.int(5, 40)}, render;dur=${r.fake.int(1, 9)}` }) })
        n.use(timing())
        n.on("net:done", ({ ctx }) => out.set(`${ctx.state["ms"]} ms · ${J(ctx.state["serverTiming"])}`))
        return <Row><Button onClick={() => n.get("/report", { policy: "parallel" })}>GET /report</Button><Out label="Süre" value={out} /></Row>
      },
    },
    WsTransport: {
      code: `net.transport(new WsTransport())
await net.request({ url: "ws:/rpc", body: { type: "sum", a: 2, b: 3 } })   // 5`,
      run: () => {
        const srv = mockSocketServer(() => 80), a = signal("2"), b = signal("3"), out = signal("—")
        srv.ws("/ex-rpc", undefined, (m: { a: number; b: number }) => m.a + m.b)
        const n = new Net().transport(new WsTransport({ factory: srv.factory, heartbeat: false }))
        let used = false
        const go = () => { used = true; n.request<number>({ url: "ws://mock.local/ex-rpc", body: { type: "sum", a: Number(a()), b: Number(b()) }, report: false }).then((r) => out.set(String(r)), (e) => out.set(msg(e))) }
        onCleanup(() => { if (used) socket("ws://mock.local/ex-rpc", { factory: srv.factory }).close() })
        return <Row><Text label="a" value={a} /><Text label="b" value={b} /><Button onClick={go}>sum</Button><Out label="Yanıt" value={out} /></Row>
      },
    },
  },
})
