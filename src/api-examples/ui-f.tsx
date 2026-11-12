// API examples of hadi-march/ui, names openDialogs … renameAt/renderFields (dialogs, parsers, JSON paths, forms, themes, shortcuts, widget points).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, effect, onCleanup, untrack } from "hadi-march";
import {
  Button, Textarea, openDialog, closePalette, key, gradientCss, bezierCss, openDialogs, openDrawer, openMedia, openPalette, paletteOpen, parse, parseBezier, parseDate, parseGradient, parseJson, parseKey, parseNumber, pickMain, registerCommands, resolveColor, theme, toast, typeOf, Form, colorTheme, colorThemes, pickerKind, place, pointer, preloadPalette, prompt, quietMedia, rangePresets, rank, registerInput, registerPages, registerThemes, removeAt, renameAt, renderFields, score, todayIso, useForm,
} from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { Swatch, Field, Pick, DOC, json, now } from "./_ui-f-kit.tsx";
export { default as SIG } from "./ui-f.sig.gen.ts";

const Stars = (props: Record<string, unknown>) => {
  const cur = (): number => Number(props["value"]) || 0
  return <Row>{[1, 2, 3, 4, 5].map((n) => <Button size="sm" variant={() => (cur() >= n ? "primary" : "ghost")} aria-label={`${n} yıldız`} onClick={() => (props["setValue"] as (v: number) => void)(n)}>{`${n}★`}</Button>)}</Row>
}

const DEMO_POINT = widgetPoint<{ lang: string }>("ex-api-pick-main", {
  defaults: [{ id: "plain", render: (i) => <code>{`düz metin (${i.lang})`}</code> }],
})




export default examples({
  "hadi-march/ui": {
    openDialogs: {
      code: `const dialog = openDialog(() => "Merhaba")
openDialogs()        // 1
await dialog         // kapanınca 0`,
      run: () => {
        const n = signal(0)
        const sync = () => n.set(openDialogs())
        const open = (): void => {
          const done = openDialog((close: (v?: unknown) => void) => <div class="sc-stack">
            <Out label="açık pencere" value={n} />
            <Row><Button onClick={open}>Bir tane daha aç</Button><Button variant="primary" onClick={() => close()}>Kapat</Button></Row>
          </div>, { title: "Pencere", size: "sm" })
          sync()
          void done.then(sync)
        }
        return <Row><Button onClick={open}>Pencere aç</Button><Out label="openDialogs()" value={n} /></Row>
      },
    },
    openDrawer: {
      code: `const choice = await openDrawer<string>(
  (close) => <button onClick={() => close("kaydet")}>Kaydet</button>,
  { title: "Ayarlar", side: "right", dismissValue: "iptal" })`,
      run: () => {
        const out = signal("—")
        const go = async () => {
          const v = await openDrawer<string>((close) => <div class="sc-stack">
            <p>Çekmece sayfanın yanından açılır; Esc ya da dış alan tıklaması kapatır.</p>
            <Row><Button variant="primary" onClick={() => close("kaydet")}>Kaydet</Button><Button onClick={() => close("sil")}>Sil</Button></Row>
          </div>, { title: "Ayarlar", side: "right", dismissValue: "iptal" })
          out.set(v)
        }
        return <Row><Button onClick={go}>Çekmeceyi aç</Button><Out label="sonuç" value={out} /></Row>
      },
    },
    openMedia: {
      code: `await openMedia("/img/cover.jpg", { title: "Kapak", alt: "Acme kapağı", size: "lg" })`,
      run: () => {
        // a poster drawn on a canvas with theme colors, so the example needs no file or network
        const poster = (): string => {
          const c = document.createElement("canvas")
          c.width = 640; c.height = 360
          const g = c.getContext("2d")
          if (!g) return ""
          const tokens = ["brand-orange", "brand-blue", "brand-green", "brand-purple"]
          tokens.forEach((t, i) => { g.fillStyle = resolveColor(t, document.body); g.fillRect(i * 160, 0, 160, 360) })
          return c.toDataURL("image/png")
        }
        const status = signal("—")
        const go = async () => { status.set("açık"); await openMedia(poster(), { title: "Önizleme", alt: "Dört renkli şerit", kind: "image", size: "md" }); status.set("kapandı") }
        return <Row><Button onClick={go}>Görseli aç</Button><Out label="durum" value={status} /></Row>
      },
    },
    openPalette: {
      code: `registerCommands([{ id: "new", title: "Yeni belge", run: () => create() }])
openPalette()          // Esc ile kapanır`,
      run: () => {
        const off = registerCommands([{ id: "ex-open-palette", title: "Örnek komut: merhaba", group: "Örnek", run: () => toast("Merhaba, Acme!", { kind: "success" }) }])
        onCleanup(off)
        return <Row><Button variant="primary" onClick={() => openPalette()}>Paleti aç</Button><span class="hm-muted">“merhaba” yazıp Enter’a bas</span></Row>
      },
    },
    paletteOpen: {
      code: `effect(() => console.log(paletteOpen() ? "açık" : "kapalı"))
openPalette(); closePalette()`,
      run: () => <Row>
        <Button onClick={() => openPalette()}>Aç</Button>
        <Button variant="ghost" onClick={() => closePalette()}>Kapat</Button>
        <Out label="paletteOpen()" value={() => (paletteOpen() ? "açık" : "kapalı")} />
      </Row>,
    },
    parse: {
      code: `parse("hsl(24 90% 53%)")    // { r: 238, g: 126, b: 28, a: 1 }
parse("rengarenk")          // null`,
      run: () => {
        const text = signal("oklch(0.72 0.17 55)")
        const c = computed(() => parse(text()))
        return <div class="sc-stack">
          <Row><Field sig={text} label="Renk" /><Swatch color={() => (c() ? text() : "")} /></Row>
          <Row>{["#336699", "hsl(24 90% 53%)", "rgb(10 200 120 / .5)", "rengarenk"].map((s) => <Button size="sm" variant="ghost" onClick={() => text.set(s)}>{s}</Button>)}</Row>
          <Out label="sonuç" value={() => { const v = c(); return v ? json({ r: Math.round(v.r), g: Math.round(v.g), b: Math.round(v.b), a: Math.round(v.a * 100) / 100 }) : "null" }} />
        </div>
      },
    },
    parseBezier: {
      code: `parseBezier("cubic-bezier(.34, 1.56, .64, 1)")   // [0.34, 1.56, 0.64, 1]
parseBezier("ease-out")                          // eğri adını da çözer`,
      run: () => {
        const text = signal("cubic-bezier(.34, 1.56, .64, 1)")
        const b = computed(() => parseBezier(text()))
        const d = () => { const v = b(); return v ? `M0,100 C${v[0] * 100},${100 - v[1] * 100} ${v[2] * 100},${100 - v[3] * 100} 100,0` : "" }
        return <div class="sc-stack">
          <Field sig={text} label="Eğri" />
          <Row>{["ease-out", "back", "linear", "bilinmeyen"].map((s) => <Button size="sm" variant="ghost" onClick={() => text.set(s)}>{s}</Button>)}</Row>
          <Row>
            <svg class="sc-ex-ui-f-curve" viewBox="-10 -70 120 190" role="img" aria-label="Eğri çizimi"><path d={d} /></svg>
            <Out label="sonuç" value={() => { const v = b(); return v ? `${json(v)} → ${bezierCss(v)}` : "null" }} />
          </Row>
        </div>
      },
    },
    parseDate: {
      code: `parseDate("14.03.2026", "tr-TR")   // "2026-03-14"
parseDate("3/14/26", "en-US")      // "2026-03-14"
parseDate("")                      // null (boş)  ·  parseDate("32.13.2026") // undefined (geçersiz)`,
      run: () => {
        const text = signal("14.03.2026"), loc = signal("tr-TR")
        return <div class="sc-stack">
          <Row><Field sig={text} label="Tarih" /><Pick sig={loc} label="Yerel ayar" options={[["tr-TR", "tr"], ["en-US", "en"]]} /></Row>
          <Out label="sonuç" value={() => { const v = parseDate(text(), loc()); return v === null ? "null (boş)" : v === undefined ? "undefined (geçersiz)" : v }} />
        </div>
      },
    },
    parseGradient: {
      code: `parseGradient("linear-gradient(90deg, #f2801f 0%, #1d9ad6 100%)")
// { type: "linear", angle: 90, stops: [{ color, at: 0 }, { color, at: 100 }] }`,
      run: () => {
        const text = signal("linear-gradient(to right, red 0%, blue 100%)")
        const g = computed(() => parseGradient(text()))
        return <div class="sc-stack">
          <Field sig={text} label="Geçiş" />
          <Row>{["linear-gradient(135deg, orange, purple)", "radial-gradient(circle, white 0%, teal 100%)", "düz renk"].map((s) => <Button size="sm" variant="ghost" onClick={() => text.set(s)}>{s.split("(")[0]}</Button>)}</Row>
          <Row><Swatch wide color={() => { const v = g(); return v ? gradientCss(v) : "" }} /></Row>
          <Out label="sonuç" value={() => (g() ? json(g()) : "null")} />
        </div>
      },
    },
    parseJson: {
      code: `const r = parseJson('{ "ad": "Acme", }')
r.error       // "Expected double-quoted property name"
r.line        // 1  ·  r.column  // 16`,
      run: () => {
        const text = signal('{\n  "ad": "Acme",\n  "adet": 3,\n}')
        const r = computed(() => parseJson(text()))
        return <div class="sc-stack">
          <Textarea value={text} rows={4} aria-label="JSON" />
          <Out label="sonuç" value={() => { const v = r(); return v.error !== undefined ? `hata: ${v.error} (satır ${v.line}, sütun ${v.column})` : `geçerli, ${typeOf(v.value)}` }} />
        </div>
      },
    },
    parseKey: {
      code: `parseKey("mod+shift+k")   // { key: "k", ctrl: true, meta: false, alt: false, shift: true }
parseKey("alt+esc")       // "esc" → "escape"`,
      run: () => {
        const combo = signal("mod+shift+k")
        return <div class="sc-stack">
          <Field sig={combo} label="Kısayol" />
          <Out label="sonuç" value={() => json(parseKey(combo()))} />
        </div>
      },
    },
    parseNumber: {
      code: `parseNumber("1.234,56", "tr-TR")   // 1234.56
parseNumber("1,234.56", "en-US")   // 1234.56
parseNumber("")  // null   ·   parseNumber("abc")  // NaN`,
      run: () => {
        const text = signal("1.234,56"), loc = signal("tr-TR")
        return <div class="sc-stack">
          <Row><Field sig={text} label="Sayı" /><Pick sig={loc} label="Yerel ayar" options={[["tr-TR", "tr"], ["en-US", "en"]]} /></Row>
          <Row>{["1.234", "1,234", "-12,5", "abc"].map((s) => <Button size="sm" variant="ghost" onClick={() => text.set(s)}>{s}</Button>)}</Row>
          <Out label="sonuç" value={() => String(parseNumber(text(), loc()))} />
        </div>
      },
    },
    pickMain: {
      code: `const view = widgetPoint("code-view", { defaults: [plain] })
view.provide({ id: "tsx", order: 1, when: (i) => i.lang === "tsx", render })
pickMain([view], { lang: "tsx" })?.id   // "tsx"`,
      run: () => {
        const lang = signal("tsx")
        const off = DEMO_POINT.provide({ id: "tsx", order: 1, when: (i) => i.lang === "tsx", render: () => <code>TSX görünümü</code> })
        onCleanup(off)
        return <div class="sc-stack">
          <Pick sig={lang} label="Dil" options={[["tsx", "tsx"], ["css", "css"]]} />
          <Out label="seçilen sağlayıcı" value={() => pickMain([DEMO_POINT], { lang: lang() })?.id ?? "yok"} />
        </div>
      },
    },

    pickerKind: {
      code: `pickerKind([{ value: 1, label: "Gün" }, { value: 2, label: "Hafta" }])   // "segmented"
pickerKind(manyOptions)                                                 // "combobox" (10+)`,
      run: () => {
        const scenario = signal("few")
        const opts = (n: number, len: number, preview = false) => Array.from({ length: n }, (_, i) => ({ value: i, label: "Seçenek".padEnd(len, "x") + i, ...(preview ? { preview: "·" } : {}) }))
        const sets: Record<string, ReturnType<typeof opts>> = { few: opts(3, 5), long: opts(5, 12), preview: opts(3, 5, true), many: opts(12, 5) }
        return <div class="sc-stack">
          <Pick sig={scenario} label="Senaryo" options={[["few", "3 kısa"], ["long", "5 uzun"], ["preview", "önizlemeli"], ["many", "12 seçenek"]]} />
          <Out label="pickerKind" value={() => pickerKind(sets[scenario()]!)} />
          <Out label="zorlanan: chips" value={() => pickerKind(sets[scenario()]!, "chips")} />
        </div>
      },
    },
    place: {
      code: `const style = place(button, panel, "bottom-start", 6)
// { top: "212px", left: "48px", "min-width": "96px" }  → panele sabit konum olarak uygula`,
      run: () => {
        const placement = signal("bottom-start")
        const out = signal("—")
        let anchor!: HTMLElement, panel!: HTMLElement
        const calc = () => out.set(json(place(anchor, panel, placement() as "bottom-start")))
        queueMicrotask(calc)
        effect(() => { placement(); untrack(() => { if (anchor) calc() }) })
        return <div class="sc-stack">
          <Pick sig={placement} label="Yerleşim" options={[["bottom-start", "alt-baş"], ["bottom-end", "alt-son"], ["top", "üst"], ["top-end", "üst-son"]]} />
          <Row>
            <span ref={(el: HTMLElement) => { anchor = el }}><Button onClick={calc}>Bağlı öğe</Button></span>
            <div class="sc-ex-ui-f-panel" ref={(el: HTMLElement) => { panel = el }}>Panel (176×56)</div>
          </Row>
          <Out label="place()" value={out} />
        </div>
      },
    },
    pointer: {
      code: `pointer(["users", 0, "e/posta"])   // "/users/0/e~1posta"
pointer([])                        // "" (kök)`,
      run: () => {
        const text = signal("users, 0, e/posta")
        const path = () => text().split(",").map((s) => s.trim()).filter(Boolean).map((s) => (/^\d+$/.test(s) ? Number(s) : s))
        return <div class="sc-stack">
          <Field sig={text} label="Yol (virgülle)" />
          <Out label="JSON pointer" value={() => json(pointer(path()))} />
        </div>
      },
    },
    preloadPalette: {
      code: `await preloadPalette()   // palet görünümü önceden iner; ilk açılış gecikmez
openPalette()`,
      run: () => {
        const lines = signal<string[]>([])
        const go = async () => {
          const t0 = performance.now()
          await preloadPalette()
          lines.update((l) => [...l, `${now()} görünüm hazır (${Math.round(performance.now() - t0)} ms)`])
        }
        return <Row><Button onClick={go}>Önceden yükle</Button><Log lines={lines} /></Row>
      },
    },
    prompt: {
      code: `const ad = await prompt({ title: "Dosya adı", label: "Ad", value: "rapor",
  validate: (v) => (v.length < 3 ? "En az 3 karakter" : null) })
// ad: yazılan metin, iptalde null`,
      run: () => {
        const out = signal("—")
        const go = async () => {
          const v = await prompt({ title: "Dosya adı", message: "Yeni dosyaya bir ad ver.", label: "Ad", value: "rapor", validate: (s) => (s.trim().length < 3 ? "En az 3 karakter" : null) })
          out.set(v === null ? "iptal (null)" : `“${v}”`)
        }
        return <Row><Button onClick={go}>Ad sor</Button><Out label="sonuç" value={out} /></Row>
      },
    },
    quietMedia: {
      code: `if (quietMedia()) showPoster()   // veri tasarrufu, 2G ya da azaltılmış hareket
else playVideo()`,
      run: () => {
        const tick = signal(0)
        return <Row>
          <Out label="quietMedia()" value={() => { tick(); return quietMedia() ? "evet: ağır medya durur" : "hayır: oynatılabilir" }} />
          <Button variant="ghost" onClick={() => tick.update((x) => x + 1)}>Yeniden oku</Button>
        </Row>
      },
    },
    rangePresets: {
      code: `rangePresets("2026-03-14")
// [{ id: "today", range: { from: "2026-03-14", to: "2026-03-14" } },
//  { id: "7d", range: { from: "2026-03-08", to: "2026-03-14" } }, …]`,
      run: () => {
        const day = signal(todayIso())
        const list = computed(() => rangePresets(parseDate(day()) ?? todayIso()))
        return <div class="sc-stack">
          <Row><Field sig={day} label="Bugün (YYYY-AA-GG)" /><Button variant="ghost" onClick={() => day.set(todayIso())}>Gerçek bugün</Button></Row>
          <ul class="sc-ex-ui-f-list">{() => list().map((p) => <li><strong>{p.label}</strong><code class="sc-ex-val">{`${p.range.from} → ${p.range.to}`}</code></li>)}</ul>
        </div>
      },
    },
    rank: {
      code: `rank("kul", [{ title: "Kullanıcılar" }, { title: "Rapor" }, { title: "Ödeme kuralları", keywords: "kullanım" }])
// en iyi eşleşme önce: [{ item, score }, …]`,
      run: () => {
        const q = signal("kul")
        const items = [{ title: "Kullanıcılar", keywords: "üye hesap" }, { title: "Kural motoru", keywords: "otomasyon" }, { title: "Rapor", keywords: "kullanım" }, { title: "Faturalar" }, { title: "Ayarlar", keywords: "tercih" }]
        return <div class="sc-stack">
          <Field sig={q} label="Arama" />
          <ul class="sc-ex-ui-f-list">{() => { const r = rank(q(), items); return r.length ? r.map((x) => <li><strong>{x.item.title}</strong><code class="sc-ex-val">{x.score.toFixed(1)}</code></li>) : <li class="hm-muted">Eşleşme yok</li> }}</ul>
        </div>
      },
    },
    registerCommands: {
      code: `const off = registerCommands([
  { id: "invoice", title: "Fatura oluştur", group: "Satış", keywords: "ödeme", run: () => create() },
])   // off() ya da sahibin temizliği kaldırır`,
      run: () => {
        const off = registerCommands([
          { id: "ex-invoice", title: "Fatura oluştur", group: "Örnek", keywords: "ödeme satış", run: () => toast("Fatura taslağı hazır", { kind: "success" }) },
          { id: "ex-report", title: "Rapor indir", group: "Örnek", shortcut: "mod+shift+r", run: () => toast("Rapor indiriliyor…") },
        ])
        onCleanup(off)
        return <Row><Button variant="primary" onClick={() => openPalette()}>Paleti aç</Button><span class="hm-muted">“fatura” ya da “rapor” ara</span></Row>
      },
    },
    registerInput: {
      code: `registerInput("stars", Stars)                       // alan türü / control adı
const form = useForm({ rating: { type: "number", control: "stars", label: "Puan" } })
renderFields(form)`,
      run: () => {
        registerInput("stars", Stars)
        const form = useForm({ rating: { type: "number", control: "stars", label: "Puan", default: 3 } })
        return <div class="sc-stack">{renderFields(form)}<Out label="rating" value={() => String(form.values["rating"])} /></div>
      },
    },
    registerPages: {
      code: `registerPages([{ id: "billing", title: "Faturalama", href: "/billing", group: "Hesap", keywords: "ödeme" }])`,
      run: () => {
        const off = registerPages([
          { id: "ex-billing", title: "Faturalama", href: "#faturalama", group: "Örnek sayfalar", keywords: "ödeme plan" },
          { id: "ex-team", title: "Ekip üyeleri", href: "#ekip", group: "Örnek sayfalar", keywords: "kişiler davet" },
        ])
        onCleanup(off)
        return <Row><Button variant="primary" onClick={() => openPalette()}>Paleti aç</Button><span class="hm-muted">“ekip” ya da “ödeme” ara: sayfalar listelenir</span></Row>
      },
    },
    registerThemes: {
      code: `registerThemes([{ id: "acme", name: "Acme", href: "/themes/acme.css" }])
colorThemes().some((t) => t.id === "acme")   // true → ThemePicker listeler`,
      run: () => {
        const n = signal(colorThemes().length)
        const go = () => { registerThemes([{ id: "acme", name: "Acme", description: "Örnek tema", href: "themes/acme.css" }]); n.set(colorThemes().length) }
        return <Row><Button onClick={go}>“Acme” temasını kaydet</Button><Out label="kayıtlı tema" value={() => `${n()} (${colorThemes().some((t) => t.id === "acme") ? "acme dahil" : "acme yok"})`} /></Row>
      },
    },
    removeAt: {
      code: `removeAt({ a: 1, list: [1, 2, 3] }, ["list", 1])   // { a: 1, list: [1, 3] }`,
      run: () => {
        const doc = signal<unknown>(DOC)
        const target = signal("tags,0")
        return <div class="sc-stack">
          <Pick sig={target} label="Silinecek yol" options={[["tags,0", "tags/0"], ["owner,id", "owner/id"], ["name", "name"]]} />
          <Row><Button onClick={() => doc.set(removeAt(doc(), target().split(",").map((s) => (/^\d+$/.test(s) ? Number(s) : s))))}>Sil</Button><Button variant="ghost" onClick={() => doc.set(DOC)}>Sıfırla</Button></Row>
          <pre class="sc-ex-ui-f-code">{() => JSON.stringify(doc(), null, 2)}</pre>
        </div>
      },
    },
    renameAt: {
      code: `renameAt({ ad: "Acme", adet: 3 }, ["ad"], "name")   // { name: "Acme", adet: 3 } (sıra korunur)`,
      run: () => {
        const doc = signal<unknown>(DOC)
        const to = signal("title")
        return <div class="sc-stack">
          <Row><Field sig={to} label="Yeni anahtar" /><Button onClick={() => to().trim() && doc.set(renameAt(doc(), ["name"], to().trim()))}>“name” anahtarını yeniden adlandır</Button><Button variant="ghost" onClick={() => doc.set(DOC)}>Sıfırla</Button></Row>
          <pre class="sc-ex-ui-f-code">{() => JSON.stringify(doc(), null, 2)}</pre>
        </div>
      },
    },
    renderFields: {
      code: `const form = useForm({ name: { type: "text", label: "Ad" }, email: { type: "email", label: "E-posta" } })
renderFields(form, null, { layout: "grid", cols: 2 })`,
      run: () => {
        const layout = signal("stack")
        const form = useForm({ name: { type: "text", label: "Ad", required: true }, email: { type: "email", label: "E-posta" }, plan: { type: "text", label: "Plan" }, note: { type: "text", label: "Not" } }, { name: "Ada" })
        return <div class="sc-stack">
          <Pick sig={layout} label="Yerleşim" options={[["stack", "alt alta"], ["grid", "ızgara"]]} />
          {() => renderFields(form, null, { layout: layout() as "stack", cols: 2 })}
        </div>
      },
    },
  },
})
