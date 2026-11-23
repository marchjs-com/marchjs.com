// Showcase stage for Textarea: rows, a character limit with a live counter, growing, monospace text and Tab indenting.
import { Textarea } from "march/components/forms/textarea";
import { Field } from "march/forms";

export const code = `<Field label="Hakkında" help={() => \`\${$about.length}/280\`}>
  <Textarea bind:value={$about} rows={3} maxLength={280} />
</Field>
<Textarea bind:value={$json} mono tabIndent rows={6} spellcheck={false} aria-label="JSON" />   // kod alanı: Tab girinti yapar`

interface Values { rows: number; maxLength: number; autosize: boolean; mono: boolean; tabIndent: boolean; placeholder: string }

export default function TextareaDemo(props: { values: Values }) {
  let $about = "HADİ ekibinde ürün tasarımı yapıyorum."
  return <div class="sc-stack">{() => {
    const v = { ...props.values }
    const help = v.tabIndent ? "Tab girinti yapar; alandan çıkmak için önce Esc, sonra Tab." : v.maxLength ? () => `${$about.length}/${v.maxLength}` : undefined
    return <Field label="Hakkında" help={help}>
      <Textarea value={$about} onChange={(x: string) => { $about = x }} rows={v.rows} maxLength={v.maxLength || undefined} autosize={v.autosize} mono={v.mono} tabIndent={v.tabIndent} placeholder={v.placeholder} />
    </Field>
  }}</div>
}
