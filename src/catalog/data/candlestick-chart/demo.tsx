// Showcase stage for CandlestickChart: three months of a coin's daily candles. "Canlı" streams prices in (the last
// candle breathes, a new one grows in while the window slides), "Yeni veri" draws another market, every option of the
// card reaches the chart, and a click on a candle names it.
import { CandlestickChart } from "march/components/data/candlestick-chart";
import { Button } from "march/components/actions/button";
import { play, pause, refresh } from "march/icons";
import { onCleanup } from "march";

export const code = `<CandlestickChart data={$btc} x="date" volume="vol" ma={[7, 21]} window={60} navigator
  format={["money", "USD"]} marks={[{ y: 64000, label: "Hedef", color: "brand-blue" }]} title="HADİ / USD" />`

const DAY = 864e5, START = Date.UTC(2026, 5, 1);
type Row = { date: number; open: number; high: number; low: number; close: number; vol: number };
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const candle = (i: number, open: number, r: () => number): Row => {
  const drift = (r() - 0.47) * open * 0.045, close = Math.max(1000, open + drift);
  const high = Math.max(open, close) + r() * open * 0.018, low = Math.min(open, close) - r() * open * 0.018;
  return { date: START + i * DAY, open: Math.round(open), high: Math.round(high), low: Math.round(low), close: Math.round(close), vol: Math.round(800 + r() * 1400 + Math.abs(drift) * 0.9) };
};
const market = (seed: number, n: number): Row[] => {
  const r = rng(seed), out: Row[] = [];
  let p = 52000 + r() * 12000;
  for (let i = 0; i < n; i++) { const c = candle(i, p, r); out.push(c); p = c.close; }
  return out;
};

type V = { type: string; volume: boolean; ma: string; window: string; navigator: boolean; marks: string; lastPrice: boolean; zoom: boolean; grid: string;
  colors: string; format: string; animate: string; height: number; title: string };

export default function CandlestickChartDemo(props: { values: V }) {
  let $seed = 7
  let $rows = market(7, 90)
  let $live = false
  let $picked = ""
  const r = rng(99)
  // live: two ticks out of three move the last candle, the third opens a new one
  const tick = () => {
    const last = $rows[$rows.length - 1]!
    if (r() < 0.66) {
      const close = Math.round(last.close + (r() - 0.48) * last.close * 0.012)
      $rows = [...$rows.slice(0, -1), { ...last, close, high: Math.max(last.high, close), low: Math.min(last.low, close), vol: last.vol + Math.round(r() * 120) }]
    } else $rows = [...$rows, candle($rows.length, last.close, r)]
  }
  let timer: ReturnType<typeof setInterval> | undefined
  const toggle = () => { $live = !$live; clearInterval(timer); if ($live) timer = setInterval(tick, 650) }
  onCleanup(() => clearInterval(timer))
  return <div class="sc-col">
    <div class="sc-row">
      {() => ($live ? <Button size="sm" icon={pause} on:click={toggle}>Durdur</Button> : <Button size="sm" icon={play} on:click={toggle}>Canlı</Button>)}
      <Button size="sm" variant="ghost" icon={refresh} on:click={() => { $seed++; $rows = market($seed * 31, 90) }}>Yeni veri</Button>
      <span class="m-muted">{() => ($picked ? `Seçilen: ${$picked}` : "Sürükleyip yakınlaş, Tab ile gel, ← → ile mum mum gez")}</span>
    </div>
    {() => {
      const v = props.values
      return <CandlestickChart data={() => $rows} x="date" type={v.type as "candle"} volume={v.volume ? "vol" : undefined}
        ma={v.ma === "short" ? [7, 21] : v.ma === "long" ? [20, 50] : undefined}
        window={v.window === "all" ? undefined : Number(v.window)} navigator={v.navigator} lastPrice={v.lastPrice} zoom={v.zoom}
        grid={v.grid === "none" ? false : v.grid === "both" ? "both" : true}
        marks={v.marks === "line" ? [{ y: 64000, label: "Hedef 64.000", color: "brand-blue" }, { y: "average", color: "neutral" }]
          : v.marks === "band" ? [{ y: [56000, 60000], label: "Destek bölgesi", color: "brand-green" }] : undefined}
        up={v.colors === "brand" ? "brand-blue" : v.colors === "mono" ? "neutral" : undefined}
        down={v.colors === "brand" ? "brand-orange" : v.colors === "mono" ? "--m-text" : undefined}
        format={v.format === "money" ? ["money", "USD"] : "number"}
        animate={v.animate === "spring" ? true : v.animate === "off" ? false : v.animate === "stagger" ? { stagger: 18 } : v.animate}
        labels={{ open: "Açılış", high: "En yüksek", low: "En düşük", close: "Kapanış", volume: "Hacim", change: "Değişim" }} xLabel="Tarih"
        height={v.height} title={v.title || undefined} sync="vitrin-borsa"
        onSelect={(p) => { $picked = `${p.label}: ${Math.round(p.close).toLocaleString("tr-TR")} (${p.change >= 0 ? "+" : ""}${(p.change * 100).toFixed(1)}%)` }} />
    }}
  </div>
}
