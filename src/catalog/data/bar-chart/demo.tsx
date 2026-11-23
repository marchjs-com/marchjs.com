// Showcase stage for BarChart: a week of a bakery's sales, in the shop and online. "Yeni hafta" draws new numbers (the
// bars glide with `animate`), every option of the card reaches the chart, and a click on a bar names it.
import { BarChart } from "march/components/data/bar-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<BarChart data={$week} x="day" y={["shop", "online"]} series={{ shop: "Dükkân", online: "Çevrimiçi" }}
  format={["money", "TRY"]} animate title="Haftalık satış" />
<BarChart data={$week} x="day" y={["shop", "online"]} stacked horizontal height={220} />`

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const week = (seed: number) => DAYS.map((day, i) => ({ day, shop: 900 + ((i * 37 + seed * 53) % 11) * 80 + (i >= 5 ? 700 : 0), online: 400 + ((i * 23 + seed * 31) % 9) * 70 }));

type V = { series: string; stacked: boolean; horizontal: boolean; animate: string; grid: boolean; legend: string; format: string; height: number; title: string };

export default function BarChartDemo(props: { values: V }) {
  let $seed = 1
  let $week = week(1)
  let $picked = ""
  const next = () => { $seed++; $week = week($seed) }
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={next}>Yeni hafta</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir çubuğa tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <BarChart data={() => $week} x="day" y={v.series === "both" ? ["shop", "online"] : "shop"} series={{ shop: "Dükkân", online: "Çevrimiçi" }}
        stacked={v.stacked} horizontal={v.horizontal} animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate} grid={v.grid}
        legend={v.legend === "none" ? false : v.legend === "auto" ? undefined : (v.legend as "bottom")} format={v.format === "money" ? ["money", "TRY"] : v.format}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.x} · ${p.series === "online" ? "Çevrimiçi" : "Dükkân"}: ${(p.y ?? 0).toLocaleString("tr")}` }} />
    }}
  </div>
}
