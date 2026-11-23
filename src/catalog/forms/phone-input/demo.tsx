// Showcase stage for PhoneInput: pick a calling code; the stored value is shown under the field.
import { PhoneInput, Field } from "march/forms";

export const code = `<Field label="Telefon"><PhoneInput bind:value={$phone} country="+90" /></Field>`

export default function PhoneInputDemo(props: { values: { country: string } }) {
  let $phone = ""
  return <div class="sc-stack">
    {() => <Field label="Telefon"><PhoneInput value={$phone} onChange={(v: string) => { $phone = v }} country={props.values.country || undefined} placeholder="532 111 22 33" /></Field>}
    <p class="m-muted">{() => `Kaydedilen: ${$phone || "—"}`}</p>
  </div>
}
