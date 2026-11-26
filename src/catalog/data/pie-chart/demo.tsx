// Showcase stage for PieChart: where a month's budget goes. "Sonraki ay" moves money between slices (they turn with
// `animate`), every option of the card reaches the chart, and a click on a slice names it.
import { PieChart } from "march/components/data/pie-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<PieChart data={$budget} x="label" y="value" donut format={["money", "TRY"]} legend="right" title="Bütçe dağılımı" />
<PieChart data={votes} donut={0.8} center="128 oy" legend="bottom" animate />`

const MONTHS = [
  [{ label: "Kira", value: 14000 }, { label: "Mutfak", value: 6200 }, { label: "Ulaşım", value: 2400 }, { label: "Eğlence", value: 1800 }, { label: "Birikim", value: 3600 }],
  [{ label: "Kira", value: 14000 }, { label: "Mutfak", value: 5100 }, { label: "Ulaşım", value: 3100 }, { label: "Eğlence", value: 3900 }, { label: "Birikim", value: 1900 }],
  [{ label: "Kira", value: 14000 }, { label: "Mutfak", value: 7000 }, { label: "Ulaşım", value: 1700 }, { label: "Eğlence", value: 900 }, { label: "Birikim", value: 6400 }],
];

type V = { donut: string; padAngle: number; center: string; labels: string; pop: number; animate: string; legend: string; format: string; height: number; title: string };

export default function PieChartDemo(props: { values: V }) {
  let $month = 0
  let $picked = ""
  // "Birikimsiz ay" drops the savings slice (it closes onto its middle) and brings it back (it opens again)
  let $noSave = false
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $month = ($month + 1) % MONTHS.length }}>Sonraki ay</Button>
      <Button size="sm" variant="secondary" on:click={() => { $noSave = !$noSave }}>{() => ($noSave ? "Birikim geri gelsin" : "Birikimsiz ay")}</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir dilime tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <PieChart data={() => MONTHS[$month]!.filter((s) => !$noSave || s.label !== "Birikim")} x="label" y="value" donut={v.donut === "ring" ? true : v.donut === "thin" ? 0.8 : false}
        padAngle={v.padAngle} center={v.center || undefined} animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 70 } : v.animate}
        labels={v.labels === "off" ? false : (v.labels as "percent")} pop={v.pop}
        legend={v.legend === "none" ? false : (v.legend as "right")} format={v.format === "money" ? ["money", "TRY"] : v.format}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: %${Math.round(p.share * 100)}` }} />
    }}
  </div>
}
