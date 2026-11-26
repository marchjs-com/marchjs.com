// Showcase stage for ScatterChart: cities by income and happiness, bubbles sized by population and colored by region.
// "Sonraki yıl" moves every city (the bubbles glide, a new city grows in, one leaves), every option of the card reaches
// the chart, and a click on a bubble names the city.
import { ScatterChart } from "march/components/data/scatter-chart";
import { Button } from "march/components/actions/button";
import { refresh } from "march/icons";

export const code = `<ScatterChart data={$cities} x="income" y="happiness" size="population" group="region" label="city"
  trend="linear" marks={[{ x: 40 }, { y: 6 }]} xTitle="Gelir (bin $)" yTitle="Mutluluk" title="Gelir ve mutluluk" />`

const CITIES: [string, string, number, number, number][] = [
  ["İstanbul", "Avrupa", 28, 5.6, 15.6], ["Berlin", "Avrupa", 52, 6.9, 3.7], ["Oslo", "Avrupa", 67, 7.4, 0.7], ["Lizbon", "Avrupa", 31, 6.2, 0.5],
  ["Varşova", "Avrupa", 34, 6.0, 1.8], ["Tokyo", "Asya", 46, 6.1, 14], ["Seul", "Asya", 41, 5.9, 9.7], ["Singapur", "Asya", 72, 6.6, 5.9],
  ["Mumbai", "Asya", 9, 4.3, 20.7], ["Bangkok", "Asya", 18, 5.8, 10.5], ["New York", "Amerika", 70, 6.8, 8.3], ["Toronto", "Amerika", 55, 7.0, 2.8],
  ["Meksiko", "Amerika", 15, 6.3, 9.2], ["São Paulo", "Amerika", 16, 6.0, 12.3], ["Bogotá", "Amerika", 12, 5.9, 7.9], ["Lagos", "Afrika", 6, 4.9, 15.4],
  ["Nairobi", "Afrika", 8, 4.6, 4.4], ["Kahire", "Afrika", 10, 4.4, 21.3], ["Kapstadt", "Afrika", 17, 5.2, 4.7],
];
// a year later: incomes and moods drift (deterministically), one city joins and one is left out in turn
const year = (k: number) => CITIES.filter((_, i) => i !== k % CITIES.length).map(([city, region, inc, hap, pop], i) => ({
  city, region, income: Math.round(inc * (1 + 0.06 * Math.sin(k * 1.7 + i))), happiness: Math.round((hap + 0.4 * Math.cos(k * 2.1 + i * 1.3)) * 10) / 10,
  population: Math.round(pop * (1 + 0.03 * k) * 10) / 10,
}))

type V = { size: boolean; group: boolean; shape: string; trend: boolean; marks: boolean; grid: string; animate: string; legend: string; height: number; title: string };

export default function ScatterChartDemo(props: { values: V }) {
  let $k = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $k++ }}>Sonraki yıl</Button>
      <span class="m-muted">{() => ($picked || "Bir kabarcığa tıkla ya da Tab ile gel, ← → ile gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <ScatterChart data={() => year($k)} x="income" y="happiness" label="city"
        size={v.size ? "population" : undefined} sizeLabel="Nüfus (milyon)" group={v.group ? "region" : undefined}
        shape={v.shape === "auto" ? "auto" : (v.shape as "circle")} trend={v.trend ? "linear" : false}
        marks={v.marks ? [{ x: 40, label: "Orta gelir" }, { y: 6, label: "Mutlu" }] : []}
        grid={v.grid === "none" ? false : v.grid === "both" ? true : (v.grid as "y")}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 60 } : v.animate}
        legend={v.legend === "none" ? false : (v.legend as "right")} xFormat={(n: number) => `${n} bin $`} xLabel="Gelir" yLabel="Mutluluk"
        xTitle="Gelir (kişi başı, bin $)" yTitle="Mutluluk (0–10)" xMin={0} yMin={3} yMax={8}
        height={v.height} title={v.title || undefined}
        onSelect={(p) => { $picked = `${p.label}: ${p.x} bin $, mutluluk ${p.y}` }} />
    }}
  </div>
}
