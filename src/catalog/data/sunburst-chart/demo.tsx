// Showcase stage for SunburstChart: a household's month of spending, group › category › item. A click on an arc zooms
// into it (its span opens to the full circle), the middle, Esc or the path above go back up; "Sonraki ay" moves the
// money (arcs turn to their new angles), and every option of the card reaches the chart.
import { SunburstChart } from "march/components/data/sunburst-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<SunburstChart data={$spending} value="tl" format={["money", "TRY"]} rootLabel="Ekim" title="Aylık harcama" />
<SunburstChart data={disk} label="name" value="size" maxDepth={4} innerRadius={0.2} drill={false} />`

interface Node { label: string; tl?: number; children?: Node[] }
const BASE: Node[] = [
  { label: "Ev", children: [{ label: "Kira", tl: 14000 }, { label: "Faturalar", children: [{ label: "Elektrik", tl: 950 }, { label: "Doğalgaz", tl: 1400 }, { label: "İnternet", tl: 420 }, { label: "Su", tl: 310 }] }, { label: "Aidat", tl: 900 }] },
  { label: "Mutfak", children: [{ label: "Market", children: [{ label: "Sebze-meyve", tl: 1800 }, { label: "Et-tavuk", tl: 2200 }, { label: "Kahvaltılık", tl: 1100 }] }, { label: "Dışarıda", children: [{ label: "Kahve", tl: 640 }, { label: "Akşam yemeği", tl: 1900 }] }] },
  { label: "Ulaşım", children: [{ label: "Akaryakıt", tl: 2600 }, { label: "Toplu taşıma", tl: 520 }, { label: "Taksi", tl: 380 }] },
  { label: "Keyif", children: [{ label: "Sinema", tl: 450 }, { label: "Konser", tl: 1200 }, { label: "Kitap", tl: 520 }, { label: "Abonelikler", children: [{ label: "Müzik", tl: 60 }, { label: "Dizi", tl: 190 }, { label: "Oyun", tl: 120 }] }] },
  { label: "Sağlık", children: [{ label: "Spor salonu", tl: 900 }, { label: "Eczane", tl: 340 }] },
];
// every month each item moves by a fixed pattern (so "Sonraki ay" always shows the same three months)
const month = (m: number): Node[] => {
  let k = 0;
  const walk = (n: Node): Node => n.children ? { label: n.label, children: n.children.map(walk) }
    : { label: n.label, tl: m === 0 || n.label === "Kira" ? n.tl! : Math.max(40, Math.round((n.tl ?? 0) * (1 + Math.sin(++k * 1.9 + m * 2.1) * 0.5))) };
  return BASE.map(walk);
};
const MONTHS = [month(0), month(1), month(2)];
const NAMES = ["Ekim", "Kasım", "Aralık"];

type V = { maxDepth: number; innerRadius: number; padAngle: number; labels: boolean; drill: boolean; breadcrumbs: boolean; center: string;
  format: string; animate: string; legend: string; height: number; title: string };

export default function SunburstChartDemo(props: { values: V }) {
  let $month = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $month = ($month + 1) % MONTHS.length }}>Sonraki ay</Button>
      <span class="m-muted">{() => ($picked || "Bir yaya tıkla: içine girer · ortaya tıkla ya da Esc: geri çıkar · Tab ve oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <SunburstChart data={() => MONTHS[$month]!} value="tl" rootLabel={NAMES[$month]} format={v.format === "money" ? ["money", "TRY"] : v.format}
        maxDepth={v.maxDepth} innerRadius={v.innerRadius} padAngle={v.padAngle} labels={v.labels} drill={v.drill} breadcrumbs={v.breadcrumbs}
        center={v.center === "auto" ? undefined : v.center === "off" ? false : (p: { total: number }) => `%${Math.round(p.total * 100)}`}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 140 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.path.join(" › ")}: ${Math.round(p.value).toLocaleString("tr-TR")} ₺ (üstünün %${Math.round(p.share * 100)}'i)` }} />
    }}
  </div>
}
