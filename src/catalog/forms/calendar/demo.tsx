// Showcase stage for Calendar: first weekday, the earliest / latest day, the color, and the parts you can switch off or redraw
// (weekday row, month buttons, day content).
import { Calendar, todayIso, addDays } from "march/forms";
import { computed, untrack } from "march";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined

export const code = `<Calendar bind:value={$day} firstDay={1} min={todayIso()} max={addDays(todayIso(), 30)} />
<Calendar bind:value={$day} m:color="brand-orange" weekdays={false} prevIcon="«" nextIcon="»"
  labels={{ prevMonth: "Önceki ay", nextMonth: "Sonraki ay" }} renderDay={(iso, d) => busy.has(iso) ? <b>{d}•</b> : d} />`

export default function CalendarDemo(props: { values: { firstDay: string; min: boolean; max: boolean; color: string; weekdays: boolean; nav: boolean; navOwn: boolean; busy: boolean } }) {
  let $day = todayIso()
  // the parts Calendar reads once (weekday row, month buttons, day content): it is built again only when one of them
  // changes; the first weekday, min / max and the color stay live on the same calendar
  const once = computed(() => [props.values.weekdays, props.values.nav, props.values.navOwn, props.values.busy].join("|"))
  return <div class="sc-stack">
    {() => {
      once()
      return untrack(() => {
        const weekdays = props.values.weekdays, nav = props.values.nav !== false, own = nav && !!props.values.navOwn, busy = props.values.busy, today = todayIso()
        return <Calendar value={$day} onChange={(x: Maybe<string>) => { $day = x ?? today }} firstDay={props.values.firstDay === "locale" ? undefined : Number(props.values.firstDay)}
        min={props.values.min ? addDays(today, -3) : undefined} max={props.values.max ? addDays(today, 10) : undefined}
        m:color={props.values.color === "primary" ? undefined : (props.values.color as "brand-blue")} weekdays={weekdays} nav={nav}
        prevIcon={own ? "«" : undefined} nextIcon={own ? "»" : undefined} labels={{ prevMonth: "Önceki ay", nextMonth: "Sonraki ay" }}
        renderDay={busy ? (_iso: string, d: number) => (d % 4 === 0 ? <b>{`${d}•`}</b> : d) : undefined} />
      })
    }}
    <p class="m-muted">{() => `Seçilen: ${$day} · hafta başı: ${props.values.firstDay === "locale" ? "dilden (firstDay verilmedi)" : `firstDay={${props.values.firstDay}}`}`}</p>
  </div>
}
