// Showcase stage for Scheduler: a team calendar around today (neutral demo data). Drag on an empty slot creates.
import { signal, computed, untrack } from "march";
import { Scheduler, type SchedulerEvent, type SchedulerRange } from "march/components/data/scheduler";
import { todayIso, addDays } from "march/forms";
import { startOfWeek } from "../../demo-util.ts";
import { EVENTS } from "./playground.ts";

export const code = `<Scheduler events={$events} view="week" step={15}
  onChange={(event, range) => api.update(event.id, range)}
  onCreate={(range) => $events = [...$events, { id: uid(), title: "Yeni", ...range }]}
  onSelect={(event) => open(event)} />
// toolbar={false} views={["week", "day"]} todayButton={false} nowLine={false} help={false} animate={false}
// labels={{ allDay: "Gün boyu", more: (n) => n + " tane daha" }} renderEvent={(event, { time }) => …}`

// the Playground's events (JSON), and two more of the card's own (next week's release)
const parse = (json: string): SchedulerEvent[] => { try { const x = JSON.parse(json || EVENTS); return Array.isArray(x) ? x : [] } catch { return [] } }

export default function SchedulerDemo(props: { values: { events: string; label: string; view: string; step: number; locale: string; weekends: boolean; editable: boolean; toolbar: boolean; views: boolean; todayButton: boolean; nowLine: boolean; event: string; help: string; animate: boolean } }) {
  const monday = startOfWeek(todayIso(), 1)
  const extra: SchedulerEvent[] = [{ id: "rel", title: "Sürüm haftası", start: addDays(monday, 7), end: addDays(monday, 11), allDay: true, color: "brand-green" }]
  const events = signal<SchedulerEvent[]>([...parse(untrack(() => props.values.events)), ...extra])
  // a new JSON in the Playground replaces the events (the card's own stay)
  const fromJson = computed(() => props.values.events)
  const sync = () => { const j = fromJson(); untrack(() => events.set([...parse(j), ...extra])) }
  const last = signal("")
  let n = 0
  const create = (r: SchedulerRange) => { events.set([...events(), { id: `new${++n}`, title: "Yeni etkinlik", ...r, color: "brand-orange" }]); last.set("Yeni etkinlik eklendi") }
  const once = computed(() => [props.values.toolbar, props.values.views, props.values.todayButton, props.values.nowLine, props.values.event, props.values.help, props.values.animate].join("|"))
  const parts = () => { once(); return untrack(() => [props.values.toolbar, props.values.views, props.values.todayButton, props.values.nowLine, props.values.event, props.values.help, props.values.animate] as const) }
  return <div class="sc-stage">
    {() => { sync(); return null }}
    {() => {
      // parts read once by the calendar (toolbar, now line, event content, hint, motion): it is drawn again only when
      // one of them changes; view, locale, step and the rest stay live on the same calendar
      const [bar, views, today, nowLine, event, help, animate] = parts()
      const own = event === "own"
      return untrack(() => <Scheduler events={events} label={() => props.values.label || "Takım takvimi"} view={() => props.values.view as "week"} locale={() => props.values.locale} height={520}
        step={() => Number(props.values.step)} weekends={() => props.values.weekends} editable={() => props.values.editable}
        toolbar={bar} todayButton={today} views={views ? undefined : false} nowLine={nowLine} animate={animate}
        help={help === "off" ? false : help === "own" ? "Etkinliği sürükleyin; boş bir saate sürükleyerek yenisini ekleyin." : true}
        renderEvent={own ? (e: SchedulerEvent, info: { time: string }) => <span><b>{e.title}</b>{e.location ? ` · ${e.location}` : ""}<br /><small>{info.time}</small></span> : undefined}
        onChange={(e: SchedulerEvent) => { events.set(events().map((x) => (x.id === e.id ? e : x))); last.set(`“${e.title}” taşındı`) }} onCreate={create} onSelect={(e: SchedulerEvent) => last.set(`Seçildi: ${e.title}`)} />)
    }}
    <p class="m-muted">{() => (props.values.animate
      ? "Hareket açık: ileri ya da geri gidince günler kayarak, görünüm değişince hafifçe büyüyerek gelir."
      : "Hareket kapalı: tarih ve görünüm değişimi anında olur.")}</p>
    <p role="status">{last}</p>
  </div>
}
