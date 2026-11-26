// Showcase stage for TextInput (and EmailInput / UrlInput): the Playground picks the kind, the prefix, the state and the
// mask (a march/mask preset or a pattern) with its template, value, animations and check mark.
import { untrack } from "march";
import { TextInput, EmailInput, UrlInput } from "march/components/forms/text-input";
import { Field } from "march/forms";
import { Icon, search, globe } from "march/icons";
import { maskOf } from "./playground.ts";

export const code = `<Field label="Ara"><TextInput bind:value={$q} placeholder="Üye, sipariş, etiket…" prefix={<Icon of={search} />} /></Field>
<Field label="Kart"><TextInput bind:value={$card} mask={cardNumber()} maskPlaceholder="ghost" /></Field>      // march/mask/presets
<Field label="Telefon"><TextInput bind:value={$tel} mask="(999) 999 99 99" /></Field>
<Field label="E-posta"><EmailInput bind:value={$mail} /></Field>
<TextInput bind:value={$email} type="email" aria-label="E-posta" error={$problem} onPaste={(e) => addLines(e)} />   // Field'sız: kendi hata metni`

interface Values { kind: string; prefix: string; placeholder: string; disabled: boolean; readonly: boolean; error: boolean; mask: string; maskPlaceholder: string; maskValue: string; maskMotion: boolean; maskDone: boolean }

export default function TextInputDemo(props: { values: Values }) {
  let $text: unknown = ""
  let $state = ""
  return <div class="sc-stack">
    {() => {
      const v = props.values
      const prefix = v.prefix === "icon" ? <Icon of={v.kind === "url" ? globe : search} /> : v.prefix === "text" ? (v.kind === "url" ? "www" : "@") : undefined
      // error: the text shows under the input while it is empty
      const error = v.error ? () => ($text ? "" : "Bu alan boş bırakılamaz.") : undefined
      // read once, untracked: a tracked read here would redraw the input (and drop its focus) on every keystroke
      const common = { value: untrack(() => $text), onChange: (x: unknown) => { $text = x }, prefix, disabled: v.disabled, readonly: v.readonly, ...(error ? { error } : {}) }
      if (v.mask !== "none") {
        // a new mask starts from an empty value (a phone number is not a card number)
        untrack(() => { $text = ""; $state = "" })
        return <Field label="Maskeli alan"><TextInput {...common} value="" mask={maskOf(v.mask) as never} maskPlaceholder={v.maskPlaceholder as "lazy"}
          maskValue={v.maskValue as "raw"} maskMotion={v.maskMotion} maskDone={v.maskDone ? undefined : false}
          onMaskState={(s: { text: string; complete: boolean; error: string | null; name?: string }) => { $state = `${s.complete ? "tamam" : "eksik"}${s.name ? ` · ${s.name}` : ""}${s.error ? ` · ${s.error}` : ""}` }} /></Field>
      }
      if (v.kind === "email") return <Field label="E-posta"><EmailInput {...common} placeholder="ad@hadisosyal.com" /></Field>
      if (v.kind === "url") return <Field label="Web adresi"><UrlInput {...common} /></Field>
      return <Field label="Ara"><TextInput {...common} placeholder={v.placeholder} /></Field>
    }}
    <p class="m-muted">{() => `Değer: ${JSON.stringify($text)}${$state ? ` · ${$state}` : ""}`}</p>
  </div>
}
