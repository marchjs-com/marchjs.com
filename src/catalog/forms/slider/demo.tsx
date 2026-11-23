// Showcase stage for Slider: step, whether the value is shown and the track (the browser's or a color ramp).
import { Slider } from "march/components/forms/slider";
import { Field } from "march/forms";
import type { ColorToken } from "march/theme";
type Opt<T> = T | undefined

export const code = `<Field label="Ses"><Slider bind:value={$vol} min={0} max={100} step={5} format={(v) => \`%\${v}\`} /></Field>
<Slider bind:value={$vol} track />                                  // renk rampası
<Slider bind:value={$hue} max={360} track="ton-seridi" showValue={false} aria-label="Ton" />   // .ton-seridi { background: linear-gradient(…) }
<Slider bind:value={$vol} track={<Progress value={100} colors="brand" paint="segments" />} />  // kendi düğümün`

export default function SliderDemo(props: { values: { step: number; showValue: boolean; track: string; color: string } }) {
  let $vol = 60
  return <div class="sc-col">{() => {
    const v = { ...props.values }
    const color = (v.color || undefined) as Opt<ColorToken>
    return <Field label="Ses"><Slider value={$vol} onChange={(x: number) => { $vol = x }} min={0} max={100} step={v.step} format={(x: number) => `%${x}`} showValue={v.showValue} {...({ track: v.track === "ramp" } as object)} m:color={color} /></Field>
  }}
    <span class="sc-demo-call">{() => `Adım ${props.values.step}: 0, ${props.values.step}, ${props.values.step * 2} … 100 (${Math.floor(100 / props.values.step) + 1} konum); ok tuşları değeri ${props.values.step} değiştirir.`}</span>
  </div>
}
