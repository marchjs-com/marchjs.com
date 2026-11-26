// Showcase stage for LineChart / AreaChart / ComboChart: a café's days, income and spending (and the cups sold for the
// combo). "Gün ekle" pushes a new day in (the line slides, the axis glides), "Yeni ay" redraws the numbers (values morph);
// every option of the card reaches the chart: curves, markers, gaps, reference marks, the second axis, the live window,
// the navigator, the crosshair shared with the small chart under it, export and the animation itself.
import { LineChart, AreaChart, ComboChart } from "march/components/data/line-chart";
import { Button } from "march/components/actions/button";
import { plus, refresh } from "march/icons";

export const code = `<LineChart data={$days} x="day" y={["income", "spend"]} series={{ income: "Gelir", spend: "Gider" }}
  format={["money", "TRY"]} curve="smooth" markers="auto" zoom sync="kafe"
  marks={[{ y: 1300, label: "Hedef", color: "success" }, { y: "average", series: "spend" }]} title="Gelir ve gider" />
<ComboChart data={$days} x="day" y={[{ key: "cups", type: "bar", label: "Fincan" }, { key: "income", type: "line", axis: "right", curve: "smooth" }]} />
<AreaChart data={$days} x="day" y={["income", "spend"]} stacked offset="expand" window={14} navigator />`

const DAY = 864e5, START = Date.UTC(2026, 9, 13);
const wave = (i: number, base: number, amp: number, k: number) => Math.round(base + amp * Math.sin((i + k) / 3) + (amp / 2) * Math.cos((i * 7 + k) / 5) + i * base * 0.006);
// a closed day (every 9th) has no numbers: the line shows a gap unless connectNulls draws across it
const dayOf = (i: number, k = 1) => (i % 9 === 8 ? { day: START + i * DAY, income: null, spend: null, cups: null }
  : { day: START + i * DAY, income: wave(i, 1200, 260, k), spend: wave(i, 760, 180, k + 3), cups: wave(i, 180, 50, k + 6) });

type V = { kind: string; series: string; stacked: boolean; offset: string; curve: string; markers: string; gaps: string; marks: string; window: string; navigator: boolean;
  zoom: boolean; grid: string; legend: string; zero: boolean; format: string; animate: string; exportable: boolean; height: number; title: string };

const animateOf = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 120 } : a);

export default function LineChartDemo(props: { values: V }) {
  let $k = 1
  let $n = 30
  let $days = Array.from({ length: 30 }, (_, i) => dayOf(i))
  let $picked = ""
  const add = () => { $days = [...$days, dayOf($n, $k)]; $n++ }
  const month = () => { $k++; $days = $days.map((_, i) => dayOf(i + $n - $days.length, $k)) }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={plus} on:click={add}>Gün ekle</Button>
      <Button size="sm" variant="secondary" icon={refresh} on:click={month}>Yeni ay</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir noktaya tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      const two = v.series === "both"
      const y = v.kind === "combo"
        ? [{ key: "cups", type: "bar" as const, label: "Fincan" }, { key: "income", type: "line" as const, axis: "right" as const, curve: "smooth" as const, label: "Gelir" }]
        : two ? ["income", "spend"] : "income"
      const C = v.kind === "area" ? AreaChart : v.kind === "combo" ? ComboChart : LineChart
      const marks = v.marks === "target" ? [{ y: 1300, label: "Hedef", color: "success" }]
        : v.marks === "stats" ? [{ y: "average" as const, series: "income" }, { y: "max" as const, series: "income", color: "brand-orange" }]
        : v.marks === "band" ? [{ x: [START + 10 * DAY, START + 15 * DAY], label: "Kampanya", color: "brand-blue" }, { at: [START + 20 * DAY, 1500] as const, label: "Festival" }]
        : undefined
      return <div class="sc-col">
        <C data={() => $days} x="day" y={y as never} series={{ income: "Gelir", spend: "Gider" }}
          xFormat="date" format={v.kind === "combo" ? "number" : v.format === "money" ? ["money", "TRY"] : v.format} y2Format={["money", "TRY"]}
          yTitle={v.kind === "combo" ? "Fincan" : undefined} y2Title={v.kind === "combo" ? "Gelir" : undefined}
          stacked={v.stacked} offset={v.offset as "zero"} curve={v.curve as "linear"} markers={v.markers === "off" ? false : (v.markers as "auto")}
          connectNulls={v.gaps === "connect"} marks={marks as never} window={v.window === "all" ? undefined : Number(v.window)} navigator={v.navigator}
          zoom={v.zoom} zero={v.zero} grid={v.grid === "y" ? true : v.grid === "none" ? false : (v.grid as "x")}
          legend={v.legend === "none" ? false : v.legend === "auto" ? undefined : (v.legend as "bottom")}
          animate={animateOf(v.animate)} export={v.exportable} sync="kafe" height={v.height} title={v.title || undefined}
          onSelect={(p) => { $picked = `${new Date(p.x as number).toLocaleDateString("tr")} · ${p.series === "spend" ? "Gider" : p.series === "cups" ? "Fincan" : "Gelir"}: ${(p.y ?? 0).toLocaleString("tr")}` }} />
        <LineChart data={() => $days} x="day" y="spend" series="Gider" height={90} grid={false} legend={false} sync="kafe" animate={animateOf(v.animate)}
          xFormat="date" format="compact" title="Gider (artı imleci yukarıdakiyle paylaşır)" />
      </div>
    }}
  </div>
}
