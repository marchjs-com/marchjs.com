// Showcase stage for Gantt: the Playground's launch plan around today (tasks as JSON, neutral demo data). "Tasarımı
// ertele" moves a task (the pushed tasks glide after it), "Kutlama" adds or removes a task (it grows in / fades out).
import { signal, computed, untrack } from "march";
import { Gantt, type GanttTask } from "march/components/data/gantt";
import { Button } from "march/components/actions/button";
import { TASKS } from "./playground.ts";
import { todayIso, addDays } from "march/forms";

export const code = `<Gantt tasks={$tasks} scale="day" cascade
  onChange={(task) => api.save(task)}
  onSelect={(task) => open(task)} />

// a task: { id, name, start, end, progress, deps: ["design"], color, milestone }
// names={false} help={false} todayLine={false} animate={false} barLabel={(task) => …} labels={{ today: "Şimdi", days: (n) => n + " gün" }}`

// the Playground's tasks (JSON)
const parse = (json: string): GanttTask[] => { try { const x = JSON.parse(json || TASKS); return Array.isArray(x) ? x : [] } catch { return [] } }

export default function GanttDemo(props: { values: { tasks: string; label: string; scale: string; arrows: boolean; cascade: boolean; editable: boolean; todayLine: boolean; names: boolean; help: string; barLabel: string; animate: string } }) {
  const plan = (): GanttTask[] => parse(untrack(() => props.values.tasks))
  const tasks = signal<GanttTask[]>(plan())
  // a new JSON in the Playground replaces the plan
  const fromJson = computed(() => props.values.tasks)
  const sync = () => { const j = fromJson(); untrack(() => tasks.set(parse(j))) }
  const last = signal("")
  let stage: HTMLElement | undefined
  // the plan as it was, then "Arayüz tasarımı" three days later with the keyboard gesture (Alt+→): with "Ardılları it"
  // the web and mobile tasks move after it, without it they stay and overlap
  const delay = () => {
    tasks.set(plan())
    queueMicrotask(() => {
      const bar = stage?.querySelector<HTMLElement>('[data-task="design"]')
      if (!bar) return
      bar.focus()
      for (let i = 0; i < 3; i++) bar.dispatchEvent(new KeyboardEvent("keydown", { key: getComputedStyle(bar).direction === "rtl" ? "ArrowLeft" : "ArrowRight", altKey: true, bubbles: true }))
    })
  }
  // a party after the launch: added (it grows in) or removed (it fades out)
  const party = (): GanttTask => ({ id: "party", name: "Yayın kutlaması", start: addDays(todayIso(), 32), end: addDays(todayIso(), 33), progress: 0, deps: ["launch"], color: "brand-pink" })
  const toggleParty = () => tasks.set(tasks().some((x) => x.id === "party") ? tasks().filter((x) => x.id !== "party") : [...tasks(), party()])
  const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a)
  const once = computed(() => [props.values.names, props.values.help, props.values.barLabel, props.values.animate].join("|"))
  const parts = () => { once(); return untrack(() => [props.values.names, props.values.help, props.values.barLabel, props.values.animate] as const) }
  return <div class="sc-stage" ref={(el: Element) => { stage = el as HTMLElement }}>
    {() => { sync(); return null }}
    <div class="sc-row">
      {() => (props.values.editable ? <Button size="sm" variant="secondary" data-audit-try on:click={delay}>Tasarımı 3 gün ertele (Alt+→)</Button> : null)}
      <Button size="sm" variant="ghost" on:click={toggleParty}>{() => (tasks().some((x) => x.id === "party") ? "Kutlamayı kaldır" : "Kutlama ekle")}</Button>
    </div>
    {() => {
      // parts read once by the chart (names column, hint, bar text, motion): it is drawn again only when one of them
      // changes; scale, arrows and the rest stay live on the same chart
      const [names, help, bar, animate] = parts()
      return untrack(() => <Gantt tasks={tasks} scale={() => props.values.scale as "day"} arrows={() => props.values.arrows} cascade={() => props.values.cascade}
        editable={() => props.values.editable} height={430} label={() => props.values.label || "Ürün yayın planı"}
        todayLine={() => props.values.todayLine} names={names} animate={anim(animate)}
        help={help === "off" ? false : help === "own" ? "Çubuğu sürükleyin; ardıl görevler kendiliğinden kayar." : true}
        barLabel={bar === "own" ? (task: GanttTask) => `${task.name} · %${Math.round((task.progress ?? 0) * 100)}` : undefined}
        labels={{ days: (n: number) => `${n} gün` }}
        onChange={(task: GanttTask) => { tasks.set(tasks().map((x) => (x.id === task.id ? task : x))); last.set(`Güncellendi: ${task.name}`) }}
        onSelect={(task: GanttTask) => last.set(`Seçildi: ${task.name}`)} />)
    }}
    <p role="status">{last}</p>
  </div>
}
