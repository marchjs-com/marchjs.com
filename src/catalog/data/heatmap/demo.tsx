// Showcase stage for Heatmap: a year of reading as a calendar heatmap (month names, Mon / Wed / Fri, a less → more
// legend, gaps outside the year), the last weeks of it, or how busy a café is by weekday and hour. "Yeni veri" draws new
// numbers (cells fade to their new tone), "Sonraki hafta" moves the calendar on (the days glide a column, the oldest
// shrink away); the arrows walk the cells (↑ ↓ a day, ← → a week), a click or Enter names one.
import { Heatmap } from "march/components/data/heatmap";
import { Button } from "march/components/actions/button";
import { refresh, plus } from "march/icons";

export const code = `<Heatmap data={pages} x="date" value="pages" calendar from="2026-01-01" to="2026-12-31" radius={3} />
<Heatmap data={pages} x="date" value="pages" calendar={{ weeks: 16 }} to={$today} levelLegend={{ less: "Az", more: "Çok" }} animate={{ stagger: 25 }} />
<Heatmap data={visits} x="hour" y="day" value="people" yFormat={(d) => DAYS[d]} title="Kafe yoğunluğu" />`

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
// pages read per day, from `to` back `days` days: weekends read more, some days nothing
const reading = (seed: number, to: Date, days: number) => Array.from({ length: days }, (_, i) => {
  const d = new Date(to); d.setDate(to.getDate() - i);
  const k = Math.floor(d.getTime() / 864e5), weekend = d.getDay() === 0 || d.getDay() === 6;
  return { date: d, pages: (k * 7 + seed * 11) % 6 === 0 ? 0 : ((k * 13 + seed * 3) % 30) + (weekend ? 18 : 4) };
});
const dayAfter = (n: number) => { const d = new Date(END); d.setDate(END.getDate() + n); return d; };

type V = { mode: string; weeks: number; levels: number; cellSize: number; gap: number; radius: number; dayLabels: string; months: boolean; levelLegend: string; firstDay: string; animate: string; title: string };
const anim = (a: string) => (a === "spring" ? true : a === "off" ? false : a === "stagger" ? { stagger: 25 } : a);

export default function HeatmapDemo(props: { values: V }) {
  let $seed = 1
  let $shift = 0
  let $picked = ""
  return <div class="sc-col">
    <div class="sc-row">
      <Button size="sm" icon={refresh} on:click={() => { $seed++ }}>Yeni veri</Button>
      {() => (props.values.mode === "calendar" ? <Button size="sm" variant="ghost" icon={plus} on:click={() => { $shift += 7 }}>Sonraki hafta</Button> : null)}
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Bir hücreye tıkla ya da Tab ile gel, oklarla gez")}</span>
    </div>
    {() => {
      const v = props.values
      const common = {
        levels: v.levels, cellSize: v.cellSize || undefined, gap: v.gap, radius: v.radius, animate: anim(v.animate), title: v.title || undefined,
        levelLegend: v.levelLegend === "off" ? false : v.levelLegend === "own" ? { less: "Az", more: "Çok" } : true,
      }
      const calendar = {
        dayLabels: (v.dayLabels === "all" ? "all" : v.dayLabels !== "none") as boolean | "all", months: v.months, firstDay: v.firstDay === "locale" ? undefined : Number(v.firstDay), valueLabel: "Sayfa",
        onSelect: (p: { datum: { date?: Date }; value: number | null }) => { $picked = `${p.datum.date?.toLocaleDateString("tr", { day: "numeric", month: "long" })}: ${p.value ?? 0} sayfa` },
      }
      if (v.mode === "year")
        return <Heatmap data={() => reading($seed, new Date(2026, 11, 31), 365)} x="date" value="pages" calendar from="2026-01-01" to="2026-12-31" {...common} {...calendar} />
      if (v.mode === "calendar")
        return <Heatmap data={() => reading($seed, dayAfter($shift), v.weeks * 7)} x="date" value="pages" calendar={{ weeks: v.weeks }} to={() => dayAfter($shift)} {...common} {...calendar} />
      return <Heatmap data={() => busy($seed)} x="hour" y="day" value="people" xFormat={(h: number) => `${h}:00`} yFormat={(d: number) => DAYS[d]} valueLabel="Kişi" {...common}
        onSelect={(p) => { $picked = `${DAYS[p.y as number]} ${p.x}:00 · ${p.value ?? 0} kişi` }} />
    }}
  </div>
}
