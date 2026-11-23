// Showcase stage for MarkdownEditor, for the Playground values (playground.ts). The editor is re-created when an
// option changes; the text is kept.
import { untrack } from "march";
import { MarkdownEditor, type MarkdownView } from "march/composite";
import { Button } from "march/actions";

const START = [
  "## HADİ ekip toplantısı",
  "",
  "Toplantı **perşembe 10:00** saatinde, _ana ofiste_. Ayrıntılar [etkinlik sayfasında](https://hadisosyal.com/etkinlik).",
  "",
  "### Gündem",
  "",
  "1. Çeyrek özeti",
  "2. Yeni ürün demosu",
  "3. Soru ve cevap",
  "",
  "- [x] Salon ayrıldı",
  "- [ ] Sunum paylaşıldı",
  "",
  "> Not: Otoparka giriş yan kapıdan.",
  "",
  "```bash",
  "npm create march@latest hadi",
  "```",
  "",
  // long enough for both panes to scroll at any width: synced scrolling needs somewhere to go
  "### Katılımcılar",
  "",
  "- Ürün ekibi",
  "- Tasarım ekibi",
  "- Mühendislik ekibi",
  "- Topluluk ekibi",
  "",
  "### Hazırlık",
  "",
  "1. Sunumu bir gün önce paylaşın",
  "2. Demo hesabını sıfırlayın",
  "3. Soruları ortak belgeye yazın",
  "",
  "### Sonraki adımlar",
  "",
  "Toplantı notları aynı gün **ortak klasöre** eklenir; kararlar bir hafta içinde görev listesine girer.",
  "",
  "> Katılamayanlar için kayıt ertesi gün paylaşılır.",
].join("\n")

export default function MarkdownEditorDemo(props: { values: { view: string; toolbar: boolean; sync: boolean; stats: boolean; rich: boolean; readonly: boolean; tools: string; hint: boolean; labels: boolean } }) {
  let $md = START
  let host: HTMLElement | undefined
  // scrolls the source to its end (or back to the top): with synced scrolling the preview follows, without it stays
  const scrollSource = () => {
    const source = host?.querySelector<HTMLTextAreaElement>(".m-mde-source")
    if (source) source.scrollTop = source.scrollTop > 0 ? 0 : source.scrollHeight
  }
  return <div class="sc-ed-one" ref={(x: Element) => { host = x as HTMLElement }}>
    {() => {
      const views: MarkdownView[] = props.values.rich || props.values.view === "rich" ? ["write", "preview", "split", "rich"] : ["write", "preview", "split"]
      return <MarkdownEditor value={untrack(() => $md)} onChange={(v: string) => { $md = v }} view={props.values.view as MarkdownView} views={views}
        toolbar={props.values.toolbar && props.values.tools === "short" ? ["bold", "italic", "|", "link", "ul"] : props.values.toolbar}
        syncScroll={props.values.sync} stats={props.values.stats} readonly={props.values.readonly} rows={14} hint={props.values.hint}
        labels={props.values.labels ? { write: "Taslak", preview: "Oku", split: "Yan yana", rich: "Biçimli", words: (n) => `${n} sözcük`, minutes: (n) => `${n} dakikada okunur` } : undefined} />
    }}
    {() => (props.values.view === "split" ? <div class="sc-row"><Button size="sm" variant="secondary" data-audit-try="toggle" on:click={scrollSource}>Yazıyı sona / başa kaydır</Button></div> : null)}
  </div>
}
