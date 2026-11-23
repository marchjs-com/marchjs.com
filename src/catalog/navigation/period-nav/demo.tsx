// Showcase stage for PeriodNav: the arrows step a month, the today button returns to this month. Every Playground
// value changes the group: title, today button, arrows, icons, attached, size, colour, limits and texts.
import { PeriodNav } from "march/navigation";
import { computed, effect, untrack } from "march";
import { arrowLeft, arrowRight } from "march/icons";

export const code = `<PeriodNav onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => go(today)} />     // ‹ Today ›
<PeriodNav title={$monthName} onPrev={back} onNext={on} />                                    // ‹ March 2026 ›
<PeriodNav title={$monthName} onPrev={back} onNext={on} onToday={now} today="Bu ay" m:color="brand-orange"
  prevIcon={arrowLeft} nextIcon={arrowRight} labels={{ group: "Ay", previous: "Önceki ay", next: "Sonraki ay" }} />`

interface Values { title: boolean; today: string; arrows: boolean; icons: string; attached: boolean; size: string; color: string; limit: boolean; labels: string }

const THIS = new Date()
const name = (offset: number): string => new Intl.DateTimeFormat("tr", { month: "long", year: "numeric" }).format(new Date(THIS.getFullYear(), THIS.getMonth() + offset, 1))

export default function PeriodNavDemo(props: { values: Values }) {
  let $offset = 0
  const first = -THIS.getMonth(), last = 11 - THIS.getMonth()
  const move = (d: number): void => { $offset = $offset + d }
  // the limit shows at an end of the year: turning it on goes to the last month, where the next arrow is closed
  const limit = computed(() => props.values.limit && props.values.arrows)
  effect(() => { if (limit()) untrack(() => { $offset = last }) })
  return <div class="sc-col">
    {() => {
      const v = { ...props.values }
      const color = v.color === "primary" ? undefined : v.color as "brand-orange"
      const own = v.icons === "own"
      const labels = v.labels === "own" ? { group: "Ay", previous: "Önceki ay", today: "Bu ay", next: "Sonraki ay" } : undefined
      const title = v.title ? () => name($offset) : undefined
      const today = v.today === "off" ? false : v.today === "own" ? "● Şimdi" : undefined
      return <PeriodNav title={title} onPrev={() => move(-1)} onNext={() => move(1)} onToday={() => { $offset = 0 }} today={today}
        arrows={v.arrows} prevIcon={own ? arrowLeft : undefined} nextIcon={own ? arrowRight : undefined} attached={v.title ? undefined : v.attached}
        size={v.size as "md"} m:color={color} labels={labels}
        prevDisabled={() => v.limit && $offset <= first} nextDisabled={() => v.limit && $offset >= last} />
    }}
    <p class="sc-demo-call">{() => `${name($offset)} (${$offset >= 0 ? "+" : ""}${$offset} ay)${limit() ? ` · sınır: ${name(first)} – ${name(last)}` : ""}`}</p>
  </div>
}
