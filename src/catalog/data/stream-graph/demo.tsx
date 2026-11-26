// Showcase stage for StreamGraph: a year of a music app's listening by genre. "Sonraki yıl" redraws the months (layers
// swell and thin in place), "Caz ekle / çıkar" brings a layer in (it rises out of the stream) or takes it out (it
// closes up), the legend hides a genre, and every option of the card reaches the chart.
import { StreamGraph } from "march/components/data/stream-graph";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<StreamGraph data={$months} x="month" y={["pop", "rock", "rap", "jazz"]}
  series={{ pop: "Pop", rock: "Rock", rap: "Rap", jazz: "Caz" }} title="Türlere göre dinleme" />
<StreamGraph data={$months} x="month" y={["pop", "rock"]} offset="silhouette" edges legend="right" />`

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const g = (i: number, base: number, amp: number, k: number) => Math.max(5, Math.round(base + amp * Math.sin((i + k) / 2) + (amp / 3) * Math.cos((i * 5 + k) / 3)));
const year = (k: number) => MONTHS.map((month, i) => ({ month, pop: g(i, 60, 25, k), rock: g(i, 40, 18, k + 2), rap: g(i, 30, 22, k + 5), jazz: g(i, 18, 10, k + 7) }));

type V = { offset: string; curve: string; edges: boolean; legend: string; animate: string; format: string; height: number; title: string };

export default function StreamGraphDemo(props: { values: V }) {
  let $k = 1
  let $jazz = true
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $k++ }}>Sonraki yıl</Button>
      <Button size="sm" variant="secondary" on:click={() => { $jazz = !$jazz }}>{() => ($jazz ? "Caz çıkar" : "Caz ekle")}</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir aya tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <StreamGraph data={() => year($k)} x="month" y={$jazz ? ["pop", "rock", "rap", "jazz"] : ["pop", "rock", "rap"]}
        series={{ pop: "Pop", rock: "Rock", rap: "Rap", jazz: "Caz" }} offset={v.offset as "wiggle"} curve={v.curve as "smooth"} edges={v.edges}
        legend={v.legend === "none" ? false : (v.legend as "bottom")} format={v.format === "hours" ? (x: unknown) => `${x} sa` : "number"}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 110 } : v.animate}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.x}: pop ${p.values.pop}, rock ${p.values.rock}` }} />
    }}
  </div>
}
