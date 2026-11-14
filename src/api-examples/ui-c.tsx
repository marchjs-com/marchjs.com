// API examples of hadi-march/ui, names LocaleSelect … MediaGrid (code-point order). Layout and rules: tools/api-examples.js.
// Each `run` is a small live demo of its `code`; components re-create themselves for options they read once.
import { signal, untrack, onCleanup, locale, setLocale } from "hadi-march";
import { LocaleSelect, MadeWithMarch, MARCH_URL, Markdown, MarkdownEditor, Marquee, Media, MediaGrid, Button } from "hadi-march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./ui-c.css";
export { default as SIG } from "./ui-c.sig.gen.ts";

const photo = (name: string) => `media/social/${name}.svg`
const PICS = [
  { src: photo("sea"), alt: "Mavi denizde turuncu yelkenli", width: 1500, height: 1000 },
  { src: photo("forest"), alt: "Orman yolu", width: 1200, height: 1500 },
  { src: photo("coffee"), alt: "Üstten kahve fincanı", width: 1200, height: 1200 },
  { src: photo("city"), alt: "Gece şehir ışıkları", width: 1500, height: 1000 },
  { src: photo("ride"), alt: "Bisiklet çizimi", width: 1500, height: 1000 },
  { src: photo("sunset"), alt: "Tepelerin üstünde gün batımı", width: 1200, height: 1500 },
]
/** A log signal and a function that appends a line (keeps the last six). */
const logger = () => { const lines = signal<string[]>([]); return [lines, (l: string) => lines.update((x) => [...x.slice(-5), l])] as const }
const opts = (...pairs: [unknown, string][]) => pairs.map(([value, label]) => ({ value, label }))

export default examples({
  "hadi-march/ui": {
    LocaleSelect: {
      code: `<LocaleSelect options={[{ value: "tr", label: "Türkçe" }, { value: "en", label: "English" }]}
  onChange={(l) => saveProfile({ locale: l })} />`,
      play: { options: [{ key: "names", label: "Seçenekler", default: "names", options: opts(["names", "ad ile"], ["codes", "kod (dize)"]) }] },
      run: (p: { values: { names: string } }) => {
        const start = untrack(locale)
        const [lines, add] = logger()
        const list = () => (p.values.names === "codes" ? ["tr", "en"] : [{ value: "tr", label: "Türkçe" }, { value: "en", label: "English" }])
        onCleanup(() => { if (locale() !== start) void setLocale(start) })
        return <div class="sc-ex-ui-c-stack">
          <Row><LocaleSelect options={list} label="Arayüz dili" onChange={(l) => add(`seçildi: ${l}`)} />
            <Out label="locale()" value={locale} />
            <Button variant="ghost" disabled={() => locale() === start} onClick={() => void setLocale(start)}>Geri al</Button></Row>
          <Log lines={lines} />
        </div>
      },
    },
    MadeWithMarch: {
      code: `<footer>
  <MadeWithMarch variant="badge" />
</footer>`,
      play: { options: [{ key: "variant", label: "Görünüm", default: "badge", options: opts(["text", "metin"], ["badge", "rozet"], ["small", "küçük"]) }] },
      run: (p: { values: { variant: "text" | "badge" | "small" } }) => <div class="sc-ex-ui-c-box">
        <p class="m-muted">© HADİ · Gizlilik · Destek</p>
        <MadeWithMarch variant={() => p.values.variant} />
      </div>,
    },
    MARCH_URL: {
      code: `<a href={MARCH_URL} target="_blank" rel="noopener">March</a>`,
      run: () => {
        const u = new URL(MARCH_URL)
        return <div class="sc-ex-ui-c-stack">
          <Out label="MARCH_URL" value={MARCH_URL} />
          <Row><Out label="host" value={u.host} /><Out label="path" value={u.pathname} /></Row>
          <a href={MARCH_URL} target="_blank" rel="noopener">March bağlantısı</a>
        </div>
      },
    },
    Markdown: {
      code: `<Markdown source={post.body} headingOffset={1} />   // safe: no raw HTML, https images only`,
      play: { options: [{ key: "offset", label: "Başlık kaydırma", default: 0, options: opts([0, "0"], [1, "+1"], [2, "+2"]) }] },
      run: (p: { values: { offset: number } }) => {
        const src = signal("# HADİ bülteni\n\nBu hafta **3 yeni** özellik var:\n\n- Hızlı arama\n- `Ctrl+K` ile komutlar\n- [Belgeler](https://example.com)\n\n> <b>HTML</b> etiketleri metin olarak kalır.")
        return <div class="sc-ex-ui-c-stack">
          <textarea class="m-input sc-ex-ui-c-input" aria-label="Markdown kaynağı" value={src()} onInput={(e: Event) => src.set((e.target as HTMLTextAreaElement).value)} />
          <div class="sc-ex-ui-c-box"><Markdown source={src()} headingOffset={p.values.offset} /></div>
        </div>
      },
    },
    MarkdownEditor: {
      code: `const body = signal("")
<MarkdownEditor value={body} view="split" rows={8} placeholder="Notunuzu yazın…" />`,
      play: { options: [
        { key: "view", label: "Görünüm", default: "write", options: opts(["write", "yaz"], ["preview", "önizle"], ["split", "böl"]) },
        { key: "toolbar", label: "Araç çubuğu", default: true, visibleWhen: (v: { view: string }) => v.view !== "preview" },
        { key: "stats", label: "Kelime sayısı", default: true },
      ] },
      run: (p: { values: { view: "write" | "preview" | "split"; toolbar: boolean; stats: boolean } }) => {
        const body = signal("## Toplantı notu\n\n- **HADİ** sürümü cuma\n- Belgeler güncellenecek")
        return <div class="sc-ex-ui-c-stack">
          {() => { const { view, toolbar, stats } = { view: p.values.view, toolbar: p.values.toolbar, stats: p.values.stats }
            return <MarkdownEditor value={body} view={view} toolbar={toolbar} stats={stats} rows={5} views={["write", "preview", "split"]} /> }}
          <Out label="karakter" value={() => body().length} />
        </div>
      },
    },
    Marquee: {
      code: `<Marquee text="Kargo bedava · Yeni sezon geldi · Üyelere %10 indirim" speed={40} />`,
      play: { options: [
        { key: "speed", label: "Hız", default: 40, options: opts([20, "yavaş"], [40, "orta"], [90, "hızlı"]) },
        { key: "separator", label: "Ayraç", default: "•", options: ["•", "✦", "—"] },
      ] },
      run: (p: { values: { speed: number; separator: string } }) => {
        const news = signal(["HADİ Koşu Kulübü pazar sabahı buluşuyor", "Yeni sezon üyelikleri açıldı", "Kahve atölyesi cuma 19.00'da"])
        return <div class="sc-ex-ui-c-stack">
          <div class="sc-ex-ui-c-box">{() => { const speed = p.values.speed, separator = p.values.separator
            return <Marquee text={() => news().join(` ${separator} `)} speed={speed} separator={separator} /> }}</div>
          <Row><Button onClick={() => news.update((l) => [...l, `Duyuru ${l.length + 1}: salon saatleri güncellendi`])}>Duyuru ekle</Button><Out label="duyuru" value={() => news().length} /></Row>
        </div>
      },
    },
    Media: {
      code: `<Media src={file.url} alt={file.name} size="sm" fallback="Önizleme yok" />   // image or video by extension`,
      play: { options: [
        { key: "pic", label: "Dosya", default: "sea", options: opts(["sea", "deniz"], ["coffee", "kahve"], ["city", "şehir"]) },
        { key: "size", label: "Boyut", default: "md", options: ["sm", "md"] },
      ] },
      run: (p: { values: { pic: string; size: "sm" | "md" } }) => <Row>
        <Media src={() => photo(p.values.pic)} alt="Örnek görsel" size={() => p.values.size} />
        <Out label="src" value={() => photo(p.values.pic)} />
      </Row>,
    },
    MediaGrid: {
      code: `<MediaGrid items={post.media} max={4} shape="square" onOpen={(i) => openViewer(post.media, i)} />`,
      play: { options: [
        { key: "shape", label: "Biçim", default: "auto", options: opts(["auto", "kendi oranı"], ["square", "kare"], ["portrait", "dikey"]) },
        { key: "gap", label: "Ara", default: "thin", options: opts(["none", "yok"], ["thin", "ince"], ["gap", "geniş"]) },
      ] },
      run: (p: { values: { shape: "auto" | "square" | "portrait"; gap: "none" | "thin" | "gap" } }) => {
        const n = signal(2)
        const [lines, add] = logger()
        return <div class="sc-ex-ui-c-stack">
          <Row><Button disabled={() => n() <= 1} onClick={() => n.update((x) => x - 1)}>Fotoğraf çıkar</Button>
            <Button disabled={() => n() >= PICS.length} onClick={() => n.update((x) => x + 1)}>Fotoğraf ekle</Button><Out label="adet" value={n} /></Row>
          <div class="sc-ex-ui-c-narrow"><MediaGrid items={() => PICS.slice(0, n())} shape={() => p.values.shape} gap={() => p.values.gap}
            onOpen={(i) => add(`açıldı: ${PICS[i]!.alt}`)} /></div>
          <Log lines={lines} />
        </div>
      },
    },
  },
})
