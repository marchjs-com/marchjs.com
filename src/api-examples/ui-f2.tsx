// API examples of march/ui, names resolveColor … widgetPoint (dialogs, parsers, JSON paths, forms, themes, shortcuts, widget points).
// Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, effect, onCleanup, untrack } from "march";
import {
  Button, Textarea, key, parse, parseJson, resolveColor, theme, toast, typeOf, Form, colorTheme, pointer, renderFields, resolvedTheme, rgbToHsv, sample, sampleTrack, schemaAt, score, setTheme, todayIso, useForm, Kbd, Widget, accent, addDays, getAt, insertAfter, setAccent, setColorTheme, setThemeBase, shapesFor, shortcuts, sorter, targetVars, timelineCode, tokenize, tokenLines, typingText, updateAt, useFormContext, validateJson,
} from "march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import { Swatch, Field, Pick, KT, DOC, SCHEMA, json, now } from "./_ui-f-kit.tsx";
export { default as SIG } from "./ui-f2.sig.gen.ts";

function FormPeek() {
  const f = useFormContext()!
  return <div class="sc-ex-stack">
    {renderFields(f)}
    <Row><Out label="geçerli" value={() => (f.valid() ? "evet" : "hayır")} /><Out label="değişti" value={() => (f.dirty() ? "evet" : "hayır")} /></Row>
  </div>
}




export default examples({
  "march/ui": {
    resolveColor: {
      code: `resolveColor("brand-orange", document.body)   // "#F2801F" (temanın o andaki değeri)
resolveColor("#336699")                        // CSS rengi olduğu gibi döner`,
      run: () => {
        const tok = signal("brand-orange")
        const out = computed(() => resolveColor(tok(), document.body))
        return <div class="sc-ex-stack">
          <Pick sig={tok} label="Renk adı" options={[["brand-orange", "turuncu"], ["brand-blue", "mavi"], ["brand-green", "yeşil"], ["brand-purple", "mor"], ["primary", "birincil"]]} />
          <Row><Swatch color={out} /><Out label="sonuç" value={out} /></Row>
        </div>
      },
    },
    resolvedTheme: {
      code: `resolvedTheme()   // "light" | "dark" ("system" çözüldükten sonra)`,
      run: () => {
        const was = theme.peek()
        const mode = signal<string>(was)
        effect(() => { setTheme(mode() as "light") })
        onCleanup(() => setTheme(was))
        return <div class="sc-ex-stack">
          <Pick sig={mode} label="Görünüm" options={[["system", "sistem"], ["light", "açık"], ["dark", "koyu"]]} />
          <Row><Out label="tercih" value={() => theme()} /><Out label="resolvedTheme()" value={() => { theme(); return resolvedTheme() }} /><Button variant="ghost" onClick={() => mode.set(was)}>Geri al</Button></Row>
        </div>
      },
    },
    rgbToHsv: {
      code: `rgbToHsv({ r: 242, g: 128, b: 31, a: 1 })   // { h: 26.5, s: 0.87, v: 0.95, a: 1 }`,
      run: () => {
        const r = signal(242), g = signal(128), b = signal(31)
        const range = (s: { (): number; set(v: number): unknown }, label: string) => <label class="sc-row">{label}<input class="sc-ex-ui-f-range" type="range" min="0" max="255" value={s()} aria-label={label} onInput={(e: Event) => s.set(+(e.target as HTMLInputElement).value)} /></label>
        const hsv = computed(() => rgbToHsv({ r: r(), g: g(), b: b(), a: 1 }))
        return <div class="sc-ex-stack">
          {range(r, "R")}{range(g, "G")}{range(b, "B")}
          <Row><Swatch color={() => `rgb(${r()} ${g()} ${b()})`} /><Out label="HSV" value={() => `h ${Math.round(hsv().h)}°  s ${Math.round(hsv().s * 100)}%  v ${Math.round(hsv().v * 100)}%`} /></Row>
        </div>
      },
    },
    sample: {
      code: `sample(model, 500)   // { logo: { x: 60, rotate: 90, scale: 1.25 } }`,
      run: () => {
        const t = signal(500)
        return <div class="sc-ex-stack">
          <label class="sc-row">Zaman<input class="sc-ex-ui-f-range" type="range" min="0" max="1000" step="50" value={t()} aria-label="Zaman (ms)" onInput={(e: Event) => t.set(+(e.target as HTMLInputElement).value)} /></label>
          <Out label={`sample(model, t)`} value={() => `${t()} ms → ${json(Object.fromEntries(Object.entries(sample(KT, t())).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([p, n]) => [p, Math.round((n as number) * 100) / 100]))])))}`} />
        </div>
      },
    },
    sampleTrack: {
      code: `sampleTrack({ id: "a", target: "logo", prop: "x", keys: [{ at: 0, value: 0 }, { at: 1000, value: 120, easing: "out" }] }, 250)`,
      run: () => {
        const t = signal(250), easing = signal("out")
        const track = computed(() => ({ id: "a", target: "logo", prop: "x" as const, keys: [{ at: 0, value: 0 }, { at: 1000, value: 120, easing: easing() }] }))
        return <div class="sc-ex-stack">
          <Pick sig={easing} label="Yumuşatma" options={[["linear", "linear"], ["in", "in"], ["out", "out"], ["in-out", "in-out"]]} />
          <label class="sc-row">Zaman<input class="sc-ex-ui-f-range" type="range" min="0" max="1000" step="50" value={t()} aria-label="Zaman (ms)" onInput={(e: Event) => t.set(+(e.target as HTMLInputElement).value)} /></label>
          <Out label="x" value={() => `${Math.round(sampleTrack(track(), t()) * 10) / 10} px (${t()} ms)`} />
        </div>
      },
    },
    schemaAt: {
      code: `schemaAt(schema, ["owner", "mail"])   // { type: "string", format: "email" }
schemaAt(schema, ["bilinmeyen"])      // undefined`,
      run: () => {
        const path = signal("owner,mail")
        return <div class="sc-ex-stack">
          <Pick sig={path} label="Yol" options={[["name", "name"], ["owner,mail", "owner/mail"], ["size", "size"], ["x", "x"]]} />
          <Out label="schemaAt" value={() => json(schemaAt(SCHEMA, path().split(",")))} />
        </div>
      },
    },

    score: {
      code: `score("rap", "Rapor")           // yüksek: önek eşleşmesi
score("rap", "Haftalık rapor")  // orta: kelime başı
score("xyz", "Rapor")           // 0 → eşleşme yok`,
      run: () => {
        const q = signal("rap")
        const titles = ["Rapor", "Haftalık rapor", "Aylık raporlama", "Fatura", "Rapro"]
        return <div class="sc-ex-stack">
          <Field sig={q} label="Sorgu" />
          <ul class="sc-ex-ui-f-list">{() => titles.map((t) => <li><strong>{t}</strong><code class="sc-ex-val">{score(q(), t).toFixed(1)}</code></li>)}</ul>
        </div>
      },
    },
    setAccent: {
      code: `setAccent("brand-blue")   // tüm uygulama vurgusu
setAccent(null)           // temanın kendi birincil rengi`,
      run: () => {
        const was = untrack(accent)
        onCleanup(() => setAccent(was))
        const tok = signal(was as string)
        effect(() => { setAccent(tok() as "primary") })
        return <div class="sc-ex-stack">
          <Pick sig={tok} label="Vurgu" options={[["primary", "tema"], ["brand-orange", "turuncu"], ["brand-blue", "mavi"], ["brand-green", "yeşil"], ["brand-purple", "mor"]]} />
          <Row><Button variant="primary">Birincil düğme</Button><Button variant="ghost" onClick={() => tok.set(was)}>Geri al</Button></Row>
        </div>
      },
    },
    setColorTheme: {
      code: `setColorTheme("night")   // stilini tembel yükler, seçimi hatırlar
colorTheme()             // "night"`,
      run: () => {
        const was = colorTheme()
        onCleanup(() => { setColorTheme(was) })
        const id = signal(was)
        effect(() => { setColorTheme(id()) })
        return <div class="sc-ex-stack">
          <Pick sig={id} label="Renk teması" options={[["hadi", "varsayılan"], ["night", "gece"], ["cream", "krem"]]} />
          <Row><Out label="colorTheme()" value={colorTheme} /><Button variant="ghost" onClick={() => id.set(was)}>Geri al</Button></Row>
        </div>
      },
    },
    setTheme: {
      code: `setTheme("dark")   // "light" | "dark" | "system"; seçim saklanır`,
      run: () => {
        const was = theme.peek()
        onCleanup(() => { setTheme(was) })
        return <div class="sc-ex-stack">
          <Row>{(["light", "dark", "system"] as const).map((m) => <Button variant={() => (theme() === m ? "primary" : "secondary")} onClick={() => setTheme(m)}>{m === "light" ? "Açık" : m === "dark" ? "Koyu" : "Sistem"}</Button>)}</Row>
          <Row><Out label="theme()" value={() => theme()} /><Button variant="ghost" onClick={() => setTheme(was)}>Geri al</Button></Row>
        </div>
      },
    },
    setThemeBase: {
      code: `setThemeBase("/assets/themes/")   // setColorTheme("night") → /assets/themes/night.css`,
      run: () => {
        const base = signal("themes/")
        const apply = (v: string) => { base.set(v); setThemeBase(v) }
        apply("themes/")
        return <div class="sc-ex-stack">
          <Row><Field sig={base} label="Tema klasörü" /><Button onClick={() => setThemeBase(base())}>Uygula</Button></Row>
          <Out label="yüklenecek" value={() => `${base().endsWith("/") ? base() : `${base()}/`}night.css`} />
          <span class="m-muted">Bu örnek değeri varsayılana (“themes/”) uygular; başka bir değer yazarsan Uygula’dan sonra Sıfırla ile dön.</span>
          <Button variant="ghost" onClick={() => apply("themes/")}>Sıfırla</Button>
        </div>
      },
    },
    shapesFor: {
      code: `shapesFor("classic", "checkbox")   // ["square", "rounded", "circle"]
shapesFor("card", "radio")         // ["square", "rounded"]
shapesFor("classic", "radio")      // [] (yuvarlak kalır)`,
      run: () => {
        const variant = signal("classic"), kind = signal("checkbox")
        return <div class="sc-ex-stack">
          <Pick sig={variant} label="Görünüm" options={[["classic", "klasik"], ["chip", "çip"], ["card", "kart"], ["toggle", "anahtar"], ["segmented", "bölmeli"]]} />
          <Pick sig={kind} label="Tür" options={[["checkbox", "onay kutusu"], ["radio", "radyo"]]} />
          <Out label="şekiller" value={() => json(shapesFor(variant() as "classic", kind() as "checkbox"))} />
        </div>
      },
    },
    shortcuts: {
      code: `key("alt+j", () => open(), { description: "Not aç", group: "Notlar" })
shortcuts()   // [{ combo: "alt+j", label: "Alt+J", description: "Not aç", group: "Notlar" }]`,
      run: () => {
        const lines = signal<string[]>([])
        const offs = [
          key("alt+j", () => lines.update((l) => [...l, `${now()} Not aç`]), { description: "Not aç", group: "Notlar" }),
          key("alt+shift+k", () => lines.update((l) => [...l, `${now()} Arama`]), { description: () => "Arama", group: "Notlar" }),
        ]
        onCleanup(() => offs.forEach((o) => o()))
        return <div class="sc-ex-stack">
          <ul class="sc-ex-ui-f-list">{() => shortcuts().map((s) => <li><Kbd>{s.label}</Kbd><span>{s.description}</span><span class="m-muted">{s.group}</span></li>)}</ul>
          <span class="m-muted">Alt+J ya da Alt+Shift+K’ye bas.</span>
          <Log lines={lines} />
        </div>
      },
    },
    sorter: {
      code: `["Çay", "Ada", "Zeytin", "Ilık"].sort(sorter("alpha", "tr-TR")!)   // dil kurallarıyla
sorter("none")                                                        // null → sırayı koru`,
      run: () => {
        const mode = signal("alpha"), loc = signal("tr-TR")
        const titles = ["Zeytin", "Çay", "Ilık", "Ada", "İzmir", "Şeker"]
        return <div class="sc-ex-stack">
          <Row><Pick sig={mode} label="Sıralama" options={[["alpha", "alfabetik"], ["none", "yok"]]} /><Pick sig={loc} label="Yerel ayar" options={[["tr-TR", "tr"], ["en-US", "en"]]} /></Row>
          <Out label="sonuç" value={() => { const cmp = sorter(mode() as "alpha", loc()); const items = titles.map((title) => ({ title })); return (cmp ? items.sort(cmp) : items).map((x) => x.title).join(", ") }} />
        </div>
      },
    },
    targetVars: {
      code: `targetVars(sample(model, 500).logo)
// { "--m-kt-x": "60", "--m-kt-r": "90", "--m-kt-s": "1.25", … } → hedef öğenin CSS değişkenleri`,
      run: () => {
        const t = signal(500)
        const vars = computed(() => targetVars(sample(KT, t())["logo"] ?? {}))
        return <div class="sc-ex-stack">
          <label class="sc-row">Zaman<input class="sc-ex-ui-f-range" type="range" min="0" max="1000" step="50" value={t()} aria-label="Zaman (ms)" onInput={(e: Event) => t.set(+(e.target as HTMLInputElement).value)} /></label>
          <div class="sc-ex-ui-f-stage"><div class="sc-ex-ui-f-box" ref={(el: HTMLElement) => effect(() => { for (const [k, v] of Object.entries(vars())) el.style.setProperty(k, v) })} /></div>
          <Out label="değişkenler" value={() => json(vars())} />
        </div>
      },
    },
    theme: {
      code: `theme()            // "system" | "light" | "dark" (reaktif)
theme.set("dark")  // saklar ve uygular`,
      run: () => {
        const was = theme.peek()
        onCleanup(() => { theme.set(was) })
        return <Row>
          <Out label="theme()" value={() => theme()} />
          <Button onClick={() => theme.set(theme.peek() === "dark" ? "light" : "dark")}>Aç / koyu değiştir</Button>
          <Button variant="ghost" onClick={() => theme.set(was)}>Geri al</Button>
        </Row>
      },
    },
    timelineCode: {
      code: `timelineCode(model)
// timeline()
//   .add("#logo", [{ translate: "0px 0" }, { translate: "120px 0" }], { at: 0, duration: 1000, easing: "in-out" })`,
      run: () => {
        const dur = signal("1000")
        const model = computed<Model>(() => ({ duration: +dur(), tracks: [{ id: "a", target: "logo", prop: "x", keys: [{ at: 0, value: 0 }, { at: +dur(), value: 120, easing: "out" }] }] }))
        return <div class="sc-ex-stack">
          <Pick sig={dur} label="Süre" options={[["500", "0,5 sn"], ["1000", "1 sn"], ["2000", "2 sn"]]} />
          <pre class="sc-ex-ui-f-code">{() => timelineCode(model())}</pre>
        </div>
      },
    },
    toast: {
      code: `const id = toast("Kaydedildi", { kind: "success" })
toast("Silindi", { kind: "warn", action: { label: "Geri al", run: () => undo() } })
toast.dismiss(id)`,
      run: () => {
        const last = signal<number | null>(null)
        const show = (kind: "info" | "success" | "warn" | "danger", text: string) => () => last.set(toast(text, { kind, ...(kind === "warn" ? { action: { label: "Geri al", run: () => toast("Geri alındı", { kind: "success" }) } } : {}) }))
        return <div class="sc-ex-stack">
          <Row>
            <Button onClick={show("info", "Bilgi mesajı")}>Bilgi</Button>
            <Button onClick={show("success", "Kaydedildi")}>Başarı</Button>
            <Button onClick={show("warn", "Kayıt silindi")}>Uyarı + eylem</Button>
            <Button onClick={show("danger", "İşlem başarısız")}>Hata</Button>
          </Row>
          <Row><Out label="son kimlik" value={() => String(last() ?? "—")} /><Button variant="ghost" onClick={() => { const id = last(); if (id !== null) toast.dismiss(id) }}>Sonuncuyu kapat</Button><Button variant="ghost" onClick={() => toast.clear()}>Hepsini temizle</Button></Row>
        </div>
      },
    },
    todayIso: {
      code: `todayIso()                 // "2026-11-12" (yerel saat)
addDays(todayIso(), 7)     // bir hafta sonrası`,
      run: () => {
        const tick = signal(0)
        return <div class="sc-ex-stack">
          <Out label="todayIso()" value={() => { tick(); return todayIso() }} />
          <Out label="7 gün sonra" value={() => { tick(); return addDays(todayIso(), 7) }} />
          <Button variant="ghost" onClick={() => tick.update((x) => x + 1)}>Yeniden oku</Button>
        </div>
      },
    },
    tokenize: {
      code: `tokenize("const n = 3 // adet", "ts")
// [["kw", "const"], ["", " "], ["", "n"], …, ["com", "// adet"]]`,
      run: () => {
        const lang = signal("ts")
        const SRC: Record<string, string> = { ts: 'const total = items.length * 3 // adet', css: ".card { color: var(--m-primary); }", json: '{ "ad": "HADİ", "adet": 3 }', sh: "npm run build # derle" }
        return <div class="sc-ex-stack">
          <Pick sig={lang} label="Dil" options={[["ts", "ts"], ["css", "css"], ["json", "json"], ["sh", "sh"]]} />
          <pre class="sc-ex-ui-f-code">{() => tokenize(SRC[lang()]!, lang()).map(([k, t]) => <span class={k ? `m-tok-${k}` : ""}>{t}</span>)}</pre>
          <Out label="parça" value={() => tokenize(SRC[lang()]!, lang()).filter(([k]) => k).map(([k]) => k).join(" ")} />
        </div>
      },
    },
    tokenLines: {
      code: `tokenLines("a\\nb", "ts")   // [[["", "a"]], [["", "b"]]]  → satır satır çizim için`,
      run: () => {
        const src = signal("// toplam\nconst a = 1\nconst b = a + 2")
        return <div class="sc-ex-stack">
          <Textarea value={src} rows={3} aria-label="Kaynak kod" />
          <pre class="sc-ex-ui-f-code">{() => tokenLines(src(), "ts").map((line, i) => <div><span class="m-muted">{`${i + 1}  `}</span>{line.length ? line.map(([k, t]) => <span class={k ? `m-tok-${k}` : ""}>{t}</span>) : " "}</div>)}</pre>
        </div>
      },
    },
    typeOf: {
      code: `typeOf([1, 2])    // "array"
typeOf(null)      // "null"   ·   typeOf(3) // "number"`,
      run: () => {
        const text = signal('{"a": [1, 2], "b": null}')
        const path = signal("a")
        return <div class="sc-ex-stack">
          <Field sig={text} label="JSON" />
          <Pick sig={path} label="Yol" options={[["", "kök"], ["a", "a"], ["b", "b"], ["a,0", "a/0"]]} />
          <Out label="typeOf" value={() => { const r = parseJson(text()); return r.error !== undefined ? "geçersiz JSON" : typeOf(getAt(r.value, path() ? path().split(",").map((s) => (/^\d+$/.test(s) ? Number(s) : s)) : [])) }} />
        </div>
      },
    },
    typingText: {
      code: `typingText(["Ada"])               // "Ada yazıyor…"
typingText(["Ada", "Can"])        // "Ada ve Can yazıyor…"
typingText(["Ada", "Can", "Eda"]) // "3 kişi yazıyor…"`,
      run: () => {
        const n = signal("2")
        const NAMES = ["Ada", "Can", "Eda"]
        return <div class="sc-ex-stack">
          <Pick sig={n} label="Yazan kişi" options={[["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"]]} />
          <Out label="metin" value={() => typingText(NAMES.slice(0, +n())) || "(boş)"} />
        </div>
      },
    },
    updateAt: {
      code: `updateAt(doc, ["owner", "id"], (id) => id + 1)   // yalnız yoldaki kapları kopyalar`,
      run: () => {
        const doc = signal<unknown>(DOC)
        return <div class="sc-ex-stack">
          <Row>
            <Button onClick={() => doc.set(updateAt(doc(), ["owner", "id"], (id) => Number(id) + 1))}>owner.id + 1</Button>
            <Button onClick={() => doc.set(updateAt(doc(), ["tags"], (l) => [...(l as string[]), "c"]))}>tags’e ekle</Button>
            <Button onClick={() => doc.set(insertAfter(doc(), ["tags", 0], "yeni"))}>0’dan sonra ekle</Button>
            <Button variant="ghost" onClick={() => doc.set(DOC)}>Sıfırla</Button>
          </Row>
          <pre class="sc-ex-ui-f-code">{() => JSON.stringify(doc(), null, 2)}</pre>
        </div>
      },
    },
    useForm: {
      code: `const form = useForm({ name: { type: "text", label: "Ad", required: true }, email: { type: "email", label: "E-posta" } },
  { name: "Ada" }, { onSubmit: (v) => save(v) })
renderFields(form)
form.submit()`,
      run: () => {
        const lines = signal<string[]>([])
        const form = useForm({ name: { type: "text", label: "Ad", required: true }, email: { type: "email", label: "E-posta" } }, { name: "Ada" },
          { validateOn: "change", onSubmit: (v: Record<string, unknown>) => { lines.update((l) => [...l, `${now()} gönderildi: ${json(v)}`]) } })
        return <div class="sc-ex-stack">
          {renderFields(form)}
          <Row>
            <Button variant="primary" onClick={() => void form.submit()}>Gönder</Button>
            <Button variant="ghost" onClick={() => form.reset()}>Sıfırla</Button>
            <Out label="geçerli" value={() => (form.valid() ? "evet" : "hayır")} />
            <Out label="değişti" value={() => (form.dirty() ? "evet" : "hayır")} />
          </Row>
          <Log lines={lines} />
        </div>
      },
    },
    useFormContext: {
      code: `function Status() {
  const form = useFormContext()!
  return <p>{form.valid() ? "Geçerli" : "Eksik alan var"}</p>
}
<Form schema={spec}><Status /></Form>`,
      run: () => <Form schema={{ title: { type: "text", label: "Başlık", required: true }, qty: { type: "number", label: "Adet", min: 1 } }} initial={{ title: "HADİ" }} actions={false}><FormPeek /></Form>,
    },
    validateJson: {
      code: `validateJson({ name: "Ac", size: 0 }, schema)
// [{ path: ["name"], message: "…" }, { path: ["size"], message: "…" }]`,
      run: () => {
        const text = signal('{ "name": "Ac", "size": 0, "owner": { "mail": "yok" } }')
        const errors = computed(() => { const r = parseJson(text()); return r.error !== undefined ? null : validateJson(r.value, SCHEMA) })
        return <div class="sc-ex-stack">
          <Textarea value={text} rows={3} aria-label="JSON" />
          <ul class="sc-ex-ui-f-list">{() => { const e = errors(); return e === null ? <li role="alert">Geçersiz JSON</li> : e.length ? e.map((x) => <li><code class="sc-ex-val">{pointer(x.path) || "/"}</code>{x.message}</li>) : <li>Şemaya uygun.</li> }}</ul>
        </div>
      },
    },
    validateRecords: {
      code: `validateRecords([{ name: "Kutu", qty: 2 }, { name: "", qty: 1 }], { name: { type: "text", required: true, label: "Ad" }, qty: { type: "number", label: "Adet" } })
// "Satır 2: Ad: …"`,
      run: () => {
        const rows = signal<Record<string, unknown>[]>([{ name: "Kutu", qty: 2 }, { name: "", qty: 1 }])
        const fields = { name: { type: "text", required: true, label: "Ad" }, qty: { type: "number", label: "Adet", min: 1 } } as const
        return <div class="sc-ex-stack">
          <Row>
            <Button onClick={() => rows.update((l) => [...l, { name: "", qty: 1 }])}>Boş satır ekle</Button>
            <Button onClick={() => rows.update((l) => l.map((r) => ({ ...r, name: r["name"] || "Ürün" })))}>Adları doldur</Button>
            <Button variant="ghost" onClick={() => rows.set([{ name: "Kutu", qty: 2 }, { name: "", qty: 1 }])}>Sıfırla</Button>
          </Row>
          <Out label="satır sayısı" value={() => String(rows().length)} />
          <Out label="sonuç" value={() => validateRecords(rows(), fields as never) ?? "null (hepsi geçerli)"} />
        </div>
      },
    },
    widgetPoint: {
      code: `const view = widgetPoint("code-view", { defaults: [plain] })
const off = view.provide({ id: "tsx", order: 1, when: (i) => i.lang === "tsx", render: (i) => <TsxView {...i} /> })
<Widget sources={[view]} input={{ lang: "tsx" }} />`,
      run: () => {
        const lang = signal("tsx")
        const pt = widgetPoint<{ lang: string }>("ex-api-widget-point", { defaults: [{ id: "plain", render: (i) => <code>{`düz metin (${i.lang})`}</code> }] })
        const on = signal(false)
        let off: (() => void) | null = null
        const toggle = () => { if (off) { off(); off = null; on.set(false) } else { off = pt.provide({ id: "tsx", order: 1, when: (i) => i.lang === "tsx", render: () => <code>TSX görünümü</code> }); on.set(true) } }
        onCleanup(() => off?.())
        return <div class="sc-ex-stack">
          <Row><Button onClick={toggle}>{() => (on() ? "Sağlayıcıyı çıkar" : "Sağlayıcı ekle")}</Button><Pick sig={lang} label="Dil" options={[["tsx", "tsx"], ["css", "css"]]} /></Row>
          {() => <Widget sources={[pt]} input={{ lang: lang() }} class="sc-ex-target" />}
          <Out label="sağlayıcılar" value={() => pt.providers().map((p) => p.id).join(", ")} />
        </div>
      },
    },
  },
})
