// Showcase stage for Heatmap: how busy a café is by weekday and hour, or a reading habit as a calendar of weeks.
// "Yeni hafta" draws new numbers (the cells fade to their new tone with `animate`), a click on a cell names it.
import { Heatmap } from "march/charts";
import { Button } from "march/actions";
import { refresh } from "march/icons";

export const code = `<Heatmap data={visits} x="hour" y="day" value="people" yFormat={(d) => DAYS[d]} title="Kafe yoğunluğu" />
<Heatmap data={pages} x="date" value="pages" calendar={{ weeks: 16 }} end="2026-11-20" levels={4} />`

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const END = new Date(2026, 10, 20);
const busy = (seed: number) => {
  const out: { hour: number; day: number; people: number }[] = [];
  for (let day = 0; day < 7; day++) for (let hour = 7; hour <= 22; hour++) {
    const rush = Math.exp(-((hour - 9) ** 2) / 3) * 30 + Math.exp(-((hour - 13) ** 2) / 4) * 26 + (day >= 5 ? Math.exp(-((hour - 16) ** 2) / 8) * 30 : 0);
    out.push({ hour, day, people: Math.max(0, Math.round(rush + ((hour * 7 + day * 13 + seed * 5) % 9))) });
  }
  return out;
};
const reading = (seed: number, weeks: number) => Array.from({ length: weeks * 7 }, (_, i) => {
  const d = new Date(END); d.setDate(END.getDate() - i);
  return { date: d, pages: (i * 7 + seed * 11) % 5 === 0 ? 0 : ((i * 13 + seed * 3) % 40) + 5 };
});

type V = { mode: string; weeks: number; levels: number; cell: number; animate: string; title: string };

export default function HeatmapDemo(props: { values: V }) {
  let $seed = 1
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $seed++ }}>Yeni hafta</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir hücreye tıkla ya da Tab ile gel, oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      const common = { levels: v.levels, cell: v.cell || undefined, animate: v.animate === "spring" ? true : v.animate === "off" ? false : v.animate, title: v.title || undefined }
      return v.mode === "calendar"
        ? <Heatmap data={() => reading($seed, v.weeks)} x="date" value="pages" calendar={{ weeks: v.weeks }} end={END} valueLabel="Sayfa" {...common}
            onSelect={(p) => { $picked = `${new Date(p.x as number).toLocaleDateString("tr")}: ${p.value ?? 0} sayfa` }} />
        : <Heatmap data={() => busy($seed)} x="hour" y="day" value="people" xFormat={(h: number) => `${h}:00`} yFormat={(d: number) => DAYS[d]} valueLabel="Kişi" {...common}
            onSelect={(p) => { $picked = `${DAYS[p.y as number]} ${p.x}:00 · ${p.value ?? 0} kişi` }} />
    }}
  </div>
}
