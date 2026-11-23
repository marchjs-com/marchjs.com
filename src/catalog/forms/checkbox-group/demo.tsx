// Showcase stage for CheckboxGroup: look, HADİ colors and the row layout.
import { CheckboxGroup } from "march/forms";
import { users, zap, shieldCheck } from "march/icons";

export const code = `<CheckboxGroup bind:value={$days} inline variant="chip" options="Pzt, Sal, Çar, Per, Cum" />
<CheckboxGroup variant="chip" colors="brand" options={days} />      // one HADİ color per option
<CheckboxGroup variant="card" options={[{ value, label, hint, icon, meta }]} />`

const PLANS = [
  { value: "free", label: "Ücretsiz", hint: "Bir kişi, temel özellikler", icon: users, meta: "₺0" },
  { value: "team", label: "Ekip", hint: "10 kişiye kadar", icon: zap, meta: "₺499/ay" },
  { value: "business", label: "Kurumsal", hint: "Denetim kaydı ve öncelikli destek", icon: shieldCheck, meta: "Teklif" },
]

export default function CheckboxGroupDemo(props: { values: { options: string; variant: string; brand: boolean; inline: boolean } }) {
  // Tuesday and Thursday: with colors="brand" the first option is orange, the theme primary, so it would look unchanged
  let $days = ["Sal", "Per"]
  let $plans = ["team"]
  return <div>{() => {
    const v = props.values, card = v.variant === "card"
    return card
      ? <CheckboxGroup value={$plans} onChange={(x: string[]) => { $plans = x }} variant="card" colors={v.brand ? "brand" : undefined} options={PLANS} aria-label="Planlar" />
      : <CheckboxGroup value={$days} onChange={(x: string[]) => { $days = x }} variant={v.variant as "chip"} inline={v.inline} colors={v.brand ? "brand" : undefined} options={v.options} aria-label="Günler" />
  }}</div>
}
