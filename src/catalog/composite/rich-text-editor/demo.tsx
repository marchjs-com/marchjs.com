// Showcase stage for RichTextEditor: the editor and its live Markdown value, for the Playground values (playground.ts).
import { lazy } from "march/lazy";
import type { Mention, RichTextEditorProps } from "march/components/composite/rich-text-editor";

// the editor is one lazy chunk, shared with MarkdownEditor's rich view (two entries would split it into a shared chunk)
const RichTextEditor = lazy<RichTextEditorProps>(() => import("march/components/composite/rich-text-editor").then((m) => ({ default: m.RichTextEditor })), { placeholder: "form" });

const TEAM: Mention[] = [
  { id: "u1", label: "Deniz Kaya", hint: "Tasarım" },
  { id: "u2", label: "Ece Demir", hint: "Ürün" },
  { id: "u3", label: "Mert Aydın", hint: "Mühendislik" },
  { id: "u4", label: "Selin Çelik", hint: "Pazarlama" },
  { id: "u5", label: "Kaan Öztürk", hint: "Destek" },
  { id: "t1", label: "HADİ Tasarım Ekibi", hint: "Ekip" },
]
const START = `## HADİ sürüm notları

Bu sürümde **karanlık tema**, *daha hızlı* arama ve yeni [belgeler](https://hadisosyal.com/docs) var. Sorular için [@Ece Demir](mention:u2) ile konuşun.

- Yeni gösterge paneli
- Toplu dışa aktarma
- ~~Eski raporlar~~ kaldırıldı

> Seçin, araç çubuğunu kullanın ya da \`# \`, \`- \`, \`1. \`, \`> \` yazarak başlayın.`

export default function RichTextEditorDemo(props: { values: { toolbar: string; mentions: boolean; emoji: boolean; counter: boolean; readonly: boolean; rows: number; output: boolean; hint: boolean; ownIcons: boolean; ownLabels: boolean } }) {
  let $md = START
  const MINIMAL = ["bold", "italic", "link", "|", "ul", "ol", "|", "undo", "redo"] as const
  return <div class={props.values.output ? "sc-ed-split" : "sc-ed-one"}>
    <RichTextEditor bind:value={$md} placeholder="Bir şeyler yazın…"
      toolbar={props.values.toolbar === "none" ? false : props.values.toolbar === "minimal" ? MINIMAL : undefined}
      mentions={props.values.mentions ? TEAM : undefined} emoji={props.values.emoji} counter={props.values.counter}
      hint={props.values.hint} toolIcons={props.values.ownIcons ? { bold: "B", italic: "I", strike: "S" } : undefined}
      labels={props.values.ownLabels ? { count: (w: number, c: number) => `${c} / 2000 karakter · ${w} sözcük` } : undefined}
      readonly={props.values.readonly} rows={props.values.rows} />
    {() => (props.values.output ? <pre class="sc-ed-out" aria-label="Markdown çıktısı">{$md}</pre> : null)}
  </div>
}
