// Showcase stage for Stopwatch: one stopwatch that takes every option live (decimals, the minute sub-dial, the lap
// list, the hand colour, size, motion). Start it, take laps, stop and reset: the hands fly back on a spring.
import { Stopwatch } from "march/components/data/stopwatch";
import type { ColorToken } from "march/theme";

export const code = `<Stopwatch />
<Stopwatch decimals={1} onLap={(l) => save(l.lap)} />
<Stopwatch running={$on} subDial={false} parts={{ laps: false }} />`

type V = { decimals: number; subDial: boolean; laps: boolean; color: string; size: number; motion: boolean; label: string }

export default function StopwatchDemo(props: { values: V }) {
  const v = () => props.values
  return <div class="sc-col">
    <Stopwatch decimals={v().decimals} subDial={v().subDial} color={v().color as ColorToken} size={v().size}
      motion={v().motion} label={v().label} parts={v().laps ? undefined : { laps: false }}
      texts={{ start: "Başlat", stop: "Durdur", resume: "Sürdür", lap: "Tur", reset: "Sıfırla", lapName: (n: number) => `Tur ${n}` }} />
  </div>
}
