// API examples of hadi-march/ui, Timeline … Wizard.
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, effect, untrack, onCleanup } from "hadi-march";
import { Timeline, ToastHost, Toggle, Toolbar, Tooltip, Tree, TreeEditor, TypingIndicator, UpdateBanner, UrlInput, UserMenu, Widget, Wizard, Button, Badge, Divider, toast, widgetPoint, type ColorToken, type TreeNode, type TimelineItem } from "hadi-march/ui";
import { schema } from "hadi-march/schema";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { now, tl, COLORS } from "./_ui-d.ts";
import "./ui-d.css";
export { default as SIG } from "./ui-d3.sig.gen.ts";


export default examples({
  "hadi-march/ui": {
    ToastHost: {
      code: `// once, near the root of the app:
<ToastHost />
toast("Kaydedildi", { kind: "success" })`,
      play: { options: [{ key: "kind", label: "Tür", default: "success", options: [{ value: "info", label: "bilgi" }, { value: "success", label: "başarı" }, { value: "warn", label: "uyarı" }] }, { key: "action", label: "Geri al eylemi", default: false }] },
      run: (p: { values: { kind: string; action: boolean } }) => {
        const n = signal(0)
        const show = () => { n.update((x) => x + 1); toast(`HADİ belgesi kaydedildi (#${n.peek()})`, { kind: p.values.kind as "info", timeout: 5000, action: p.values.action ? { label: "Geri al", run: () => n.update((x) => x - 1) } : undefined }) }
        return <div class="sc-ex-stack">
          <Row><Button variant="primary" onClick={show}>Bildirim göster</Button><Button variant="ghost" onClick={() => toast.clear()}>Hepsini kapat</Button><Out label="açık" value={() => toast.list().length} /></Row>
          <div class="sc-ex-ui-d-toasts"><ToastHost /></div>
        </div>
      },
    },
    Toggle: {
      code: `<Toggle value={notify} label="E-posta bildirimleri" onChange={(on) => save({ notify: on })} />`,
      play: { options: [{ key: "color", label: "Renk", default: "primary", options: COLORS }, { key: "disabled", label: "Devre dışı", default: false }] },
      run: (p: { values: { color: string; disabled: boolean } }) => {
        const notify = signal(true), log = signal<string[]>([])
        return <div class="sc-ex-stack">
          {() => { const { color, disabled } = p.values; return <Toggle value={notify} label="E-posta bildirimleri" color={color as ColorToken} disabled={disabled}
            onChange={(on: boolean) => log.update((l) => [...l.slice(-3), `${now()} kaydedildi: ${on ? "açık" : "kapalı"}`])} /> }}
          <Log lines={log} />
        </div>
      },
    },
    Toolbar: {
      code: `<Toolbar label="Biçim" end={<Button size="sm">Kaydet</Button>}>
  <Button size="sm">K</Button><Button size="sm">İ</Button>
</Toolbar>`,
      play: { options: [{ key: "end", label: "Sondaki düğme", default: true }, { key: "divider", label: "Ayraç", default: true }] },
      run: (p: { values: { end: boolean; divider: boolean } }) => {
        const bold = signal(false), italic = signal(false), saved = signal("—")
        return <div class="sc-ex-stack">
          {() => { const { end, divider } = p.values; return <Toolbar label="Biçim" end={end ? <Button size="sm" variant="primary" onClick={() => saved.set(now())}>Kaydet</Button> : undefined}>
            <Button size="sm" variant={() => (bold() ? "secondary" : "ghost")} aria-pressed={() => String(bold())} onClick={() => bold.update((x) => !x)}>Kalın</Button>
            <Button size="sm" variant={() => (italic() ? "secondary" : "ghost")} aria-pressed={() => String(italic())} onClick={() => italic.update((x) => !x)}>Eğik</Button>
            {divider ? <Divider vertical /> : null}
            <Button size="sm" variant="ghost" onClick={() => { bold.set(false); italic.set(false) }}>Temizle</Button>
          </Toolbar> }}
          <Row><Out label="biçim" value={() => [bold() && "kalın", italic() && "eğik"].filter(Boolean).join(" + ") || "düz"} /><Out label="kaydedildi" value={saved} /></Row>
        </div>
      },
    },
    Tooltip: {
      code: `<Tooltip text="Bağlantıyı kopyala" placement="top">
  <IconButton icon={link} label="Kopyala" />
</Tooltip>`,
      play: { options: [{ key: "placement", label: "Yer", default: "top", options: [{ value: "top", label: "üst" }, { value: "bottom", label: "alt" }, { value: "top-start", label: "üst-baş" }] }] },
      run: (p: { values: { placement: string } }) => {
        const copied = signal(0)
        return <Row>
          {() => { const placement = p.values.placement; return <Tooltip text={() => (copied() ? `Kopyalandı (${copied()})` : "Bağlantıyı kopyala")} placement={placement as "top"}>
            <Button onClick={() => copied.update((x) => x + 1)}>Paylaş</Button>
          </Tooltip> }}
          <span class="hm-muted">Üzerine gelin ya da Tab ile odaklayın</span>
        </Row>
      },
    },
    TreeEditor: {
      code: `<TreeEditor value={config} onChange={(v) => config.set(v)} expand={1}
  schema={{ type: "object", properties: { port: { type: "integer", minimum: 1 } } }} />`,
      play: { options: [{ key: "search", label: "Arama kutusu", default: false }, { key: "readonly", label: "Salt okunur", default: false }, { key: "expand", label: "Açık seviye", default: 1, options: [0, 1, 2] }] },
      run: (p: { values: { search: boolean; readonly: boolean; expand: number } }) => {
        const config = signal<unknown>({ name: "hadi-api", port: 8080, debug: false, hosts: ["hadisosyal.com", "api.hadisosyal.com"] })
        const sch = { type: "object", required: ["name", "port"], properties: { name: { type: "string", minLength: 2 }, port: { type: "integer", minimum: 1, maximum: 65535 }, debug: { type: "boolean" }, hosts: { type: "array", items: { type: "string" } } } }
        return <div class="sc-ex-stack">
          {() => { const { search, readonly, expand } = p.values; return <TreeEditor label="Ayarlar" value={config} schema={sch as never} search={search} readonly={readonly} expand={expand} /> }}
          <Out label="JSON" value={() => JSON.stringify(config())} />
        </div>
      },
    },
    TypingIndicator: {
      code: `<TypingIndicator names={typing} />                         // hidden when empty
<TypingIndicator names={["Ada", "Linus"]} variant="inline" text />`,
      play: { options: [{ key: "variant", label: "Görünüm", default: "inline", options: [{ value: "bubble", label: "balon" }, { value: "inline", label: "satır" }] }, { key: "text", label: "Metin", default: true }] },
      run: (p: { values: { variant: string; text: boolean } }) => {
        const typing = signal<string[]>(["Ada"])
        const flip = (name: string) => typing.update((l) => (l.includes(name) ? l.filter((x) => x !== name) : [...l, name]))
        return <div class="sc-ex-stack">
          <TypingIndicator names={typing} variant={() => p.values.variant as "inline"} text={() => p.values.text} />
          <Row>{["Ada", "Linus", "Grace", "HADİ"].map((n) => <Button size="sm" variant={() => (typing().includes(n) ? "secondary" : "ghost")} aria-pressed={() => String(typing().includes(n))} onClick={() => flip(n)}>{n}</Button>)}</Row>
        </div>
      },
    },
    UpdateBanner: {
      code: `// deploys write a new build id to /build.txt; open tabs offer a reload
<UpdateBanner url="/build.txt" every={5} />`,
      play: { options: [{ key: "custom", label: "Özel metin", default: false }] },
      run: (p: { values: { custom: boolean } }) => {
        // a local stand-in for the server: only this example's URL is answered here, every other request goes on as usual
        const URL_ = "hadi-build-demo.txt", build = signal(1), reloads = signal(0)
        const real = globalThis.fetch
        const fake = ((input: RequestInfo | URL, init?: RequestInit) => (String(input).endsWith(URL_) ? Promise.resolve(new Response(`hadi-${build.peek()}`)) : real.call(globalThis, input, init))) as typeof fetch
        globalThis.fetch = fake
        onCleanup(() => { if (globalThis.fetch === fake) globalThis.fetch = real })
        return <div class="sc-ex-stack">
          <Row><Button variant="primary" onClick={() => build.update((x) => x + 1)}>Yeni sürüm yayınla</Button><Out label="sunucudaki sürüm" value={() => `hadi-${build()}`} /><Out label="yenileme" value={reloads} /></Row>
          <p class="hm-muted">Sekme sürümü 6 sn'de bir denetler.</p>
          <UpdateBanner url={URL_} every={0.1} text={() => (p.values.custom ? "HADİ 2.1 hazır: yeni panolar geldi" : undefined)}
            reloadText={() => (p.values.custom ? "Şimdi geç" : undefined)} onReload={() => reloads.update((x) => x + 1)} />
        </div>
      },
    },
    UrlInput: {
      code: `<UrlInput value={site} placeholder="https://hadisosyal.com" />   // url keyboard, trimmed`,
      play: { options: [{ key: "affix", label: "Ön ek", default: false }, { key: "readonly", label: "Salt okunur", default: false }] },
      run: (p: { values: { affix: boolean; readonly: boolean } }) => {
        const site = signal("https://hadisosyal.com/blog")
        const host = () => { try { return new URL(site()).host } catch { return "geçersiz" } }
        return <div class="sc-ex-stack">
          {() => { const { affix, readonly } = p.values; return <UrlInput aria-label="Web sitesi" value={site} prefix={affix ? "URL" : undefined} readonly={readonly} /> }}
          <Row><Out label="alan adı" value={host} /><Button size="sm" variant="ghost" onClick={() => site.set("  https://docs.hadisosyal.com  ")}>Boşluklu adres</Button></Row>
        </div>
      },
    },
    UserMenu: {
      code: `<UserMenu name="Ada" detail="ada@hadisosyal.com" items={[
  { label: "Profil", onSelect: openProfile }, "-", { label: "Çıkış yap", danger: true, onSelect: signOut },
]} />`,
      play: { options: [{ key: "compact", label: "Yalnız avatar", default: false }, { key: "detail", label: "Ayrıntı satırı", default: true }] },
      run: (p: { values: { compact: boolean; detail: boolean } }) => {
        const log = signal<string[]>([])
        const pick = (l: string) => () => log.update((x) => [...x.slice(-3), `${now()} ${l}`])
        const items = [{ label: "Profil", onSelect: pick("profil açıldı") }, { label: "Ayarlar", onSelect: pick("ayarlar açıldı") }, "-" as const, { label: "Çıkış yap", danger: true, onSelect: pick("çıkış yapıldı") }]
        return <div class="sc-ex-stack">
          {() => { const { detail, compact } = p.values; return <UserMenu name="Ada" detail={detail ? "ada@hadisosyal.com" : undefined} items={items} compact={compact} placement="bottom-start" /> }}
          <Log lines={log} />
        </div>
      },
    },
    Widget: {
      code: `const price = widgetPoint<{ amount: number }>("price", { defaults: [{ id: "plain", render: (i) => <span>{i.amount} TL</span> }] })
price.provide({ id: "card", order: 1, render: (i, ctx) => <Card>{fmt(i.amount)} {ctx.actions()}</Card> })
<Widget sources={[price]} input={{ amount: 1499 }} />`,
      play: { options: [{ key: "card", label: "Kart sağlayıcısı", default: true }, { key: "action", label: "Eylem sağlayıcısı", default: true }] },
      run: (p: { values: { card: boolean; action: boolean } }) => {
        type In = { amount: () => number }
        const point = widgetPoint<In>("hadi-price-example", { defaults: [{ id: "plain", render: (i) => <span>{() => `${i.amount()} TL`}</span> }] })
        const amount = signal(1499), copied = signal(0)
        effect(() => { if (p.values.card) untrack(() => point.provide({ id: "card", order: 1, render: (i, ctx) => <div class="sc-ex-ui-d-price"><strong>{() => tl(i.amount())}</strong><Badge tone="success">KDV dahil</Badge>{ctx.actions()}</div> })) })
        effect(() => { if (p.values.action) untrack(() => point.provide({ id: "copy", slot: "action", render: () => <Button size="sm" variant="ghost" onClick={() => copied.update((x) => x + 1)}>Kopyala</Button> })) })
        return <div class="sc-ex-stack">
          <Widget sources={[point]} input={{ amount }} />
          <Row><Button size="sm" onClick={() => amount.update((x) => x + 100)}>Fiyat +100</Button><Out label="çizen" value={() => (p.values.card ? "card" : "plain")} /><Out label="kopyalandı" value={copied} /></Row>
        </div>
      },
    },
    Wizard: {
      code: `<Wizard submitLabel="Abone ol" onSubmit={(v) => subscribe(v)} steps={[
  { title: "E-posta", schema: schema({ email: { type: "email", label: "E-posta", required: true } }) },
  { title: "Konular", schema: schema({ weekly: { type: "bool", label: "Haftalık özet", control: "switch" } }) },
]} />`,
      play: { options: [{ key: "color", label: "Renk", default: "primary", options: COLORS }, { key: "check", label: "Ek denetim", default: true }] },
      run: (p: { values: { color: string; check: boolean } }) => {
        const result = signal("—"), step = signal(0)
        const steps = () => [
          { title: "E-posta", schema: schema({ email: { type: "email", label: "E-posta", required: true } }),
            validate: p.values.check ? (v: Record<string, unknown>) => (String(v["email"] ?? "").endsWith("@hadisosyal.com") ? null : { email: "Yalnız @hadisosyal.com adresleri" }) : undefined },
          { title: "Konular", schema: schema({ weekly: { type: "bool", label: "Haftalık özet", control: "switch" }, product: { type: "bool", label: "Ürün haberleri", control: "switch" } }) },
        ]
        return <div class="sc-ex-stack">
          {() => { const color = p.values.color; return <Wizard color={color as ColorToken} steps={steps()} initial={{ email: "ada@hadisosyal.com" }} submitLabel="Abone ol"
            onStep={(i: number) => step.set(i)} onSubmit={(v: Record<string, unknown>) => result.set(JSON.stringify(v))} /> }}
          <Row><Out label="adım" value={() => step() + 1} /><Out label="gönderilen" value={result} /></Row>
        </div>
      },
    },
  },
})
