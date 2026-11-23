// Showcase stage for LineChart / AreaChart: 30 days of income and spending. "Gün ekle" pushes a new day in (the chart
// flows), every option of the card reaches the chart, and a click on a point names it.
import { LineChart, AreaChart } from "march/components/data/line-chart";
import { Button } from "march/components/actions/button";
import { plus } from "march/icons";

export const code = `<LineChart data={$days} x="day" y={["income", "spend"]} series={{ income: "Gelir", spend: "Gider" }}
  format={["money", "TRY"]} xFormat="date" zoom title="Gelir ve gider" />
<AreaChart data={$days} x="day" y="active" stacked legend={false} height={200} />`

const DAY = 864e5, START = Date.UTC(2026, 9, 13);
const wave = (i: number, base: number, amp: number, k: number) => Math.round(base + amp * Math.sin((i + k) / 3) + (amp / 2) * Math.cos((i * 7 + k) / 5) + i * base * 0.006);
const dayOf = (i: number) => ({ day: START + i * DAY, income: wave(i, 1200, 260, 1), spend: wave(i, 760, 180, 4) });

type V = { kind: string; series: string; stacked: boolean; zoom: boolean; grid: string; legend: string; zero: boolean; format: string; height: number; title: string };

export default function LineChartDemo(props: { values: V }) {
  let $days = Array.from({ length: 30 }, (_, i) => dayOf(i))
  let $n = 30
  let $picked = ""
  const add = () => { $days = [...$days.slice(1), dayOf($n)]; $n++ }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={plus} on:click={add}>Gün ekle</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir noktaya tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      const C = v.kind === "area" ? AreaChart : LineChart
      return <C data={() => $days} x="day" y={v.series === "both" ? ["income", "spend"] : "income"} series={{ income: "Gelir", spend: "Gider" }}
        xFormat="date" format={v.format === "money" ? ["money", "TRY"] : v.format} zoom={v.zoom} zero={v.zero} stacked={v.stacked}
        grid={v.grid === "y" ? true : v.grid === "none" ? false : (v.grid as "x")} legend={v.legend === "none" ? false : v.legend === "auto" ? undefined : (v.legend as "bottom")}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${new Date(p.x as number).toLocaleDateString("tr")} · ${p.series === "spend" ? "Gider" : "Gelir"}: ${(p.y ?? 0).toLocaleString("tr")}` }} />
    }}
  </div>
}
