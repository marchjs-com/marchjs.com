// Showcase stage for SankeyChart: where a household's monthly income goes. "Sonraki ay" changes the amounts (ribbons
// and nodes morph), hovering a node lights its whole flow, and every option of the card reaches the chart.
import { SankeyChart } from "march/components/data/sankey-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<SankeyChart links={$flows} format={["money", "TRY"]} title="Aylık bütçe akışı" />
<SankeyChart links={funnel} align="left" linkColor="source" nodePadding={20} />`

type Link = { source: string; target: string; value: number };
const month = (salary: number, side: number, rent: number, food: number, fun: number, gold: number): Link[] => {
  const income = salary + side, fixed = rent + 2400 + 1300, saving = income - fixed - food - fun - 1900;
  return [
    { source: "Maaş", target: "Bütçe", value: salary }, { source: "Ek iş", target: "Bütçe", value: side },
    { source: "Bütçe", target: "Sabit giderler", value: fixed }, { source: "Bütçe", target: "Market", value: food },
    { source: "Bütçe", target: "Ulaşım", value: 1900 }, { source: "Bütçe", target: "Eğlence", value: fun },
    { source: "Bütçe", target: "Birikim", value: saving },
    { source: "Sabit giderler", target: "Kira", value: rent }, { source: "Sabit giderler", target: "Faturalar", value: 2400 },
    { source: "Sabit giderler", target: "İnternet ve telefon", value: 1300 },
    { source: "Birikim", target: "Altın", value: gold }, { source: "Birikim", target: "Fon", value: saving - gold },
  ];
};
const MONTHS = [month(42000, 6000, 16000, 8200, 3600, 4000), month(42000, 11000, 16000, 7600, 5200, 7000), month(44500, 2500, 16000, 9100, 2400, 3000)];
const tl = (n: number): string => `${n.toLocaleString("tr")} ₺`;

type V = { align: string; nodeWidth: number; nodePadding: number; iterations: number; linkColor: string; labels: boolean; valueLabels: boolean;
  animate: string; legend: string; format: string; height: number; title: string };

export default function SankeyChartDemo(props: { values: V }) {
  let $month = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $month = ($month + 1) % MONTHS.length }}>Sonraki ay</Button>
      <span class="m-muted">{() => ($picked || "Bir düğümün üstüne gel: bütün akışı yanar · Tab ile gel, oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <SankeyChart links={() => MONTHS[$month]!} align={v.align as "justify"} nodeWidth={v.nodeWidth} nodePadding={v.nodePadding}
        iterations={v.iterations} linkColor={v.linkColor as "gradient"} labels={v.labels} valueLabels={v.valueLabels}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 60 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} format={v.format === "money" ? ["money", "TRY"] : v.format}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = p.kind === "node" ? `${p.label}: giren ${tl(p.incoming)}, çıkan ${tl(p.outgoing)}` : `${p.label}: ${tl(p.value)}` }} />
    }}
  </div>
}
