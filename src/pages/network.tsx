// Network and errors: hadi-march/net (policies, priority, retry, middleware, Api classes, WebSocket, mock) and
// hadi-march/errors (AppError, rules, de-duplication, dev layer) — live. Everything here goes through the one `net`
// instance, so the request inspector also shows the page loads the router makes after this page was opened.
import "./network.css";
import "hadi-march/errors/errors.css";
import { signal, effect, onCleanup, untrack } from "hadi-march";
import { Button, Badge, Card, Grid } from "hadi-march/ui";
import { Segmented, Slider, Toggle, TextInput } from "hadi-march/forms";
import { net, Api, api, cache, timing, normalizeErrors, isAbort, ManagedSocket, type Ctx, type Step } from "hadi-march/net";
import { crud, reply, mockSocketServer, type MockController } from "hadi-march/net/mock";
import { errors, ErrorPage, ErrorInline, type Captured } from "hadi-march/errors";
import { Try } from "hadi-march";
import { appUrl } from "hadi-march/base";
import { Demo, Section } from "../demo.tsx";

// ------------------------------------------------------------------ the app's API (one class) + the mock behind it
interface User { id: string; name: string; email: string; role: string }
interface Notice { topic: string; data: { id: number; text: string; at: string } }

// public/demo-api under the showcase's root, on every route and under any base path (the mock answers the same paths)
const API = appUrl("demo-api");
const API_PATH = new URL(API).pathname;

class UsersApi extends Api {
  base = API;
  category = "users";
  list = this.get<User[]>("/users.json");
  cached = this.get<User[]>("/users.json", { cache: "10s", category: "users-cached" });
  search = this.get<User[], { q: string }>("/users.json", { category: "search", policy: "latest" });
  me = this.get<User>("/me.json", { category: "session", retry: 0 });
  saveProfile = this.post<User, { name: string }>("/profile.json", { category: "profile" });
  crash = this.post<void>("/crash.json", { category: "errors-demo" });
}
const users = api(UsersApi);

const people = crud<User & Record<string, unknown>>(`${API_PATH}/users`, (f) => f.list(12, (i) => {
  const name = f.name();
  return { id: String(i + 1), name, email: f.email(name), role: f.pick(["admin", "editor", "viewer"]) };
}), { seed: 7 });
const HANDLERS = {
  ...people,
  // the static file paths of the "real" mode, answered from the stateful list
  [`GET ${API_PATH}/users.json`]: (r: { query: Record<string, string> }) => {
    const q = (r.query["q"] ?? "").toLocaleLowerCase("tr");
    return people.rows().filter((u) => !q || u.name.toLocaleLowerCase("tr").includes(q) || u.email.includes(q));
  },
  [`GET ${API_PATH}/me.json`]: () => reply(401, { message: "Oturum süresi doldu", code: "SESSION_EXPIRED" }),
  [`POST ${API_PATH}/profile.json`]: (r: { body: { name?: string } }) => (r.body?.name ? { id: "1", name: r.body.name } : reply(422, { message: "Ad boş olamaz", fields: { name: "Zorunlu alan" } })),
  [`POST ${API_PATH}/crash.json`]: () => reply(500, { message: "Veritabanı yanıt vermiyor" }),
};

// module-level state: survives leaving and re-opening the page
const mode = signal<"mock" | "real">("mock");
const delay = signal(450);
const errorRate = signal(0);
let mock: MockController | null = null;
function applyMode(): void {
  if (mode() === "mock") {
    if (!mock) { mock = net.mock(HANDLERS, { seed: 7 }); people.rows(); }
    const d = delay();
    mock.set({ delay: [d * 0.7, d * 1.3], errorRate: errorRate() / 100 });
  } else if (mock) { net.mock(false); mock = null; }
}
effect(applyMode);
net.use(timing(), cache(), normalizeErrors());
errors.install({ window: true });

// ------------------------------------------------------------------ request log for the inspector
interface Row { id: number; method: string; url: string; category: string; policy: string; priority: string; state: "pending" | "done" | "error" | "abort"; from: string; status: number; ms: number; steps: Step[]; attempt: number; progress: number; note: string }
const log = signal<Row[]>([]);
const MAX_ROWS = 40;
function upsert(ctx: Ctx, patch: Partial<Row>): void {
  const now = (globalThis.performance?.now() ?? Date.now()) - ctx.start;
  const base: Row = { id: ctx.id, method: ctx.req.method, url: ctx.req.url.replace(/^run:$/, String(ctx.req.meta["load"] || "lazy()")), category: ctx.req.category, policy: ctx.req.policy, priority: ctx.req.priority, state: "pending", from: "", status: 0, ms: 0, steps: [], attempt: 0, progress: 0, note: "" };
  log.update((l) => {
    const i = l.findIndex((r) => r.id === ctx.id);
    const row = { ...(i >= 0 ? l[i] as Row : base), steps: [...ctx.steps], attempt: ctx.attempt, ms: Math.round(now), ...patch };
    return i >= 0 ? l.map((r, j) => (j === i ? row : r)) : [row, ...l].slice(0, MAX_ROWS);
  });
}
net.on("net:start", ({ ctx }) => upsert(ctx, {}));
net.on("net:progress", ({ ctx, loaded, total }) => upsert(ctx, { progress: total ? (loaded ?? 0) / total : 0 }));
net.on("net:retry", ({ ctx, error }) => upsert(ctx, { note: `yeniden deneme (${error?.status || error?.type})` }));
net.on("net:done", ({ ctx }) => upsert(ctx, { state: "done", status: ctx.res?.status ?? 0, from: ctx.res?.from ?? "", progress: 1 }));
net.on("net:error", ({ ctx, error }) => upsert(ctx, { state: "error", status: error?.status ?? 0, note: error?.message ?? "" }));
net.on("net:abort", ({ ctx }) => { if (ctx.steps.length) upsert(ctx, { state: "abort", note: "iptal" }); });

const STATE_TONE = { pending: "info", done: "success", error: "danger", abort: "warn" } as const;
const STATE_TEXT = { pending: "sürüyor", done: "tamam", error: "hata", abort: "iptal" } as const;
const FROM_TEXT: Record<string, string> = { mock: "mock", network: "ağ", cache: "önbellek", replay: "kayıt", run: "parça" };

function Inspector() {
  return <div class="sc-net-inspector">
    <div class="sc-row sc-row-between">
      <span class="sc-row">
        <Badge tone="info" dot>{() => `${net.pending()} sürüyor`}</Badge>
        <Badge tone={() => (net.offlineQueue() ? "warn" : "neutral")}>{() => `çevrimdışı kuyruk: ${net.offlineQueue()}`}</Badge>
      </span>
      <Button size="sm" variant="ghost" onClick={() => log.set([])}>Temizle</Button>
    </div>
    <ol class="sc-net-list" aria-live="polite">
      {() => log().length ? null : <li class="sc-net-empty">Henüz istek yok — aşağıdaki demolardan birini çalıştırın ya da başka bir sayfaya gidip dönün.</li>}
      {() => log().map((r) => <li class="sc-net-req" data-state={r.state}>
        <details>
          <summary class="sc-net-sum">
            <Badge tone={STATE_TONE[r.state]} dot>{STATE_TEXT[r.state]}</Badge>
            <code class="sc-net-url" title={r.url}>{r.method} {r.url}</code>
            <span class="sc-net-meta">{r.category} · {r.policy} · {r.priority}{r.from ? ` · ${FROM_TEXT[r.from] ?? r.from}` : ""}{r.status ? ` · ${r.status}` : ""}{r.attempt ? ` · ${r.attempt + 1}. deneme` : ""}</span>
            <span class="sc-num sc-net-ms">{r.ms} ms</span>
            <span class="sc-net-bar" aria-hidden="true"><span class="sc-net-bar-fill" style={{ width: `${Math.round((r.state === "pending" ? r.progress : 1) * 100)}%` }} /></span>
          </summary>
          <div class="sc-net-steps">
            {r.note ? <p class="sc-net-note">{r.note}</p> : null}
            {r.steps.map((s) => <div class="sc-net-step" data-ok={String(s.ok)}>
              <span class="sc-net-step-name">{s.name}</span>
              <span class="sc-net-track"><span class="sc-net-span" style={{ insetInlineStart: `${pct(s.start, r.ms)}%`, width: `${Math.max(1, pct(s.ms, r.ms))}%` }} /></span>
              <span class="sc-num">{Math.round(s.ms)} ms</span>
            </div>)}
          </div>
        </details>
      </li>)}
    </ol>
  </div>
}
const pct = (v: number, total: number): number => (total > 0 ? Math.min(100, Math.max(0, (v / total) * 100)) : 0);

// ------------------------------------------------------------------ dedupe: three components, one request
function Consumer(props: { n: number }) {
  let $text = "yükleniyor…"
  users.list(undefined, { category: "dedupe" }).then((l) => { $text = `${l.length} kullanıcı geldi` }, (e: unknown) => { $text = isAbort(e) ? "iptal" : errors.message(e as never) })
  return <Card class="sc-net-consumer" title={`Bileşen ${props.n}`}>{$text}</Card>
}
function DedupeDemo() {
  let $round = 1
  let $starts = 0
  const off = net.on("net:start", ({ ctx }) => { if (ctx.req.category === "dedupe") $starts++ })
  onCleanup(off)
  return <div class="sc-stage">
    <div class="sc-row">
      <Button onClick={() => { $starts = 0; $round++ }}>Üçünü yeniden oluştur</Button>
      <Badge tone="success">{() => `3 bileşen → ${$starts} istek`}</Badge>
    </div>
    {() => { const r = $round; return untrack(() => <Grid cols={3} min="8rem" data-round={r}><Consumer n={1} /><Consumer n={2} /><Consumer n={3} /></Grid>) }}
  </div>
}

// ------------------------------------------------------------------ latest: search aborts the older request
function LatestDemo() {
  let $q = ""
  let $sent = 0
  let $aborted = 0
  let $done = 0
  let $results: User[] = []
  let $error = ""
  effect(() => {
    const q = $q
    untrack(() => {
      $sent++
      users.search({ q }).then((list) => {
        $done++
        $error = ""
        const k = q.toLocaleLowerCase("tr")
        $results = list.filter((u) => !k || u.name.toLocaleLowerCase("tr").includes(k) || u.email.includes(k)).slice(0, 6)
      }, (e: unknown) => { if (isAbort(e)) $aborted++; else $error = errors.message(e as never) })
    })
  })
  return <div class="sc-stage">
    <TextInput bind:value={$q} placeholder="İsim yazın (her tuş yeni istek)…" aria-label="Kullanıcı ara" />
    <div class="sc-row">
      <Badge>{() => `gönderilen ${$sent}`}</Badge>
      <Badge tone="warn">{() => `iptal ${$aborted}`}</Badge>
      <Badge tone="success">{() => `tamamlanan ${$done}`}</Badge>
    </div>
    {() => $error ? <p class="sc-net-error" role="alert">{$error}</p> : null}
    <ul class="sc-net-results">{() => $results.map((u) => <li><strong>{u.name}</strong> <span class="hm-muted">{u.email}</span></li>)}</ul>
  </div>
}

// ------------------------------------------------------------------ mock ↔ real, slow network, error rate, offline
function MockDemo() {
  let $offline = !net.online.peek()
  let $result = ""
  let $busy = false
  effect(() => net.setOnline(!$offline))
  onCleanup(() => net.setOnline(true))
  const run = (fn: () => Promise<User[]>, label: string): void => {
    $busy = true
    const t0 = performance.now()
    fn().then((l) => { $result = `${label}: ${l.length} kullanıcı, ${Math.round(performance.now() - t0)} ms` }, (e: unknown) => { $result = `${label}: ${errors.message(e as never)}` }).finally(() => { $busy = false })
  }
  return <div class="sc-stage">
    <Segmented aria-label="Kaynak" value={mode()} onChange={(v: "mock" | "real") => mode.set(v)} options={[{ value: "mock", label: "Mock (tarayıcıda)" }, { value: "real", label: "Gerçek (sunucudaki dosya)" }]} />
    {() => mode() === "mock" ? <div class="sc-net-sliders">
      <label class="sc-net-slider"><span>Gecikme (yavaş ağ): <strong class="sc-num">{() => `${delay()} ms`}</strong></span>
        <Slider aria-label="Gecikme" min={0} max={3000} step={50} value={delay()} onChange={(v: number) => delay.set(v)} /></label>
      <label class="sc-net-slider"><span>Hata oranı: <strong class="sc-num">{() => `%${errorRate()}`}</strong></span>
        <Slider aria-label="Hata oranı" min={0} max={100} step={5} value={errorRate()} onChange={(v: number) => errorRate.set(v)} /></label>
    </div> : <p class="hm-muted">Gerçek modda istekler sunucudaki demo-api/users.json dosyasına gider; gecikme ve hata oranı yalnız mock'ta vardır.</p>}
    <Toggle bind:value={$offline} label="Çevrimdışı (istekler kuyrukta bekler, bağlanınca gider)" />
    <div class="sc-row">
      <Button loading={() => $busy} onClick={() => run(() => users.list(), "Liste")}>Kullanıcıları getir</Button>
      <Button variant="secondary" onClick={() => run(() => users.cached(), "Önbellekli")}>Önbellekli getir (10 sn)</Button>
    </div>
    <p class="sc-net-result" aria-live="polite">{() => $result || "GET istekleri 503'te 2 kez yeniden denenir (izleyicide görünür); POST denenmez."}</p>
  </div>
}

// ------------------------------------------------------------------ WebSocket: mock notification stream
const ws = mockSocketServer(() => 120 + Math.round(delay() / 4));
let seq = 0;
const NOTES = ["Yeni yorum: Acme bütçe taslağı", "Yeni sipariş: #1042", "Bir panoya eklendiniz", "Yedekleme tamamlandı", "Rapor dosyası güncellendi", "3 yeni üye katıldı"];
ws.ws("/demo-ws", (c) => c.send({ type: "hello" }), (msg: { type?: string }) => (msg.type === "ask" ? { answer: `Sunucu saati ${new Date().toLocaleTimeString("tr")}` } : undefined));
const sock = new ManagedSocket<Notice | { type: string }, { type: string }>("ws:/demo-ws", { factory: ws.factory, lazy: true, reconnect: { min: 600, max: 5000 }, heartbeat: { interval: 5000 } });
const SOCK_TEXT = { idle: "bekliyor", connecting: "bağlanıyor", open: "bağlı", reconnecting: "yeniden bağlanıyor", closed: "kapalı" } as const;
const SOCK_TONE = { idle: "neutral", connecting: "info", open: "success", reconnecting: "warn", closed: "danger" } as const;

function SocketDemo() {
  let $items: Array<{ id: number; text: string; at: string }> = []
  let $reply = ""
  onCleanup(sock.subscribe("notices", (m) => { const d = (m as Notice).data; $items = [d, ...$items].slice(0, 6) }))
  const timer = setInterval(() => ws.publish("/demo-ws", "notices", { id: ++seq, text: NOTES[seq % NOTES.length], at: new Date().toLocaleTimeString("tr") }), 2500)
  onCleanup(() => clearInterval(timer))
  return <div class="sc-stage">
    <div class="sc-row">
      <Badge tone={() => SOCK_TONE[sock.state()]} dot>{() => SOCK_TEXT[sock.state()]}</Badge>
      {() => sock.attempts() ? <Badge tone="warn">{`${sock.attempts()}. deneme`}</Badge> : null}
      {() => sock.queued() ? <Badge>{`kuyrukta ${sock.queued()}`}</Badge> : null}
    </div>
    <div class="sc-row">
      <Button variant="secondary" onClick={() => ws.drop("/demo-ws")}>Bağlantıyı kopar</Button>
      <Button variant="secondary" onClick={() => { $reply = "soruluyor…"; sock.request<{ answer: string }>({ type: "ask" }, { timeout: 5000 }).then((r) => { $reply = r.answer }, (e: unknown) => { $reply = errors.message(e as never) }) }}>Sunucuya sor (istek-yanıt)</Button>
    </div>
    {() => $reply ? <p class="sc-net-result">{$reply}</p> : null}
    <ul class="sc-net-notes">{() => $items.length ? $items.map((n) => <li><span class="sc-num hm-muted">{n.at}</span> {n.text}</li>) : <li class="hm-muted">Bildirimler 2,5 sn'de bir gelir…</li>}</ul>
  </div>
}

// ------------------------------------------------------------------ error rules
function Exploding(): never { throw new Error("Bileşen çizilirken patladı") }
function ErrorsDemo() {
  let $dev = false
  let $boom = false
  let $name = ""
  onCleanup(errors.rule({ type: "auth" }, "page"))
  effect(() => errors.dev($dev))
  onCleanup(() => { errors.dev(false); errors.clear("page"); errors.clear({ target: "profile" }) })
  const swallow = (): void => undefined
  const SHOWN: Record<string, string> = { toast: "bildirim", inline: "satır içi", page: "tam sayfa", silent: "sessiz", custom: "özel" }
  return <div class="sc-stage">
    <ErrorPage><p class="hm-muted">Kural: auth → tam sayfa · doğrulama (hedefli) → satır içi · sunucu → bildirim · iptal → sessiz.</p></ErrorPage>
    <div class="sc-net-buttons">
      <Button variant="secondary" onClick={() => users.me().catch(swallow)}>Oturum düştü (401)</Button>
      <Button variant="secondary" onClick={() => users.crash().catch(swallow)}>Sunucu hatası (500)</Button>
      <Button variant="secondary" onClick={() => { for (let i = 0; i < 3; i++) errors.capture(new Error("Aynı hata üç kez"), { source: "manual" }) }}>Aynı hata ×3</Button>
      <Button variant="secondary" onClick={() => { $boom = true }}>Bileşen çöksün</Button>
      <Button variant="secondary" onClick={() => { void Promise.reject(new Error("Yakalanmamış söz")) }}>Yakalanmamış söz</Button>
    </div>
    <form class="sc-net-form" on:submit={(e: Event) => { e.preventDefault(); errors.clear({ target: "profile" }); users.saveProfile({ name: $name }, { meta: { target: "profile" } }).then(() => { $name = "" }, swallow) }}>
      <TextInput bind:value={$name} placeholder="Ad (boş gönderin: 422)" aria-label="Ad" />
      <Button type="submit">Profili kaydet</Button>
    </form>
    <ErrorInline target="profile" />
    {() => $boom ? <Try fallback={(_e: unknown, reset: () => void) => <p class="sc-net-error" role="alert">Sınır yakaladı. <Button size="sm" variant="ghost" onClick={() => { $boom = false; reset() }}>Sıfırla</Button></p>} log={false}><Exploding /></Try> : null}
    <Toggle bind:value={$dev} label="Geliştirici katmanı (sol altta)" />
    <div class="sc-speed-scroll"><table class="sc-speed-table sc-net-errors">
      <thead><tr><th>tür / kod</th><th>kaynak</th><th class="sc-num">sayı</th><th>gösterim</th></tr></thead>
      <tbody>{() => errors.list().length ? errors.list().slice(0, 8).map((c: Captured) => <tr><td><code>{c.error.type}/{c.error.code}</code></td><td>{c.error.source}</td><td class="sc-num">{`×${c.count}`}</td><td>{SHOWN[c.shown] ?? c.shown}</td></tr>) : <tr><td colspan="4" class="hm-muted">Henüz hata yok.</td></tr>}</tbody>
    </table></div>
  </div>
}

export const title = "Ağ ve hatalar"

export default function Network() {
  return <Section kicker="Altyapı" title="Ağ ve hatalar" lead="Bütün istekler tek merkezden geçer: kategori, anahtar ve politika (latest, dedupe, queue, parallel), öncelik, yeniden deneme, çevrimdışı kuyruk ve middleware zinciri. Hatalar tek toplayıcıda AppError olur, kurallara göre gösterilir.">
    <Demo wide title="Canlı istek izleyici" desc="Her istek: kategori, politika, öncelik, kaynak ve middleware adımlarının süreleri (satıra tıklayın). Başka bir sayfaya gidip dönün: sayfa parçaları da net'ten geçer (route önceliği)."
      code={`net.use(timing(), cache(), normalizeErrors())
net.on("net:done", ({ ctx }) => console.log(ctx.req.key, ctx.steps))
net.pending("users")   // reactive count`}>
      <Inspector />
    </Demo>
    <Demo title="dedupe: 3 bileşen, 1 istek" desc="Aynı anahtar uçuştayken gelen istekler aynı yanıtı paylaşır; birinin iptali ötekileri bozmaz."
      code={`class UsersApi extends Api {
  base = appUrl("demo-api")   // public/demo-api, on every route
  list = this.get<User[]>("/users.json")   // GET → dedupe
}
const users = api(UsersApi)
await users.list()`}>
      <DedupeDemo />
    </Demo>
    <Demo title="latest: arama iptali" desc="Aynı kategoride yeni istek eskisini iptal eder; yalnız son yazılanın sonucu gelir. Gecikmeyi artırınca iptaller çoğalır."
      code={`search = this.get<User[], { q: string }>("/users.json", { category: "search", policy: "latest" })
users.search({ q })   // the older search is aborted`}>
      <LatestDemo />
    </Demo>
    <Demo title="Mock ↔ gerçek, yavaş ağ, hata oranı" desc="Mock sağlayıcı tarayıcıda yanıt verir: tohumlu veri, durumlu CRUD, gecikme ve hata oranı."
      code={`import { crud, reply } from "hadi-march/net/mock"
const m = net.mock({ ...crud("/demo-api/users", seed), "GET /demo-api/me.json": () => reply(401) }, { delay: [300, 600] })
m.set({ errorRate: 0.2 })      net.mock(false)   // back to the server
net.setOnline(false)            // requests wait in the offline queue`}>
      <MockDemo />
    </Demo>
    <Demo title="WebSocket bildirim akışı (mock)" desc="Yönetilen bağlantı: jitter'lı yeniden bağlanma, heartbeat, konu aboneliği (yeniden bağlanınca yenilenir), korelasyonlu istek-yanıt."
      code={`const sock = socket<Notice>("ws:/live", { heartbeat: { interval: 25_000 } })
sock.subscribe("notices", (m) => …)
const r = await sock.request({ type: "ask" })
sock.state()   // "open" | "reconnecting" | …`}>
      <SocketDemo />
    </Demo>
    <Demo wide title="Hata kuralları" desc="window hataları, yakalanmamış sözler, sınırlar, net ve WS hataları tek toplayıcıya gelir; aynı hata tekrar gösterilmez, sayılır. report() kancası varsayılan olarak hiçbir yere göndermez."
      code={`errors.install()
errors.rule({ type: "auth" }, "page")                       // <ErrorPage>
users.saveProfile(v, { meta: { target: "profile" } })        // 422 → <ErrorInline target="profile" />
errors.report((e) => myLogger.send(e))                      // opt-in`}>
      <ErrorsDemo />
    </Demo>
  </Section>
}
