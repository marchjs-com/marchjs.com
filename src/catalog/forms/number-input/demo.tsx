// Showcase stage for the NumberInput family: the starting value, decimals, grouping, prefix / suffix and the arrow step; MoneyInput and
// PercentInput under it.
import { NumberInput, MoneyInput, PercentInput } from "march/components/forms/number-input";
import { Field } from "march/forms";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined
type V = { value: number; decimals: number; grouping: boolean; prefix: string; suffix: string; step: number }

export const code = `<Field label="Adet"><NumberInput bind:value={$n} min={0} max={99} /></Field>
<Field label="Fiyat"><MoneyInput bind:value={$price} currency="TRY" /></Field>
<Field label="İndirim"><PercentInput bind:value={$rate} /></Field>   // 0.125 → 12,5 %`

export default function NumberInputDemo(props: { values: V }) {
  let $n = props.values.value
  let $price = 249.5
  let $rate = 0.125
  return <div class="sc-stack">
    {() => {
      const v = props.values
      return <Field label="Tutar" help="↑ / ↓ ile adım adım değiştir"><NumberInput value={$n} onChange={(x: Maybe<number>) => { $n = x ?? 0 }} min={0}
        decimals={v.decimals} minDecimals={v.decimals} grouping={v.grouping} prefix={v.prefix || undefined} suffix={v.suffix || undefined} step={v.step} /></Field>
    }}
    <p class="m-muted">{() => `Saklanan değer: ${$n}`}</p>
    <Field label="Fiyat (MoneyInput)"><MoneyInput value={$price} onChange={(x: Maybe<number>) => { $price = x ?? 0 }} currency="TRY" /></Field>
    <Field label="İndirim (PercentInput)"><PercentInput value={$rate} onChange={(x: Maybe<number>) => { $rate = x ?? 0 }} /></Field>
  </div>
}
