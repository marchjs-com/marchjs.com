// Showcase stage for FunnelChart: an online shop's checkout week by week. "Sonraki hafta" changes every stage (the
// widths morph), "İade aşaması" adds / removes a last stage (it pours in / collapses), every option reaches the chart
// and a click on a stage names it.
import { FunnelChart } from "march/components/data/funnel-chart";
import { Button } from "march/components/actions/button";
import { refresh, plus } from "march/icons";

export const code = `<FunnelChart data={$checkout} x="stage" y="people" title="Satın alma hunisi" />
<FunnelChart data={signups} shape="bars" color="brand-blue" orientation="horizontal" />`

const WEEKS = [
  [18400, 9200, 4100, 2300, 1650],
  [21900, 12800, 5200, 2600, 1980],
  [16200, 7300, 3900, 2800, 2210],
];
const STAGES = ["Ziyaret", "Ürüne bakış", "Sepete ekleme", "Ödeme", "Satın alma"];

type V = { shape: string; orientation: string; names: boolean; showValue: boolean; showShare: boolean; showConversion: boolean; dropoff: boolean;
  color: string; gap: number; format: string; animate: string; legend: string; height: number; title: string };

const animateOf = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a);

export default function FunnelChartDemo(props: { values: V }) {
  let $week = 0
  let $returns = false
  let $picked = ""
  const data = () => {
    const w = WEEKS[$week]!
    const rows = STAGES.map((stage, i) => ({ stage, people: w[i]! }))
    return $returns ? [...rows, { stage: "Tekrar alım", people: Math.round(w[4]! * 0.34) }] : rows
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $week = ($week + 1) % WEEKS.length }}>Sonraki hafta</Button>
      <Button size="sm" variant="ghost" icon={plus} on:click={() => { $returns = !$returns }}>{() => ($returns ? "Tekrar alımı çıkar" : "Tekrar alım aşaması")}</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir aşamaya tıkla ya da Tab ile gel, ↑ ↓ ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <FunnelChart data={data} x="stage" y="people" shape={v.shape as "funnel"} orientation={v.orientation as "vertical"}
        names={v.names} showValue={v.showValue} showShare={v.showShare} showConversion={v.showConversion} dropoff={v.dropoff}
        color={v.color || undefined} gap={v.gap} format={v.format} animate={animateOf(v.animate)}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.value.toLocaleString("tr")} kişi${p.conversion == null ? "" : `, adım dönüşümü %${Math.round(p.conversion * 100)}`}` }} />
    }}
  </div>
}
