// Showcase stage for Thermometer: one thermometer that takes every option live (temperature, °C / °F, a second
// scale, zones, the liquid colour, height, motion). "Isıt / Soğut" move it by 10 °C, so the column's spring shows.
import { Thermometer } from "march/components/data/thermometer";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<Thermometer value={$temp} />
<Thermometer value={$t} unit="F" secondary />
<Thermometer value={$t} zones={[{ from: -30, to: 0, color: "info" }, { from: 30, to: 50, color: "danger" }]} />`

type V = { value: number; unit: string; secondary: boolean; zones: boolean; color: string; size: number; motion: boolean; label: string }
const ZONES = [{ from: -30, to: 0, color: "info" as const }, { from: 15, to: 25, color: "success" as const }, { from: 30, to: 50, color: "danger" as const }]

export default function ThermometerDemo(props: { values: V }) {
  // degrees added by the buttons on top of the option's temperature
  let $delta = 0
  const v = () => props.values
  return <div class="sc-col">
    <Thermometer value={v().value + $delta} unit={v().unit === "F" ? "F" : "C"} secondary={v().secondary} zones={v().zones ? ZONES : undefined}
      color={(v().color || undefined) as ColorToken | undefined} size={v().size} motion={v().motion} label={v().label} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $delta += 10 }}>🔥 Isıt</Button>
      <Button size="sm" variant="ghost" on:click={() => { $delta -= 10 }}>🧊 Soğut</Button>
    </div>
  </div>
}
