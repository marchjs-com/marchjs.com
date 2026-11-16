// Home page sections (a lazy part): a chart fed live while it is on screen, and the test run of the library printed
// line by line into a read-only terminal.
import "./more.css";
import { onCleanup } from "march";
import { inView, reducedMotion } from "march/motion";
import { LineChart, BarChart } from "march/charts";
import { Terminal, type TerminalApi } from "march/components/composite/terminal";
import { Reveal } from "march/components/landing/index.ts";
import { HOME_STATS as S } from "../../home-stats.gen.ts";
import { Head } from "../head.tsx";
import { every } from "../clock.ts";

// ── a live chart ────────────────────────────────────────────────────────────────────────────────────────────────

/** How many points the line keeps, and how often a new one comes (ms). */
const POINTS = 24, FEED_MS = 900
const next = (prev: number): number => Math.max(8, Math.min(96, prev + (Math.random() - 0.45) * 18))
const start = (): { t: number; visits: number; sales: number }[] => {
  let v = 40, s = 25
  return Array.from({ length: POINTS }, (_, t) => ({ t, visits: (v = next(v)), sales: (s = next(s) * 0.7) }))
}
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
const week = () => DAYS.map((day) => ({ day, value: Math.round(20 + Math.random() * 75) }))

function Charts() {
  let $points = start()
  let $week = week()
  let tick = 0
  const feed = (box: Element) => {
    let stop: (() => void) | undefined
    const off = inView(box, { once: false, rootMargin: "0px", threshold: 0.3,
      enter: () => { if (!reducedMotion()) stop ??= every(FEED_MS, () => {
        const last = $points[$points.length - 1]!
        $points = [...$points.slice(1), { t: last.t + 1, visits: next(last.visits), sales: next(last.sales) * 0.7 }]
        if (++tick % 4 === 0) $week = week()
      }) },
      leave: () => { stop?.(); stop = undefined } })
    onCleanup(() => { off(); stop?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-chart-h">
    <Head id="sc-chart-h" kicker="Grafikler" color="brand-blue" title="Veri akar, grafik takip eder"
      lead="Çizgi, çubuk, pasta, ısı haritası: SVG, erişilebilir tablo görünümü ve klavyeyle gezinme hazır. Yalnız değişen nokta güncellenir; binlerce nokta seyreltilerek çizilir." />
    <Reveal class="sc-charts" effect="up" stagger={110}>
      <div class="sc-chart-card sc-card" ref={feed}>
        <span class="sc-chart-cap">Canlı ziyaret ve satış</span>
        <LineChart data={$points} x="t" y={["visits", "sales"]} series={["Ziyaret", "Satış"]} height={220} yMin={0} yMax={100} title="Canlı ziyaret ve satış" />
      </div>
      <div class="sc-chart-card sc-card">
        <span class="sc-chart-cap">Haftalık katılım</span>
        <BarChart data={$week} x="day" y="value" height={220} yMin={0} yMax={100} animate="spring" title="Haftalık katılım" legend={false} />
      </div>
    </Reveal>
  </section>
}

// ── the tests ───────────────────────────────────────────────────────────────────────────────────────────────────

/** A few of the library's own test names, printed as a run while the terminal is on screen. */
const TESTS = [
  "signal: a write updates only what reads it", "computed: recomputes once per change", "For: rows are reused by key",
  "Dialog: focus stays inside, Escape closes", "DataTable: sorts, filters, pages", "Router: lazy pages, one chunk each",
  "i18n: plural rules, right to left", "Toast: stacks and leaves on its own", "Rating: a fraction fills part of a star",
  "BarChart: bars glide, the axis takes the new scale", "CSP: no inline style anywhere", "LikeButton: burst on like",
  "Slider: arrows, Home, End, page keys", "Form: server errors land on the right field", "Reveal: nothing hidden with reduced motion",
]
const LINE_MS = 260

function Tests() {
  let api: TerminalApi | null = null
  const run = (box: Element) => {
    let stop: (() => void) | undefined, at = 0
    const off = inView(box, { once: false, rootMargin: "0px", threshold: 0.3,
      enter: () => {
        if (!api) return
        if (reducedMotion()) { if (!at) { TESTS.forEach((n) => api!.print(`✓ ${n}`, { tone: "success" })); at = TESTS.length } return }
        stop ??= every(LINE_MS, () => {
          if (!api) return
          if (at < TESTS.length) { api.print(`✓ ${TESTS[at]!}`, { tone: "success" }); at++; return }
          api.print(`${S.tests.toLocaleString("tr")} test geçti · başarısız yok`, { tone: "info" })
          stop?.(); stop = undefined
        })
      },
      leave: () => { stop?.(); stop = undefined } })
    onCleanup(() => { off(); stop?.() })
  }
  return <section class="sc-sec" aria-labelledby="sc-test-h">
    <Head id="sc-test-h" kicker="Testler" color="brand-green" title={`${S.tests.toLocaleString("tr")} test, her değişiklikte`}
      lead="Her bileşenin davranışı, erişilebilirliği, boyut bütçesi ve güvenlik kuralları test edilir. Bir değişiklik ancak hepsi geçince yayına girer." />
    <Reveal class="sc-tests" effect="up">
      <div class="sc-tests-term" ref={run}>
        <Terminal readonly scheme="dark" height="18rem" label="Test çıktısı" welcome="$ npm test" ref={(a: TerminalApi) => { api = a }} />
      </div>
    </Reveal>
  </section>
}

export default function MoreLive() {
  return <>
    <Charts />
    <Tests />
  </>
}
