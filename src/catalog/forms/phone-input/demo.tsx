// Showcase stage for PhoneInput: pick a country (or international), the template and the animations; the stored value
// ("+" and digits) and the country the number belongs to are shown under the field.
import { PhoneInput } from "march/components/forms/phone-input";
import { Field } from "march/forms";

export const code = `<Field label="Telefon"><PhoneInput bind:value={$phone} country="TR" /></Field>
<Field label="Telefon"><PhoneInput bind:value={$intl} onMaskState={(s) => $cc = s.name} /></Field>   // uluslararası: +44 7700 900123`

export default function PhoneInputDemo(props: { values: { country: string; maskPlaceholder: string; maskMotion: boolean } }) {
  let $phone = ""
  let $cc = ""
  return <div class="sc-stack">
    {() => <Field label="Telefon"><PhoneInput value="" onChange={(v: string) => { $phone = v }} country={props.values.country || undefined}
      maskPlaceholder={props.values.maskPlaceholder as "lazy"} maskMotion={props.values.maskMotion}
      onMaskState={(s: { name?: string }) => { $cc = s.name ?? "" }} /></Field>}
    <p class="m-muted">{() => `Kaydedilen: ${$phone || "—"}${$cc ? ` · ${$cc}` : ""}`}</p>
  </div>
}
