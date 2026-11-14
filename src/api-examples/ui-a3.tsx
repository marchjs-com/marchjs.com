// API examples of hadi-march/ui, names "CodeInput" … "DateTimeInput" (code-point order; the subpath is split over several
// files by name range). Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`;
// components have a Playground.
import { signal, onCleanup } from "hadi-march"
import {
  Button, CodeInput, CodeView, CodeViewer, ColorInput, ColorPicker, Combobox, Chip, CopyButton, CountRoll, DatePicker,
  DateRangePicker, DateTimeInput, DEFAULT_CROP, DEFAULT_TOOLS, registerCommands, openPalette,
} from "hadi-march/ui"
import { search, fileText, plus, heart, star, calendar } from "hadi-march/icons"
import { examples } from "./types.ts"
import { Out, Log, Row } from "./_kit.tsx"
import "./ui-a.css"
export { default as SIG } from "./ui-a3.sig.gen.ts"

const now = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
/** A log signal and a writer that keeps its last `max` lines. */
const logOf = (max = 4) => { const lines = signal<string[]>([]); return [lines, (s: string) => lines.update((l) => [...l, `${now()} ${s}`].slice(-max))] as const }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const addDays = (n: number) => iso(new Date(Date.now() + n * 86_400_000))

export default examples({
  "hadi-march/ui": {
    CodeInput: {
      code: `<CodeInput length={6} groups={[3, 3]} autofocus onComplete={(code) => verify(code)} />
<CodeInput length={4} mask pattern="numeric" />   // PIN`,
      play: { options: [
        { key: "length", label: "Uzunluk", default: 6, options: [4, 6, 8] },
        { key: "variant", label: "Görünüm", default: "outline", options: ["outline", "filled", "underline"] },
        { key: "mask", label: "Gizle (PIN)", default: false },
      ] },
      run: (p: { values: { length: number; variant: "outline" | "filled" | "underline"; mask: boolean } }) => {
        const code = signal(""), result = signal("—")
        return <div class="sc-ex-stack">
          {() => { const { length, variant, mask } = p.values; code.set(""); result.set("—"); return <CodeInput value={code} length={length} variant={variant} mask={mask} groups={length === 6 ? [3, 3] : length === 8 ? [4, 4] : undefined} aria-label="Doğrulama kodu"
            onComplete={(c) => result.set(c === "123456".slice(0, length) || c === "12345678".slice(0, length) ? "doğru ✓" : "yanlış kod")} /> }}
          <Row><Out label="value" value={code} /><Out label="sonuç" value={result} /><span class="m-muted">Doğru kod: 1234…</span></Row>
        </div>
      },
    },
    CodeView: {
      code: `<CodeView code={config()} lang="json" lineNumbers={false} label="Yapılandırma" />`,
      play: { options: [
        { key: "lang", label: "Dil", default: "ts", options: ["ts", "css", "json"] },
        { key: "lineNumbers", label: "Satır numaraları", default: true },
        { key: "wrap", label: "Satır kaydır", default: false },
      ] },
      run: (p: { values: { lang: "ts" | "css" | "json"; lineNumbers: boolean; wrap: boolean } }) => {
        const n = signal(2)
        const SRC = {
          ts: () => `const team = signal(${n()})\nexport const seats = computed(() => team() * 12) // HADİ koltuk hesabı, uzun bir satır yorumu`,
          css: () => `.hadi-card {\n  padding: var(--m-space-${n()});\n  border-radius: var(--m-radius);\n}`,
          json: () => JSON.stringify({ name: "hadi", seats: n() * 12, plan: "pro" }, null, 2),
        }
        return <div class="sc-ex-stack">
          {() => { const { lang, lineNumbers, wrap } = p.values; return <CodeView code={SRC[lang]} lang={lang} lineNumbers={lineNumbers} wrap={wrap} label="Örnek kod" /> }}
          <Row><Button size="sm" onClick={() => n.update((x) => x + 1)}>Değeri artır</Button><Out label="n" value={n} /></Row>
        </div>
      },
    },
    CodeViewer: {
      code: `CodeViewer({ source: appSrc, lang: "tsx", files: [{ name: "style.css", source: css, lang: "css" }] })
// the default "viewer" provider of the codeView widget point`,
      play: { options: [{ key: "files", label: "Ek dosyalar", default: true }] },
      run: (p: { values: { files: boolean } }) => () => CodeViewer({
        source: `export function Hello() {\n  return <p class="hello">Merhaba, HADİ</p>\n}`, lang: "tsx",
        files: p.values.files ? [{ name: "hello.css", source: `.hello { color: var(--m-primary-text); }`, lang: "css" }, { name: "data.json", source: `{ "name": "HADİ" }`, lang: "json" }] : [],
      }),
    },
    ColorInput: {
      code: `<ColorInput bind:value={brandColor} aria-label="Marka rengi" />`,
      play: { options: [{ key: "readonly", label: "Salt okunur", default: false }] },
      run: (p: { values: { readonly: boolean } }) => {
        const color = signal("#1d9ad6")
        return <div class="sc-ex-stack">
          {() => <ColorInput value={color} readonly={p.values.readonly} aria-label="Marka rengi" />}
          <Row><Out label="value" value={color} /><span class="sc-ex-ui-a-chipc" style={() => `--sc-ex-c: ${color()}`}>Önizleme</span></Row>
        </div>
      },
    },
    ColorPicker: {
      code: `<ColorPicker value={color()} onChange={color.set} format="hsl" alpha={false} palettes={false} recent={0} />`,
      play: { options: [
        { key: "format", label: "Biçim", default: "hex", options: [{ value: "hex", label: "HEX" }, { value: "rgb", label: "RGB" }, { value: "hsl", label: "HSL" }] },
        { key: "alpha", label: "Saydamlık", default: false },
        { key: "palettes", label: "Paletler", default: true },
      ] },
      run: (p: { values: { format: "hex" | "rgb" | "hsl"; alpha: boolean; palettes: boolean } }) => {
        const color = signal("#78be3a")
        return <div class="sc-ex-stack">
          {() => { const { format, alpha, palettes } = p.values; return <ColorPicker value={color} format={format} alpha={alpha} recent={0} eyedropper={false}
            palettes={palettes ? [{ label: "HADİ", colors: ["#f2801f", "#1d9ad6", "#78be3a", "#a3338c"] }] : false} aria-label="Renk" /> }}
          <Out label="value" value={color} />
        </div>
      },
    },
    Combobox: {
      code: `<Combobox bind:value={assignee} placeholder="Kişi ara…"
  search={(q) => api.people(q)} labelOf={(id) => nameOf(id)} minChars={1} />`,
      play: { options: [
        { key: "multiple", label: "Çoklu seçim", default: false },
        { key: "async", label: "Uzak arama", default: false },
        { key: "allowCustom", label: "Serbest metin", default: false },
      ] },
      run: (p: { values: { multiple: boolean; async: boolean; allowCustom: boolean } }) => {
        const PEOPLE = ["Ada Yılmaz", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton", "Alan Kay", "Barbara Liskov"].map((n, i) => ({ value: `u${i}`, label: n, hint: i % 2 ? "Tasarım" : "Mühendislik" }))
        const search = (q: string) => new Promise<typeof PEOPLE>((r) => setTimeout(() => r(PEOPLE.filter((x) => x.label.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")))), 300))
        const value = signal<any>(null)
        return <div class="sc-ex-stack">
          {() => { const { multiple, async, allowCustom } = p.values; value.set(multiple ? [] : null); return <Combobox value={value} multiple={multiple} allowCustom={allowCustom} placeholder="Kişi ara…" aria-label="Atanan"
            options={async ? undefined : PEOPLE} search={async ? search : undefined} labelOf={(v) => PEOPLE.find((x) => x.value === v)?.label ?? String(v)} /> }}
          <Out label="value" value={() => JSON.stringify(value())} />
        </div>
      },
    },
    CommandPalette: {
      code: `<CommandPalette placeholder="Komut ya da sayfa…" limit={20}
  commands={[{ id: "hadi.invite", title: "Kişi davet et", group: "Ekip", run: invite }]}
  onRun={(entry) => analytics.track(entry.id)} />`,
      play: { options: [{ key: "set", label: "Komutlar", default: "doc", options: [{ value: "doc", label: "belge" }, { value: "view", label: "görünüm" }] }] },
      run: (p: { values: { set: string } }) => {
        const [lines, log] = logOf(3)
        const zoom = signal(100)
        type Cmd = { id: string; title: string; group: string; icon: unknown; keywords?: string; run: () => void }
        const SETS: Record<string, Cmd[]> = {
          doc: [
            { id: "ex.ui-a.new", title: "Yeni HADİ belgesi", group: "Bu örnek", icon: fileText, run: () => log("yeni belge") },
            { id: "ex.ui-a.star", title: "Belgeyi yıldızla", group: "Bu örnek", icon: star, keywords: "favori", run: () => log("yıldızlandı") },
          ],
          view: [
            { id: "ex.ui-a.zoomin", title: "Yakınlaştır", group: "Bu örnek", icon: plus, keywords: "zoom büyüt", run: () => { zoom.update((x) => x + 10); log("yakınlaştır") } },
            { id: "ex.ui-a.zoomreset", title: "Yakınlığı sıfırla", group: "Bu örnek", icon: search, keywords: "zoom", run: () => { zoom.set(100); log("sıfırla") } },
          ],
        }
        // the app mounts one <CommandPalette/>; this example adds its commands to it while it is on screen
        return () => { const set = SETS[p.values.set] ?? []; onCleanup(registerCommands(() => set)); return <div class="sc-ex-stack">
          <Row><Button icon={search} onClick={openPalette}>Paleti aç</Button><span class="m-muted">"{set[0]!.title.split(" ")[0]}" yazın</span><Out label="yakınlık" value={() => `%${zoom()}`} /></Row>
          <Log lines={lines} />
        </div> }
      },
    },
    CopyButton: {
      code: `<CopyButton text={() => inviteLink()} label="Bağlantıyı kopyala" onCopy={() => toast("Kopyalandı")} />
<CopyButton text={apiKey} iconOnly />`,
      play: { options: [{ key: "iconOnly", label: "Yalnız ikon", default: false }] },
      run: (p: { values: { iconOnly: boolean } }) => {
        const team = signal("tasarim"), copies = signal(0)
        const link = () => `https://hadisosyal.com/davet/${team()}`
        return <div class="sc-ex-stack">
          <Row><code class="sc-ex-val">{link}</code>{() => <CopyButton text={link} iconOnly={p.values.iconOnly} label="Bağlantıyı kopyala" onCopy={() => copies.update((x) => x + 1)} />}</Row>
          <Row>
            <Button size="sm" variant="ghost" onClick={() => team.set(team() === "tasarim" ? "muhendislik" : "tasarim")}>Ekibi değiştir</Button>
            <Out label="kopyalama" value={copies} />
          </Row>
        </div>
      },
    },
    CountRoll: {
      code: `<span>{heartIcon} <CountRoll value={likes} hideZero /></span>
<CountRoll value={views} format="full" duration={500} />`,
      play: { options: [
        { key: "format", label: "Biçim", default: "compact", options: [{ value: "compact", label: "kısa" }, { value: "full", label: "tam" }] },
        { key: "hideZero", label: "0'ı gizle", default: true },
      ] },
      run: (p: { values: { format: "compact" | "full"; hideZero: boolean } }) => {
        const likes = signal(0), views = signal(1180)
        return <div class="sc-ex-stack">
          <Row>
            <Button size="sm" icon={heart} aria-label="Beğen" onClick={() => likes.update((x) => x + 1)}><CountRoll value={likes} hideZero={() => p.values.hideZero} format={() => p.values.format} /></Button>
            <span class="sc-ex-ui-a-count"><CountRoll value={views} format={() => p.values.format} duration={500} /> görüntülenme</span>
          </Row>
          <Row>
            <Button size="sm" variant="ghost" onClick={() => views.update((x) => x + 37)}>+37</Button>
            <Button size="sm" variant="ghost" onClick={() => views.update((x) => x * 3)}>×3</Button>
            <Button size="sm" variant="ghost" onClick={() => { likes.set(0); views.set(1180) }}>Sıfırla</Button>
          </Row>
        </div>
      },
    },
    DatePicker: {
      code: `<DatePicker bind:value={due} min={today} max={inAMonth} placeholder="Son tarih" />`,
      play: { options: [
        { key: "limit", label: "Önümüzdeki 30 gün", default: true },
        { key: "locale", label: "Biçim", default: "tr-TR", options: [{ value: "tr-TR", label: "tr-TR" }, { value: "en-US", label: "en-US" }, { value: "de-DE", label: "de-DE" }] },
      ] },
      run: (p: { values: { limit: boolean; locale: string } }) => {
        const due = signal<string | null>(addDays(7))
        return <div class="sc-ex-stack">
          {() => { const { limit, locale } = p.values; return <DatePicker value={due} min={limit ? addDays(0) : undefined} max={limit ? addDays(30) : undefined} locale={locale} aria-label="Son tarih" /> }}
          <Row><Out label="value" value={() => due() ?? "null"} /><Button size="sm" variant="ghost" onClick={() => due.set(null)}>Temizle</Button></Row>
        </div>
      },
    },
    DateRangePicker: {
      code: `<DateRangePicker bind:value={range} max={today}
  presets={[{ id: "q", label: "Bu çeyrek", range: { from: "2026-10-01", to: today } }]} />`,
      play: { options: [{ key: "presets", label: "Hazır aralıklar", default: "default", options: [{ value: "default", label: "varsayılan" }, { value: "custom", label: "özel" }, { value: "none", label: "yok" }] }] },
      run: (p: { values: { presets: string } }) => {
        const range = signal<{ from: string | null; to: string | null } | null>({ from: addDays(-6), to: addDays(0) })
        const days = () => { const r = range(); return r?.from && r.to ? Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1 : 0 }
        const custom = [{ id: "w2", label: "Son 2 hafta", range: { from: addDays(-13), to: addDays(0) } }, { id: "y", label: "Dün", range: { from: addDays(-1), to: addDays(-1) } }]
        return <div class="sc-ex-stack">
          {() => { const k = p.values.presets; return <DateRangePicker value={range} max={addDays(0)} presets={k === "none" ? false : k === "custom" ? custom : undefined} aria-label="Rapor aralığı" /> }}
          <Row><Out label="from" value={() => range()?.from ?? "—"} /><Out label="to" value={() => range()?.to ?? "—"} /><Out label="gün" value={days} /></Row>
        </div>
      },
    },
    DateTimeInput: {
      code: `<DateTimeInput bind:value={startsAt} min={today} defaultTime="09:00" />
// value: "2026-11-12T09:00" (local)`,
      play: { options: [{ key: "defaultTime", label: "Varsayılan saat", default: "09:00", options: ["09:00", "13:30", "18:00"] }] },
      run: (p: { values: { defaultTime: string } }) => {
        const at = signal<string | null>(null)
        const left = () => { const v = at(); if (!v) return "—"; const h = Math.round((Date.parse(v) - Date.now()) / 3_600_000); return h >= 0 ? `${h} saat sonra` : `${-h} saat önce` }
        return <div class="sc-ex-stack">
          {() => <DateTimeInput value={at} min={addDays(0)} defaultTime={p.values.defaultTime} aria-label="Toplantı başlangıcı" />}
          <Row><Out label="value" value={() => at() ?? "null"} /><Out label="kalan" value={left} /></Row>
          <Row><Button size="sm" variant="ghost" icon={calendar} onClick={() => at.set(`${addDays(1)}T${p.values.defaultTime}`)}>Yarın</Button></Row>
        </div>
      },
    },
    DEFAULT_CROP: {
      code: `const crop = signal({ ...DEFAULT_CROP, aspect: 1 })   // { zoom: 1, rotate: 0, flip: false, x: 0, y: 0, … }
<ImageCropper src={photo} bind:value={crop} />
<Button onClick={() => crop.set({ ...DEFAULT_CROP })}>Sıfırla</Button>`,
      run: () => {
        const crop = signal({ ...DEFAULT_CROP })
        const change = (f: (c: typeof DEFAULT_CROP) => Partial<typeof DEFAULT_CROP>) => crop.update((c) => ({ ...c, ...f(c) }))
        return <div class="sc-ex-stack">
          <div class="sc-ex-ui-a-crop" aria-hidden="true">
            <div class="sc-ex-ui-a-crop-img" style={() => { const c = crop(); return `transform: translate(${c.x * 100}%, ${c.y * 100}%) rotate(${c.rotate}deg) scale(${c.zoom * (c.flip ? -1 : 1)}, ${c.zoom})` }} />
            <div class="sc-ex-ui-a-crop-frame" style={() => `inline-size: ${crop().w * 100}%; block-size: ${crop().h * 100}%`} />
          </div>
          <Row>
            <Button size="sm" onClick={() => change((c) => ({ zoom: Math.min(4, c.zoom + 0.25) }))}>Yakınlaştır</Button>
            <Button size="sm" onClick={() => change((c) => ({ rotate: c.rotate + 90 }))}>Döndür</Button>
            <Button size="sm" onClick={() => change((c) => ({ flip: !c.flip }))}>Aynala</Button>
            <Button size="sm" onClick={() => change((c) => ({ x: c.x + 0.05 }))}>Kaydır</Button>
            <Button size="sm" variant="primary" onClick={() => crop.set({ ...DEFAULT_CROP })}>DEFAULT_CROP'a dön</Button>
          </Row>
          <code class="sc-ex-val sc-ex-ui-a-json">{() => JSON.stringify(crop())}</code>
        </div>
      },
    },
    DEFAULT_TOOLS: {
      code: `// a smaller toolbar: the default one without headings and code blocks
<RichTextEditor toolbar={DEFAULT_TOOLS.filter((t) => !["h2", "h3", "codeblock"].includes(t))} />`,
      run: () => {
        const off = signal(new Set<string>(["h3", "codeblock"]))
        const tools = () => DEFAULT_TOOLS.filter((t) => t === "|" || !off().has(t))
        return <div class="sc-ex-stack">
          <Row>{DEFAULT_TOOLS.filter((t) => t !== "|").map((t) => <Chip size="sm" selected={() => !off().has(t)} onClick={() => off.update((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n })}>{t}</Chip>)}</Row>
          <Out label="DEFAULT_TOOLS" value={`${DEFAULT_TOOLS.length} öğe`} />
          <code class="sc-ex-val sc-ex-ui-a-json">{() => `toolbar={${JSON.stringify(tools())}}`}</code>
        </div>
      },
    },
  },
})
