// Showcase stage for Segmented: the options (a comma-separated text), the color token, the sliding indicator and the size.
import { Segmented } from "march/forms";
import type { ColorToken } from "march/theme";
// unions live outside JSX: the March compiler reads `|` in a JSX expression as a pipe
type Maybe<T> = T | null | undefined
type Opt<T> = T | undefined
/** An empty choice means "not set". */
const pick = (v: string): string | undefined => v || undefined

export const code = `<Segmented bind:value={$view} aria-label="Görünüm" indicator="slide"
  options={[{ value: "day", label: "Gün", icon: sun }, { value: "week", label: "Hafta", icon: calendar },
    { value: "month", label: "Ay", disabled: true, title: "Aylık görünüm bu planda yok" }]} />
<Segmented bind:value={$unit} options="°C, °F" aria-label="Birim" />   // a comma-separated text`

export default function SegmentedDemo(props: { values: { options: string; color: string; indicator: string; size: string } }) {
  let $view = "Hafta"
  return <div class="sc-stack">
    {() => {
      const v = { ...props.values }
      return <Segmented value={$view} onChange={(x: Maybe<string>) => { $view = x ?? "" }} options={v.options} indicator={v.indicator as "fill"} size={v.size as "md"} m:color={pick(v.color) as Opt<ColorToken>} aria-label="Dönem" />
    }}
    <p class="m-muted">{() => `Seçilen: ${$view || "—"}`}</p>
  </div>
}
