// API examples of march/ui, names "accent" … "deepEqual" (second half: ui-e2.tsx): accent and color themes, actions and
// dialogs, calendar math, color and gradient helpers, crop geometry, clone and deep equality.
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, onCleanup } from "march";
import type { Signal } from "march";
import {
  Button, Badge, Segmented, TextInput, Slider, Widget, accent, setAccent, ACCENT_CHOICES, accepts, action, addDays, addMonths, askReason, bezierCss, EASING_PRESETS, bootLoader, clampPan, clone, closeAll, closePalette, openPalette, paletteOpen, codeView, colorAt, colorTheme, colorThemes, confirm, contrastOf, convert, countLabel, coverScale, cropToCanvas, currencyInfo, dayLabel, deepEqual, format, gradientCss, hsvToRgb, openDialog,
} from "march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-e.css";
export { default as SIG } from "./ui-e.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
const json = (v: unknown) => JSON.stringify(v)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const Pick = (p: { value: Signal<string>; options: string[]; label: string }) =>
  <Segmented value={p.value} onChange={(v: string) => p.value.set(v)} options={p.options.map((o) => ({ value: o, label: o }))} aria-label={p.label} />
const Swatch = (p: { color: () => string }) => <span class="sc-ex-ui-e-swatch" style={{ background: p.color() }} />
const Field = (p: { value: Signal<string>; label: string }) => <TextInput value={p.value} aria-label={p.label} />
const warm = (v = 0.95, a = 1) => hsvToRgb({ h: 28, s: 0.88, v, a })
const cool = (a = 1) => hsvToRgb({ h: 200, s: 0.85, v: 0.85, a })

function makeSource() {
  const c = document.createElement("canvas")
  c.width = 320; c.height = 200
  const g = c.getContext("2d")!
  for (let i = 0; i < 8; i++) { g.fillStyle = format(hsvToRgb({ h: i * 45, s: 0.6, v: 0.95, a: 1 })); g.fillRect(i * 40, 0, 40, 200) }
  g.fillStyle = format(hsvToRgb({ h: 0, s: 0, v: 1, a: 1 })); g.beginPath(); g.arc(110, 80, 44, 0, Math.PI * 2); g.fill()
  g.fillStyle = format(hsvToRgb({ h: 0, s: 0, v: 0.15, a: 1 })); g.fillRect(100, 70, 20, 20)
  return c
}

const CODE_SRC: Record<string, string> = {
  ts: "const total = items.reduce((s, i) => s + i.price, 0)\nconsole.log(total)",
  css: ".card {\n  padding: var(--m-space-3);\n  border-radius: var(--m-radius-2);\n}",
}

export default examples({
  "march/ui": {
    accent: {
      code: `setAccent("brand-green")   // recolors components without their own color; remembered
accent()                   // "brand-green"`,
      run: () => {
        const was = accent.peek()
        onCleanup(() => { setAccent(was) })
        return <div class="sc-ex-stack">
          <Row>{ACCENT_CHOICES.slice(0, 6).map((c) => <Button size="sm" variant="secondary" onClick={() => setAccent(c)}>{c}</Button>)}</Row>
          <Row><Button onClick={() => setAccent(was)} variant="ghost">Önceki vurgu</Button><Button>Birincil düğme</Button><Out label="accent()" value={accent} /></Row>
        </div>
      },
    },
    accepts: {
      code: `accepts({ name: "foto.png", type: "image/png" }, "image/*,.pdf")   // true
accepts({ name: "veri.csv", type: "text/csv" }, "image/*,.pdf")    // false`,
      run: () => {
        const list = signal("image/*,.pdf")
        const files = [{ name: "foto.png", type: "image/png" }, { name: "rapor.pdf", type: "application/pdf" }, { name: "veri.csv", type: "text/csv" }, { name: "not.txt", type: "text/plain" }]
        return <div class="sc-ex-stack">
          <Field value={list} label="accept listesi" />
          <ul class="sc-ex-ui-e-table">{files.map((f) => <li><code>{f.name}</code><Badge m:color={() => (accepts(f, list()) ? "success" : "danger")}>{() => (accepts(f, list()) ? "kabul" : "red")}</Badge></li>)}</ul>
        </div>
      },
    },
    action: {
      code: `const archive = action("Arşivle", async (id: string) => { await save(id); return id }, {
  confirm: "Arşivlensin mi?", success: (id) => id + " arşivlendi",
})
await archive.run("HADİ")   // asks, shows busy, toasts`,
      run: () => {
        const log = signal<string[]>([])
        const archive = action("Arşivle", async (id: string) => { await sleep(500); return id }, { confirm: "HADİ arşivlensin mi?", success: (id) => `${id} arşivlendi` })
        const go = async () => { const r = await archive.run("HADİ").catch(() => undefined); log.update((l) => [...l, `${now()} sonuç: ${r ?? "vazgeçildi"}`]) }
        return <Row><Button loading={archive.busy} onClick={go}>{() => archive.label()}</Button><Log lines={log} /></Row>
      },
    },
    addDays: {
      code: `addDays("2026-01-31", 1)    // "2026-02-01"
addDays("2026-03-01", -1)   // "2026-02-28"`,
      run: () => {
        const d = signal("2026-01-31"), n = signal("1")
        const ok = () => /^\d{4}-\d{2}-\d{2}$/.test(d())
        return <div class="sc-ex-stack"><Row><Field value={d} label="Tarih" /><Pick value={n} options={["-7", "-1", "1", "30"]} label="Gün" /></Row>
          <Out label="addDays" value={() => (ok() ? addDays(d(), Number(n())) : "geçersiz tarih")} /></div>
      },
    },
    addMonths: {
      code: `addMonths("2026-01-31", 1)   // "2026-02-28" (day clamped)
addMonths("2026-05-15", -6)  // "2025-11-15"`,
      run: () => {
        const d = signal("2026-01-31"), n = signal("1")
        const ok = () => /^\d{4}-\d{2}-\d{2}$/.test(d())
        return <div class="sc-ex-stack"><Row><Field value={d} label="Tarih" /><Pick value={n} options={["-6", "-1", "1", "12"]} label="Ay" /></Row>
          <Out label="addMonths" value={() => (ok() ? addMonths(d(), Number(n())) : "geçersiz tarih")} /></div>
      },
    },
    askReason: {
      code: `const why = await askReason({ title: "Neden siliniyor?", min: 10, danger: true })
// string, or null when cancelled
const r = await askReason({ purposes: [{ value: "dup", label: "Yinelenen" }] })   // { category, text }`,
      run: () => {
        const out = signal("—"), purpose = signal("yok")
        const go = async () => {
          const r = purpose() === "var"
            ? await askReason({ title: "Neden siliniyor?", danger: true, purposes: [{ value: "dup", label: "Yinelenen kayıt" }, { value: "old", label: "Eski kayıt" }] })
            : await askReason({ title: "Neden siliniyor?", danger: true })
          out.set(r === null ? "vazgeçildi" : json(r))
        }
        return <Row><Pick value={purpose} options={["yok", "var"]} label="Amaç listesi" /><Button onClick={go}>Neden sor</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    bezierCss: {
      code: `bezierCss([0.34, 1.56, 0.64, 1])   // "cubic-bezier(.34, 1.56, .64, 1)"`,
      run: () => {
        const name = signal("back")
        const curve = () => EASING_PRESETS.find((p) => p.name === name())!.value
        return <div class="sc-ex-stack"><Pick value={name} options={EASING_PRESETS.map((p) => p.name)} label="Eğri" />
          <Out label="bezierCss" value={() => bezierCss(curve())} /></div>
      },
    },
    bootLoader: {
      code: `// index.html: <div id="m-boot">…</div>
mount(App, document.body)
bootLoader.done()   // fades #m-boot out and removes it`,
      run: () => {
        let box!: HTMLElement
        const make = () => { const el = document.createElement("div"); el.id = "sc-ex-ui-e-boot"; el.className = "sc-ex-ui-e-boot"; el.textContent = "Uygulama yükleniyor…"; return el }
        const out = signal("—")
        const done = () => out.set(String(bootLoader.done({ id: "sc-ex-ui-e-boot", fade: 250 })))
        const reset = () => { box.replaceChildren(make()); out.set("—") }
        return <div class="sc-ex-stack">
          <div ref={(x: HTMLElement) => { box = x; x.append(make()) }} />
          <Row><Button onClick={done}>done()</Button><Button variant="ghost" onClick={reset}>Yeniden göster</Button><Out label="Döndürdü" value={out} /></Row>
        </div>
      },
    },
    clampPan: {
      code: `const st = { ...DEFAULT_CROP, zoom: 1.5, x: 0.5 }
clampPan(st, 1600, 900, 400, 400)   // [x, y] kept inside the image`,
      run: () => {
        const zoom = signal("1.5"), x = signal(0.5)
        const st = () => ({ ...DEFAULT_CROP, zoom: Number(zoom()), x: x() })
        return <div class="sc-ex-stack">
          <Row><Pick value={zoom} options={["1", "1.5", "2"]} label="Yakınlaştırma" /><Slider value={x} min={-1} max={1} step={0.05} aria-label="Kaydırma x" /></Row>
          <Out label="istenen x" value={() => x().toFixed(2)} />
          <Out label="clampPan" value={() => clampPan(st(), 1600, 900, 400, 400).map((v) => v.toFixed(3)).join(", ")} />
        </div>
      },
    },
    clone: {
      code: `const copy = clone(order)   // plain objects and arrays are copied deeply
copy.items.push("ek")       // order.items is unchanged`,
      run: () => {
        const order = { id: 7, items: ["kalem", "defter"], note: { rush: false } }
        const copy = signal(clone(order)), tick = signal(0)
        const edit = () => { const c = clone(copy.peek()); c.items.push("ek"); c.note.rush = true; copy.set(c); tick.update((x) => x + 1) }
        return <div class="sc-ex-stack"><Row><Button onClick={edit}>Kopyayı değiştir</Button><Button variant="ghost" onClick={() => copy.set(clone(order))}>Sıfırla</Button></Row>
          <Out label="özgün" value={json(order)} /><Out label="kopya" value={() => json(copy())} /></div>
      },
    },
    closeAll: {
      code: `openDialog(() => <Button onClick={closeAll}>Hepsini kapat</Button>)
closeAll()   // dismisses every open dialog, newest first`,
      run: () => {
        const out = signal("—")
        const go = async () => {
          const first = openDialog<string>(() => <Button onClick={() => { void openDialog(() => <Button variant="danger" onClick={closeAll}>Hepsini kapat</Button>, { title: "İkinci pencere", size: "sm" }) }}>İkinci pencereyi aç</Button>, { title: "Birinci pencere", size: "sm", dismissValue: "kapatıldı" })
          out.set(`birinci pencere: ${await first}`)
        }
        return <Row><Button onClick={go}>İç içe pencereler aç</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    closePalette: {
      code: `openPalette()
closePalette()   // e.g. after running a command`,
      run: () => {
        let t: ReturnType<typeof setTimeout> | undefined
        onCleanup(() => { clearTimeout(t); closePalette() })
        const go = () => { openPalette(); clearTimeout(t); t = setTimeout(closePalette, 1800) }
        return <Row><Button onClick={go}>Aç, 1,8 sn sonra kapat</Button><Button variant="ghost" onClick={closePalette}>closePalette()</Button><Out label="Açık" value={() => String(paletteOpen())} /></Row>
      },
    },
    codeView: {
      code: `<Widget sources={[codeView]} input={{ source: "const a = 1", lang: "ts" }} />
codeView.provide({ id: "editor", render: (input) => <MyEditor {...input} /> })   // replaces the viewer`,
      run: () => {
        const lang = signal("ts")
        return <div class="sc-ex-stack"><Pick value={lang} options={["ts", "css"]} label="Dil" />
          {() => <Widget sources={[codeView]} input={{ source: CODE_SRC[lang()]!, lang: lang() }} />}</div>
      },
    },
    colorAt: {
      code: `const g = { type: "linear", angle: 90, stops: [{ color: "#f2801f", at: 0 }, { color: "#1d9ad6", at: 100 }] }
colorAt(g, 50)   // the blended color at 50%`,
      run: () => {
        const at = signal(50)
        const g = { type: "linear" as const, angle: 90, stops: [{ color: format(warm()), at: 0 }, { color: format(cool()), at: 100 }] }
        return <div class="sc-ex-stack"><div class="sc-ex-ui-e-bar" style={{ background: gradientCss(g) }} />
          <Row><Slider value={at} min={0} max={100} aria-label="Konum" /><Swatch color={() => colorAt(g, at())} /><Out label="colorAt" value={() => colorAt(g, at())} /></Row></div>
      },
    },
    colorTheme: {
      code: `colorTheme()   // "hadi" — the active color theme id (reactive)`,
      run: () => <Row><Out label="colorTheme()" value={colorTheme} /><Badge>etkin tema</Badge></Row>,
    },
    colorThemes: {
      code: `for (const th of colorThemes()) console.log(th.id, th.name)`,
      run: () => <ul class="sc-ex-ui-e-table">{() => colorThemes().map((th) => <li><code>{th.id}</code><span>{th.name}</span>{th.id === colorTheme() && <Badge m:color="success">etkin</Badge>}</li>)}</ul>,
    },
    confirm: {
      code: `if (await confirm({ title: "Silinsin mi?", message: "Bu işlem geri alınamaz.", danger: true })) remove()`,
      run: () => {
        const out = signal("—"), danger = signal("normal")
        const go = async () => out.set(String(await confirm({ title: "Silinsin mi?", message: "Bu işlem geri alınamaz.", danger: danger() === "tehlikeli" })))
        return <Row><Pick value={danger} options={["normal", "tehlikeli"]} label="Tür" /><Button onClick={go}>Sor</Button><Out label="Sonuç" value={out} /></Row>
      },
    },
    contrastOf: {
      code: `contrastOf({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 })   // 21`,
      run: () => {
        const v = signal(60)
        const ratio = () => contrastOf(hsvToRgb({ h: 28, s: 0.9, v: v() / 100, a: 1 }), hsvToRgb({ h: 0, s: 0, v: 1, a: 1 }))
        return <div class="sc-ex-stack"><Row><Slider value={v} min={10} max={100} aria-label="Metin parlaklığı" /><Swatch color={() => format(hsvToRgb({ h: 28, s: 0.9, v: v() / 100, a: 1 }))} /></Row>
          <Row><Out label="oran" value={() => ratio().toFixed(2)} /><Badge m:color={() => (ratio() >= 4.5 ? "success" : "danger")}>{() => (ratio() >= 4.5 ? "AA geçer" : "AA geçmez")}</Badge></Row></div>
      },
    },
    convert: {
      code: `convert("12,5", "number")        // 12.5
convert([1, 2], "string")        // "[1,2]"
convert("evet", "boolean")       // true`,
      run: () => {
        const samples: Record<string, unknown> = { "12,5": "12,5", "evet": "evet", "[1,2]": [1, 2], "{a:1}": { a: 1 }, "null": null }
        const src = signal("12,5"), to = signal("number")
        return <div class="sc-ex-stack"><Row><Pick value={src} options={Object.keys(samples)} label="Değer" /><Pick value={to} options={["string", "number", "boolean", "array", "object", "null"]} label="Tür" /></Row>
          <Out label="convert" value={() => json(convert(samples[src()], to() as "string"))} /></div>
      },
    },
    coverScale: {
      code: `coverScale(1600, 900, 400, 400, 0)    // 0.444 — smallest scale that covers the frame
coverScale(1600, 900, 400, 400, 45)   // larger when rotated`,
      run: () => {
        const deg = signal("0")
        return <div class="sc-ex-stack"><Pick value={deg} options={["0", "15", "45", "90"]} label="Açı" />
          <Out label="coverScale" value={() => coverScale(1600, 900, 400, 400, Number(deg())).toFixed(3)} /></div>
      },
    },
    cropToCanvas: {
      code: `const canvas = cropToCanvas(img, { ...DEFAULT_CROP, zoom: 2 }, { width: 320, height: 200 }, { width: 200 })
document.body.append(canvas)`,
      run: () => {
        const src = makeSource(), zoom = signal("1"), rotate = signal("0"), flip = signal("hayır")
        const out = computed(() => cropToCanvas(src, { ...DEFAULT_CROP, zoom: Number(zoom()), rotate: Number(rotate()), flip: flip() === "evet" }, { width: 320, height: 200 }, { width: 240 }))
        return <div class="sc-ex-stack"><Row><Pick value={zoom} options={["1", "1.5", "2.5"]} label="Yakınlaştırma" /><Pick value={rotate} options={["0", "90", "180"]} label="Döndürme" /><Pick value={flip} options={["hayır", "evet"]} label="Ayna" /></Row>
          <Row><canvas class="sc-ex-ui-e-canvas" width="160" height="100" ref={(c: HTMLCanvasElement) => c.getContext("2d")!.drawImage(src, 0, 0, 160, 100)} />{() => { const c = out(); c.className = "sc-ex-ui-e-canvas"; return c }}</Row></div>
      },
    },
    currencyInfo: {
      code: `currencyInfo("tr-TR", "TRY")   // { symbol: "₺", prefix: true, digits: 2 }
currencyInfo("de-DE", "EUR")   // { symbol: "€", prefix: false, digits: 2 }`,
      run: () => {
        const loc = signal("tr-TR"), cur = signal("TRY")
        return <div class="sc-ex-stack"><Row><Pick value={loc} options={["tr-TR", "en-US", "de-DE"]} label="Yerel" /><Pick value={cur} options={["TRY", "USD", "EUR", "JPY"]} label="Para birimi" /></Row>
          <Out label="currencyInfo" value={() => json(currencyInfo(loc(), cur()))} /></div>
      },
    },
    dayLabel: {
      code: `dayLabel(new Date())                          // "Bugün"
dayLabel(new Date(Date.now() - 864e5))        // "Dün"
dayLabel(new Date("2026-01-05"))              // "5 Oca 2026"`,
      run: () => {
        const ago = signal("0")
        return <div class="sc-ex-stack"><Pick value={ago} options={["0", "1", "3", "40"]} label="Gün önce" />
          <Out label="dayLabel" value={() => dayLabel(new Date(Date.now() - Number(ago()) * 864e5))} /></div>
      },
    },
    deepEqual: {
      code: `deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })   // true
deepEqual("", null)                                    // true (empty values match)
deepEqual({ a: 1 }, { a: "1" })                        // false`,
      run: () => {
        const flip = signal(false)
        const cases = (): [string, unknown, unknown][] => [
          ["nesne, farklı sıra", { a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }],
          ["boş metin ve null", "", null],
          ["sayı ve metin", { a: 1 }, { a: "1" }],
          ["dizi", [1, 2, 3], flip() ? [1, 2, 3] : [1, 2]],
        ]
        return <div class="sc-ex-stack"><Button onClick={() => flip.update((x) => !x)}>Son dizi: {() => (flip() ? "eşitle" : "farklılaştır")}</Button>
          <ul class="sc-ex-ui-e-table">{() => cases().map(([label, a, b]) => <li><span>{label}</span><Badge m:color={deepEqual(a, b) ? "success" : "danger"}>{String(deepEqual(a, b))}</Badge></li>)}</ul></div>
      },
    },
  },
})
