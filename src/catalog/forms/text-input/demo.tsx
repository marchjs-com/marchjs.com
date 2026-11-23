// Showcase stage for TextInput (and EmailInput / UrlInput): the Playground picks the kind, the prefix and the state.
import { untrack } from "march";
import { TextInput, EmailInput, UrlInput } from "march/components/forms/text-input";
import { Field } from "march/forms";
import { Icon, search, globe } from "march/icons";

export const code = `<Field label="Ara"><TextInput bind:value={$q} placeholder="Üye, sipariş, etiket…" prefix={<Icon of={search} />} /></Field>
<Field label="E-posta"><EmailInput bind:value={$mail} /></Field>
<Field label="Web adresi"><UrlInput bind:value={$site} /></Field>
<TextInput bind:value={$email} type="email" aria-label="E-posta" error={$problem} onPaste={(e) => addLines(e)} />   // Field'sız: kendi hata metni`

interface Values { kind: string; prefix: string; placeholder: string; disabled: boolean; readonly: boolean; error: boolean }

export default function TextInputDemo(props: { values: Values }) {
  let $text = ""
  return <div class="sc-stack">
    {() => {
      const v = props.values
      const prefix = v.prefix === "icon" ? <Icon of={v.kind === "url" ? globe : search} /> : v.prefix === "text" ? (v.kind === "url" ? "www" : "@") : undefined
      // error: the text shows under the input while it is empty
      const error = v.error ? () => ($text ? "" : "Bu alan boş bırakılamaz.") : undefined
      // read once, untracked: a tracked read here would redraw the input (and drop its focus) on every keystroke
      const common = { value: untrack(() => $text), onChange: (x: string) => { $text = x }, prefix, disabled: v.disabled, readonly: v.readonly, ...(error ? { error } : {}) }
      if (v.kind === "email") return <Field label="E-posta"><EmailInput {...common} placeholder="ad@hadisosyal.com" /></Field>
      if (v.kind === "url") return <Field label="Web adresi"><UrlInput {...common} /></Field>
      return <Field label="Ara"><TextInput {...common} placeholder={v.placeholder} /></Field>
    }}
    <p class="m-muted">{() => `Değer: ${JSON.stringify($text)}`}</p>
  </div>
}
