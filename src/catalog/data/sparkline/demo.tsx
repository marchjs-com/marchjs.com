// Showcase stage for Sparkline: the fruit market board, one price trend line per row. "Canlı" adds a price every
// second on the motion clock (global speed and "Stop all" reach it; the lines move), and every option of the card reaches every line.
import { Sparkline } from "march/charts";
import { Button } from "march/actions";
import { onCleanup } from "march";
import { onFrame } from "march/motion";

export const code = `<Sparkline data={$prices} area />
<Sparkline data={rows} y="visits" width={160} height={40} color={2} dot={false} title="Ziyaret" />`

const FRUITS = [{ name: "Elma", base: 120, amp: 14, k: 1 }, { name: "Armut", base: 80, amp: 22, k: 4 }, { name: "Kiraz", base: 45, amp: 6, k: 7 }];
const price = (i: number, c: (typeof FRUITS)[number]) => Math.round((c.base + c.amp * Math.sin((i + c.k) / 4) + (c.amp / 2) * Math.cos((i * 3 + c.k) / 5)) * 10) / 10;

type V = { area: boolean; dot: boolean; zero: boolean; color: number; width: number; height: number };

export default function SparklineDemo(props: { values: V }) {
  let $n = 40
  let $live = false
  let acc = 0
  onCleanup(onFrame((_t, dt) => { if (!$live) return; acc += dt; if (acc >= 1000) { acc = 0; $n++ } }))
  const series = (c: (typeof FRUITS)[number]) => () => Array.from({ length: 30 }, (_, i) => price($n - 30 + i, c))
  return <div class="sc-col">
    <div class="sc-row"><Button size="sm" pressed={() => $live} on:click={() => { $live = !$live }}>{() => ($live ? "Durdur" : "Canlı")}</Button></div>
    {() => {
      const v = props.values
      return <div class="sc-col">
        {FRUITS.map((c, i) => {
          const data = series(c)
          return <div class="sc-row sc-row-between">
            <strong>{c.name}</strong>
            <Sparkline data={data} area={v.area} dot={v.dot} zero={v.zero} color={(v.color + i) % 5} width={v.width} height={v.height} title={c.name} format="number" />
            <span class="m-muted">{() => `₺${data()[29]}`}</span>
          </div>
        })}
      </div>
    }}
  </div>
}
