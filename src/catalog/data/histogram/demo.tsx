// Showcase stage for Histogram: a week of delivery times (minutes) in two cities. "Sonraki hafta" brings new orders
// (the bars morph), the bins slider re-bins them, every option of the card reaches the chart, and a click on a bar
// names its range.
import { Histogram } from "march/components/data/histogram";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<Histogram data={$orders} value="minutes" group="city" bins={18} curve="kde"
  marks={[{ x: "median", series: "Ankara" }]} xTitle="Teslimat süresi (dk)" title="Teslimat süreleri" />`

// a small seeded generator: the same week always looks the same
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const week = (k: number) => {
  const r = rng(11 + k * 7919), normal = (m: number, s: number) => m + s * Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  const out: { city: string; minutes: number }[] = [];
  for (let i = 0; i < 260; i++) out.push({ city: "Ankara", minutes: Math.max(6, Math.round(normal(27 - k % 3, 6 + (k % 2) * 2))) });
  // İzmir: mostly quick, with a slow tail of rainy-day orders
  for (let i = 0; i < 220; i++) out.push({ city: "İzmir", minutes: Math.max(6, Math.round(i % 6 === 0 ? normal(46, 7) : normal(22 + k % 4, 5))) });
  return out;
}

type V = { bins: number; group: boolean; curve: string; cumulative: boolean; density: boolean; marks: boolean; gap: number; animate: string; legend: string; height: number; title: string };

export default function HistogramDemo(props: { values: V }) {
  let $k = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $k++ }}>Sonraki hafta</Button>
      <span class="m-muted">{() => ($picked || "Bir çubuğa tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <Histogram data={() => (v.group ? week($k) : week($k).filter((o) => o.city === "Ankara"))} value="minutes"
        group={v.group ? "city" : undefined} bins={v.bins} curve={v.curve === "none" ? false : (v.curve as "kde")}
        cumulative={v.cumulative} density={v.density} gap={v.gap}
        marks={v.marks ? [{ x: "median", series: "Ankara", label: "Ankara ortancası" }, { x: 45, label: "Söz verilen 45 dk", color: "danger" }] : []}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 60 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "right")} format={v.density ? ["number", 3] : "number"}
        xFormat={(n: number) => `${n} dk`} xTitle="Teslimat süresi" yTitle={v.density ? (v.cumulative ? "Pay" : "Yoğunluk") : "Sipariş"}
        yLabel="Sipariş" xLabel="Süre aralığı" height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.count} sipariş` }} />
    }}
  </div>
}
