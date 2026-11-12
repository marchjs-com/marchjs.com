// API examples of the data group: queries and mutations, access control, grouping (hadi-march/data), schemas
// (hadi-march/schema) and the component registry (loaded when its example opens).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, effect, untrack, onCleanup, Await } from "hadi-march";
import {
  access, aggregate, aggregates, can, Can, clearCache, configure, denied, fetchJson, Gate, groupRows, hasMethod, hasRole,
  invalidate, mutation, query, resource, role, setAccess, signedIn, VirtualList, type AccessInput, type Denial,
} from "hadi-march/data";
import { fieldType, options, schema, TYPES, type FieldSpec } from "hadi-march/schema";
import { Button, Badge, Segmented, TextInput } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { ORDERS, money } from "./_orders.ts";
import "./data.css";
export { default as SIG } from "./data.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const json = (v: unknown) => JSON.stringify(v)

// ---- access: three sample users; every example puts the page's own access state back when it closes
type PersonaId = "guest" | "viewer" | "admin"
const PERSONAS: Record<PersonaId, AccessInput | null> = {
  guest: null,
  viewer: { user: { id: 1, name: "Ada" }, roles: ["viewer"], perms: ["reports.view"], methods: ["password"] },
  admin: { user: { id: 2, name: "Deniz" }, roles: ["admin", "viewer"], perms: ["*"], methods: ["password", "passkey"] },
}
const PERSONA_OPTS = [{ value: "guest", label: "Misafir" }, { value: "viewer", label: "İzleyici" }, { value: "admin", label: "Yönetici" }]
const personaPlay = { key: "persona", label: "Kullanıcı", default: "viewer", options: PERSONA_OPTS }
function sandbox() { const prev = untrack(access); onCleanup(() => setAccess(prev)) }
/** A user picker that sets the access state (restored when the example closes). */
function Persona(props: { start?: PersonaId }) {
  sandbox()
  const who = signal<string>(props.start ?? "viewer")
  effect(() => setAccess(PERSONAS[who() as PersonaId]))
  return <Segmented value={who} onChange={(v: string) => who.set(v)} options={PERSONA_OPTS} aria-label="Kullanıcı" />
}
const usePersona = (p: { values: { persona: PersonaId } }) => { sandbox(); effect(() => setAccess(PERSONAS[p.values.persona])) }

// ---- sample rows
// ---- sample rows: ./_orders.ts
// ---- a fake server for queries: a list that changes, answered after a short wait
const server = { version: 1, calls: 0 }
const fetchStock = async (page: number, signal?: AbortSignal) => {
  server.calls++
  await wait(450)
  if (signal?.aborted) throw Object.assign(new Error("Aborted"), { name: "AbortError" })
  return Array.from({ length: 3 }, (_, i) => `Ürün ${page * 3 + i + 1} · stok ${((page * 7 + i * 5 + server.version * 3) % 40) + 1}`)
}
const usersUrl = () => new URL("demo-api/users.json", document.baseURI).href

export default examples({
  "hadi-march/data": {
    access: {
      code: `const a = access()            // reactive: user, roles, perms, methods, meta
<p>{() => access().user?.name ?? "Misafir"}</p>`,
      run: () => <div class="sc-ex-data-stack">
        <Persona />
        <Out label="user" value={() => json(access().user)} />
        <Out label="roles" value={() => json(access().roles)} />
        <Out label="perms" value={() => json(access().perms)} />
      </div>,
    },
    aggregate: {
      code: `aggregate(orders, (o) => o.amount, "sum")      // 12925
aggregate(orders, (o) => o.region, "distinct")  // 3
aggregate(orders, (o) => o.amount, (vals) => Math.max(...vals) - Math.min(...vals))`,
      run: () => {
        const kind = signal("sum")
        const rows = signal(ORDERS.slice(0, 5))
        const kinds = ["sum", "avg", "min", "max", "count", "distinct"]
        const result = () => aggregate(rows(), (o) => (kind() === "distinct" ? o.region : o.amount), kind() as "sum")
        return <div class="sc-ex-data-stack">
          <Segmented value={kind} onChange={(v: string) => kind.set(v)} options={kinds} aria-label="Toplama" />
          <Row>
            <Button onClick={() => rows.update((l) => ORDERS.slice(0, Math.min(ORDERS.length, l.length + 1)))}>Sipariş ekle</Button>
            <Button variant="ghost" onClick={() => rows.update((l) => l.slice(0, Math.max(0, l.length - 1)))}>Çıkar</Button>
            <Out label={() => `${kind()} (${rows().length} satır)`} value={() => { const r = result(); return kind() === "count" || kind() === "distinct" ? String(r) : money(r) }} />
          </Row>
        </div>
      },
    },
    aggregates: {
      code: `aggregates(orders, [
  { key: "total", value: (o) => o.amount, aggregate: "sum" },
  { key: "regions", value: (o) => o.region, aggregate: "distinct" },
])   // { total: 12925, regions: 3 }`,
      run: () => {
        const paidOnly = signal(false)
        const rows = () => (paidOnly() ? ORDERS.filter((o) => o.paid) : ORDERS)
        const out = () => aggregates(rows(), [
          { key: "total", value: (o) => o.amount, aggregate: "sum" },
          { key: "average", value: (o) => o.amount, aggregate: "avg" },
          { key: "regions", value: (o) => o.region, aggregate: "distinct" },
        ])
        return <div class="sc-ex-data-stack">
          <Row><Button onClick={() => paidOnly.update((x) => !x)}>{() => (paidOnly() ? "Tüm siparişler" : "Yalnız ödenenler")}</Button></Row>
          <Row>
            <Out label="total" value={() => money(out().total)} />
            <Out label="average" value={() => money(out().average)} />
            <Out label="regions" value={() => String(out().regions)} />
          </Row>
        </div>
      },
    },
    can: {
      code: `can("reports.view")                 // one permission
can(["users.edit", "users.admin"])  // any of them
can((a) => a.meta.plan === "pro")   // a predicate over access()`,
      run: () => <div class="sc-ex-data-stack">
        <Persona />
        <Row>
          <Out label='can("reports.view")' value={() => String(can("reports.view"))} />
          <Out label='can("users.edit")' value={() => String(can("users.edit"))} />
          <Out label="can(a => a.user)" value={() => String(can((a) => !!a.user))} />
        </Row>
      </div>,
    },
    Can: {
      code: `<Can perm="reports.export" fallback={<Badge>Yetki yok</Badge>}>
  <Button>Raporu indir</Button>
</Can>`,
      play: { options: [personaPlay, { key: "fallback", label: "Yedek içerik", default: true }] },
      run: (p: { values: { persona: PersonaId; fallback: boolean } }) => {
        usePersona(p)
        return <Row>
          <Can perm="reports.view" fallback={() => (p.values.fallback ? <Badge>Rapor görme yetkisi yok</Badge> : null)}><Button>Raporu aç</Button></Can>
          <Can role="admin" fallback={() => (p.values.fallback ? <Badge tone="warn">Yalnız yönetici</Badge> : null)}><Button variant="primary">Kullanıcıları yönet</Button></Can>
        </Row>
      },
    },
    clearCache: {
      code: `async function signOut() {
  await auth.signOut()
  clearCache()          // no user's data stays in memory
}`,
      run: () => {
        const mounts = signal(0), log = signal<string[]>([])
        const Reader = () => {
          const q = query(() => { log.update((l) => [...l, `${now()} sunucuya gidildi`]); return wait(300).then(() => "Acme bakiye: ₺12.925") }, { key: "ex-clear-cache", staleTime: 60_000 })
          return <Out label="veri" value={() => (q.loading() ? "yükleniyor…" : q())} />
        }
        return <div class="sc-ex-data-stack">
          <Row>
            <Button onClick={() => mounts.update((x) => x + 1)}>Ekranı yeniden aç</Button>
            <Button variant="ghost" onClick={() => { clearCache(); log.update((l) => [...l, `${now()} önbellek boşaltıldı`]) }}>clearCache()</Button>
          </Row>
          {() => { mounts(); return untrack(() => <Reader />) }}
          <Log lines={log} />
        </div>
      },
    },
    configure: {
      code: `configure({
  retry: 1,
  onError: (e) => toast.error(e.message),
})`,
      run: () => {
        onCleanup(() => configure({ retry: 2, retryDelay: 300 }))
        const retry = signal(2), log = signal<string[]>([]), tick = signal(0)
        let attempt = 0
        const r = resource(async () => {
          if (!tick()) return "henüz çalıştırılmadı"
          attempt++
          log.update((l) => [...l, `${now()} deneme ${attempt}`])
          await wait(80)
          throw Object.assign(new Error("Sunucu meşgul"), { transient: true })
        }, { refetchOnFocus: false })
        const go = () => { attempt = 0; log.set([]); configure({ retry: retry(), retryDelay: 120 }); tick.update((x) => x + 1) }
        return <div class="sc-ex-data-stack">
          <Row><Segmented value={retry} onChange={(v: number) => retry.set(v)} options={[0, 1, 2, 3]} aria-label="retry" /><Button onClick={go}>İsteği çalıştır</Button></Row>
          <Out label="sonuç" value={() => (r.loading() ? "deneniyor…" : r.error() ? `hata: ${(r.error() as Error).message}` : String(r()))} />
          <Log lines={log} />
        </div>
      },
    },
    denied: {
      code: `denied({ perm: "users.edit" })        // "auth" when signed out, "perm" when not allowed
denied({ method: "passkey" })          // "method"
denied({ role: "admin" }) ?? "izinli"`,
      run: () => {
        const reqs = [{ perm: "reports.view" }, { perm: "users.edit" }, { role: "admin" }, { method: "passkey" }]
        return <div class="sc-ex-data-stack">
          <Persona start="guest" />
          <ul class="sc-ex-data-list">{reqs.map((r) => <li><code>{json(r)}</code><span>{() => denied(r) ?? "izinli"}</span></li>)}</ul>
        </div>
      },
    },
    fetchJson: {
      code: `const users = await fetchJson<User[]>("/api/users")
await fetchJson("/api/users", { method: "POST", body: { name: "Ada" } })
// errors: e.status, e.message (the server's message)`,
      run: () => {
        const out = signal("—")
        const load = async (url: string) => {
          out.set("yükleniyor…")
          try { const users = await fetchJson<{ name: string; role: string }[]>(url); out.set(`${users.length} kullanıcı · ilk: ${users[0]?.name} (${users[0]?.role})`) }
          catch (e) { out.set(`hata ${(e as { status?: number }).status}: ${(e as Error).message}`) }
        }
        return <div class="sc-ex-data-stack">
          <Row>
            <Button onClick={() => load(usersUrl())}>users.json oku</Button>
            <Button variant="ghost" onClick={() => load(new URL("demo-api/yok.json", document.baseURI).href)}>Olmayan adres</Button>
          </Row>
          <Out label="sonuç" value={out} />
        </div>
      },
    },
    Gate: {
      code: `<Gate method="passkey" fallback={(why) => <p>Bu ekran için {why} gerekli</p>}>
  <BillingSettings />
</Gate>`,
      play: { options: [personaPlay, { key: "need", label: "Gereken", default: "method", options: [{ value: "auth", label: "Giriş" }, { value: "method", label: "Geçiş anahtarı" }, { value: "role", label: "Yönetici" }] }] },
      run: (p: { values: { persona: PersonaId; need: string } }) => {
        usePersona(p)
        const why: Record<Denial, string> = { auth: "Önce giriş yapın.", method: "Bu ekran geçiş anahtarıyla giriş ister.", role: "Bu ekran yalnız yöneticilere açık.", perm: "Yetkiniz yok." }
        return <div>{() => {
          const need = p.values.need
          return untrack(() => <Gate auth={need === "auth" || undefined} method={need === "method" ? "passkey" : undefined} role={need === "role" ? "admin" : undefined}
            fallback={(reason: Denial) => <p role="note"><Badge tone="warn">{reason}</Badge> {why[reason]}</p>}>
            <p><Badge tone="success">açık</Badge> Fatura ayarları</p>
          </Gate>)
        }}</div>
      },
    },
    groupRows: {
      code: `const items = groupRows(orders, [{ key: "region", value: (o) => o.region }], {
  aggregates: [{ key: "amount", value: (o) => o.amount, aggregate: "sum" }],
  collapsed: (id) => closed.has(id),
})   // [{ kind: "group", id: "Ege", count: 3, aggregates: { amount: … } }, { kind: "row", row }, …]`,
      run: () => {
        const closed = signal(new Set<string>())
        const flip = (id: string) => closed.update((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
        const items = () => groupRows(ORDERS, [{ key: "region", value: (o) => o.region }], { aggregates: [{ key: "amount", value: (o) => o.amount, aggregate: "sum" }], collapsed: (id) => closed().has(id) })
        return <ul class="sc-ex-data-list">{() => items().map((it) => (it.kind === "group"
          ? <li class="is-group" role="button" tabindex="0" aria-expanded={String(it.open)} onClick={() => flip(it.id)} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(it.id) } }}>
            <span>{it.open ? "▾" : "▸"} {String(it.value)} ({it.count})</span><span>{money(it.aggregates.amount)}</span></li>
          : <li><span>{it.row.customer}</span><span>{money(it.row.amount)}</span></li>))}</ul>
      },
    },
    hasMethod: {
      code: `if (!hasMethod("passkey")) askForPasskey()
hasMethod(["otp", "passkey"])   // any of them`,
      run: () => <div class="sc-ex-data-stack">
        <Persona />
        <Row>
          <Out label='hasMethod("password")' value={() => String(hasMethod("password"))} />
          <Out label='hasMethod("passkey")' value={() => String(hasMethod("passkey"))} />
        </Row>
      </div>,
    },
    hasRole: {
      code: `hasRole("admin")
hasRole(["editor", "admin"])   // any of them`,
      run: () => <div class="sc-ex-data-stack">
        <Persona />
        <Row>
          <Out label='hasRole("admin")' value={() => String(hasRole("admin"))} />
          <Out label='hasRole(["viewer", "admin"])' value={() => String(hasRole(["viewer", "admin"]))} />
        </Row>
      </div>,
    },
    invalidate: {
      code: `const stock = query(() => api.stock(page), { key: () => ["stock", page] })
await api.restock()
invalidate("stock")   // every active ["stock", …] query refetches`,
      run: () => {
        const page = signal(0)
        const q = query(({ signal }) => fetchStock(page(), signal), { key: () => ["ex-stock", page()], keep: true, refetchOnFocus: false })
        return <div class="sc-ex-data-stack">
          <Row>
            <Button onClick={() => page.update((x) => (x + 1) % 3)}>Sonraki sayfa</Button>
            <Button variant="primary" onClick={() => { server.version++; invalidate("ex-stock") }}>Stok geldi → invalidate</Button>
            <Out label="sunucu çağrısı" value={() => { q(); return String(server.calls) }} />
          </Row>
          <ul class="sc-ex-data-list" aria-busy={() => String(q.loading() || q.refreshing())}>{() => (q() ?? []).map((s) => <li class={q.refreshing() ? "is-off" : ""}>{s}</li>)}</ul>
        </div>
      },
    },
    mutation: {
      code: `const like = mutation((id) => api.like(id), {
  optimistic: (id) => { likes.update((n) => n + 1); return () => likes.update((n) => n - 1) },
  invalidates: [["post", id]],
})
<Button disabled={like.pending()} onClick={() => like(post.id)}>Beğen</Button>`,
      run: () => {
        const likes = signal(41), fail = signal(false), log = signal<string[]>([])
        const like = mutation(async (_id: number) => { await wait(600); if (fail()) throw new Error("Bağlantı koptu"); return "kaydedildi" }, {
          optimistic: () => { likes.update((n) => n + 1); return () => likes.update((n) => n - 1) },
          onSuccess: (r) => log.update((l) => [...l, `${now()} ${r}`]),
          onError: (e) => log.update((l) => [...l, `${now()} geri alındı: ${(e as Error).message}`]),
        })
        return <div class="sc-ex-data-stack">
          <Row>
            <Button variant="primary" disabled={() => like.pending()} onClick={() => like(1).catch(() => {})}>{() => `Beğen · ${likes()}`}</Button>
            <Button variant="ghost" onClick={() => fail.update((x) => !x)}>{() => (fail() ? "Ağ: kopuk" : "Ağ: bağlı")}</Button>
            <Out label="pending" value={() => String(like.pending())} />
          </Row>
          <Log lines={log} />
        </div>
      },
    },
    query: {
      code: `const users = query(({ signal }) => api.users({ page, signal }), { key: () => ["users", page], keep: true })
<p>{() => users.loading() ? "Yükleniyor…" : users()?.length}</p>
users.refetch()   users.mutate([])   users.state()   // "loading" | "error" | "ready"`,
      run: () => {
        const page = signal(0)
        const q = query(({ signal }) => fetchStock(page(), signal), { key: () => ["ex-query", page()], keep: true, refetchOnFocus: false })
        return <div class="sc-ex-data-stack">
          <Row>
            <Button disabled={() => page() === 0} onClick={() => page.update((x) => x - 1)}>‹ Önceki</Button>
            <Button onClick={() => page.update((x) => x + 1)}>Sonraki ›</Button>
            <Button variant="ghost" onClick={() => q.refetch()}>refetch()</Button>
            <Out label="state" value={() => `${q.state()}${q.refreshing() ? " · yenileniyor" : ""}`} />
          </Row>
          <ul class="sc-ex-data-list">{() => (q() ?? []).map((s) => <li>{s}</li>)}</ul>
        </div>
      },
    },
    resource: {
      code: `const user = resource(async ({ signal }) => {
  const id = userId()                 // read before the first await: tracked
  return fetchJson(\`/api/users/\${id}\`, { signal })
})`,
      run: () => {
        const id = signal(0)
        const user = resource(async ({ signal }) => {
          const i = id()
          const list = await fetchJson<{ name: string; email: string }[]>(usersUrl(), { signal })
          await wait(250)
          return list[i % list.length]
        }, { refetchOnFocus: false })
        return <div class="sc-ex-data-stack">
          <Row><Button onClick={() => id.update((x) => x + 1)}>Sonraki kullanıcı</Button><Out label="id" value={() => String(id() + 1)} /></Row>
          <Out label="kullanıcı" value={() => (user.loading() ? "yükleniyor…" : `${user()?.name} · ${user()?.email}`)} />
        </div>
      },
    },
    role: {
      code: `<Badge>{() => role() ?? "misafir"}</Badge>   // the first (primary) role`,
      run: () => <Row><Persona /><Badge tone="info">{() => role() ?? "misafir"}</Badge></Row>,
    },
    setAccess: {
      code: `setAccess({ user: { id: 7, name: "Ada" }, roles: ["editor"], perms: ["posts.edit"], methods: ["password"] })
setAccess(null)   // signed out`,
      run: () => {
        sandbox()
        const log = signal<string[]>([])
        const set = (id: PersonaId) => { setAccess(PERSONAS[id]); log.update((l) => [...l, `${now()} setAccess(${id === "guest" ? "null" : `{ roles: ${json(PERSONAS[id]?.roles)} }`})`]) }
        return <div class="sc-ex-data-stack">
          <Row>
            <Button onClick={() => set("viewer")}>Ada (izleyici)</Button>
            <Button onClick={() => set("admin")}>Deniz (yönetici)</Button>
            <Button variant="ghost" onClick={() => set("guest")}>Çıkış</Button>
          </Row>
          <Out label="signedIn / can('users.edit')" value={() => `${signedIn()} / ${can("users.edit")}`} />
          <Log lines={log} />
        </div>
      },
    },
    signedIn: {
      code: `<If when={signedIn} else={<Button>Giriş yap</Button>}><UserMenu /></If>`,
      run: () => <div class="sc-ex-data-stack">
        <Persona start="guest" />
        {() => (signedIn() ? <p>Hoş geldin, <strong>{String(access().user?.name)}</strong></p> : <Button variant="primary" onClick={() => setAccess(PERSONAS.viewer)}>Giriş yap</Button>)}
      </div>,
    },
    VirtualList: {
      code: `<VirtualList items={$messages} key={(m) => m.id} estimate={64} gap={4}
  render={(m) => <MessageRow message={m()} />} onEndReached={loadOlder} />`,
      play: { options: [{ key: "count", label: "Satır", default: 1000, options: [{ value: 100, label: "100" }, { value: 1000, label: "1.000" }, { value: 100000, label: "100.000" }] }, { key: "gap", label: "Aralık", default: 0, options: [{ value: 0, label: "0" }, { value: 6, label: "6 px" }] }] },
      run: (p: { values: { count: number; gap: number } }) => {
        const words = ["Teslimat yola çıktı.", "Fatura hazır, onayınızı bekliyor; ödeme vadesi ay sonu.", "Toplantı 14.00'e alındı.", "Yeni sipariş: 12 koli, Ege deposundan çıkacak ve iki gün içinde teslim edilecek."]
        const items = computed(() => Array.from({ length: p.values.count }, (_, i) => ({ id: i, title: `#${i + 1} · Acme`, text: words[(i * 7) % words.length]! })))
        const reached = signal(0)
        return <div class="sc-ex-data-stack">
          {() => { const gap = p.values.gap; return untrack(() => <VirtualList class="sc-ex-data-vlist" label="Mesajlar" items={items} key={(m) => m.id} estimate={56} gap={gap} onEndReached={() => reached.update((x) => x + 1)}
            render={(m) => <div class="sc-ex-data-item"><strong>{() => m().title}</strong><p>{() => m().text}</p></div>} />) }}
          <Out label="sona ulaşıldı" value={() => `${reached()} kez · ${items().length.toLocaleString("tr-TR")} satır`} />
        </div>
      },
    },
  },
  "hadi-march/schema": {
    fieldType: {
      code: `fieldType("plate", {
  coerce: (v) => String(v ?? "").toUpperCase().replace(/\\s+/g, " ").trim(),
  empty: "",
  check: (v) => (/^\\d{2} [A-Z]{1,3} \\d{2,4}$/.test(v) ? null : "Plaka 34 ABC 123 biçiminde olmalı"),
})
const Car = schema({ plate: { type: "plate", required: true } })`,
      run: () => {
        if (!TYPES.plate) fieldType("plate", {
          coerce: (v) => String(v ?? "").toUpperCase().replace(/\s+/g, " ").trim(), empty: "",
          check: ((v: string) => (/^\d{2} [A-Z]{1,3} \d{2,4}$/.test(v) ? null : "Plaka 34 ABC 123 biçiminde olmalı")) as never,
        })
        const Car = schema({ plate: { type: "plate", required: true, label: "Plaka" } })
        const raw = signal("34 abc 123")
        return <div class="sc-ex-data-stack">
          <TextInput value={raw} onChange={(v: string) => raw.set(v)} aria-label="Plaka" />
          <Out label="parse" value={() => json(Car.parse({ plate: raw() }))} />
          <Out label="hata" value={() => Car.validateField("plate", raw()) ?? "yok"} />
        </div>
      },
    },
    options: {
      code: `options({ options: ["draft", "live"] })
// [{ value: "draft", label: "draft" }, { value: "live", label: "live" }]
options({ options: () => regions.map((r) => ({ value: r.id, label: r.name })) })`,
      run: () => {
        const inputs: Record<string, Pick<FieldSpec, "options">> = {
          dizi: { options: ["taslak", "yayında"] },
          nesne: { options: [{ value: 1, label: "Ege", hint: "3 depo" }, { value: 2, label: "Marmara" }] },
          "işlev": { options: () => [...new Set(ORDERS.map((o) => o.region))] },
        }
        const pick = signal("dizi")
        return <div class="sc-ex-data-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(inputs)} aria-label="Girdi" />
          <pre class="sc-ex-data-pre">{() => options(inputs[pick()]!).map((o) => json(o)).join("\n")}</pre>
        </div>
      },
    },
    schema: {
      code: `const Product = schema({
  title: { type: "text", required: true, max: 40 },
  price: { type: "money", currency: "TRY", min: 1 },
  status: { type: "pick", options: ["draft", "live"] as const, default: "draft" },
})
Product.validate(values)   // { ok, errors: { price: "…" }, values }`,
      run: () => {
        const Product = schema({
          title: { type: "text", required: true, max: 40, label: "Ad" },
          price: { type: "money", currency: "TRY", min: 1, label: "Fiyat" },
          email: { type: "email", label: "İletişim" },
        })
        const values = signal<Record<string, string>>({ title: "Acme kupa", price: "0", email: "satis@acme" })
        const set = (k: string) => (v: string) => values.update((o) => ({ ...o, [k]: v }))
        const res = () => Product.validate(values())
        return <div class="sc-ex-data-stack">
          {Product.fields.map((f) => <TextInput value={values()[f.name] ?? ""} onChange={set(f.name)} aria-label={f.label} placeholder={f.label} />)}
          <Out label="ok" value={() => String(res().ok)} />
          <Out label="errors" value={() => json(res().errors)} />
          <Out label="values" value={() => json(res().values)} />
        </div>
      },
    },
    TYPES: {
      code: `Object.keys(TYPES)                        // "text", "email", "money", "pick", …
TYPES.money.coerce("1.234,50", field)      // 1234.5
TYPES.list.coerce("a, b\\nc", field)        // ["a", "b", "c"]`,
      run: () => {
        const name = signal("money"), raw = signal("1.234,50")
        const pickable = ["text", "email", "int", "money", "bool", "date", "list", "json"]
        const field = () => ({ name: "x", label: "x", type: name() })
        return <div class="sc-ex-data-stack">
          <Segmented value={name} onChange={(v: string) => name.set(v)} options={pickable} aria-label="Tür" />
          <TextInput value={raw} onChange={(v: string) => raw.set(v)} aria-label="Ham değer" />
          <Out label="coerce" value={() => json(TYPES[name()]!.coerce(raw(), field()))} />
          <Out label="empty" value={() => json(TYPES[name()]!.empty)} />
          <Out label="kayıtlı türler" value={() => String(Object.keys(TYPES).length)} />
        </div>
      },
    },
  },
  "hadi-march/components/registry.gen.ts": {
    registry: {
      code: `import { registry } from "hadi-march/components/registry.gen.ts"
const forms = registry.filter((e) => e.meta.category === "forms")
const demo = await forms[0].demo()   // lazy demo module`,
      run: () => <Await for={() => import("hadi-march/components/registry.gen.ts")} loading={<p class="hm-muted">Yükleniyor…</p>}>{({ registry }: { registry: readonly { meta: { name: string; category: string; summary: string; status: string } }[] }) => {
        const cats = [...new Set(registry.map((e) => e.meta.category))].sort()
        const cat = signal(cats.includes("data") ? "data" : cats[0]!)
        const shown = () => registry.filter((e) => e.meta.category === cat())
        return <div class="sc-ex-data-stack">
          <Segmented value={cat} onChange={(v: string) => cat.set(v)} options={cats} aria-label="Kategori" />
          <Out label="bileşen" value={() => `${shown().length} / ${registry.length}`} />
          <ul class="sc-ex-data-grid">{() => shown().map((e) => <li title={e.meta.summary}><strong>{e.meta.name}</strong> <small>{e.meta.status}</small></li>)}</ul>
        </div>
      }}</Await>,
    },
  },
})
