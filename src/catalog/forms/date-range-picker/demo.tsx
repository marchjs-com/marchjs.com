// Showcase stage for DateRangePicker: with presets or only the custom pair.
import { DateRangePicker, type DateRange } from "march/components/forms/date-range-picker";
import { Field } from "march/forms";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined

export const code = `<Field label="Rapor dönemi" group><DateRangePicker bind:value={$range} /></Field>
<DateRangePicker bind:value={$range} presets={false} />
<DateRangePicker bind:value={$range} labels={{ custom: "Özel", from: "Başlangıç", to: "Bitiş" }} separator="→" picker={{ icon: false }} />`

// a range no preset matches: the from / to pair (and the sign between them) is shown from the start
const START_RANGE: Maybe<DateRange> = { from: "2026-03-02", to: "2026-03-14" }

export default function DateRangePickerDemo(props: { values: { presets: boolean; custom: boolean; separator: string; min: string; max: string } }) {
  let $range = START_RANGE
  return <div class="sc-stack">
    {() => <Field label="Rapor dönemi" group><DateRangePicker value={$range} onChange={(v: Maybe<DateRange>) => { $range = v }} presets={props.values.presets ? undefined : false} custom={props.values.custom}
      separator={props.values.separator === "off" ? false : props.values.separator === "arrow" ? "→" : undefined} min={props.values.min || undefined} max={props.values.max || undefined} labels={{ range: "Tarih aralığı", custom: "Özel", from: "Başlangıç", to: "Bitiş" }} /></Field>}
    <p class="m-muted">{() => `Değer: ${$range ? `${$range.from ?? "…"} → ${$range.to ?? "…"}` : "—"}`}</p>
  </div>
}
