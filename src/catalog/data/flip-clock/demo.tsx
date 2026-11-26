// Showcase stage for FlipClock: one clock that takes every option. By default it shows the system clock (the
// seconds cards flip every second); "Saat dilimi" moves it to another city, "12 saat" adds the AM / PM flap.
import { FlipClock } from "march/components/data/flip-clock";
import type { ColorToken } from "march/theme";

export const code = `<FlipClock />
<FlipClock timeZone="Asia/Tokyo" label="Tokyo" seconds={false} />
<FlipClock hour12 size="lg" color="warning" />
<FlipClock time={() => $end - Date.now()} timeZone="UTC" />`

type V = { timeZone: string; hour12: string; seconds: boolean; separator: string; blink: boolean; size: string; color: string; frame: boolean; motion: boolean; label: string }

export default function FlipClockDemo(props: { values: V }) {
  const v = () => props.values
  return <div class="sc-col">
    <FlipClock timeZone={() => v().timeZone || undefined} hour12={() => (v().hour12 === "auto" ? undefined : v().hour12 === "12")}
      seconds={() => v().seconds} separator={() => (v().separator === "none" ? false : v().separator)} blink={() => v().blink}
      size={() => v().size as "md"} color={() => (v().color || undefined) as ColorToken | undefined}
      parts={() => ({ frame: v().frame })} motion={() => v().motion} label={() => v().label} />
  </div>
}
