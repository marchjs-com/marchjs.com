// Showcase stage for DatePicker: the locale changes the typing order and the placeholder.
import { DatePicker } from "march/components/forms/date-picker";
import { Field } from "march/forms";
import { Icon, clock } from "march/icons";
import { computed, untrack } from "march";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined
/** An empty choice means "not set". */
const pick = (v: string): string | undefined => v || undefined

export const code = `<Field label="Tarih"><DatePicker bind:value={$date} /></Field>
<Field label="Teslim"><DatePicker bind:value={$due} min={todayIso()} locale="en-US" /></Field>
<DatePicker bind:value={$date} icon={() => <Icon of={clock} />} labels={{ choose: "Gün seç" }} calendar={{ weekdays: false }} />   // icon={false}: no button`

const START_DATE: Maybe<string> = "2026-03-14"

export default function DatePickerDemo(props: { values: { locale: string; disabled: boolean; icon: string } }) {
  let $date = START_DATE
  // the calendar button is built once: the picker is built again only for another icon; locale and disabled stay live
  const icon = computed(() => props.values.icon)
  return <div class="sc-stack">
    {() => {
      const kind = icon()
      return untrack(() => <Field label="Tarih"><DatePicker value={$date} onChange={(v: Maybe<string>) => { $date = v }} locale={pick(props.values.locale)} disabled={props.values.disabled}
        icon={kind === "off" ? false : kind === "own" ? () => <Icon of={clock} /> : undefined} labels={{ choose: "Gün seç", prevMonth: "Önceki ay", nextMonth: "Sonraki ay" }} /></Field>)
    }}
    <p class="m-muted">{() => `Değer (ISO): ${$date ?? "—"} · ${props.values.locale ? `locale="${props.values.locale}"` : "locale verilmedi: uygulamanın dili"}`}</p>
  </div>
}
