// Showcase stage for BulletChart: a small studio's quarter goals. "Sonraki çeyrek" moves every measure (bars fill,
// targets slide), "Destek satırı" adds / removes a row (it fades in / shrinks away), every option reaches the chart
// and a click on a row names it with the range it falls in.
import { BulletChart } from "march/components/data/bullet-chart";
import { Button } from "march/components/actions/button";
import { refresh, plus } from "march/icons";

export const code = `<BulletChart data={$goals} title="Çeyrek hedefleri" />
<BulletChart data={{ label: "Gelir", value: 270, target: 250, ranges: [150, 225, 300] }} compact rangeTone="traffic" />`

const QUARTERS = [
  { revenue: 412, margin: 18, clients: 23, nps: 54, basket: 1350 },
  { revenue: 486, margin: 22, clients: 31, nps: 61, basket: 1490 },
  { revenue: 538, margin: 27, clients: 28, nps: 72, basket: 1620 },
];

type V = { orientation: string; compact: boolean; rangeTone: string; axis: boolean; showValue: boolean; names: boolean; previous: boolean;
  color: string; rowHeight: number; animate: string; legend: string; title: string };

const animateOf = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 60 } : a);

export default function BulletChartDemo(props: { values: V }) {
  let $q = 0
  let $support = false
  let $picked = ""
  const data = () => {
    const q = QUARTERS[$q]!, p = QUARTERS[($q + QUARTERS.length - 1) % QUARTERS.length]!
    const rows = [
      { label: "Gelir", subtitle: "bin ₺", value: q.revenue, target: 500, previous: p.revenue, ranges: [300, 450, 600] },
      { label: "Kâr marjı", subtitle: "%", value: q.margin, target: 25, previous: p.margin, ranges: [15, 22, 30] },
      { label: "Yeni müşteri", subtitle: "kişi", value: q.clients, target: 30, previous: p.clients, ranges: [15, 25, 40] },
      { label: "Memnuniyet", subtitle: "NPS", value: q.nps, target: 65, previous: p.nps, ranges: [30, 50, 100] },
      { label: "Ortalama sepet", subtitle: "₺", value: q.basket, target: 1500, previous: p.basket, ranges: [900, 1300, 2000] },
    ]
    return $support ? [...rows, { label: "Destek", subtitle: "saat, çözüm", value: 9 - $q * 2, target: 6, previous: 10 - $q * 2, ranges: [4, 8, 12] }] : rows
  }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $q = ($q + 1) % QUARTERS.length }}>Sonraki çeyrek</Button>
      <Button size="sm" variant="ghost" icon={plus} on:click={() => { $support = !$support }}>{() => ($support ? "Destek satırını çıkar" : "Destek satırı")}</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir satıra tıkla ya da Tab ile gel, ↑ ↓ ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <BulletChart data={data} orientation={v.orientation as "horizontal"} compact={v.compact} rangeTone={v.rangeTone as "neutral"} rangeLabels={["Zayıf", "Orta", "İyi"]}
        axis={v.axis} showValue={v.showValue} names={v.names} previous={v.previous ? "previous" : () => null}
        color={v.color || undefined} rowHeight={v.orientation === "horizontal" && !v.compact ? v.rowHeight : undefined}
        animate={animateOf(v.animate)} legend={v.legend === "none" ? false : (v.legend as "bottom")} title={v.title || undefined}
        height={v.orientation === "vertical" ? 300 : undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.value} (hedef ${p.target})${p.range ? `, ${p.range}` : ""}` }} />
    }}
  </div>
}
