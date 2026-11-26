// Showcase stage for RadialBarChart: a day's goals as rings (steps, water, sleep, reading, meditation). "Sonraki gün"
// moves every ring (the sweeps morph), the middle shows the ring under the pointer or keyboard, and every option of the
// card reaches the chart: the shape option switches between three quarters, a full circle and a gauge arc.
import { RadialBarChart } from "march/components/data/radial-bar-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<RadialBarChart data={$goals} x="label" y="done" rowMax="goal" title="Bugünün hedefleri" />
<RadialBarChart data={langs} max={100} endAngle={360} innerRadius={0.4} legend="right" />`

const GOALS = [{ label: "Adım", goal: 10000 }, { label: "Su (bardak)", goal: 8 }, { label: "Uyku (saat)", goal: 8 }, { label: "Kitap (sayfa)", goal: 40 }, { label: "Meditasyon (dk)", goal: 15 }];
const DAYS = [[7420, 6, 7, 22, 10], [11240, 8, 6, 35, 15], [4380, 4, 8, 12, 5], [9100, 7, 7.5, 48, 20]];
const day = (d: number) => GOALS.map((g, i) => ({ ...g, done: DAYS[d]![i]! }));

type V = { shape: string; innerRadius: number; gap: number; rounded: boolean; track: boolean; labels: boolean; center: string;
  max: string; animate: string; legend: string; height: number; title: string };

const ANGLES: Record<string, [number, number]> = { quarter: [0, 270], full: [0, 360], gauge: [-135, 135] };

export default function RadialBarChartDemo(props: { values: V }) {
  let $day = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $day = ($day + 1) % DAYS.length }}>Sonraki gün</Button>
      <span class="m-muted">{() => ($picked || "Bir halkanın üstüne gel ya da Tab ile gel, ↑ ↓ ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      const [startAngle, endAngle] = ANGLES[v.shape] ?? [0, 270]
      return <RadialBarChart data={() => day($day)} x="label" y="done" rowMax={v.max === "row" ? "goal" : undefined} max={v.max === "fixed" ? 10000 : undefined}
        startAngle={startAngle} endAngle={endAngle} innerRadius={v.innerRadius} gap={v.gap} rounded={v.rounded} track={v.track} labels={v.labels}
        center={v.center === "auto" ? undefined : v.center === "off" ? false : (p: { share: number }) => `%${Math.round(p.share * 100)}`}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 90 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.value} / ${p.max} (%${Math.round(p.share * 100)})` }} />
    }}
  </div>
}
