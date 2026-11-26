// Showcase stage for RadarChart: three players of a five-a-side team over six skills. "Sonraki sezon" moves every
// skill (the shapes morph), the legend hides a player (its shape shrinks into the center), and every option of the
// card reaches the chart. A click (or Enter on a spoke) names the skill and the values on it.
import { RadarChart } from "march/components/data/radar-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<RadarChart data={$skills} x="skill" y={["ece", "can", "deniz"]} series={["Ece", "Can", "Deniz"]} max={100} title="Oyuncu karşılaştırması" />
<RadarChart data={laptops} x="spec" y="score" gridShape="circle" curve="smooth" fill={0.35} />`

const SKILLS = ["Hız", "Şut", "Pas", "Dripling", "Savunma", "Kondisyon"];
const SEASONS = [
  [[88, 62, 71], [74, 85, 58], [69, 77, 90], [91, 70, 64], [45, 52, 86], [80, 73, 78]],
  [[90, 66, 70], [78, 88, 61], [73, 79, 92], [92, 74, 66], [50, 55, 88], [84, 78, 75]],
  [[84, 72, 76], [81, 91, 66], [78, 80, 94], [89, 79, 70], [58, 60, 90], [88, 82, 81]],
];
const season = (s: number) => SKILLS.map((skill, i) => { const [ece, can, deniz] = SEASONS[s]![i]!; return { skill, ece, can, deniz }; });

type V = { gridShape: string; curve: string; fill: number; levels: number; dots: boolean; scale: string; levelLabels: boolean; axisLabels: boolean;
  animate: string; legend: string; height: number; title: string };

export default function RadarChartDemo(props: { values: V }) {
  let $season = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $season = ($season + 1) % SEASONS.length }}>Sonraki sezon</Button>
      <span class="m-muted">{() => ($picked || "Bir kola tıkla ya da Tab ile gel, ← → ile gez · açıklamadan oyuncu gizle")}</span>
    </div>
    {() => {
      const v = props.values
      return <RadarChart data={() => season($season)} x="skill" y={["ece", "can", "deniz"]} series={["Ece", "Can", "Deniz"]}
        max={v.scale === "shared" ? 100 : undefined} scale={v.scale === "axis" ? "axis" : "shared"}
        gridShape={v.gridShape as "circle"} curve={v.curve as "smooth"} fill={v.fill === 0 ? false : v.fill} levels={v.levels}
        dots={v.dots} levelLabels={v.levelLabels} axisLabels={v.axisLabels}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 120 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${Object.entries(p.values).map(([k, x]) => `${k === "ece" ? "Ece" : k === "can" ? "Can" : "Deniz"} ${x}`).join(" · ")}` }} />
    }}
  </div>
}
