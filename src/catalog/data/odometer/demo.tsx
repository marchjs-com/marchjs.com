// Showcase stage for Odometer: the counter takes every option live; "+0,1" turns only the fraction drum, "+123,4"
// several drums, "Başa sar" rolls them back down. A new look, size or drum count redraws the same number.
import { Odometer } from "march/components/data/odometer";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<Odometer value={$km} digits={6} decimals={1} unit="km" />
<Odometer value={$visitors} digits={7} variant="flip" size="lg" />
<Odometer value={$kwh} decimals={2} unit="kWh" variant="digital" color="success" />`

type V = { value: number; digits: number; decimals: number; variant: string; size: string; unit: string; frame: boolean; motion: boolean; color: string; label: string }

export default function OdometerDemo(props: { values: V }) {
  let $add = 0
  return <div class="sc-col">
    {() => {
      // the colour is read once by the component: a new colour builds the counter anew
      const color = (props.values.color || undefined) as ColorToken | undefined
      return <Odometer value={() => props.values.value + $add} digits={() => props.values.digits} decimals={() => props.values.decimals}
        variant={() => props.values.variant as "mechanical" | "digital" | "flip"} size={() => props.values.size as "sm" | "md" | "lg"}
        unit={() => props.values.unit || false} frame={() => props.values.frame} motion={() => props.values.motion}
        label={() => props.values.label} color={color} />
    }}
    <div class="sc-row">
      <Button size="sm" on:click={() => { $add = Math.round(($add + 0.1) * 10) / 10 }}>+0,1</Button>
      <Button size="sm" data-audit-try on:click={() => { $add = Math.round(($add + 123.4) * 10) / 10 }}>+123,4</Button>
      <Button size="sm" variant="ghost" on:click={() => { $add = 0 }}>Başa sar</Button>
    </div>
  </div>
}
