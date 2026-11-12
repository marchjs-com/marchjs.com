// API examples of hadi-march/ui, names OverflowToolbar … PhoneInput (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal, computed } from "hadi-march";
import { OverflowToolbar, Overlay, Page, Pager, Pagination, PaletteButton, PasswordInput, PercentInput, PhoneInput, Progress, PROP_RANGE, PROP_UNIT, Button, Segmented } from "hadi-march/ui";
import { plus, copy, trash, columns, eye } from "hadi-march/icons";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c3.sig.gen.ts";

const photo = (name: string) => `media/social/${name}.svg`
/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    OverflowToolbar: {
      code: `<OverflowToolbar label="Belge" items={[
  { id: "new", label: "Yeni", icon: plus, onSelect: create, priority: 10 },
  { id: "delete", label: "Sil", icon: trash, danger: true },   // moves to "More" first
]} />`,
      play: { options: [
        { key: "width", label: "Genişlik", default: 360, options: opts([200, "200 px"], [360, "360 px"], [560, "560 px"]) },
        { key: "labels", label: "Etiketler", default: false },
      ] },
      run: (p: { values: { width: number; labels: boolean } }) => {
        const [lines, add] = logger()
        const preview = signal(true)
        const items = () => { const l = p.values.labels
          return [
            { id: "new", label: "Yeni", icon: plus, onSelect: () => add("Yeni"), priority: 10, showLabel: l },
            { id: "copy", label: "Kopyala", icon: copy, onSelect: () => add("Kopyala"), priority: 6, showLabel: l },
            { id: "s1", separator: true },
            { id: "preview", label: "Önizleme", icon: eye, pressed: () => preview(), onSelect: () => preview.set(!preview()), priority: 5, showLabel: l },
            { id: "cols", label: "Sütunlar", icon: columns, onSelect: () => add("Sütunlar"), priority: 3, showLabel: l },
            { id: "delete", label: "Sil", icon: trash, danger: true, onSelect: () => add("Sil"), priority: 0, showLabel: l },
          ] }
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-tbar" style={() => `inline-size: ${p.values.width}px`}><OverflowToolbar label="Belge" items={items} /></div>
          <Row><Out label="önizleme" value={() => (preview() ? "açık" : "kapalı")} /></Row>
          <Log lines={lines} />
        </div>
      },
    },
    Overlay: {
      code: `<section class="hero">
  <Overlay src="/media/sea.svg" opacity={0.5} />
  <Overlay effect="glass" front inset={4} />
  <h2>Acme yaz kampı</h2>
</section>`,
      play: { options: [
        { key: "effect", label: "Efekt", default: "gradient", options: opts(["gradient", "geçiş"], ["dots", "nokta"], ["grid", "ızgara"], ["vignette", "vinyet"]) },
        { key: "photo", label: "Fotoğraf katmanı", default: true },
      ] },
      run: (p: { values: { effect: "gradient" | "dots" | "grid" | "vignette"; photo: boolean } }) => {
        const opacity = signal(0.6)
        return <div class="sc-ex-ui-c-stack">
          {() => { const effect = p.values.effect, withPhoto = p.values.photo
            return <div class="sc-ex-ui-c-hero">
              {withPhoto && <Overlay src={photo("sunset")} opacity={() => opacity()} />}
              <Overlay effect={effect} />
              <div><strong>Acme yaz kampı</strong><p>Kayıtlar açık</p></div>
            </div> }}
          <Row><Segmented aria-label="Fotoğraf saydamlığı" value={opacity} options={opts([0.3, "%30"], [0.6, "%60"], [1, "%100"])} /><Out label="opacity" value={opacity} /></Row>
        </div>
      },
    },
    Page: {
      code: `<Page title="Siparişler" subtitle="Son 30 gün" back="/home"
  breadcrumbs={[{ label: "Satış", href: "/sales" }, { label: "Siparişler" }]}
  actions={[<Button variant="primary">Yeni sipariş</Button>]}>
  <OrdersTable />
</Page>`,
      play: { options: [
        { key: "crumbs", label: "İçerik yolu", default: true },
        { key: "back", label: "Geri düğmesi", default: false },
      ] },
      run: (p: { values: { crumbs: boolean; back: boolean } }) => {
        const [lines, add] = logger()
        const count = signal(12)
        return <div class="sc-ex-ui-c-box">
          {() => { const back = p.values.back
            return <Page title="Siparişler" subtitle={() => `Son 30 gün · ${count()} sipariş`} back={back ? () => add("geri") : undefined}
              breadcrumbs={() => (p.values.crumbs ? [{ label: "Satış" }, { label: "Siparişler" }] : null)}
              actions={[<Button variant="primary" onClick={() => { count.update((x) => x + 1); add("yeni sipariş") }}>Yeni sipariş</Button>]}>
              <Log lines={lines} />
            </Page> }}
        </div>
      },
    },
    Pager: {
      code: `<Pager page={page()} total={total} size={size()} sizes={[10, 25, 50]}
  onPage={page.set} onSize={size.set} />
<Pager hasPrev={!!cursor.prev} hasNext={!!cursor.next} onPrev={prev} onNext={next} />   // cursor mode`,
      play: { options: [{ key: "mode", label: "Mod", default: "offset", options: opts(["offset", "sayfa numarası"], ["cursor", "imleç"]) }] },
      run: (p: { values: { mode: string } }) => {
        const page = signal(1), size = signal(10), total = 47
        const rows = () => { const from = (page() - 1) * size(); return Array.from({ length: Math.min(3, total - from) }, (_, i) => `Kayıt ${from + i + 1}`) }
        return <div class="sc-ex-ui-c-stack">
          {() => (p.values.mode === "cursor"
            ? <Pager hasPrev={() => page() > 1} hasNext={() => page() * size() < total} onPrev={() => page.update((x) => x - 1)} onNext={() => page.update((x) => x + 1)} />
            : <Pager page={page} total={total} size={size} sizes={[10, 25]} onPage={(n) => page.set(n)} onSize={(s) => { size.set(s); page.set(1) }} />)}
          <ul class="sc-ex-ui-c-list">{() => rows().map((r) => <li>{r} …</li>)}</ul>
        </div>
      },
    },
    Pagination: {
      code: `<Pagination page={page} pages={12} setPage={page.set} siblings={1} />`,
      play: { options: [
        { key: "pages", label: "Sayfa", default: 12, options: [5, 12, 40] },
        { key: "siblings", label: "Komşu", default: 1, options: [0, 1, 2] },
      ] },
      run: (p: { values: { pages: number; siblings: number } }) => {
        const page = signal(4)
        const at = () => Math.min(page(), p.values.pages)
        return <div class="sc-ex-ui-c-stack">
          {() => { const siblings = p.values.siblings; return <Pagination page={at} pages={() => p.values.pages} siblings={siblings} setPage={(n) => page.set(n)} /> }}
          <Row><Out label="sayfa" value={() => `${at()} / ${p.values.pages}`} /><Button variant="ghost" onClick={() => page.set(p.values.pages)}>Son sayfa</Button></Row>
        </div>
      },
    },
    PaletteButton: {
      code: `<header>
  <PaletteButton label="Ara ya da komut çalıştır…" />   // opens <CommandPalette />, shows Ctrl+K / ⌘K
</header>`,
      play: { options: [
        { key: "label", label: "Metin", default: "Ara…", options: ["Ara…", "Sayfa ya da komut ara…"] },
        { key: "shortcut", label: "Kısayol", default: "mod+k", options: ["mod+k", "mod+p"] },
      ] },
      run: (p: { values: { label: string; shortcut: string } }) => <div class="sc-ex-ui-c-stack">
        {() => { const shortcut = p.values.shortcut; return <div class="sc-ex-ui-c-narrow"><PaletteButton label={() => p.values.label} shortcut={shortcut} /></div> }}
        <p class="hm-muted">Tıklayınca komut paleti açılır (Esc kapatır).</p>
      </div>,
    },
    PasswordInput: {
      code: `<PasswordInput value={pass} autocomplete="new-password" placeholder="En az 8 karakter" />`,
      play: { options: [{ key: "disabled", label: "Devre dışı", default: false }] },
      run: (p: { values: { disabled: boolean } }) => {
        const pass = signal("")
        const score = computed(() => { const v = pass(); return [v.length >= 8, /[A-ZÇĞİÖŞÜ]/.test(v), /\d/.test(v), /[^\w\s]/.test(v)].filter(Boolean).length })
        return <div class="sc-ex-ui-c-stack sc-ex-ui-c-narrow">
          {() => { const disabled = p.values.disabled; return <PasswordInput value={pass} autocomplete="new-password" placeholder="En az 8 karakter" disabled={disabled} aria-label="Yeni parola" /> }}
          <Progress value={() => score()} max={4} label="Parola gücü" size="sm" tone={() => (score() >= 3 ? "success" : score() >= 2 ? "warn" : "danger")} />
          <Out label="uzunluk" value={() => pass().length} />
        </div>
      },
    },
    PercentInput: {
      code: `<PercentInput value={rate} />                 // shows 12,5 % · stores 0.125
<PercentInput value={rate} fraction={false} />  // stores 12.5`,
      play: { options: [{ key: "fraction", label: "Kesir olarak sakla", default: true }] },
      run: (p: { values: { fraction: boolean } }) => {
        const rate = signal<number | null>(null)
        return <div class="sc-ex-ui-c-stack">
          {() => { const fraction = p.values.fraction; rate.set(fraction ? 0.125 : 12.5)
            return <div class="sc-ex-ui-c-narrow"><PercentInput value={rate} fraction={fraction} decimals={1} aria-label="İndirim oranı" /></div> }}
          <Row><Out label="saklanan" value={() => String(rate())} /><Out label="1000 ₺ üzerinden" value={() => `${(1000 * (rate() ?? 0) / (p.values.fraction ? 1 : 100)).toFixed(2)} ₺`} /></Row>
        </div>
      },
    },
    PhoneInput: {
      code: `<PhoneInput value={phone} country="+90" placeholder="5xx xxx xx xx" />`,
      play: { options: [{ key: "country", label: "Ülke kodu", default: "+90", options: ["+90", "+44", "+49"] }] },
      run: (p: { values: { country: string } }) => {
        const phone = signal("")
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-narrow">{() => { const country = p.values.country; return <PhoneInput value={phone} country={country} placeholder="5xx xxx xx xx" aria-label="Telefon" /> }}</div>
          <Row><Out label="değer" value={() => phone() || "—"} /><Button variant="ghost" onClick={() => phone.set("5321234567")}>Örnek numara</Button></Row>
        </div>
      },
    },
    PROP_RANGE: {
      code: `const [min, max] = PROP_RANGE.rotate   // [-360, 360]
<input type="range" min={min} max={max} />`,
      run: () => {
        const prop = signal<keyof typeof PROP_RANGE>("rotate")
        const value = signal(0)
        const range = () => PROP_RANGE[prop()]
        return <div class="sc-ex-ui-c-stack">
          <Segmented aria-label="Özellik" value={prop} onChange={() => value.set(0)} options={Object.keys(PROP_RANGE)} />
          <input type="range" aria-label="Değer" min={() => range()[0]} max={() => range()[1]} step={() => ((range()[1] - range()[0]) > 10 ? 1 : 0.05)}
            value={() => String(value())} onInput={(e: Event) => value.set(Number((e.target as HTMLInputElement).value))} />
          <Row><Out label="aralık" value={() => `${range()[0]} … ${range()[1]}`} /><Out label="değer" value={value} /></Row>
        </div>
      },
    },
    PROP_UNIT: {
      code: `const label = (prop, v) => \`\${v}\${PROP_UNIT[prop]}\`   // "120px", "1.5×", "45°"`,
      run: () => {
        const k = signal(1)
        const sample: Record<string, number> = { x: 120, y: -40, scale: 1.5, rotate: 45, opacity: 0.8 }
        return <div class="sc-ex-ui-c-stack">
          <Row><Button onClick={() => k.update((x) => x + 1)}>Değerleri büyüt</Button><Button variant="ghost" onClick={() => k.set(1)}>Sıfırla</Button></Row>
          <Row>{(Object.keys(PROP_UNIT) as (keyof typeof PROP_UNIT)[]).map((prop) => <Out label={prop} value={() => `${+(sample[prop]! * k()).toFixed(2)}${PROP_UNIT[prop]}`} />)}</Row>
        </div>
      },
    },
  },
})
