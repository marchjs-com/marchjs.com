// Showcase stage for Counter: the value slider makes it glide (count) or roll (odometer) to the new number.
import { Counter } from "march/components/landing/counter";

export const code = `<Counter value={12840} />                                     // counts up when visible
<Counter value={$price} mode="roll" format={{ style: "currency", currency: "EUR" }} />
<Counter value={0.98} format={{ style: "percent" }} />  <Counter value={2_400_000} format={{ notation: "compact" }} />
<Counter value={$n} mode="none" />  <Counter value={12840} easing="bounce" />     // no motion · another easing`

const FORMATS: Record<string, Intl.NumberFormatOptions> = { number: {}, currency: { style: "currency", currency: "EUR", maximumFractionDigits: 0 }, percent: { style: "percent", maximumFractionDigits: 1 }, compact: { notation: "compact", maximumFractionDigits: 1 } }

export default function CounterDemo(props: { values: { mode: string; format: string; easing: string; value: number } }) {
  return <div class="sc-counter-stage">
    {() => {
      const v = props.values, f = v.format
      const n = () => (f === "percent" ? props.values.value / 100000 : f === "compact" ? props.values.value * 1000 : props.values.value)
      return <Counter class="sc-counter-big" value={n} mode={v.mode as "count" | "roll" | "none"} easing={v.easing} format={FORMATS[f]} />
    }}
  </div>
}
