// Showcase stage for Select.
import { Select, Field } from "march/forms";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined
type V = { options: string; placeholder: string; disabled: boolean }

export const code = `<Field label="Şehir"><Select bind:value={$city} options={cities} placeholder="Seç…" /></Field>
<Select bind:value={$drink} options="Çay, Kahve, Ayran" />   // a text: a comma-separated list`

export default function SelectDemo(props: { values: V }) {
  let $city = "İzmir"
  return <div class="sc-stack">
    {() => <Field label="Şehir"><Select value={$city} onChange={(v: Maybe<string>) => { $city = v ?? "" }} options={props.values.options} placeholder={props.values.placeholder} disabled={props.values.disabled} /></Field>}
    <p class="m-muted">{() => `Seçilen: ${$city || "—"}`}</p>
  </div>
}
