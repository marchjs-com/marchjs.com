// Showcase stage for BatteryGauge: one battery that takes every option live (charge, charging, fill or cells, the
// cell count, orientation, the percentage, colour, size, motion). "Kullan / Şarj et" move the charge by 15 %, so the
// fill's spring and the low / critical colours show.
import { BatteryGauge } from "march/components/data/battery-gauge";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<BatteryGauge value={$battery} charging={$plugged} />
<BatteryGauge value={18} variant="segments" segments={5} />
<BatteryGauge value={$level} orientation="vertical" readout="outside" />`

type V = { value: number; charging: boolean; variant: string; segments: number; orientation: string; readout: string; color: string; size: number; motion: boolean; label: string }

export default function BatteryGaugeDemo(props: { values: V }) {
  // percent added or used by the buttons, on top of the option's charge
  let $delta = 0
  const v = () => props.values
  return <div class="sc-col">
    <BatteryGauge value={Math.max(0, Math.min(100, v().value + $delta))} charging={v().charging} variant={v().variant as "fill" | "segments"}
      segments={v().segments} orientation={v().orientation as "horizontal" | "vertical"}
      readout={v().readout === "off" ? false : v().readout as "inside" | "outside"} color={(v().color || undefined) as ColorToken | undefined}
      size={v().size} motion={v().motion} label={v().label} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $delta -= 15 }}>Kullan −15%</Button>
      <Button size="sm" variant="ghost" on:click={() => { $delta += 15 }}>Şarj et +15%</Button>
    </div>
  </div>
}
