// Showcase stage for ChordChart: moves between five cities in a year (thousands of people). "Sonraki yıl" changes the
// flows (arcs and ribbons turn to their new angles), hovering a city keeps only its ribbons, and every option of the card
// reaches the chart.
import { ChordChart } from "march/components/data/chord-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<ChordChart matrix={$moves} names={["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa"]} title="Şehirler arası göç" />
<ChordChart data={transfers} directed ticks ribbonColor="target" />`

const CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa"];
const YEARS = [
  [[0, 42, 31, 26, 38], [36, 0, 14, 11, 9], [24, 12, 0, 9, 6], [18, 8, 7, 0, 4], [29, 7, 5, 3, 0]],
  [[0, 38, 35, 33, 41], [33, 0, 16, 13, 8], [27, 13, 0, 12, 7], [15, 7, 9, 0, 5], [25, 6, 6, 4, 0]],
  [[0, 47, 28, 22, 34], [40, 0, 12, 10, 11], [21, 14, 0, 8, 5], [21, 9, 6, 0, 3], [33, 9, 4, 2, 0]],
];

type V = { directed: boolean; padAngle: number; thickness: number; ribbonColor: string; labels: boolean; ticks: boolean; animate: string; legend: string; height: number; title: string };

export default function ChordChartDemo(props: { values: V }) {
  let $year = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $year = ($year + 1) % YEARS.length }}>Sonraki yıl</Button>
      <span class="m-muted">{() => ($picked || "Bir şehrin üstüne gel: yalnız onun göçleri kalır · Tab ile gel, oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <ChordChart matrix={() => YEARS[$year]!} names={CITIES} directed={v.directed} padAngle={v.padAngle} thickness={v.thickness}
        ribbonColor={v.ribbonColor as "source"} labels={v.labels} ticks={v.ticks} format={(x: number) => `${x} bin kişi`}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 40 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = p.kind === "group" ? `${p.label}: ${p.value} bin kişi` : `${p.label}: ${p.value} bin${p.back ? ` · geri ${p.back} bin` : ""}` }} />
    }}
  </div>
}
