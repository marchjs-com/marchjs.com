// Showcase stage for Sparkline: the fruit market board, one trend per row. "Canlı" adds a price every second on the
// motion clock (global speed and "Stop all" reach it): the line slides left as the window moves on, columns grow, the
// "artı / eksi" strip shows each day's rise (green) or fall (red). "Yeni pazar" draws a whole new week: the lines morph.
// Every option of the card reaches every row.
import { Sparkline } from "march/components/data/sparkline";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";
import { onCleanup } from "march";
import { onFrame } from "march/motion";

export const code = `<Sparkline data={$prices} area />
<Sparkline data={sales} variant="bar" animate={{ stagger: 30 }} />
<Sparkline data={changes} variant="winloss" title="Günlük değişim" />`

const FRUITS = [{ name: "Elma", base: 120, amp: 14, k: 1 }, { name: "Armut", base: 80, amp: 22, k: 4 }, { name: "Kiraz", base: 45, amp: 6, k: 7 }];
const price = (i: number, c: (typeof FRUITS)[number], seed: number) => Math.round((c.base + c.amp * Math.sin((i + c.k + seed * 5) / 4) + (c.amp / 2) * Math.cos((i * 3 + c.k + seed) / 5)) * 10) / 10;

type V = { variant: string; animate: string; area: boolean; dot: boolean; zero: boolean; color: number; width: number; height: number };
const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a);

export default function SparklineDemo(props: { values: V }) {
  let $n = 40
  let $seed = 0
  let $live = false
  let acc = 0
  onCleanup(onFrame((_t, dt) => { if (!$live) return; acc += dt; if (acc >= 1000) { acc = 0; $n++ } }))
  const N = () => (props.values.variant === "line" ? 30 : 14)
  const prices = (c: (typeof FRUITS)[number]) => () => Array.from({ length: N() + 1 }, (_, i) => price($n - N() + i, c, $seed))
  // what each variant draws: the price (line, columns) or the day's change (win / loss)
  const series = (c: (typeof FRUITS)[number]) => () => { const p = prices(c)(); return props.values.variant === "winloss" ? p.slice(1).map((x, i) => Math.round((x - p[i]!) * 10) / 10) : p.slice(1) }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" pressed={() => $live} on:click={() => { $live = !$live }}>{() => ($live ? "Durdur" : "Canlı")}</Button>
      <Button size="sm" variant="ghost" icon={refresh} on:click={() => { $seed++ }}>Yeni pazar</Button>
    </div>
    {() => {
      const v = props.values
      return <div class="sc-col">
        {FRUITS.map((c, i) => {
          const data = series(c), p = prices(c)
          return <div class="sc-row sc-row-between">
            <strong>{c.name}</strong>
            <Sparkline data={data} variant={v.variant as "line"} animate={anim(v.animate)} area={v.area} dot={v.dot} zero={v.zero} color={(v.color + i) % 5}
              width={v.width} height={v.height} title={v.variant === "winloss" ? `${c.name}, günlük değişim` : c.name} format="number" />
            <span class="m-muted">{() => `₺${p()[N()]}`}</span>
          </div>
        })}
      </div>
    }}
  </div>
}
