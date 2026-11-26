// Showcase stage for WaterfallChart: a café's month, from last month's profit to this month's. "Sonraki ay" changes
// every step (bars glide, connectors follow), every option reaches the chart and a click on a column names it.
import { WaterfallChart } from "march/components/data/waterfall-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<WaterfallChart data={$month} start={84000} totals="end" format={["money", "TRY"]} title="Kâr köprüsü" />
<WaterfallChart data={cash} x="ay" y="net" horizontal upColor="brand-blue" downColor="brand-orange" />`

const MONTHS = [
  { start: 84000, steps: [42000, 18500, -6200, -31000, -9800, -12400] },
  { start: 74500, steps: [51000, 9200, -4100, -31000, -11200, -9300] },
  { start: 88100, steps: [36000, 22800, -8900, -33500, -7400, -14100] },
];
const NAMES = ["Satış", "Yeni müşteri", "İadeler", "Maaşlar", "Kira", "Vergi"];

type V = { start: boolean; subtotal: boolean; totals: boolean; connectors: boolean; labels: boolean; orientation: string; palette: string;
  marks: string; format: string; animate: string; legend: string; height: number; title: string };

const animateOf = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a);

export default function WaterfallChartDemo(props: { values: V }) {
  let $month = 0
  let $picked = ""
  const rows = (sub: boolean) => {
    const m = MONTHS[$month]!
    const list: { label: string; value?: number; total?: boolean }[] = m.steps.map((value, i) => ({ label: NAMES[i]!, value }))
    if (sub) list.splice(3, 0, { label: "Brüt kâr", total: true })
    return list
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $month = ($month + 1) % MONTHS.length }}>Sonraki ay</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir sütuna tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      const brand = v.palette === "brand"
      return <WaterfallChart data={() => rows(v.subtotal)} start={v.start ? MONTHS[$month]!.start : undefined} startLabel="Geçen ay"
        totals={v.totals ? "end" : false} totalLabel="Bu ay" connectors={v.connectors} labels={v.labels}
        orientation={v.orientation as "vertical"} upColor={brand ? "brand-blue" : undefined} downColor={brand ? "brand-orange" : undefined} totalColor={brand ? "brand-purple" : undefined}
        marks={v.marks === "goal" ? [{ y: 100000, label: "Hedef 100 B", color: "brand-green" }] : v.marks === "average" ? [{ y: "average" }] : []}
        format={v.format === "money" ? ["money", "TRY"] : v.format} animate={animateOf(v.animate)}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.kind === "total" ? "" : p.value > 0 ? "+" : ""}${p.value.toLocaleString("tr")} ₺ → ${p.to.toLocaleString("tr")} ₺` }} />
    }}
  </div>
}
