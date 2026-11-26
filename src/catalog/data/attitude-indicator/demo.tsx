// Showcase stage for AttitudeIndicator: one artificial horizon that takes every option live (pitch, roll, the
// ladder's range, sky and ground colours, the aircraft colour, size, motion). "Sert dönüş" banks hard and back, so
// the gyro spring shows.
import { AttitudeIndicator } from "march/components/data/attitude-indicator";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<AttitudeIndicator pitch={$pitch} roll={$roll} />
<AttitudeIndicator pitch={$p} roll={$r} range={20} colors={{ sky: "brand-blue", ground: "brand-green" }} />`

type V = { pitch: number; roll: number; range: number; sky: string; color: string; size: number; motion: boolean; label: string }
const SKIES: Record<string, { sky: ColorToken; ground: ColorToken } | undefined> = {
  classic: undefined, night: { sky: "brand-purple", ground: "neutral" }, green: { sky: "brand-blue", ground: "brand-green" },
}

export default function AttitudeIndicatorDemo(props: { values: V }) {
  // an extra bank from the buttons, on top of the option's roll
  let $bank = 0
  const v = () => props.values
  return <div class="sc-col">
    <AttitudeIndicator pitch={v().pitch} roll={v().roll + $bank} range={v().range} colors={SKIES[v().sky]}
      color={v().color as ColorToken} size={v().size} motion={v().motion} label={v().label} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $bank = $bank ? 0 : 45 }}>Sert dönüş</Button>
    </div>
  </div>
}
