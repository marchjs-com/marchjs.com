// API examples of march/ui, names "defineMeta" … "openDialog" (first half: ui-e.tsx): component meta, text and number
// formatting, key helpers, JSON paths, forms helpers, Markdown and HTML conversion, dialogs.
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, untrack } from "march";
import type { Signal } from "march";
import { Button } from "march/components/actions/button";
import { Badge } from "march/components/data/badge";
import { Segmented } from "march/components/forms/segmented";
import { TextInput } from "march/components/forms/text-input";
import { Textarea } from "march/components/forms/textarea";
import { Slider } from "march/components/forms/slider";
import { Kbd } from "march/components/typography/kbd";
import { action, isAction, colorTheme, colorThemes, defineMeta, distance, firstDayOf, fold, formatKey, formatNumber, inputFor, isMac, isSafeLink, key, loadTheme, markdownNodes, model } from "march/ui";
import { format, hsvToRgb, mix } from "march/components/composite/color-picker";
import { formatCount } from "march/components/landing/counter";
import { formatDate } from "march/components/forms/date-picker";
import { frameSize } from "march/components/composite/image-cropper";
import { freeKey, getAt, insertAfter } from "march/components/composite/tree-editor";
import { gradientCss } from "march/components/composite/gradient-editor";
import { heartBurst, heartPop } from "march/components/social/like-button";
import { htmlToMarkdown } from "march/components/composite/rich-text-editor";
import { initials } from "march/components/social/avatar";
import { mediaKind } from "march/components/media/media";
import { normalizePhone } from "march/components/forms/phone-input";
import { openDialog } from "march/components/overlays/dialog";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-e.css";
export { default as SIG } from "./ui-e2.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
const json = (v: unknown) => JSON.stringify(v)
const Pick = (p: { value: Signal<string>; options: string[]; label: string }) =>
  <Segmented value={p.value} onChange={(v: string) => p.value.set(v)} options={p.options.map((o) => ({ value: o, label: o }))} aria-label={p.label} />
const Swatch = (p: { color: () => string }) => <span class="sc-ex-ui-e-swatch" style={{ background: p.color() }} />
const Pre = (p: { text: () => string }) => <pre class="sc-ex-ui-e-pre">{p.text}</pre>
const Field = (p: { value: Signal<string>; label: string }) => <TextInput value={p.value} aria-label={p.label} />
const warm = (v = 0.95, a = 1) => hsvToRgb({ h: 28, s: 0.88, v, a })
const cool = (a = 1) => hsvToRgb({ h: 200, s: 0.85, v: 0.85, a })

function Stepper(props: { value?: number | Signal<number>; onChange?: (v: number) => void }) {
  const [get, set] = model(props, 0)
  return <Row><Button size="sm" onClick={() => set(get() - 1)}>−</Button><code class="sc-ex-val">{get}</code><Button size="sm" onClick={() => set(get() + 1)}>+</Button></Row>
}

export default examples({
  "march/ui": {
    defineMeta: {
      code: `export default defineMeta({
  name: "Chip", status: "stable", since: "1.0.0", category: "actions",
  summary: "Compact tag.", composedOf: [],
})`,
      run: () => {
        const meta = defineMeta({ name: "Chip", status: "experimental", since: "1.0.0", category: "actions", summary: "Küçük etiket.", composedOf: [] })
        return <div class="sc-ex-stack"><Pre text={() => json(meta)} /><Out label="Aynı nesne" value={String(defineMeta(meta) === meta)} /></div>
      },
    },
    distance: {
      code: `distance("kitap", "kitab")        // 1
distance("form", "from")          // 1 (swap)
distance("elma", "armut", 2)      // 3 — stops above max`,
      run: () => {
        const a = signal("kitap"), b = signal("kitab")
        return <div class="sc-ex-stack"><Row><Field value={a} label="Birinci" /><Field value={b} label="İkinci" /></Row>
          <Row><Out label="distance" value={() => distance(a(), b())} /><Out label="max 2" value={() => distance(a(), b(), 2)} /></Row></div>
      },
    },
    firstDayOf: {
      code: `firstDayOf("tr-TR")   // 1 (Monday)
firstDayOf("en-US")   // 0 (Sunday)`,
      run: () => {
        const loc = signal("tr-TR")
        const name = (d: number) => new Intl.DateTimeFormat(loc(), { weekday: "long" }).format(new Date(2024, 0, 7 + d))
        return <div class="sc-ex-stack"><Pick value={loc} options={["tr-TR", "en-US", "ar-EG", "de-DE"]} label="Yerel" />
          <Row><Out label="firstDayOf" value={() => firstDayOf(loc())} /><Out label="Gün" value={() => name(firstDayOf(loc()))} /></Row></div>
      },
    },
    fold: {
      code: `fold("İstanbul")           // "istanbul"
fold("Çiçek").includes(fold("cicek"))   // true`,
      run: () => {
        const text = signal("İSTANBUL Çiçekçi"), q = signal("istanbul")
        return <div class="sc-ex-stack"><Row><Field value={text} label="Metin" /><Field value={q} label="Arama" /></Row>
          <Out label="fold" value={() => fold(text())} /><Out label="eşleşir" value={() => String(fold(text()).includes(fold(q())))} /></div>
      },
    },
    format: {
      code: `format({ r: 242, g: 128, b: 31, a: 1 })          // "#f2801f"
format({ r: 242, g: 128, b: 31, a: 0.5 }, "rgb") // "rgb(242 128 31 / 0.5)"`,
      run: () => {
        const f = signal("hex"), a = signal("1")
        const c = () => warm(0.95, Number(a()))
        return <div class="sc-ex-stack"><Row><Pick value={f} options={["hex", "rgb", "hsl"]} label="Biçim" /><Pick value={a} options={["1", "0.5"]} label="Saydamlık" /></Row>
          <Row><Swatch color={() => format(c())} /><Out label="format" value={() => format(c(), f() as "hex")} /></Row></div>
      },
    },
    formatCount: {
      code: `formatCount(1234)             // "1,2 B"
formatCount(1234, "full")     // "1.234"`,
      run: () => {
        const n = signal(1234), mode = signal("compact")
        return <div class="sc-ex-stack"><Row><Slider value={n} min={0} max={2_000_000} step={1000} aria-label="Sayı" /><Pick value={mode} options={["compact", "full"]} label="Biçim" /></Row>
          <Out label="formatCount" value={() => formatCount(n(), mode() as "compact")} /></div>
      },
    },
    formatDate: {
      code: `formatDate("2026-03-14", "tr-TR")   // "14.03.2026"
formatDate("2026-03-14", "en-US")   // "03/14/2026"`,
      run: () => {
        const d = signal("2026-03-14"), loc = signal("tr-TR")
        return <div class="sc-ex-stack"><Row><Field value={d} label="Tarih" /><Pick value={loc} options={["tr-TR", "en-US", "de-DE", "ja-JP"]} label="Yerel" /></Row>
          <Out label="formatDate" value={() => formatDate(d(), loc()) || "geçersiz tarih"} /></div>
      },
    },
    formatKey: {
      code: `formatKey("mod+shift+k")   // "Ctrl+Shift+K" (or "⇧⌘K" on macOS)
formatKey("alt+arrowup")   // "Alt+↑"`,
      run: () => {
        const combo = signal("mod+shift+k")
        return <div class="sc-ex-stack"><Field value={combo} label="Kısayol" /><Row><Out label="formatKey" value={() => formatKey(combo())} /><Kbd>{() => formatKey(combo())}</Kbd></Row></div>
      },
    },
    formatNumber: {
      code: `formatNumber(1234567.891, "tr-TR", { decimals: 2, grouping: true })   // "1.234.567,89"
formatNumber(1234.5, "en-US")                                         // "1234.5"`,
      run: () => {
        const loc = signal("tr-TR"), dec = signal(2), grouping = signal("açık")
        return <div class="sc-ex-stack"><Row><Pick value={loc} options={["tr-TR", "en-US", "de-DE"]} label="Yerel" /><Pick value={grouping} options={["açık", "kapalı"]} label="Gruplama" /><Slider value={dec} min={0} max={4} aria-label="Ondalık" /></Row>
          <Out label="formatNumber" value={() => formatNumber(1234567.891, loc(), { decimals: dec(), grouping: grouping() === "açık" })} /></div>
      },
    },
    frameSize: {
      code: `frameSize({ ...DEFAULT_CROP, aspect: 1 }, 600, 400)   // [336, 336]`,
      run: () => {
        const aspect = signal("1")
        const st = () => ({ ...DEFAULT_CROP, aspect: aspect() === "serbest" ? null : Number(aspect()) })
        const size = () => frameSize(st(), 600, 400)
        return <div class="sc-ex-stack"><Pick value={aspect} options={["serbest", "1", "1.7778", "0.8"]} label="En/boy" />
          <div class="sc-ex-ui-e-view"><div class="sc-ex-ui-e-frame" style={{ "inline-size": () => `${(size()[0] / 600) * 100}%`, "block-size": () => `${(size()[1] / 400) * 100}%` }} /></div>
          <Out label="frameSize" value={() => size().map(Math.round).join(" × ")} /></div>
      },
    },
    freeKey: {
      code: `freeKey({ ad: 1 }, "ad")           // "ad2"
freeKey({ key: 1, key2: 2 })       // "key3"`,
      run: () => {
        const obj = signal<Record<string, unknown>>({ key: 1 })
        const add = () => obj.update((o) => ({ ...o, [freeKey(o)]: 1 }))
        return <div class="sc-ex-stack"><Row><Button onClick={add}>Anahtar ekle</Button><Button variant="ghost" onClick={() => obj.set({ key: 1 })}>Sıfırla</Button></Row>
          <Out label="anahtarlar" value={() => Object.keys(obj()).join(", ")} /></div>
      },
    },
    getAt: {
      code: `const data = { users: [{ name: "Ada" }, { name: "Alan" }] }
getAt(data, ["users", 1, "name"])   // "Alan"`,
      run: () => {
        const data = { users: [{ name: "Ada", roles: ["admin"] }, { name: "Alan", roles: [] }], plan: "pro" }
        const path = signal("users.0.roles.0")
        const parts = () => path().split(".").filter(Boolean).map((s) => (/^\d+$/.test(s) ? Number(s) : s))
        return <div class="sc-ex-stack"><Pre text={() => json(data)} /><Field value={path} label="Yol" /><Out label="getAt" value={() => json(getAt(data, parts())) ?? "undefined"} /></div>
      },
    },
    gradientCss: {
      code: `gradientCss({ type: "linear", angle: 90, stops: [{ color: c1, at: 0 }, { color: c2, at: 100 }] })
// "linear-gradient(90deg, … 0%, … 100%)"`,
      run: () => {
        const type = signal("linear"), angle = signal(90)
        const g = () => ({ type: type() as "linear", angle: angle(), stops: [{ color: format(warm()), at: 0 }, { color: format(cool()), at: 100 }] })
        return <div class="sc-ex-stack"><Row><Pick value={type} options={["linear", "radial", "conic"]} label="Tür" /><Slider value={angle} min={0} max={360} step={15} aria-label="Açı" /></Row>
          <div class="sc-ex-ui-e-bar" style={{ background: () => gradientCss(g()) }} /><Pre text={() => gradientCss(g())} /></div>
      },
    },
    heartBurst: {
      code: `heartBurst(host, { count: 12, radius: 30 })   // particles + ring from the center of host (position: relative)`,
      run: () => {
        let host!: HTMLElement
        const count = signal("10")
        return <Row><span class="sc-ex-ui-e-host" ref={(x: HTMLElement) => { host = x }}><span class="sc-ex-ui-e-heart" aria-hidden="true">♥</span></span>
          <Pick value={count} options={["6", "10", "16"]} label="Parçacık" /><Button onClick={() => heartBurst(host, { count: Number(count()) })}>Patlat</Button></Row>
      },
    },
    heartPop: {
      code: `heartPop(icon, true)    // squash, overshoot, settle
heartPop(icon, false)   // small press`,
      run: () => {
        let icon!: HTMLElement
        const on = signal(false)
        const toggle = () => { on.update((x) => !x); heartPop(icon, on.peek()) }
        return <Row><span class="sc-ex-ui-e-heart" ref={(x: HTMLElement) => { icon = x }} aria-hidden="true">{() => (on() ? "♥" : "♡")}</span>
          <Button onClick={toggle}>{() => (on() ? "Vazgeç" : "Beğen")}</Button></Row>
      },
    },
    hsvToRgb: {
      code: `hsvToRgb({ h: 28, s: 0.88, v: 0.95, a: 1 })   // { r: 242, g: 128, b: 29, a: 1 }`,
      run: () => {
        const h = signal(28), s = signal(88), v = signal(95)
        const rgb = () => hsvToRgb({ h: h(), s: s() / 100, v: v() / 100, a: 1 })
        return <div class="sc-ex-stack"><Row><Slider value={h} min={0} max={360} aria-label="Ton" /><Slider value={s} min={0} max={100} aria-label="Doygunluk" /><Slider value={v} min={0} max={100} aria-label="Parlaklık" /></Row>
          <Row><Swatch color={() => format(rgb())} /><Out label="hsvToRgb" value={() => { const c = rgb(); return `${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}` }} /></Row></div>
      },
    },
    htmlToMarkdown: {
      code: `htmlToMarkdown("<h1>Başlık</h1><p>Bir <b>kalın</b> söz.</p>")
// "## Başlık\\n\\nBir **kalın** söz."`,
      run: () => {
        const html = signal('<h1>Merhaba</h1><p>Bir <b>kalın</b> ve <a href="https://hadisosyal.com">bağlantı</a>.</p><ul><li>Bir</li><li>İki</li></ul>')
        return <div class="sc-ex-stack"><Textarea value={html} aria-label="HTML" rows={3} /><Pre text={() => htmlToMarkdown(html())} /></div>
      },
    },
    initials: {
      code: `initials("Ada Lovelace")   // "AL"
initials("alan")           // "AL"`,
      run: () => {
        const name = signal("Ada Lovelace")
        return <div class="sc-ex-stack"><Field value={name} label="Ad" /><Out label="initials" value={() => initials(name())} /></div>
      },
    },
    inputFor: {
      code: `const Input = inputFor({ type: "money" })   // MoneyInput
Input && <Input value={price} />`,
      run: () => {
        const type = signal("text")
        return <div class="sc-ex-stack"><Pick value={type} options={["text", "money", "phone", "bool", "date", "hidden"]} label="Alan türü" />
          <Out label="bileşen" value={() => inputFor({ type: type() })?.name || (type() === "hidden" ? "null" : "tembel yüklenen giriş")} />
          {() => { const C = inputFor({ type: type() }); return untrack(() => (C ? C({ "aria-label": "Örnek alan" }) : <em class="m-muted">Gizli alanın girişi yok.</em>)) }}</div>
      },
    },
    insertAfter: {
      code: `insertAfter(["a", "b"], [0], "x")                    // ["a", "x", "b"]
insertAfter({ a: 1, c: 3 }, ["a"], 2, "b")           // { a: 1, b: 2, c: 3 }`,
      run: () => {
        const arr = signal<unknown>(["a", "b"]), obj = signal<unknown>({ a: 1, c: 3 })
        return <div class="sc-ex-stack"><Row><Button onClick={() => arr.update((v) => insertAfter(v, [0], "x"))}>Diziye ekle</Button><Button onClick={() => obj.update((v) => insertAfter(v, ["a"], 2, freeKey(v as Record<string, unknown>, "b")))}>Nesneye ekle</Button>
          <Button variant="ghost" onClick={() => { arr.set(["a", "b"]); obj.set({ a: 1, c: 3 }) }}>Sıfırla</Button></Row>
          <Out label="dizi" value={() => json(arr())} /><Out label="nesne" value={() => json(obj())} /></div>
      },
    },
    isAction: {
      code: `isAction(action("Kaydet", save))   // true
isAction(save)                      // false`,
      run: () => {
        const save = () => {}
        const a = action("Kaydet", save)
        return <ul class="sc-ex-ui-e-table"><li><code>action("Kaydet", save)</code><Badge m:color="success">{String(isAction(a))}</Badge></li><li><code>save</code><Badge m:color="danger">{String(isAction(save))}</Badge></li><li><code>{"{ kind: 'x' }"}</code><Badge m:color="danger">{String(isAction({ kind: "x" }))}</Badge></li></ul>
      },
    },
    isMac: {
      code: `isMac()   // true on Apple platforms — ⌘ is the primary modifier
formatKey("mod+k")`,
      run: () => <Row><Out label="isMac()" value={String(isMac())} /><Kbd>{formatKey("mod+k")}</Kbd></Row>,
    },
    isSafeLink: {
      code: `isSafeLink("https://hadisosyal.com")   // true
isSafeLink("javascript:alert(1)")    // false`,
      run: () => {
        const url = signal("https://hadisosyal.com")
        const samples = ["https://hadisosyal.com", "/docs/start", "mailto:ada@hadisosyal.com", "javascript:alert(1)", "data:text/html,x", "//evil.example"]
        return <div class="sc-ex-stack"><Row>{samples.map((s) => <Button size="sm" variant="ghost" onClick={() => url.set(s)}>{s.slice(0, 14)}</Button>)}</Row>
          <Field value={url} label="Bağlantı" /><Row><Out label="isSafeLink" value={() => String(isSafeLink(url()))} /><Badge m:color={() => (isSafeLink(url()) ? "success" : "danger")}>{() => (isSafeLink(url()) ? "güvenli" : "engellenir")}</Badge></Row></div>
      },
    },
    key: {
      code: `const off = key("alt+j", () => open(), { description: "Open journal", group: "Navigation" })
off()   // unregister (also automatic when the component is removed)`,
      run: () => {
        const log = signal<string[]>([])
        const hit = () => log.update((l) => [...l.slice(-4), `${now()} alt+j çalıştı`])
        key("alt+j", hit, { description: "Günlüğü aç", group: "Örnek" })
        return <Row><Kbd>{formatKey("alt+j")}</Kbd><Button onClick={hit}>Tetikle</Button><Log lines={log} /></Row>
      },
    },
    loadTheme: {
      code: `const ok = await loadTheme("night")   // adds the stylesheet once; true when it loaded`,
      run: () => {
        const log = signal<string[]>([])
        const themes = () => colorThemes().filter((t) => t.id !== colorTheme()).slice(0, 3)
        return <div class="sc-ex-stack"><Row>{() => themes().map((th) => <Button size="sm" onClick={async () => { const ok = await loadTheme(th.id); log.update((l) => [...l.slice(-4), `${th.id}: ${ok ? "yüklendi" : "yüklenemedi"}`]) }}>{th.name}</Button>)}</Row><Log lines={log} label="Yükleme günlüğü" /></div>
      },
    },
    markdownNodes: {
      code: `parent.append(...markdownNodes("# Başlık\\n\\n**kalın** [bağlantı](https://hadisosyal.com)"))`,
      run: () => {
        const md = signal("# Başlık\n\n**Kalın**, *eğik* ve [bağlantı](https://hadisosyal.com).\n\n- Bir\n- İki\n\n<b>HTML metin olarak görünür</b>")
        return <div class="sc-ex-stack"><Textarea value={md} aria-label="Markdown" rows={4} /><div class="sc-ex-ui-e-md">{() => markdownNodes(md())}</div></div>
      },
    },
    mediaKind: {
      code: `mediaKind("klip.mp4")     // "video"
mediaKind("ses.mp3")      // "audio"
mediaKind("foto.jpg")     // "image"`,
      run: () => {
        const src = signal("klip.mp4")
        return <div class="sc-ex-stack"><Row>{["klip.mp4", "ses.mp3?x=1", "foto.jpg", "belge"].map((s) => <Button size="sm" variant="ghost" onClick={() => src.set(s)}>{s}</Button>)}</Row>
          <Field value={src} label="Adres" /><Out label="mediaKind" value={() => mediaKind(src())} /></div>
      },
    },
    mix: {
      code: `mix(orange, blue, 0.5)   // sRGB blend: { r, g, b, a }`,
      run: () => {
        const t = signal(50)
        const c = () => mix(warm(), cool(), t() / 100)
        return <div class="sc-ex-stack"><Row><Swatch color={() => format(warm())} /><Slider value={t} min={0} max={100} aria-label="Karışım" /><Swatch color={() => format(cool())} /></Row>
          <Row><Swatch color={() => format(c())} /><Out label="mix" value={() => format(c())} /></Row></div>
      },
    },
    model: {
      code: `function Stepper(props) {
  const [get, set] = model(props, 0)   // signal, getter + onChange, or uncontrolled
  return <button onClick={() => set(get() + 1)}>{get}</button>
}`,
      run: () => {
        const n = signal(5), log = signal<string[]>([])
        return <div class="sc-ex-stack">
          <Row><span>Kontrolsüz</span><Stepper /></Row>
          <Row><span>Sinyale bağlı</span><Stepper value={n} onChange={(v) => log.update((l) => [...l.slice(-3), `onChange(${v})`])} /><Out label="n()" value={n} /></Row>
          <Log lines={log} />
        </div>
      },
    },
    normalizePhone: {
      code: `normalizePhone("0532 123 45 67", "+90")   // "+905321234567"
normalizePhone("00 44 7700 900123")       // "+447700900123"`,
      run: () => {
        const raw = signal("0532 123 45 67"), country = signal("+90")
        return <div class="sc-ex-stack"><Row><Field value={raw} label="Telefon" /><Pick value={country} options={["+90", "+44", "yok"]} label="Ülke kodu" /></Row>
          <Out label="normalizePhone" value={() => normalizePhone(raw(), country() === "yok" ? null : country())} /></div>
      },
    },
    openDialog: {
      code: `const plan = await openDialog<string>(
  (close) => <Button onClick={() => close("pro")}>Pro</Button>,
  { title: "Plan seç", size: "sm", dismissValue: "iptal" },
)`,
      run: () => {
        const out = signal("—")
        const go = async () => {
          const plan = await openDialog<string>((close) => <Row>{["Başlangıç", "Pro", "Ekip"].map((p) => <Button onClick={() => close(p)}>{p}</Button>)}</Row>, { title: "Plan seç", size: "sm", dismissValue: "iptal" })
          out.set(plan)
        }
        return <Row><Button onClick={go}>Plan seç</Button><Out label="Seçilen" value={out} /></Row>
      },
    },
  },
})
