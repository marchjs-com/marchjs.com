// Showcase stage for PasswordInput.
import { PasswordInput } from "march/components/forms/password-input";
import { Field } from "march/forms";
import { computed, untrack } from "march";

export const code = `<Field label="Parola" help="Güçlü bir parola seç"><PasswordInput bind:value={$pw} autocomplete="new-password" /></Field>   // the eye
<PasswordInput bind:value={$pw} toggle="text" labels={{ show: "Göster", hide: "Gizle" }} />   // words; toggle={false}: no button
<PasswordInput bind:value={$pw} toggle={(shown) => (shown ? "🙈" : "🐵")} onToggle={(shown) => …} />   // your own drawing`

export default function PasswordInputDemo(props: { values: { disabled: boolean; toggle: string } }) {
  let $pw = "hadi-2026"
  // the button is built once: the input is built again only for another kind of button (the text is kept in $pw)
  const kind = computed(() => props.values.toggle)
  return <div>{() => {
    const toggle = kind()
    return untrack(() => <Field label="Parola" help="Göz düğmesiyle yazdığını kontrol et">
      <PasswordInput value={$pw} onChange={(v: string) => { $pw = v }} disabled={props.values.disabled} autocomplete="new-password" labels={{ show: "Göster", hide: "Gizle", showPassword: "Parolayı göster", hidePassword: "Parolayı gizle" }}
        toggle={toggle === "off" ? false : toggle === "text" ? "text" : "icon"} />
    </Field>)
  }}</div>
}
