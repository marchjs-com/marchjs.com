// Showcase stage for Gauge: one dial that takes every option. Its look, needle, readout and source build it anew; the
// value, zones, redline, peak, colour, size, unit and motion change it live, so the needle springs to each new value.
// "Rastgele" nudges the value; on the VU look with the demo source the needle follows the synthesized loop.
import { Gauge } from "march/components/data/gauge";
import { Button } from "march/components/actions/button";
import { audioSource } from "march/audio";
import type { ColorToken } from "march/theme";
import { onScale } from "./playground.ts";

export const code = `<Gauge value={$speed} max={240} unit="km/h" label="Hız" peak />
<Gauge variant="tachometer" value={$rpm} />
<Gauge variant="half" value={$load} unit="%" zones={[{ from: 0, to: 60, color: "success" }, { from: 60, to: 85, color: "warning" }]} redline={85} />
<Gauge variant="vu" source={audioSource("demo")} />`

type V = {
  variant: string; value: number; source: string; zones: boolean; redline: string; peak: boolean; needle: string;
  readout: string; color: string; size: number; motion: boolean; unit: string; label: string;
}
type Variant = "speedometer" | "tachometer" | "half" | "vu";

export default function GaugeDemo(props: { values: V }) {
  let $jolt = 0
  const demo = audioSource("demo")
  return <div class="sc-col">
    {() => {
      const v = props.values
      const variant = v.variant as Variant
      const live = variant === "vu" && v.source === "demo"
      const readout = v.readout === "auto" ? undefined : v.readout === "odometer" ? "odometer" as const : v.readout === "true"
      const scaled = (p: number): number => onScale({ variant, value: p })
      return <div class="sc-col">
        <Gauge variant={variant} source={live ? demo : undefined}
          value={() => scaled(Math.max(0, Math.min(100, props.values.value + $jolt)))}
          max={variant === "speedometer" ? 240 : undefined}
          zones={() => (props.values.zones && variant !== "vu"
            ? [{ from: scaled(0), to: scaled(60), color: "success" as const }, { from: scaled(60), to: scaled(85), color: "warning" as const }]
            : undefined)}
          redline={() => (props.values.redline === "auto" ? undefined : props.values.redline === "off" ? false : scaled(85))}
          peak={() => props.values.peak} needle={v.needle === "auto" ? undefined : v.needle as "spring" | "vu" | "none"}
          readout={readout} color={(v.color || undefined) as ColorToken | undefined} size={() => props.values.size}
          motion={() => props.values.motion} unit={() => (variant === "vu" ? undefined : props.values.unit)} label={() => props.values.label} />
        <div class="sc-row">
          {live
            ? <Button size="sm" data-audit-try on:click={() => demo.start()}>🔊 Demo sesini başlat</Button>
            : <Button size="sm" data-audit-try on:click={() => { $jolt = Math.round(Math.random() * 90) - 45 }}>Rastgele</Button>}
        </div>
      </div>
    }}
  </div>
}
