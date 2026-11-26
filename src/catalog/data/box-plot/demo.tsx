// Showcase stage for BoxPlot: how long patients waited at an emergency desk, day by day. "Sonraki hafta" brings a new
// week (boxes and violins morph), every option of the card reaches the chart, and a click on a day names its median.
import { BoxPlot } from "march/components/data/box-plot";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<BoxPlot data={$waits} x="day" y="minutes" mode="both" showPoints
  marks={[{ y: 30, label: "Hedef 30 dk" }]} yTitle="Bekleme (dk)" title="Acil serviste bekleme" />`

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
// a small seeded generator: the same week always looks the same; weekends are busier and more spread out
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const week = (k: number) => {
  const r = rng(3 + k * 104729), normal = (m: number, s: number) => m + s * Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  return DAYS.map((day, d) => {
    const busy = d >= 5 ? 14 : d === 0 ? 8 : 0, n = 26 + ((d * 7 + k * 3) % 14);
    const minutes = Array.from({ length: n }, (_, i) => Math.max(2, Math.round(normal(22 + busy + (k % 3) * 2, 6 + busy / 2) + (i % 11 === 0 ? 25 : 0))));
    return { day, minutes };
  });
}

type V = { mode: string; horizontal: boolean; showPoints: boolean; whisker: string; mean: boolean; outliers: boolean; marks: boolean; animate: string; height: number; title: string };

export default function BoxPlotDemo(props: { values: V }) {
  let $k = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $k++ }}>Sonraki hafta</Button>
      <span class="m-muted">{() => ($picked || "Bir güne tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <BoxPlot data={() => week($k)} x="day" y="minutes" mode={v.mode as "box"} horizontal={v.horizontal} showPoints={v.showPoints}
        whisker={v.whisker === "minmax" ? "minmax" : "iqr"} mean={v.mean} outliers={v.outliers}
        marks={v.marks ? [{ y: 30, label: "Hedef 30 dk", color: "danger" }] : []}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 60 } : v.animate}
        format={(n: number) => `${n} dk`} xFormat={(d: string) => SHORT[DAYS.indexOf(d)] ?? d} xLabel="Gün" yTitle="Bekleme süresi"
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ortanca ${p.stats.median} dk, ${p.stats.n} hasta` }} />
    }}
  </div>
}
