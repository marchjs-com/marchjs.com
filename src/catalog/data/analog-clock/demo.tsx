// Showcase stage for AnalogClock: one clock on the system time that takes every option live (second hand, numerals,
// time zone, caption, date window, colour, size, motion). Its own time source is not an option: the stage shows the
// real time, and "+1 saat" moves a second clock that runs on a time you set, so the hands' spring is visible.
import { AnalogClock } from "march/components/data/analog-clock";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<AnalogClock />
<AnalogClock timeZone="Asia/Tokyo" caption="Tokyo" seconds="smooth" />
<AnalogClock numerals="roman" seconds={false} />
<AnalogClock time={$meeting} readout={(d) => d.getDate()} />`

type V = { seconds: string; numerals: string; timeZone: string; caption: string; readout: boolean; color: string; size: number; motion: boolean; label: string }
type Numerals = "arabic" | "roman" | "quarters" | "none";

export default function AnalogClockDemo(props: { values: V }) {
  // a time of our own, moved by the button (the hands take the short way round on a spring)
  let $own = new Date(2026, 10, 26, 10, 8, 30).getTime()
  const v = () => props.values
  return <div class="sc-col">
    <div class="sc-row">
      <AnalogClock seconds={v().seconds === "off" ? false : v().seconds as "tick" | "smooth"} numerals={v().numerals as Numerals}
        timeZone={v().timeZone || undefined} caption={v().caption || undefined}
        readout={v().readout ? (d: Date) => String(d.getDate()) : undefined} color={v().color as ColorToken}
        size={v().size} motion={v().motion} label={v().label} />
      <AnalogClock time={$own} numerals={v().numerals as Numerals} seconds={false} size={Math.round(v().size * 0.6)} motion={v().motion} label="Kendi saati" />
    </div>
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $own += 3_600_000 }}>+1 saat</Button>
      <Button size="sm" variant="ghost" on:click={() => { $own += 15 * 60_000 }}>+15 dakika</Button>
    </div>
  </div>
}
