// Showcase stage for RadioGroup: look and size.
import { RadioGroup } from "march/forms";
import { users, zap, shieldCheck } from "march/icons";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined

export const code = `<RadioGroup bind:value={$size} inline options="S, M, L, XL" />
<RadioGroup variant="card" bind:value={$plan} options={plans} />
<RadioGroup variant="segmented" bind:value={$view} options={views} />`

const PLANS = [
  { value: "Ücretsiz", label: "Ücretsiz", hint: "Bir kişi", icon: users, meta: "₺0" },
  { value: "Ekip", label: "Ekip", hint: "10 kişiye kadar", icon: zap, meta: "₺499/ay" },
  { value: "Kurumsal", label: "Kurumsal", hint: "Öncelikli destek", icon: shieldCheck, meta: "Teklif" },
]

export default function RadioGroupDemo(props: { values: { options: string; variant: string; size: string } }) {
  let $plan = "Ekip"
  return <div>{() => {
    const v = props.values, card = v.variant === "card"
    return <RadioGroup value={$plan} onChange={(x: Maybe<string>) => { $plan = x ?? "" }} variant={v.variant as "chip"} size={v.size as "md"} inline={!card}
      options={card ? PLANS : v.options} aria-label="Plan" />
  }}</div>
}
