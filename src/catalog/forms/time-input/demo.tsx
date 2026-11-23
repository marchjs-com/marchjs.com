// Showcase stage for TimeInput: the clock dial (picker="clock") or the browser's field, with or without seconds.
import { TimeInput } from "march/components/forms/time-input";
import { Field } from "march/forms";
import { effect, untrack } from "march";

export const code = `<Field label="Başlangıç"><TimeInput bind:value={$start} picker="clock" min="09:00" max="18:00" /></Field>
<TimeInput bind:value={$alarm} picker="clock" hour12 labels={{ choose: "Alarm saati" }} />`

export default function TimeInputDemo(props: { values: { picker: string; hour12: string; seconds: boolean; min: string; max: string; disabled: boolean } }) {
  let $time = "09:30"
  // with seconds the value carries them ("09:30:00"); without, it is cut back to "HH:MM"
  effect(() => { const s = props.values.seconds, t = untrack(() => $time); if (t) $time = s ? (t.length === 5 ? `${t}:00` : t) : t.slice(0, 5) })
  return <div class="sc-stack">
    {() => <Field label="Başlangıç"><TimeInput value={$time} onChange={(v: string) => { $time = v }} picker={props.values.picker as "clock"} hour12={props.values.hour12 === "12" ? true : props.values.hour12 === "24" ? false : undefined} step={props.values.seconds ? 1 : undefined} min={props.values.min || undefined} max={props.values.max || undefined} disabled={props.values.disabled} /></Field>}
    <p class="m-muted">{() => `Değer: ${$time || "—"} (${props.values.seconds ? "saat:dakika:saniye" : "saat:dakika"})`}</p>
  </div>
}
