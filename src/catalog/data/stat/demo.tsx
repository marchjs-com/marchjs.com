// Showcase stage for Stat: a coffee shop's month in three KPIs. "Yeni gün" adds a day (values, deltas and sparklines
// move); the first box takes every option, the others the shared ones (delta source, hint, sparkline, icon). The last
// one is a cost: a decrease is good (invert). The values are passed as functions, so a new day does not redraw the boxes:
// the numbers count to their new value, the arrows turn and the sparklines morph (`animate`).
import { Stat } from "march/components/data/stat";
import { Button } from "march/components/actions/button";
import { plus, wallet, coffee, clock } from "march/icons";

export const code = `<Stat icon={wallet} label="Aylık gelir" value={$income} previous={$lastMonth} format={["money", "TRY"]} spark={$days} hint="geçen aya göre" />
<Stat label="Sipariş" value={1284} delta={0.068} />
<Stat label="Bekleme" value={4.2} delta={-0.12} invert format={(v) => \`\${v} dk\`} animate={{ easing: "out", duration: 1400 }} />`

const wave = (i: number, base: number, amp: number, k: number) => Math.round(base + amp * Math.sin((i + k) / 3) + (amp / 3) * Math.cos((i * 7 + k) / 5));

type V = { label: string; format: string; delta: string; invert: boolean; hint: string; spark: boolean; icon: boolean; animate: string };
const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "slow" ? { easing: "out", duration: 1400 } : a === "noenter" ? { enter: false } : a);

export default function StatDemo(props: { values: V }) {
  let $n = 30
  const series = (base: number, amp: number, k: number) => () => Array.from({ length: 20 }, (_, i) => wave($n - 20 + i, base, amp, k))
  const income = series(4200, 900, 1), orders = series(42, 9, 3), wait = series(5, 2, 5)
  const last = (s: () => number[]) => s()[s().length - 1]!
  const prev = (s: () => number[]) => s()[s().length - 2]!
  const sum = (s: () => number[]) => s().reduce((a, b) => a + b, 0)
  return <div class="sc-col">
    <div class="sc-row"><Button size="sm" icon={plus} on:click={() => { $n++ }}>Yeni gün</Button></div>
    {() => {
      const v = props.values
      // live values as functions: the boxes stay, their numbers move
      const d = (now: () => number, before: () => number) => (v.delta === "previous" ? { previous: before } : v.delta === "delta" ? { delta: () => (now() - before()) / before() } : {})
      const a = anim(v.animate)
      return <div class="sc-row">
        <Stat icon={v.icon ? wallet : undefined} label={v.label} value={() => sum(income)} {...d(() => sum(income), () => sum(income) - last(income) + prev(income))}
          format={v.format === "money" ? ["money", "TRY"] : v.format} invert={v.invert} hint={v.hint || undefined} spark={v.spark ? income : undefined} animate={a} />
        <Stat icon={v.icon ? coffee : undefined} label="Sipariş" value={() => sum(orders)} {...d(() => sum(orders), () => sum(orders) - last(orders) + prev(orders))}
          hint={v.hint || undefined} spark={v.spark ? orders : undefined} animate={a} />
        <Stat icon={v.icon ? clock : undefined} label="Bekleme" value={() => last(wait)} {...d(() => last(wait), () => prev(wait))} invert
          format={(x: unknown) => `${x} dk`} hint={v.hint || undefined} spark={v.spark ? wait : undefined} animate={a} />
      </div>
    }}
  </div>
}
