// API examples of hadi-march/charts: the chart components (SVG, reactive, accessible) and the scale / layout helpers
// they are built on. Layout and rules: tools/api-examples.js. Each `run` is a small live demo of its `code`.
import { signal, computed } from "hadi-march";
import {
  arcPath, AreaChart, BarChart, BarList, heatLevel, Heatmap, LineChart, lttb, niceStep, niceTicks, PieChart, pieLayout,
  ProgressRing, scaleBand, scaleLinear, scaleTime, Sparkline, Stat, timeTicks,
} from "hadi-march/charts";
import { Button, Segmented, Slider } from "hadi-march/ui";
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

export default examples({
  "hadi-march/charts": {
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
  },
})
