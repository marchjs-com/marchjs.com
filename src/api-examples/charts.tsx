// API examples of march/charts: the chart components (SVG, reactive, accessible) and the scale / layout helpers
// they are built on. Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed, For } from "march";
import {
  animateOf, arcLine, arcPath, AreaChart, areaPath, BarChart, BarList, binsOf, BoxPlot, boxStats, BulletChart,
  CandlestickChart, ChordChart, ChoroplethMap, colorScale, ComboChart, countBins, csvText, descendants, exportChart,
  FunnelChart, heatLevel, Heatmap, hierarchy, Histogram, LineChart, linearFit, linePath, loadTurkey, lttb, motionOf,
  NetworkGraph, niceStep, niceTicks, partition, pathBox, PieChart, pieLayout, playMarks, pngBlob, polar, polygonPath,
  presence, ProgressRing, projectGeo, RadarChart, RadialBarChart, regionKey, SankeyChart, scaleBand, scaleLinear,
  scaleTime, ScatterChart, Sparkline, squarify, Stat, statOf, StreamGraph, SunburstChart, svgText, symbolPath, syncGroup,
  timeTicks, Treemap, tween, WaterfallChart, windowed, windowRange,
} from "march/charts";
import type { AnimateProp, Curve, MotionContext, RefStat, WindowProp } from "march/charts";
import { Button, Segmented, Slider } from "march/ui";
import { examples } from "./types.ts";
import { Out, Log, Row } from "./_kit.tsx";
import "./charts.css";
export { default as SIG } from "./charts.sig.gen.ts";

const now = () => new Date().toLocaleTimeString("tr-TR")
const DAY = 864e5, START = Date.UTC(2026, 9, 1)
const wave = (i: number, base: number, amp: number, k: number) => Math.round(base + amp * Math.sin((i + k) / 3) + (amp / 2) * Math.cos((i * 7 + k) / 5) + i * base * 0.006)
const dayRow = (i: number) => ({ day: START + i * DAY, revenue: wave(i, 1200, 260, 1), expenses: wave(i, 760, 180, 4), visits: wave(i, 820, 160, 2) })
/** 30 days of sample figures; `more()` slides the window one day on. */
function useDays(n = 30) {
  let next = n
  const rows = signal(Array.from({ length: n }, (_, i) => dayRow(i)))
  return { rows, more: () => rows.update((l) => [...l.slice(1), dayRow(next++)]) }
}
const CHANNELS = [{ label: "Uygulama", value: 4200 }, { label: "Web", value: 2900 }, { label: "Davet", value: 1800 }, { label: "Kampanya", value: 950 }, { label: "Diğer", value: 610 }]
const SERIES = { revenue: "Gelir", expenses: "Gider" }
const fmtDay = (ms: number) => new Date(ms).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
let seed = 20261126
/** A repeatable pseudo-random number in [0, 1): the demos change the same way on every load. */
const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647
/** `v` moved by up to ±k/2 of itself. */
const vary = (v: number, k = 0.6) => Math.round(v * (1 - k / 2 + rnd() * k))
/** `n` values around `mean` (a rough bell: the sum of three uniforms). */
const sample = (n: number, mean: number, spread: number) => Array.from({ length: n }, () => Math.round((mean + spread * (rnd() + rnd() + rnd() - 1.5)) * 10) / 10)
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"]
type Leaf = { label: string; value?: number; children?: Leaf[] }
const BUDGET_ROWS: Leaf[] = [
  { label: "Ev", children: [{ label: "Kira", value: 18000 }, { label: "Fatura", value: 3200 }] },
  { label: "Yaşam", children: [{ label: "Market", value: 7400 }, { label: "Ulaşım", value: 2600 }, { label: "Eğlence", value: 1800 }] },
  { label: "Birikim", children: [{ label: "Fon", value: 5000 }, { label: "Altın", value: 2500 }] },
]
/** The budget tree with every leaf moved a little. */
const budget = (): Leaf[] => BUDGET_ROWS.map((g) => ({ label: g.label, children: g.children!.map((c) => ({ label: c.label, value: vary(c.value!) })) }))
/** The button every chart demo has: new data, so the change animation plays. */
function Refresh(p: { onClick: () => void; label?: string }) {
  return <Row><Button size="sm" onClick={p.onClick}>{p.label ?? "Verileri değiştir"}</Button></Row>
}
/** A small bar chart whose wrapper element is handed to `into` (the export helpers read it). */
function ExportDemo(p: { into: (el: HTMLElement) => void }) {
  return <div ref={(el: HTMLElement) => p.into(el)}><BarChart data={CHANNELS} x="label" y="value" height={160} title="Kanallar" animate={false} /></div>
}
type Pt = [number, number]
const PTS: (Pt | null)[] = [[10, 70], [50, 30], [90, 55], [130, 20], null, [190, 45], [230, 15], [270, 60], [310, 35]]

export default examples({
  "march/charts": {
    animateOf: {
      code: `animateOf(true)                                   // true
animateOf(() => "out")                            // "out": an accessor (a signal) is read
animateOf(({ index }) => ({ delay: index * 50 }))  // kept as it is: the per-mark form
const how = () => animateOf(props.animate)        // inside your own chart`,
      run: () => {
        const cases: Record<string, AnimateProp | (() => AnimateProp)> = { on: true, read: () => "out", mark: ({ index }: MotionContext) => ({ delay: index * 50 }) }
        const pick = signal("read")
        const shown = () => { const r = animateOf(cases[pick()]!); return typeof r === "function" ? "fonksiyon (işaret başına)" : JSON.stringify(r) }
        return <div class="sc-ex-charts-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={[{ value: "on", label: "true" }, { value: "read", label: "() => \"out\"" }, { value: "mark", label: "(ctx) => …" }]} aria-label="Girdi" />
          <Out label="animateOf" value={shown} />
        </div>
      },
    },
    arcLine: {
      code: `<path d={arcLine(60, 60, 48, 0, Math.PI * 1.5)} fill="none" stroke-width="10" />   // an open arc: a track, a gauge`,
      run: () => {
        const sweep = signal(220)
        const d = () => arcLine(60, 60, 48, (-120 * Math.PI) / 180, ((sweep() - 120) * Math.PI) / 180)
        return <div class="sc-ex-charts-stack">
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={() => `${sweep()}° yay`}>
            <path class="m-chart-series-1 sc-ex-charts-stroke sc-ex-charts-thick sc-ex-charts-faint" d={arcLine(60, 60, 48, (-120 * Math.PI) / 180, (120 * Math.PI) / 180)} />
            <path class="m-chart-series-0 sc-ex-charts-stroke sc-ex-charts-thick" d={d} />
          </svg>
          <Slider value={sweep} onChange={(v: number) => sweep.set(v)} min={0} max={240} step={5} format={(v: number) => `${v}°`} aria-label="Açı" />
          <Out label="d" value={d} />
        </div>
      },
    },
    arcPath: {
      code: `const d = arcPath(60, 60, 50, 30, 0, Math.PI / 2)   // a quarter of a ring
<path d={d} class="slice" />
arcPath(60, 60, 50, 0, 0, Math.PI)                 // half a pie (r0 = 0)`,
      run: () => {
        const sweep = signal(240), inner = signal(28)
        const d = () => arcPath(60, 60, 52, inner(), 0, (sweep() / 180) * Math.PI)
        return <div class="sc-ex-charts-stack">
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={() => `${sweep()}° dilim`}>
            <path class="m-chart-series-1 sc-ex-charts-soft" d={() => arcPath(60, 60, 52, inner(), 0, Math.PI * 2)} />
            <path class="m-chart-series-0 sc-ex-charts-fill" d={d} />
          </svg>
          <Slider value={sweep} onChange={(v: number) => sweep.set(v)} min={0} max={360} step={5} format={(v: number) => `${v}°`} aria-label="Açı" />
          <Segmented value={inner} onChange={(v: number) => inner.set(v)} options={[{ value: 0, label: "Pasta" }, { value: 28, label: "Halka" }, { value: 44, label: "İnce halka" }]} aria-label="İç yarıçap" />
          <Out label="d" value={d} />
        </div>
      },
    },
    AreaChart: {
      code: `<AreaChart data={$days} x="day" y={["revenue", "expenses"]} series={{ revenue: "Gelir", expenses: "Gider" }}
  stacked xFormat="date" format={["money", "TRY"]} height={220} title="Gelir ve gider" />`,
      play: { options: [{ key: "stacked", label: "Yığılmış", default: true }, { key: "legend", label: "Gösterge", default: true }, { key: "zoom", label: "Sürükle yakınlaştır", default: false }] },
      run: (p: { values: { stacked: boolean; legend: boolean; zoom: boolean } }) => {
        const { rows, more } = useDays()
        return <div class="sc-ex-charts-stack">
          <Row><Button size="sm" onClick={more}>Gün ekle</Button></Row>
          <AreaChart data={rows} x="day" y={["revenue", "expenses"]} series={SERIES} stacked={() => p.values.stacked} legend={() => p.values.legend} zoom={() => p.values.zoom}
            xFormat="date" format={["money", "TRY"]} height={220} title="Gelir ve gider" />
        </div>
      },
    },
    areaPath: {
      code: `const base = top.map(([x]) => [x, 100])     // one base point per top point (a stacked band: the layer below)
<path d={areaPath(top, base, "smooth")} />    // nulls in either break the band`,
      run: () => {
        const curve = signal<Curve>("smooth")
        const top = signal<(Pt | null)[]>(PTS)
        const base = () => top().map((p) => (p ? [p[0], 90] as Pt : null))
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => top.set(PTS.map((p) => (p ? [p[0], vary(45, 1.4)] as Pt : null)))}>Verileri değiştir</Button>
            <Segmented value={curve} onChange={(v: Curve) => curve.set(v)} options={[{ value: "linear", label: "linear" }, { value: "smooth", label: "smooth" }, { value: "step", label: "step" }]} aria-label="Eğri" />
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 100" role="img" aria-label="Alan">
            <path class="m-chart-series-0 sc-ex-charts-soft" d={() => areaPath(top(), base(), curve())} />
            <path class="m-chart-series-0 sc-ex-charts-stroke" d={() => linePath(top(), curve())} />
          </svg>
        </div>
      },
    },
    BarChart: {
      code: `<BarChart data={week} x="day" y={["revenue", "expenses"]} series={{ revenue: "Gelir", expenses: "Gider" }}
  orientation="horizontal" stacked onSelect={(p) => open(p.datum)} title="Son 7 gün" />`,
      play: { options: [{ key: "orientation", label: "Yön", default: "vertical", options: [{ value: "vertical", label: "Dikey" }, { value: "horizontal", label: "Yatay" }] }, { key: "stacked", label: "Yığılmış", default: false }, { key: "grid", label: "Izgara", default: true }] },
      run: (p: { values: { orientation: "vertical" | "horizontal"; stacked: boolean; grid: boolean } }) => {
        const log = signal<string[]>([])
        const week = Array.from({ length: 7 }, (_, i) => dayRow(i + 20))
        return <div class="sc-ex-charts-stack">
          <BarChart data={week} x={(r: { day: number }) => new Date(r.day).toLocaleDateString("tr-TR", { weekday: "short" })} y={["revenue", "expenses"]} series={SERIES}
            orientation={() => p.values.orientation} stacked={() => p.values.stacked} grid={() => p.values.grid} format={["money", "TRY"]} height={240} title="Son 7 gün"
            onSelect={(pt) => log.update((l) => [...l, `${now()} ${String(pt.label)}: ${pt.series ?? ""} ${pt.y ?? ""}`])} />
          <Log lines={log} label="Seçilen çubuklar" />
        </div>
      },
    },
    BarList: {
      code: `<BarList data={channels} x="label" y="value" limit={3} format="number" title="Kanallar"
  onSelect={(item) => filterBy(item.label)} />`,
      play: { options: [{ key: "limit", label: "Satır", default: 0, options: [{ value: 3, label: "İlk 3" }, { value: 0, label: "Tümü" }] }, { key: "sort", label: "Büyükten küçüğe", default: true }] },
      run: (p: { values: { limit: number; sort: boolean } }) => {
        const picked = signal("—")
        return <div class="sc-ex-charts-stack">
          <BarList data={CHANNELS} limit={() => p.values.limit || null} sort={() => p.values.sort} format="number" title="Kanallar" onSelect={(it) => picked.set(`${it.rank}. ${it.label} (${it.value})`)} />
          <Out label="seçilen" value={picked} />
        </div>
      },
    },
    binsOf: {
      code: `binsOf([3, 7, 12, 18, 25], { count: 5 })        // [{ index: 0, x0: 0, x1: 5 }, …]: nice thresholds
binsOf(values, { width: 2.5, domain: [0, 30] })   // a fixed width over a fixed range`,
      run: () => {
        const minutes = sample(60, 24, 18)
        const count = signal(8)
        return <div class="sc-ex-charts-stack">
          <Segmented value={count} onChange={(v: number) => count.set(v)} options={[4, 8, 16]} aria-label="Yaklaşık bölme" />
          <Out label="bölme" value={() => binsOf(minutes, { count: count() }).map((b) => `${b.x0}–${b.x1}`).join("  ")} />
        </div>
      },
    },
    BoxPlot: {
      code: `<BoxPlot data={$waits} x="day" y="minutes" mode="both" showPoints format={(v) => \`\${v} dk\`} title="Bekleme süreleri" />
<BoxPlot data={teams} horizontal whisker="minmax" marks={[{ y: 40, label: "Hedef" }]} />`,
      run: () => {
        const gen = () => ["Pzt", "Sal", "Çar", "Per", "Cum"].map((d, i) => ({ day: d, minutes: sample(14, 18 + i * 4, 16 + i * 3) }))
        const rows = signal(gen())
        const mode = signal<"box" | "violin" | "both">("both")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.set(gen())}>Verileri değiştir</Button>
            <Segmented value={mode} onChange={(v: "box" | "violin" | "both") => mode.set(v)} options={[{ value: "box", label: "Kutu" }, { value: "violin", label: "Keman" }, { value: "both", label: "İkisi" }]} aria-label="Biçim" />
          </Row>
          <BoxPlot data={rows} x="day" y="minutes" mode={mode} showPoints format={(v: unknown) => `${v} dk`} height={240} title="Bekleme süreleri" />
        </div>
      },
    },
    boxStats: {
      code: `boxStats([12, 15, 17, 19, 22, 24, 58])
// { n: 7, min: 12, q1, median: 19, q3, max: 58, mean, low, high, outliers: [58] }
boxStats(values, Infinity)   // whiskers reach min / max: no outliers`,
      run: () => {
        const values = signal([12, 15, 17, 19, 22, 24, 58])
        const k = signal(1.5)
        const s = () => boxStats(values(), k())
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => values.update((l) => [...l, vary(l.length % 3 ? 20 : 70)])}>Değer ekle</Button>
            <Segmented value={k} onChange={(v: number) => k.set(v)} options={[{ value: 1.5, label: "1,5 × IQR" }, { value: 3, label: "3 × IQR" }, { value: Infinity, label: "min / max" }]} aria-label="Bıyık" />
          </Row>
          <Out label="değerler" value={() => values().join(", ")} />
          <Row>
            <Out label="medyan" value={() => String(s()?.median)} />
            <Out label="q1–q3" value={() => `${s()?.q1}–${s()?.q3}`} />
            <Out label="bıyık" value={() => `${s()?.low}–${s()?.high}`} />
            <Out label="uç değer" value={() => s()?.outliers.join(", ") || "—"} />
          </Row>
        </div>
      },
    },
    BulletChart: {
      code: `<BulletChart data={$kpis} title="Çeyrek hedefleri" />
<BulletChart data={{ label: "Gelir", value: 270, target: 250, ranges: [150, 225, 300] }} compact />`,
      run: () => {
        const gen = () => [
          { label: "Gelir", subtitle: "bin ₺", value: vary(260), target: 250, previous: 230, ranges: [150, 225, 300] },
          { label: "Yeni üye", subtitle: "kişi", value: vary(1400), target: 1600, previous: 1300, ranges: [900, 1400, 2000] },
          { label: "Memnuniyet", subtitle: "100 üzerinden", value: vary(78, 0.3), target: 85, previous: 74, ranges: [60, 80, 100] },
        ]
        const rows = signal(gen())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => rows.set(gen())} />
          <BulletChart data={rows} rangeTone="traffic" title="Çeyrek hedefleri" />
        </div>
      },
    },
    CandlestickChart: {
      code: `<CandlestickChart data={$prices} x="date" volume="vol" ma={[5]} window={30} format={["money", "TRY"]} title="Hisse" />
<CandlestickChart data={history} type="ohlc" marks={[{ y: 120, label: "Hedef" }]} />`,
      run: () => {
        let last = 100, day = 0
        const candle = () => {
          const open = last, close = Math.round((open + (rnd() - 0.48) * 6) * 100) / 100
          last = close
          return { date: new Date(START + day++ * DAY), open, close, high: Math.max(open, close) + Math.round(rnd() * 250) / 100, low: Math.min(open, close) - Math.round(rnd() * 250) / 100, vol: vary(5000) }
        }
        const rows = signal(Array.from({ length: 30 }, candle))
        const type = signal<"candle" | "ohlc" | "line">("candle")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.update((l) => [...l, candle()])}>Yeni gün</Button>
            <Segmented value={type} onChange={(v: "candle" | "ohlc" | "line") => type.set(v)} options={[{ value: "candle", label: "Mum" }, { value: "ohlc", label: "OHLC" }, { value: "line", label: "Çizgi" }]} aria-label="Tür" />
          </Row>
          <CandlestickChart data={rows} x="date" volume="vol" ma={[5]} window={30} type={type} format={["money", "TRY"]} height={260} title="Hisse" />
        </div>
      },
    },
    ChordChart: {
      code: `<ChordChart matrix={$moves} names={["İzmir", "Ankara", "İstanbul", "Bursa"]} title="Şehirler arası taşınma" />
<ChordChart data={transfers} directed format={["money", "TRY"]} ribbonColor="target" />`,
      run: () => {
        const names = ["İzmir", "Ankara", "İstanbul", "Bursa"]
        const gen = () => names.map((_, i) => names.map((_, j) => (i === j ? 0 : vary(i === 2 || j === 2 ? 90 : 35))))
        const matrix = signal(gen())
        const directed = signal(false)
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => matrix.set(gen())}>Verileri değiştir</Button>
            <Segmented value={directed} onChange={(v: boolean) => directed.set(v)} options={[{ value: false, label: "Toplam" }, { value: true, label: "Yönlü" }]} aria-label="Yön" />
          </Row>
          <ChordChart matrix={matrix} names={names} directed={directed} height={260} title="Şehirler arası taşınma" />
        </div>
      },
    },
    ChoroplethMap: {
      code: `<ChoroplethMap data={$population} id="plate" value="people" format="compact" title="Nüfus" />
<ChoroplethMap data={growth} colorScale="diverging" mid={0} format={["percent", 1]} legend="right" />`,
      run: () => {
        const gen = () => Array.from({ length: 81 }, (_, i) => ({ plate: i + 1, change: Math.round((rnd() - 0.4) * 200) / 10 }))
        const rows = signal(gen())
        const scale = signal<"sequential" | "diverging">("diverging")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.set(gen())}>Verileri değiştir</Button>
            <Segmented value={scale} onChange={(v: "sequential" | "diverging") => scale.set(v)} options={[{ value: "sequential", label: "Sıralı" }, { value: "diverging", label: "Ayrışan" }]} aria-label="Renk ölçeği" />
          </Row>
          <ChoroplethMap data={rows} id="plate" value="change" colorScale={scale} mid={0} format={(v: unknown) => `%${v}`} title="Yıllık nüfus değişimi" />
        </div>
      },
    },
    colorScale: {
      code: `const color = colorScale("sequential", 0, 100)
<rect style={{ fill: color(42) }} />            // a color-mix between theme colors (CSP safe)
colorScale("diverging", -10, 10, 0)             // below 0 ↔ above 0
colorScale(["#e0f2fe", "#0369a1"], lo, hi)      // your own ends`,
      run: () => {
        const kind = signal("sequential")
        const scales: Record<string, Parameters<typeof colorScale>[0]> = { sequential: "sequential", diverging: "diverging", own: ["#fde68a", "#7c3aed"] }
        const values = [-10, -6, -3, 0, 3, 6, 10]
        const color = () => colorScale(scales[kind()], -10, 10, 0)
        return <div class="sc-ex-charts-stack">
          <Segmented value={kind} onChange={(v: string) => kind.set(v)} options={[{ value: "sequential", label: "Sıralı" }, { value: "diverging", label: "Ayrışan" }, { value: "own", label: "İki renk" }]} aria-label="Ölçek" />
          <ul class="sc-ex-charts-swatches">{values.map((v) => <li>
            <svg viewBox="0 0 28 28" aria-hidden="true"><rect style={() => ({ fill: color()(v) })} width="28" height="28" rx="4" /></svg>
            <span>{v}</span>
          </li>)}</ul>
        </div>
      },
    },
    ComboChart: {
      code: `<ComboChart data={$months} x="month" y={[{ key: "orders", type: "bar", label: "Sipariş" },
  { key: "margin", type: "line", axis: "right", curve: "smooth", label: "Marj" }]}
  y2Format="percent" yTitle="Sipariş" y2Title="Marj" />`,
      run: () => {
        const gen = () => MONTHS.map((month) => ({ month, orders: vary(420), margin: vary(22, 0.5) / 100 }))
        const rows = signal(gen())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => rows.set(gen())} />
          <ComboChart data={rows} x="month" y={[{ key: "orders", type: "bar", label: "Sipariş" }, { key: "margin", type: "line", axis: "right", curve: "smooth", label: "Marj" }]}
            y2Format="percent" yTitle="Sipariş" y2Title="Marj" height={240} title="Sipariş ve marj" />
        </div>
      },
    },
    countBins: {
      code: `const bins = binsOf(minutes, { count: 8 })
countBins(minutes, bins)   // [2, 5, 9, …]: values in [x0, x1); the last bin includes its upper edge`,
      run: () => {
        const values = signal(sample(80, 24, 20))
        const bins = () => binsOf(values(), { count: 8 })
        const counts = () => countBins(values(), bins())
        const max = () => Math.max(1, ...counts())
        return <div class="sc-ex-charts-stack">
          <Refresh label="Yeni örnek" onClick={() => values.set(sample(80, 24, 20))} />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 100" role="img" aria-label={() => `Sayılar: ${counts().join(", ")}`}>
            {() => counts().map((c, i) => { const w = 300 / counts().length; return <g>
              <rect class="m-chart-series-0 sc-ex-charts-fill" x={10 + i * w} y={82 - (c / max()) * 70} width={w - 2} height={(c / max()) * 70} />
              <text x={10 + i * w + w / 2} y="96" text-anchor="middle">{c}</text>
            </g> })}
          </svg>
        </div>
      },
    },
    csvText: {
      code: `const csv = csvText(chartEl)   // the chart's data table as CSV (UTF-8 BOM, formula safe)`,
      run: () => {
        let box: HTMLElement | null = null
        const lines = signal<string[]>([])
        return <div class="sc-ex-charts-stack">
          <ExportDemo into={(el) => { box = el }} />
          <Row><Button size="sm" onClick={() => box && lines.set(csvText(box).replace(/^﻿/, "").split("\r\n"))}>CSV oluştur</Button></Row>
          <Log lines={lines} label="CSV satırları" />
        </div>
      },
    },
    descendants: {
      code: `descendants(root)      // every node below the root, pre-order
descendants(root, 1)   // only the top level`,
      run: () => {
        const depth = signal(2)
        const root = hierarchy(BUDGET_ROWS)
        return <div class="sc-ex-charts-stack">
          <Segmented value={depth} onChange={(v: number) => depth.set(v)} options={[{ value: 1, label: "1 düzey" }, { value: 2, label: "2 düzey" }]} aria-label="En fazla derinlik" />
          <ul class="sc-ex-charts-list">{() => descendants(root, depth()).map((n) => <li><span>{"· ".repeat(n.depth - 1)}{n.label}</span><code>{n.value}</code></li>)}</ul>
        </div>
      },
    },
    exportChart: {
      code: `await exportChart(chartEl, "png", { filename: "kanallar" })          // saves kanallar.png
const svg = await exportChart(chartEl, "svg", { download: false })   // only builds it
<BarChart export={["png", "csv"]} … />                               // or the chart's own buttons`,
      run: () => {
        let box: HTMLElement | null = null
        const out = signal("—")
        return <div class="sc-ex-charts-stack">
          <ExportDemo into={(el) => { box = el }} />
          <Row>
            <Button size="sm" onClick={() => box && exportChart(box, "png", { filename: "kanallar" })}>PNG indir</Button>
            <Button size="sm" variant="ghost" onClick={() => box && exportChart(box, "svg", { download: false }).then((t) => out.set(`${String(t).length.toLocaleString("tr-TR")} karakter SVG`))}>SVG (indirmeden)</Button>
          </Row>
          <Out label="sonuç" value={out} />
        </div>
      },
    },
    FunnelChart: {
      code: `<FunnelChart data={$steps} x="stage" y="people" title="Ödeme adımları" />
<FunnelChart data={signups} shape="bars" orientation="horizontal" conversionFormat={["percent", 0]} />`,
      run: () => {
        const gen = () => { let n = 12000; return ["Ziyaret", "Sepet", "Ödeme", "Satın alma"].map((stage, i) => ({ stage, people: i ? (n = vary(n * 0.45, 0.4)) : n })) }
        const rows = signal(gen())
        const shape = signal<"funnel" | "bars" | "pyramid">("funnel")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.set(gen())}>Verileri değiştir</Button>
            <Segmented value={shape} onChange={(v: "funnel" | "bars" | "pyramid") => shape.set(v)} options={[{ value: "funnel", label: "Huni" }, { value: "bars", label: "Çubuk" }, { value: "pyramid", label: "Piramit" }]} aria-label="Biçim" />
          </Row>
          <FunnelChart data={rows} x="stage" y="people" shape={shape} height={260} title="Ödeme adımları" />
        </div>
      },
    },
    heatLevel: {
      code: `heatLevel(0, 40)        // 0 (empty)
heatLevel(12, 40)       // 2 of 0…4
heatLevel(40, 40, 3)    // 2 (three levels)
<rect class={\`m-heat-cell m-heat-\${heatLevel(v, max)}\`} />`,
      run: () => {
        const levels = signal(5)
        const values = [0, 3, 9, 14, 21, 28, 35, 40]
        return <div class="sc-ex-charts-stack">
          <Segmented value={levels} onChange={(v: number) => levels.set(v)} options={[{ value: 3, label: "3 düzey" }, { value: 4, label: "4 düzey" }, { value: 5, label: "5 düzey" }]} aria-label="Düzey" />
          <ul class="sc-ex-charts-swatches">{values.map((v) => <li>
            <svg viewBox="0 0 28 28" aria-hidden="true"><rect class={() => `m-heat-cell m-heat-${heatLevel(v, 40, levels())}`} width="28" height="28" rx="4" /></svg>
            <span>{v} → {() => heatLevel(v, 40, levels())}</span>
          </li>)}</ul>
        </div>
      },
    },
    Heatmap: {
      code: `<Heatmap data={visits} x="hour" y="weekday" value="count" yFormat={(d) => days[d]} title="Yoğun saatler" />
<Heatmap data={commits} x="date" value="count" calendar={{ weeks: 12 }} title="Etkinlik" />`,
      play: { options: [{ key: "calendar", label: "Takvim", default: false }, { key: "levels", label: "Düzey", default: 5, options: [3, 4, 5] }] },
      run: (p: { values: { calendar: boolean; levels: number } }) => {
        const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
        const grid: { h: number; d: number; v: number }[] = []
        for (let d = 0; d < 7; d++) for (let h = 8; h < 20; h++) grid.push({ h, d, v: Math.max(0, Math.round((d < 5 ? 30 : 12) * Math.sin(((h - 7) / 13) * Math.PI) + ((h * 7 + d * 3) % 7))) })
        const end = new Date(2026, 10, 10)
        const daily = Array.from({ length: 84 }, (_, i) => ({ date: new Date(end.getTime() - (83 - i) * DAY), count: (i * 13) % 9 > 2 ? (i * 7) % 11 : 0 }))
        return <div>{() => (p.values.calendar
          ? <Heatmap data={daily} x="date" value="count" calendar={{ weeks: 12 }} end={end} levels={() => p.values.levels} title="Günlük etkinlik" valueLabel="kayıt" />
          : <Heatmap data={grid} x="h" y="d" value="v" yFormat={(d: unknown) => days[d as number]} levels={() => p.values.levels} title="Yoğun saatler" valueLabel="ziyaret" />)}</div>
      },
    },
    hierarchy: {
      code: `const root = hierarchy(budget)   // a list of top rows: a synthetic root above them
root.value                       // the sum of every leaf
root.children[0].label           // "Ev"
hierarchy(org, { children: "team", value: "size", label: "name" })`,
      run: () => {
        const data = signal(budget())
        const root = computed(() => hierarchy(data()))
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => data.set(budget())} />
          <ul class="sc-ex-charts-list">{() => root().children.map((n) => <li><span>{n.label} ({n.children.length} alt)</span><code>{n.value}</code></li>)}</ul>
          <Out label="root.value" value={() => String(root().value)} />
        </div>
      },
    },
    Histogram: {
      code: `<Histogram data={$times} bins={20} curve="kde" marks={[{ x: "median" }, { x: 30, label: "Hedef" }]}
  xFormat={(v) => \`\${v} dk\`} title="Teslimat süreleri" />`,
      run: () => {
        const times = signal(sample(160, 26, 26))
        const bins = signal(12)
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => times.set(sample(160, vary(26, 0.4), 26))}>Yeni örnek</Button>
            <Segmented value={bins} onChange={(v: number) => bins.set(v)} options={[6, 12, 24]} aria-label="Bölme" />
          </Row>
          <Histogram data={times} bins={bins} curve="kde" marks={[{ x: "median" }, { x: 30, label: "Hedef" }]} xFormat={(v: unknown) => `${v} dk`} height={220} title="Teslimat süreleri" />
        </div>
      },
    },
    linearFit: {
      code: `const fit = linearFit([[1, 2], [2, 4.1], [3, 5.9]])   // { slope: 1.95, intercept: 0.1, r2: 0.999, n: 3 }
fit && fit.intercept + fit.slope * 4                   // the prediction at x = 4`,
      run: () => {
        const noise = signal(1)
        const gen = () => Array.from({ length: 16 }, (_, i) => [i, Math.round((2 + 0.5 * i + (rnd() - 0.5) * 4 * noise()) * 10) / 10] as Pt)
        const pts = signal(gen())
        const fit = () => linearFit(pts())
        const X = (x: number) => 12 + x * 19, Y = (y: number) => 92 - y * 6
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => pts.set(gen())}>Yeni noktalar</Button>
            <Segmented value={noise} onChange={(v: number) => { noise.set(v); pts.set(gen()) }} options={[{ value: 0.2, label: "Az gürültü" }, { value: 1, label: "Orta" }, { value: 3, label: "Çok" }]} aria-label="Gürültü" />
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 100" role="img" aria-label="Noktalar ve doğru">
            {() => pts().map(([x, y]) => <circle class="m-chart-series-0 sc-ex-charts-dot" cx={X(x)} cy={Y(y)} r="3.5" />)}
            {() => { const f = fit(); return f ? <line class="m-chart-series-1 sc-ex-charts-stroke" x1={X(0)} y1={Y(f.intercept)} x2={X(15)} y2={Y(f.intercept + f.slope * 15)} /> : null }}
          </svg>
          <Row>
            <Out label="slope" value={() => fit()?.slope.toFixed(3) ?? "—"} />
            <Out label="intercept" value={() => fit()?.intercept.toFixed(2) ?? "—"} />
            <Out label="r²" value={() => fit()?.r2.toFixed(3) ?? "—"} />
          </Row>
        </div>
      },
    },
    LineChart: {
      code: `<LineChart data={$days} x="day" y={["revenue", "expenses"]} series={{ revenue: "Gelir", expenses: "Gider" }}
  format={["money", "TRY"]} xFormat="date" zoom grid="both" height={240} title="Gelir ve gider" />`,
      play: { options: [{ key: "grid", label: "Izgara", default: "y", options: [{ value: "y", label: "Yatay" }, { value: "both", label: "İkisi" }, { value: "none", label: "Yok" }] }, { key: "zoom", label: "Sürükle yakınlaştır", default: true }, { key: "zero", label: "Sıfırdan başla", default: false }] },
      run: (p: { values: { grid: string; zoom: boolean; zero: boolean } }) => {
        const { rows, more } = useDays()
        return <div class="sc-ex-charts-stack">
          <Row><Button size="sm" onClick={more}>Gün ekle</Button><Out label="son gün" value={() => fmtDay(rows()[rows().length - 1]!.day)} /></Row>
          <LineChart data={rows} x="day" y={["revenue", "expenses"]} series={SERIES} format={["money", "TRY"]} xFormat="date" height={240} title="Gelir ve gider"
            grid={() => (p.values.grid === "none" ? false : p.values.grid === "both" ? "both" : true)} zoom={() => p.values.zoom} zero={() => p.values.zero} />
        </div>
      },
    },
    linePath: {
      code: `linePath([[0, 40], [40, 10], [80, 30], null, [140, 20]], "smooth")   // null leaves a gap
linePath(points, "step-after", true)                                  // connect: skip the nulls`,
      run: () => {
        const curve = signal<Curve>("smooth"), connect = signal(false)
        return <div class="sc-ex-charts-stack">
          <Segmented value={curve} onChange={(v: Curve) => curve.set(v)} options={["linear", "smooth", "step", "step-after"]} aria-label="Eğri" />
          <Segmented value={connect} onChange={(v: boolean) => connect.set(v)} options={[{ value: false, label: "Boşluk bırak" }, { value: true, label: "Birleştir" }]} aria-label="null" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 80" role="img" aria-label="Çizgi">
            <path class="m-chart-series-0 sc-ex-charts-stroke" d={() => linePath(PTS, curve(), connect())} />
            {PTS.map((p) => (p ? <circle class="m-chart-series-0 sc-ex-charts-dot" cx={p[0]} cy={p[1]} r="3" /> : null))}
          </svg>
          <Out label="d" value={() => linePath(PTS, curve(), connect())} />
        </div>
      },
    },
    loadTurkey: {
      code: `loadTurkey()                                       // prefetch the Turkey map chunk (~29 KB) early
const { TURKEY, TURKEY_VIEWBOX } = await loadTurkey()   // 81 provinces: { id, code, name, d, cx, cy }`,
      run: () => {
        const map = signal<Awaited<ReturnType<typeof loadTurkey>> | null>(null)
        const t0 = signal(0), took = signal("—")
        return <div class="sc-ex-charts-stack">
          <Row><Button size="sm" onClick={() => { t0.set(performance.now()); loadTurkey().then((m) => { map.set(m); took.set(`${m.TURKEY.length} il · ${Math.round(performance.now() - t0())} ms`) }) }}>Haritayı yükle</Button><Out label="sonuç" value={took} /></Row>
          {() => { const m = map(); return m ? <svg class="sc-ex-charts-svg" viewBox={`0 0 ${m.TURKEY_VIEWBOX[0]} ${m.TURKEY_VIEWBOX[1]}`} role="img" aria-label="Türkiye illeri">
            {m.TURKEY.map((p, i) => <path class={`m-chart-series-${i % 6} sc-ex-charts-fill sc-ex-charts-region`} d={p.d}><title>{p.name}</title></path>)}
          </svg> : null }}
        </div>
      },
    },
    lttb: {
      code: `const shown = lttb(points, 120)                       // [x, y] pairs or { x, y }
lttb(rows, 200, (r) => r.time, (r) => r.latency)      // custom fields`,
      run: () => {
        const n = 3000
        const points = Array.from({ length: n }, (_, i) => [i, Math.round(50 + 30 * Math.sin(i / 160) + 12 * Math.sin(i / 23) + ((i * 7919) % 17) - 8 + (i % 997 === 0 ? 40 : 0))] as [number, number])
        const keep = signal(120)
        const down = computed(() => lttb(points, keep()))
        return <div class="sc-ex-charts-stack">
          <Segmented value={keep} onChange={(v: number) => keep.set(v)} options={[{ value: 30, label: "30" }, { value: 120, label: "120" }, { value: 600, label: "600" }]} aria-label="Nokta" />
          <Sparkline data={() => down().map((p) => p[1])} width="100%" height={64} area title="Seyreltilmiş seri" />
          <Out label="nokta" value={() => `${n.toLocaleString("tr-TR")} → ${down().length}`} />
        </div>
      },
    },
    motionOf: {
      code: `motionOf({ easing: "out", stagger: 80 }, { index: 2, key: "b", phase: "enter" })
// { easing: "out", duration: 600, delay: 160 }
motionOf({ exit: false }, { index: 0, key: "a", phase: "exit" })   // null: jump`,
      run: () => {
        const easing = signal("out"), phase = signal<MotionContext["phase"]>("enter")
        return <div class="sc-ex-charts-stack">
          <Segmented value={easing} onChange={(v: string) => easing.set(v)} options={["spring", "out", "bounce"]} aria-label="Yumuşatma" />
          <Segmented value={phase} onChange={(v: MotionContext["phase"]) => phase.set(v)} options={["enter", "update", "exit"]} aria-label="Evre" />
          <ul class="sc-ex-charts-list">{() => [0, 1, 2, 3].map((index) => <li><span>index {index}</span>
            <code>{JSON.stringify(motionOf({ easing: easing(), stagger: 80, exit: false }, { index, key: String(index), phase: phase() }))}</code></li>)}</ul>
        </div>
      },
    },
    NetworkGraph: {
      code: `<NetworkGraph nodes={$people} links={$follows} group="team" directed title="Takip ağı" />
<NetworkGraph links={edges} layout="circle" labels="hover" onSelect={(n) => open(n.id)} />`,
      run: () => {
        const teams = ["Tasarım", "Ürün", "Veri"]
        const nodes = signal(["Ada", "Bora", "Cem", "Defne", "Ece", "Fırat", "Gül"].map((id, i) => ({ id, team: teams[i % 3] })))
        const links = signal([["Ada", "Bora"], ["Ada", "Cem"], ["Bora", "Defne"], ["Cem", "Ece"], ["Defne", "Fırat"], ["Ece", "Gül"], ["Gül", "Ada"]].map(([source, target]) => ({ source, target })))
        const layout = signal<"force" | "circle" | "grid">("force")
        const add = () => {
          const id = `Kişi ${nodes().length + 1}`, list = nodes()
          nodes.set([...list, { id, team: teams[list.length % 3] }])
          links.update((l) => [...l, { source: id, target: list[Math.floor(rnd() * list.length)]!.id }])
        }
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={add}>Kişi ekle</Button>
            <Segmented value={layout} onChange={(v: "force" | "circle" | "grid") => layout.set(v)} options={[{ value: "force", label: "Kuvvet" }, { value: "circle", label: "Çember" }, { value: "grid", label: "Izgara" }]} aria-label="Yerleşim" />
          </Row>
          <NetworkGraph nodes={nodes} links={links} group="team" layout={layout} directed height={280} title="Takip ağı" />
        </div>
      },
    },
    niceStep: {
      code: `niceStep(870)       // 200 (870 / 5 ≈ 174 → 200)
niceStep(870, 10)   // 100
niceStep(0.37)      // 0.1`,
      run: () => {
        const span = signal(870), count = signal(5)
        return <div class="sc-ex-charts-stack">
          <Slider value={span} onChange={(v: number) => span.set(v)} min={1} max={5000} step={1} format={(v: number) => `aralık ${v}`} aria-label="Aralık" />
          <Segmented value={count} onChange={(v: number) => count.set(v)} options={[3, 5, 10]} aria-label="Parça" />
          <Row><Out label="niceStep" value={() => String(niceStep(span(), count()))} /><Out label="ham adım" value={() => (span() / count()).toFixed(1)} /></Row>
        </div>
      },
    },
    niceTicks: {
      code: `niceTicks(13, 87)      // { min: 0, max: 100, step: 20, ticks: [0, 20, 40, 60, 80, 100] }
niceTicks(0.2, 0.93, 4)`,
      run: () => {
        const lo = signal(13), hi = signal(87)
        const t = () => niceTicks(lo(), hi())
        const x = () => scaleLinear([t().min, t().max], [12, 308])
        return <div class="sc-ex-charts-stack">
          <Slider value={lo} onChange={(v: number) => lo.set(v)} min={-200} max={200} step={1} format={(v: number) => `min ${v}`} aria-label="En küçük" />
          <Slider value={hi} onChange={(v: number) => hi.set(v)} min={-200} max={900} step={1} format={(v: number) => `max ${v}`} aria-label="En büyük" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 44" role="img" aria-label={() => `Çentikler: ${t().ticks.join(", ")}`}>
            <rect class="m-chart-series-0 sc-ex-charts-soft" x={() => Math.min(x()(lo()), x()(hi()))} y="8" width={() => Math.abs(x()(hi()) - x()(lo()))} height="10" />
            <line class="sc-ex-charts-axis" x1="12" x2="308" y1="22" y2="22" />
            {() => t().ticks.map((v) => <g><line class="sc-ex-charts-tick" x1={x()(v)} x2={x()(v)} y1="18" y2="26" /><text x={x()(v)} y="38" text-anchor="middle">{v}</text></g>)}
          </svg>
          <Out label="step" value={() => String(t().step)} />
        </div>
      },
    },
    partition: {
      code: `const spans = partition(hierarchy(budget))   // Map: node → [a0, a1] in radians
[...spans].map(([n, [a0, a1]]) => n.depth > 0 && <path d={arcPath(60, 60, 18 + n.depth * 19, 1 + n.depth * 19, a0, a1)} />)`,
      run: () => {
        const data = signal(budget())
        const spans = () => [...partition(hierarchy(data()))].filter(([n]) => n.depth > 0)
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => data.set(budget())} />
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="160" height="160" role="img" aria-label="Bölümler">
            {() => spans().map(([n, [a0, a1]]) => <path class={`m-chart-series-${n.branch} ${n.depth > 1 ? "sc-ex-charts-soft" : "sc-ex-charts-fill"}`} d={arcPath(60, 60, 18 + n.depth * 19, 2 + n.depth * 19, a0, a1 - 0.01)}><title>{n.label}: {n.value}</title></path>)}
          </svg>
        </div>
      },
    },
    pathBox: {
      code: `pathBox("M10,20L90,20L60,80Z")   // [10, 20, 90, 80]: x0, y0, x1, y1 (curve control points ignored)`,
      run: () => {
        const shapes: Record<string, string> = { "Üçgen": "M10,20L90,20L60,80Z", "Yıldız": polygonPath(60, 55, [45, 18, 45, 18, 45, 18, 45, 18, 45, 18]), "Yay": arcLine(60, 70, 50, -1.2, 1.2) }
        const pick = signal("Yıldız")
        const box = () => pathBox(shapes[pick()]!)
        return <div class="sc-ex-charts-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(shapes)} aria-label="Şekil" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 110" width="140" role="img" aria-label="Yol ve kutusu">
            <rect class="sc-ex-charts-box" x={() => box()[0]} y={() => box()[1]} width={() => box()[2] - box()[0]} height={() => box()[3] - box()[1]} />
            <path class="m-chart-series-0 sc-ex-charts-stroke" d={() => shapes[pick()]!} />
          </svg>
          <Out label="pathBox" value={() => JSON.stringify(box())} />
        </div>
      },
    },
    PieChart: {
      code: `<PieChart data={channels} x="label" y="value" donut center="Kanallar" legend="right"
  onSelect={(p) => show(p.label, p.share)} title="Kanal payı" />`,
      play: { options: [{ key: "donut", label: "Halka", default: true }, { key: "legend", label: "Gösterge", default: "bottom", options: [{ value: "right", label: "Sağda" }, { value: "bottom", label: "Altta" }, { value: "none", label: "Yok" }] }] },
      run: (p: { values: { donut: boolean; legend: string } }) => {
        const picked = signal("—")
        return <div class="sc-ex-charts-stack">
          <PieChart data={CHANNELS} x="label" y="value" donut={() => p.values.donut} legend={() => (p.values.legend === "none" ? false : p.values.legend as "right" | "bottom")}
            height={220} title="Kanal payı" onSelect={(pt) => picked.set(`${pt.label}: %${Math.round(pt.share * 100)}`)} />
          <Out label="seçilen dilim" value={picked} />
        </div>
      },
    },
    pieLayout: {
      code: `pieLayout([3, 1])
// [{ start: 0, end: 4.712, value: 3, share: 0.75 }, { start: 4.712, end: 6.283, value: 1, share: 0.25 }]
pieLayout(values, { padAngle: 0.04 })   // a gap between slices`,
      run: () => {
        const values = signal([4200, 2900, 1800])
        const pad = signal(0.04)
        const slices = () => pieLayout(values(), { padAngle: pad() })
        const deg = (r: number) => Math.round((r * 180) / Math.PI)
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => values.update((l) => (l.length < 6 ? [...l, 600 + l.length * 350] : [4200]))}>Dilim ekle</Button>
            <Segmented value={pad} onChange={(v: number) => pad.set(v)} options={[{ value: 0, label: "Boşluksuz" }, { value: 0.04, label: "padAngle 0,04" }, { value: 0.15, label: "0,15" }]} aria-label="Boşluk" />
          </Row>
          <div class="sc-ex-charts-row">
            <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Dilimler">
              {() => slices().map((s, i) => <path class={`m-chart-series-${i} sc-ex-charts-fill`} d={arcPath(60, 60, 54, 26, s.start, s.end)} />)}
            </svg>
            <ul class="sc-ex-charts-list">{() => slices().map((s) => <li><span>{s.value}</span><span>{deg(s.start)}°–{deg(s.end)}° · %{Math.round(s.share * 100)}</span></li>)}</ul>
          </div>
        </div>
      },
    },
    playMarks: {
      code: `playMarks(values.length, { easing: "out", stagger: 90 }, "enter", (i) => keys[i], (p) => {
  heights.set(values.map((v, i) => v * p(i)))   // p(i): bar i's eased progress 0…1, once per frame
})   // → { cancel() }, or null when nothing animates (then jump)`,
      run: () => {
        const values = [40, 70, 55, 90, 30, 65]
        const heights = signal(values), easing = signal("out")
        let run: { cancel(): void } | null = null
        const play = () => { run?.cancel(); run = playMarks(values.length, { easing: easing(), stagger: 90 }, "enter", (i) => String(i), (p) => heights.set(values.map((v, i) => v * p(i)))); if (!run) heights.set(values) }
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={play}>Oynat</Button>
            <Segmented value={easing} onChange={(v: string) => easing.set(v)} options={["out", "spring", "bounce"]} aria-label="Yumuşatma" />
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 100" role="img" aria-label="Sırayla büyüyen çubuklar">
            {values.map((_, i) => <rect class="m-chart-series-0 sc-ex-charts-fill" x={14 + i * 50} width="40" y={() => 96 - heights()[i]!} height={() => Math.max(0, heights()[i]!)} rx="3" />)}
          </svg>
        </div>
      },
    },
    pngBlob: {
      code: `const blob = await pngBlob(chartEl, 2)   // a PNG Blob at 2× (needs img-src blob: under a CSP)
navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])`,
      run: () => {
        let box: HTMLElement | null = null
        const out = signal("—")
        return <div class="sc-ex-charts-stack">
          <ExportDemo into={(el) => { box = el }} />
          <Row><Button size="sm" onClick={() => box && pngBlob(box, 2).then((b) => out.set(`${b.type} · ${(b.size / 1024).toFixed(1)} KB`), (e: Error) => out.set(e.message))}>PNG oluştur</Button><Out label="Blob" value={out} /></Row>
        </div>
      },
    },
    polar: {
      code: `polar(60, 60, 50, 0)             // [60, 10]: 12 o'clock
polar(60, 60, 50, Math.PI / 2)   // [110, 60]: angles run clockwise`,
      run: () => {
        const deg = signal(60)
        const p = () => polar(60, 60, 48, (deg() * Math.PI) / 180)
        return <div class="sc-ex-charts-stack">
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={() => `${deg()}°`}>
            <circle class="sc-ex-charts-axis sc-ex-charts-none" cx="60" cy="60" r="48" />
            <line class="m-chart-series-0 sc-ex-charts-stroke" x1="60" y1="60" x2={() => p()[0]} y2={() => p()[1]} />
            <circle class="m-chart-series-0 sc-ex-charts-dot" cx={() => p()[0]} cy={() => p()[1]} r="6" />
          </svg>
          <Slider value={deg} onChange={(v: number) => deg.set(v)} min={0} max={360} step={5} format={(v: number) => `${v}°`} aria-label="Açı" />
          <Out label="[x, y]" value={() => p().map((v) => v.toFixed(1)).join(", ")} />
        </div>
      },
    },
    polygonPath: {
      code: `polygonPath(60, 60, [50, 30, 45, 20, 40])   // a radar shape: radius i at angle i·2π/5
polygonPath(60, 60, [50, 50, 50, 50, 50])   // a grid ring`,
      run: () => {
        const radii = signal([50, 30, 45, 20, 40])
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => radii.set(radii().map(() => vary(34, 1)))}>Verileri değiştir</Button>
            <Button size="sm" variant="ghost" onClick={() => radii.update((l) => (l.length < 8 ? [...l, 40] : l.slice(0, 3)))}>Köşe ekle</Button>
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="Çokgen">
            {() => [18, 36, 54].map((r) => <path class="sc-ex-charts-axis sc-ex-charts-none" d={polygonPath(60, 60, radii().map(() => r))} />)}
            <path class="m-chart-series-0 sc-ex-charts-soft" d={() => polygonPath(60, 60, radii())} />
            <path class="m-chart-series-0 sc-ex-charts-stroke" d={() => polygonPath(60, 60, radii())} />
          </svg>
        </div>
      },
    },
    presence: {
      code: `const live = presence(items, (t) => t.id, how)   // the items + the ones leaving (flagged \`leaving\`)
<For each={live.items} key="id">{(t) => {
  const g = tween(() => ({ w: t().leaving ? 0 : t().value }), ["w"], how, (to) => ({ w: 0 }),
    { leaving: () => !!t().leaving, onSettle: () => t().leaving && live.done(t().id) })
  return <rect width={() => g().w} />
}}</For>`,
      run: () => {
        type Item = { id: string; value: number; leaving?: boolean }
        let next = 4
        const items = signal<Item[]>([{ id: "A", value: 220 }, { id: "B", value: 150 }, { id: "C", value: 260 }])
        const how = (): AnimateProp => ({ easing: "out", duration: 500 })
        const live = presence(items, (t) => t.id, how)
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => items.update((l) => [...l, { id: String.fromCharCode(64 + next++), value: vary(200) }])}>Ekle</Button>
            <Button size="sm" variant="ghost" onClick={() => items.update((l) => l.filter((_, i) => i !== Math.floor(rnd() * l.length)))}>Rastgele sil</Button>
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 150" role="img" aria-label="Öğeler">
            <For each={live.items} key="id">{(t: () => Item, i: () => number) => {
              const g = tween(() => ({ w: t().leaving ? 0 : t().value }), ["w"], how, () => ({ w: 0 }), { index: i, leaving: () => !!t().leaving, onSettle: () => { if (t().leaving) live.done(t().id) } })
              return <g>
                <text x="0" y={() => i() * 18 + 12}>{() => t().id}</text>
                <rect class={() => `m-chart-series-${t().leaving ? 3 : 0} sc-ex-charts-fill`} x="14" y={() => i() * 18 + 2} height="13" width={() => Math.max(0, g().w)} rx="3" />
              </g>
            }}</For>
          </svg>
        </div>
      },
    },
    ProgressRing: {
      code: `<ProgressRing value={82} label="Sağlık" />
<ProgressRing value={$done} max={$total} thresholds={[40, 75]} size={88} thickness={10} format={(v) => \`\${v}/\${$total}\`} />`,
      play: { options: [{ key: "value", label: "Değer", default: 64, options: [{ value: 23, label: "23" }, { value: 64, label: "64" }, { value: 92, label: "92" }] }, { key: "size", label: "Boyut", default: 88, options: [{ value: 64, label: "64" }, { value: 88, label: "88" }, { value: 120, label: "120" }] }, { key: "colors", label: "HADİ renkleri", default: false }] },
      run: (p: { values: { value: number; size: number; colors: boolean } }) => <div>{() => {
        const colors = p.values.colors
        return <Row>
          <ProgressRing value={() => p.values.value} size={() => p.values.size} thickness={() => Math.round(p.values.size / 9)} label="Hedef" colors={colors ? "brand" : undefined} />
          <ProgressRing value={() => Math.round(p.values.value * 0.6)} max={60} size={() => p.values.size} format={(v: unknown) => `${v}/60`} label="Görev" thresholds={[40, 75]} colors={colors ? "brand" : undefined} />
        </Row>
      }}</div>,
    },
    projectGeo: {
      code: `const { shapes, viewBox } = projectGeo(geojson, 1000)   // GeoJSON lon/lat → SVG paths
<ChoroplethMap shapes={shapes} viewBox={viewBox} data={rows} id="name" />`,
      run: () => {
        const sq = (name: string, x: number, y: number, w: number, h: number) => ({ type: "Feature", properties: { name }, geometry: { type: "Polygon", coordinates: [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]] } })
        const geo = { type: "FeatureCollection" as const, features: [sq("Batı", 26, 38, 4, 3), sq("Orta", 30, 37.5, 5, 4), sq("Doğu", 35, 38, 6, 2.5)] }
        const width = signal(300)
        const out = () => projectGeo(geo, width())
        return <div class="sc-ex-charts-stack">
          <Segmented value={width} onChange={(v: number) => width.set(v)} options={[150, 300]} aria-label="Genişlik" />
          <svg class="sc-ex-charts-svg" viewBox={() => `0 0 ${out().viewBox[0]} ${out().viewBox[1]}`} role="img" aria-label="İzdüşümü alınmış bölgeler">
            {() => out().shapes.map((s, i) => <path class={`m-chart-series-${i} sc-ex-charts-fill`} d={s.d}><title>{s.name}</title></path>)}
          </svg>
          <Out label="viewBox" value={() => JSON.stringify(out().viewBox)} />
        </div>
      },
    },
    RadarChart: {
      code: `<RadarChart data={$skills} x="skill" y={["ada", "bora"]} series={["Ada", "Bora"]} max={10} title="Oyuncu becerileri" />
<RadarChart data={laptops} x="spec" y="score" gridShape="circle" curve="smooth" fill={0.35} />`,
      run: () => {
        const gen = () => ["Hız", "Pas", "Şut", "Defans", "Dayanıklılık"].map((skill) => ({ skill, ada: Math.min(10, vary(7, 0.6)), bora: Math.min(10, vary(6, 0.8)) }))
        const rows = signal(gen())
        const grid = signal<"polygon" | "circle">("polygon")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.set(gen())}>Verileri değiştir</Button>
            <Segmented value={grid} onChange={(v: "polygon" | "circle") => grid.set(v)} options={[{ value: "polygon", label: "Çokgen" }, { value: "circle", label: "Çember" }]} aria-label="Izgara" />
          </Row>
          <RadarChart data={rows} x="skill" y={["ada", "bora"]} series={["Ada", "Bora"]} max={10} gridShape={grid} height={260} title="Oyuncu becerileri" />
        </div>
      },
    },
    RadialBarChart: {
      code: `<RadialBarChart data={$rings} x="label" y="value" rowMax="goal" title="Etkinlik" />
<RadialBarChart data={langs} max={100} endAngle={360} innerRadius={0.4} legend="right" />`,
      run: () => {
        const gen = () => [{ label: "Adım", value: vary(7200), goal: 10000 }, { label: "Dakika", value: vary(24), goal: 30 }, { label: "Kalori", value: vary(380), goal: 500 }]
        const rows = signal(gen())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => rows.set(gen())} />
          <RadialBarChart data={rows} x="label" y="value" rowMax="goal" height={240} title="Günlük etkinlik" />
        </div>
      },
    },
    regionKey: {
      code: `regionKey("İstanbul") === regionKey("ISTANBUL")   // true: both "istanbul"
regionKey("034")                                   // "34"
regionKey("Şanlıurfa")                             // "sanliurfa"`,
      run: () => <ul class="sc-ex-charts-list">{["İstanbul", "ISTANBUL", "istanbul", "Şanlıurfa", "Afyon-karahisar", "034", 6].map((v) => <li><span>{JSON.stringify(v)}</span><code>{regionKey(v)}</code></li>)}</ul>,
    },
    SankeyChart: {
      code: `<SankeyChart links={$flows} format={["money", "TRY"]} title="Para nereye gidiyor" />
<SankeyChart links={steps} nodes={stages} nodeLabel="name" align="left" linkColor="source" />`,
      run: () => {
        const gen = () => [["Maaş", "Kira"], ["Maaş", "Market"], ["Maaş", "Birikim"], ["Ek iş", "Birikim"], ["Ek iş", "Eğlence"], ["Birikim", "Fon"], ["Birikim", "Altın"]]
          .map(([source, target], i) => ({ source, target, value: vary([18000, 7400, 6000, 3000, 1800, 5000, 4000][i]!) }))
        const links = signal(gen())
        const color = signal<"gradient" | "source" | "neutral">("gradient")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => links.set(gen())}>Verileri değiştir</Button>
            <Segmented value={color} onChange={(v: "gradient" | "source" | "neutral") => color.set(v)} options={[{ value: "gradient", label: "Geçiş" }, { value: "source", label: "Kaynak" }, { value: "neutral", label: "Nötr" }]} aria-label="Bağ rengi" />
          </Row>
          <SankeyChart links={links} linkColor={color} format={["money", "TRY"]} height={260} title="Para nereye gidiyor" />
        </div>
      },
    },
    scaleBand: {
      code: `const x = scaleBand(["Pzt", "Sal", "Çar"], [0, 300], { paddingInner: 0.2 })
x("Sal")          // bar start (px)
x.bandwidth       // bar width
x.center("Çar")   x.invert(250)   // "Çar"`,
      run: () => {
        const pad = signal(0.2)
        const days = ["Pzt", "Sal", "Çar", "Per", "Cum"]
        const vals = [42, 65, 30, 80, 56]
        const x = () => scaleBand(days, [10, 310], { paddingInner: pad() })
        const hover = signal("—")
        return <div class="sc-ex-charts-stack">
          <Segmented value={pad} onChange={(v: number) => pad.set(v)} options={[{ value: 0, label: "0" }, { value: 0.2, label: "0,2" }, { value: 0.5, label: "0,5" }]} aria-label="paddingInner" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 110" role="img" aria-label="Bantlar"
            onPointerMove={(e: PointerEvent) => { const svg = e.currentTarget as SVGSVGElement, r = svg.getBoundingClientRect(); hover.set(String(x().invert(((e.clientX - r.left) / r.width) * 320) ?? "—")) }}>
            {() => days.map((d, i) => <g>
              <rect class="m-chart-series-0 sc-ex-charts-fill" x={x()(d)} y={90 - vals[i]!} width={x().bandwidth} height={vals[i]} rx="2" />
              <text x={x().center(d)} y="104" text-anchor="middle">{d}</text>
            </g>)}
          </svg>
          <Row><Out label="bandwidth" value={() => x().bandwidth.toFixed(1)} /><Out label="step" value={() => x().step.toFixed(1)} /><Out label="invert (imleç)" value={hover} /></Row>
        </div>
      },
    },
    scaleLinear: {
      code: `const y = scaleLinear([0, 100], [200, 0])   // value → px (inverted axis)
y(25)            // 150
y.invert(50)     // 75
y.ticks(5)       y.nice()`,
      run: () => {
        const v = signal(25)
        const y = scaleLinear([0, 100], [200, 0])
        return <div class="sc-ex-charts-stack">
          <Slider value={v} onChange={(n: number) => v.set(n)} min={0} max={100} step={1} format={(n: number) => `değer ${n}`} aria-label="Değer" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 214" role="img" aria-label={() => `y(${v()}) = ${y(v())}`}>
            <line class="sc-ex-charts-axis" x1="40" x2="40" y1="4" y2="204" />
            {y.ticks(5).map((t) => <g><line class="sc-ex-charts-tick" x1="34" x2="300" y1={y(t) + 4} y2={y(t) + 4} /><text x="28" y={y(t) + 7} text-anchor="end">{t}</text></g>)}
            <circle class="m-chart-series-0 sc-ex-charts-dot" cx="170" cy={() => y(v()) + 4} r="7" />
          </svg>
          <Row><Out label="y(v)" value={() => String(y(v()))} /><Out label="y.invert(y(v))" value={() => String(y.invert(y(v())))} /></Row>
        </div>
      },
    },
    scaleTime: {
      code: `const x = scaleTime([start, end], [0, 640])
x(new Date())        // px
x.invert(320)        // the Date in the middle
x.ticks(6)           // epoch ms on calendar boundaries`,
      run: () => {
        const span = signal(14)
        const x = () => scaleTime([START, START + span() * DAY], [16, 304])
        const pos = signal(160)
        return <div class="sc-ex-charts-stack">
          <Segmented value={span} onChange={(v: number) => span.set(v)} options={[{ value: 1, label: "1 gün" }, { value: 14, label: "2 hafta" }, { value: 365, label: "1 yıl" }]} aria-label="Aralık" />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 44" role="img" aria-label="Zaman ekseni">
            <line class="sc-ex-charts-axis" x1="16" x2="304" y1="14" y2="14" />
            {() => x().ticks(5).map((t) => <g><line class="sc-ex-charts-tick" x1={x()(t)} x2={x()(t)} y1="10" y2="18" /><text x={x()(t)} y="32" text-anchor="middle">{span() <= 1 ? new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : fmtDay(t)}</text></g>)}
            <circle class="m-chart-series-0 sc-ex-charts-dot" cx={pos} cy="14" r="5" />
          </svg>
          <Slider value={pos} onChange={(v: number) => pos.set(v)} min={16} max={304} step={1} format={(v: number) => `${v} px`} aria-label="Konum" />
          <Out label="x.invert(px)" value={() => x().invert(pos()).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })} />
        </div>
      },
    },
    ScatterChart: {
      code: `<ScatterChart data={$cities} x="income" y="happiness" size="population" group="region" label="city"
  trend="linear" marks={[{ y: 6.5, label: "Orta" }]} title="Gelir ve mutluluk" />`,
      run: () => {
        const cities = [["İzmir", "Batı"], ["Manisa", "Batı"], ["Aydın", "Batı"], ["Ankara", "İç"], ["Konya", "İç"], ["Kayseri", "İç"], ["Erzurum", "Doğu"], ["Van", "Doğu"], ["Malatya", "Doğu"]]
        const gen = () => cities.map(([city, region], i) => ({ city, region, income: vary(30 + (i % 3) * 8 + (region === "Batı" ? 12 : region === "İç" ? 6 : 0)), happiness: Math.round(vary(55 + (i % 3) * 5, 0.3)) / 10, population: vary(1500 - (i % 3) * 400) }))
        const rows = signal(gen())
        const trend = signal(true)
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.set(gen())}>Verileri değiştir</Button>
            <Segmented value={trend} onChange={(v: boolean) => trend.set(v)} options={[{ value: true, label: "Eğilim çizgisi" }, { value: false, label: "Yok" }]} aria-label="Eğilim" />
          </Row>
          <ScatterChart data={rows} x="income" y="happiness" size="population" group="region" label="city" trend={() => (trend() ? "linear" : null)}
            marks={[{ y: 6.5, label: "Orta" }]} xTitle="Gelir (bin ₺)" yTitle="Mutluluk" height={260} title="Gelir ve mutluluk" />
        </div>
      },
    },
    Sparkline: {
      code: `<Sparkline data={$latency} width={160} height={40} area dot />
<Sparkline data={rows} y="visits" zero title="Ziyaret" />`,
      play: { options: [{ key: "area", label: "Alan", default: true }, { key: "dot", label: "Son nokta", default: true }, { key: "zero", label: "Sıfırdan", default: false }] },
      run: (p: { values: { area: boolean; dot: boolean; zero: boolean } }) => {
        const { rows, more } = useDays(24)
        return <Row>
          <Sparkline data={rows} y="visits" width={180} height={48} area={() => p.values.area} dot={() => p.values.dot} zero={() => p.values.zero} title="Ziyaret" />
          <Sparkline data={() => rows().map((r) => r.expenses)} width={180} height={48} color={2} area={() => p.values.area} dot={() => p.values.dot} zero={() => p.values.zero} title="Gider" />
          <Button size="sm" onClick={more}>Yeni gün</Button>
        </Row>
      },
    },
    squarify: {
      code: `squarify([50, 30, 12, 8], { x: 0, y: 0, w: 320, h: 160 })
// [{ x, y, w, h }, …] in input order: near-square tiles, areas by value`,
      run: () => {
        const values = signal([50, 30, 12, 8, 5])
        const rects = () => squarify(values(), { x: 0, y: 0, w: 320, h: 140 })
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => values.set(values().map(() => vary(25, 1.6)))} />
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 140" role="img" aria-label="Kareleştirilmiş dikdörtgenler">
            {() => rects().map((r, i) => <g>
              <rect class={`m-chart-series-${i} sc-ex-charts-fill sc-ex-charts-tile`} x={r.x} y={r.y} width={Math.max(0, r.w)} height={Math.max(0, r.h)} />
              <text x={r.x + 6} y={r.y + 14}>{values()[i]}</text>
            </g>)}
          </svg>
        </div>
      },
    },
    Stat: {
      code: `<Stat label="Gelir" value={48210} previous={43580} format={["money", "TRY"]} spark={revenue} />
<Stat label="Gider" value={18400} delta={-0.031} invert hint="önceki aya göre" />`,
      play: { options: [{ key: "trend", label: "Eğilim", default: "up", options: [{ value: "up", label: "Artış" }, { value: "down", label: "Düşüş" }] }, { key: "invert", label: "Düşüş iyi (gider)", default: false }, { key: "spark", label: "Eğri", default: true }] },
      run: (p: { values: { trend: string; invert: boolean; spark: boolean } }) => {
        const series = Array.from({ length: 20 }, (_, i) => dayRow(i).revenue)
        return <div class="sc-ex-charts-row">{() => {
          const up = p.values.trend === "up", invert = p.values.invert, spark = p.values.spark
          return <>
            <Stat label="Aylık gelir" value={up ? 48210 : 39120} previous={43580} format={["money", "TRY"]} invert={invert} hint="önceki aya göre" spark={spark ? (up ? series : [...series].reverse()) : null} />
            <Stat label="Etkin üye" value={9640} delta={up ? 0.068 : -0.042} invert={invert} format="number" hint="haftalık" />
          </>
        }}</div>
      },
    },
    statOf: {
      code: `statOf([4, 8, null, 15, 16], "median")   // 8 (nulls are skipped)
statOf(values, "average")                  // also "min", "max"
<LineChart marks={[{ y: "average" }]} … />  // the same statistic as a reference line`,
      run: () => {
        const values = [4, 8, null, 15, 16, 23, 42]
        const stat = signal<RefStat>("median")
        return <div class="sc-ex-charts-stack">
          <Segmented value={stat} onChange={(v: RefStat) => stat.set(v)} options={["average", "median", "min", "max"]} aria-label="İstatistik" />
          <Row><Out label="değerler" value={values.map(String).join(", ")} /><Out label="statOf" value={() => String(statOf(values, stat()))} /></Row>
        </div>
      },
    },
    StreamGraph: {
      code: `<StreamGraph data={$weeks} x="week" y={["pop", "rock", "jazz", "rap"]} title="Ne dinledik" />
<StreamGraph data={$days} x="day" y={["search", "social", "mail"]} offset="silhouette" edges legend="right" />`,
      run: () => {
        let next = 12
        const week = (i: number) => ({ week: i + 1, pop: vary(40 + 20 * Math.sin(i / 3)), rock: vary(30 + 15 * Math.cos(i / 4)), jazz: vary(14), rap: vary(20 + i) })
        const rows = signal(Array.from({ length: 12 }, (_, i) => week(i)))
        const offset = signal<"wiggle" | "silhouette" | "expand">("wiggle")
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => rows.update((l) => [...l.slice(1), week(next++)])}>Yeni hafta</Button>
            <Segmented value={offset} onChange={(v: "wiggle" | "silhouette" | "expand") => offset.set(v)} options={["wiggle", "silhouette", "expand"]} aria-label="Taban" />
          </Row>
          <StreamGraph data={rows} x="week" y={["pop", "rock", "jazz", "rap"]} series={{ pop: "Pop", rock: "Rock", jazz: "Caz", rap: "Rap" }} offset={offset} height={220} title="Ne dinledik" />
        </div>
      },
    },
    SunburstChart: {
      code: `<SunburstChart data={$budget} value="amount" format={["money", "TRY"]} title="Bütçe" />
<SunburstChart data={disk} label="name" value="size" format="bytes" maxDepth={4} />`,
      run: () => {
        const data = signal(budget())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => data.set(budget())} />
          <SunburstChart data={data} format={["money", "TRY"]} rootLabel="Bütçe" height={280} title="Aylık bütçe" />
        </div>
      },
    },
    svgText: {
      code: `const svg = svgText(chartEl)                    // standalone SVG: computed colors written in
svgText(chartEl, "transparent")                 // without the background`,
      run: () => {
        let box: HTMLElement | null = null
        const text = signal("")
        return <div class="sc-ex-charts-stack">
          <ExportDemo into={(el) => { box = el }} />
          <Row><Button size="sm" onClick={() => box && text.set(svgText(box))}>SVG metnini al</Button></Row>
          <Row><Out label="uzunluk" value={() => `${text().length.toLocaleString("tr-TR")} karakter`} /><Out label="başı" value={() => text().slice(0, 64) || "—"} /></Row>
        </div>
      },
    },
    symbolPath: {
      code: `<path d={symbolPath("diamond", 6)} transform="translate(40 20)" />
// "circle", "square", "diamond", "triangle": centred on 0,0, the same area as a circle of radius r`,
      run: () => {
        const r = signal(10)
        return <div class="sc-ex-charts-stack">
          <ul class="sc-ex-charts-swatches">{(["circle", "square", "diamond", "triangle"] as const).map((s, i) => <li>
            <svg class="sc-ex-charts-symbol" viewBox="-20 -20 40 40" aria-hidden="true"><path class={`m-chart-series-${i} sc-ex-charts-fill`} d={() => symbolPath(s, r())} /></svg>
            <span>{s}</span>
          </li>)}</ul>
          <Slider value={r} onChange={(v: number) => r.set(v)} min={3} max={18} step={1} format={(v: number) => `r ${v}`} aria-label="Yarıçap" />
        </div>
      },
    },
    syncGroup: {
      code: `<LineChart data={sales} x="day" y="revenue" sync="panel" />
<LineChart data={visits} x="day" y="visits" sync="panel" />   // one crosshair for both
const at = syncGroup("panel")                                  // signal: { from, x } | null`,
      run: () => {
        const { rows } = useDays(14)
        const at = syncGroup("api-ornek")
        return <div class="sc-ex-charts-stack">
          <LineChart data={rows} x="day" y="revenue" series="Gelir" xFormat="date" sync="api-ornek" height={120} title="Gelir" />
          <LineChart data={rows} x="day" y="visits" series="Ziyaret" xFormat="date" sync="api-ornek" height={120} title="Ziyaret" />
          <Out label="syncGroup(…)()" value={() => { const a = at(); return a ? fmtDay(Number(a.x)) : "imleci bir grafiğin üstüne getirin" }} />
        </div>
      },
    },
    timeTicks: {
      code: `timeTicks(start, end)        // epoch ms on round calendar boundaries
timeTicks(Date.now() - 6 * 36e5, Date.now(), 6)   // every hour
timeTicks(new Date(2026, 0, 1), new Date(2026, 11, 31), 4)   // quarters`,
      run: () => {
        const spans: Record<string, number> = { "6 saat": DAY / 4, "10 gün": 10 * DAY, "1 yıl": 365 * DAY, "8 yıl": 8 * 365 * DAY }
        const pick = signal("10 gün"), count = signal(6)
        const ticks = () => timeTicks(START, START + spans[pick()]!, count())
        const label = (t: number) => (spans[pick()]! < DAY ? new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : new Date(t).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }))
        return <div class="sc-ex-charts-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(spans)} aria-label="Aralık" />
          <Segmented value={count} onChange={(v: number) => count.set(v)} options={[3, 6, 12]} aria-label="Çentik sayısı" />
          <ul class="sc-ex-charts-list">{() => ticks().map((t) => <li><span>{label(t)}</span><code>{t}</code></li>)}</ul>
        </div>
      },
    },
    Treemap: {
      code: `<Treemap data={$budget} value="amount" format={["money", "TRY"]} title="Bütçe" />
<Treemap data={stocks} colorValue="change" colorScale="diverging" colorMid={0} format="compact" />`,
      run: () => {
        const data = signal(budget())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => data.set(budget())} />
          <Treemap data={data} format={["money", "TRY"]} rootLabel="Bütçe" height={260} title="Aylık bütçe" />
        </div>
      },
    },
    tween: {
      code: `const shown = tween(() => ({ w: value() }), ["w"], () => "spring", (to) => ({ ...to, w: 0 }))
<rect width={() => shown().w} />   // grows in, then glides to every new value`,
      run: () => {
        const value = signal(180), easing = signal("spring")
        const shown = tween(() => ({ w: value() }), ["w"], () => easing(), (to) => ({ ...to, w: 0 }))
        return <div class="sc-ex-charts-stack">
          <Row>
            <Button size="sm" onClick={() => value.set(Math.min(300, vary(160, 1.6)))}>Yeni değer</Button>
            <Segmented value={easing} onChange={(v: string) => easing.set(v)} options={["spring", "out", "bounce"]} aria-label="Yumuşatma" />
          </Row>
          <svg class="sc-ex-charts-svg" viewBox="0 0 320 30" role="img" aria-label={() => `${value()}`}>
            <rect class="m-chart-series-0 sc-ex-charts-fill" x="0" y="4" height="22" rx="4" width={() => Math.max(0, shown().w)} />
          </svg>
          <Row><Out label="hedef" value={() => String(value())} /><Out label="çizilen" value={() => shown().w.toFixed(1)} /></Row>
        </div>
      },
    },
    WaterfallChart: {
      code: `<WaterfallChart data={$pnl} start={120000} totals="end" format="compact" title="Kâr köprüsü" />
<WaterfallChart data={rows} total="isSubtotal" marks={[{ y: 100000, label: "Hedef" }]} connectors={false} />`,
      run: () => {
        const gen = () => [{ label: "Satış", value: vary(80000) }, { label: "İade", value: -vary(12000) }, { label: "Maliyet", value: -vary(45000) }, { label: "Brüt", total: true },
          { label: "Pazarlama", value: -vary(18000) }, { label: "Faiz", value: vary(6000) }]
        const rows = signal(gen())
        return <div class="sc-ex-charts-stack">
          <Refresh onClick={() => rows.set(gen())} />
          <WaterfallChart data={rows} start={120000} startLabel="Açılış" totals="end" totalLabel="Kapanış" format="compact" height={240} title="Kâr köprüsü" />
        </div>
      },
    },
    windowed: {
      code: `$rows = windowed([...$rows, reading], 20)   // a live series that keeps only its last 20 rows`,
      run: () => {
        const rows = signal(sample(12, 50, 30))
        const add = (n: number) => rows.set(windowed([...rows(), ...sample(n, 50, 30)], 12))
        return <div class="sc-ex-charts-stack">
          <Row><Button size="sm" onClick={() => add(1)}>Okuma ekle</Button><Button size="sm" variant="ghost" onClick={() => add(5)}>5 okuma</Button><Out label="satır" value={() => String(rows().length)} /></Row>
          <Sparkline data={rows} width="100%" height={56} area dot title="Son 12 okuma" />
        </div>
      },
    },
    windowRange: {
      code: `windowRange(10, xs, 4)                // [6, 9]: the last 4 rows
windowRange(10, xs, { ms: 3 * DAY })  // the rows of the latest 3 days
windowRange(10, xs, null)             // [0, 9]: everything`,
      run: () => {
        const xs = [0, 1, 2, 3, 5, 6, 8, 9, 10, 12].map((d) => START + d * DAY)
        const windows: Record<string, WindowProp> = { "4": 4, "{ last: 2 }": { last: 2 }, "{ ms: 3 gün }": { ms: 3 * DAY }, "null": null }
        const pick = signal("{ ms: 3 gün }")
        const range = () => windowRange(xs.length, xs, windows[pick()])
        return <div class="sc-ex-charts-stack">
          <Segmented value={pick} onChange={(v: string) => pick.set(v)} options={Object.keys(windows)} aria-label="Pencere" />
          <Out label="[a, b]" value={() => JSON.stringify(range())} />
          <ul class="sc-ex-charts-swatches">{xs.map((x, i) => <li class={() => (i >= range()[0] && i <= range()[1] ? "sc-ex-charts-in" : "sc-ex-charts-out")}><span>{fmtDay(x)}</span></li>)}</ul>
        </div>
      },
    },
  },
})
