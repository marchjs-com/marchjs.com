// Showcase stage for Altimeter: one altimeter that takes every option live (altitude, unit, pressure window, the
// ten-thousands pointer, colour, size, motion). "Tırman" climbs 1,500 ft at a time, so the long hand spins round.
import { Altimeter } from "march/components/data/altimeter";
import { Button } from "march/components/actions/button";
import type { ColorToken } from "march/theme";

export const code = `<Altimeter value={$altitude} pressure={1013} />
<Altimeter value={$alt} unit="m" pressure={29.92} pressureUnit="inHg" />
<Altimeter value={$alt} parts={{ tenThousands: false }} />`

type V = { value: number; unit: string; pressure: string; tenThousands: boolean; color: string; size: number; motion: boolean; label: string }

export default function AltimeterDemo(props: { values: V }) {
  // climbs added by the buttons on top of the option's altitude
  let $climb = 0
  const v = () => props.values
  return <div class="sc-col">
    <Altimeter value={v().value + $climb} unit={v().unit} pressure={v().pressure === "none" ? null : v().pressure === "inHg" ? 29.92 : 1013}
      pressureUnit={v().pressure === "inHg" ? "inHg" : "hPa"} parts={v().tenThousands ? undefined : { tenThousands: false }}
      color={v().color as ColorToken} size={v().size} motion={v().motion} label={v().label} />
    <div class="sc-row">
      <Button size="sm" data-audit-try on:click={() => { $climb += 1500 }}>Tırman +1500</Button>
      <Button size="sm" variant="ghost" on:click={() => { $climb -= 1500 }}>Alçal −1500</Button>
    </div>
  </div>
}
