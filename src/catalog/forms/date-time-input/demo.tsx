// Showcase stage for DateTimeInput: the stored value is one UTC timestamp.
import { DateTimeInput, Field } from "march/forms";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined

export const code = `<Field label="Başlangıç"><DateTimeInput bind:value={$startsAt} defaultTime="09:00" /></Field>`

const START_AT: Maybe<string> = "2026-03-14T09:30:00.000Z"

export default function DateTimeInputDemo(props: { values: { defaultTime: string; timeLabel: string; disabled: boolean; readonly: boolean } }) {
  let $at = START_AT
  return <div class="sc-stack">
    {() => <Field label="Başlangıç"><DateTimeInput value={$at} onChange={(v: Maybe<string>) => { $at = v }} defaultTime={props.values.defaultTime || undefined} timeLabel={props.values.timeLabel || undefined} disabled={props.values.disabled} readonly={props.values.readonly} /></Field>}
    <p class="m-muted">{() => `Değer (UTC): ${$at ?? "—"}`}</p>
  </div>
}
