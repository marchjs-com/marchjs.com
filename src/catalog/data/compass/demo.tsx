// Showcase stage for Compass: one compass that takes every option live (heading, rose or needle, bearing, 4 or 8
// points, readout, colour, size, motion). "⟲ / ⟳" turn it by 45° past north too, so the short way round shows.
import { Compass } from "march/components/data/compass";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<Compass heading={$heading} />
<Compass heading={$heading} bearing={120} points={8} />
<Compass heading={$wind} mode="needle" readout={false} />`

type V = { heading: number; mode: string; bearing: string; points: number; readout: boolean; color: string; size: number; motion: boolean; label: string }

export default function CompassDemo(props: { values: V }) {
  // turns added by the buttons; the compass wraps any number of degrees and turns the short way
  let $turn = 0
  const v = () => props.values
  return <div class="sc-col">
    <Compass heading={v().heading + $turn} mode={v().mode as "rose" | "needle"} bearing={v().bearing === "none" ? null : Number(v().bearing)}
      points={Number(v().points) === 8 ? 8 : 4} readout={v().readout} color={v().color as ColorToken} size={v().size}
      motion={v().motion} label={v().label} />
    <div class="sc-row">
      <Button size="sm" variant="ghost" on:click={() => { $turn -= 45 }}>⟲ 45°</Button>
      <Button size="sm" data-audit-try on:click={() => { $turn += 45 }}>45° ⟳</Button>
    </div>
  </div>
}
