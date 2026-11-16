// Home page below the hero: the counters, the map of the whole showcase (six sections, every category on one screen),
// speed and size, a first example and the footer. Every block assembles when it scrolls into view: headings word by
// word, cards one after another, the rows of the map one by one, code and result from the two sides (ready at once
// with reduced motion). Every number comes from home-stats.gen.ts (tools/gen-home-stats.js) or from march-report.json
// (this build's measured sizes); none is typed here.
import "./sections.css";
import { onCleanup, signal } from "march";
import { inView, reducedMotion } from "march/motion";
import { Link } from "march/router";
import { appUrl } from "march/base";
import { Button, Card, CodeView, IconTile, Kbd, ListRow, MadeWithMarch, StatTile, heartBurst, openPalette } from "march/ui";
import { Reveal, StatsBand, Counter, revealOnScroll } from "march/components/landing/index.ts";
import { Head } from "./head.tsx";
import { Features } from "./features.tsx";
import { lazy } from "march/lazy";

// the further sections, each file a lazy part loaded as it comes near (the home page's first chunk stays small)
const Ai = lazy(() => import("./more/ai.tsx"), { when: "visible", placeholder: "none", height: "36rem" })
const MoreUi = lazy(() => import("./more/ui.tsx"), { when: "visible", placeholder: "none", height: "60rem" })
const Design = lazy(() => import("./more/design.tsx"), { when: "visible", placeholder: "none", height: "48rem" })
const MoreLive = lazy(() => import("./more/live.tsx"), { when: "visible", placeholder: "none", height: "40rem" })
const MorePeople = lazy(() => import("./more/people.tsx"), { when: "visible", placeholder: "none", height: "40rem" })
const Cta = lazy(() => import("./more/cta.tsx"), { when: "visible", placeholder: "none", height: "24rem" })
import { search, sparkles } from "march/icons";
import { BRAND_COLORS_ALL, type ColorToken } from "march/theme/colors.ts";
import { HOME_STATS as S } from "../home-stats.gen.ts";
import { celebrate } from "./celebrate.ts";
import { pages } from "../app.tsx";
import { withMeta, SECTIONS, sectionOf, type NavSection } from "../nav-meta.ts";

interface Report { entry?: { js: number }; boot?: { js: number } | null }
const kb = (bytes: number): number => Math.round((bytes / 1024) * 10) / 10;

// ── counters ────────────────────────────────────────────────────────────────────────────────────────────────────

/** How long the figures count, ms. */
const COUNT_MS = 1500

function Stats() {
  const items = [
    { value: S.components, label: "bileşen" }, { value: S.exports, label: "dışa aktarım" }, { value: S.icons.total, label: "ikon" },
    { value: S.animations.total, label: "animasyon" }, { value: S.managers, label: "yönetici" }, { value: S.tests, label: "test" },
    { value: S.dependencies, label: "bağımlılık" },
  ]
  // the figures wait at 0 until the whole band is in view, then count up together in a second and a half (ease in-out);
  // as each reaches its value, a firework of the brand colours goes off over it and a ghost of the number zooms out
  const ready = signal(false)
  const counted = items.map((it) => ({ ...it, value: () => (ready() ? it.value : 0) }))
  const burst = (band: Element) => band.querySelectorAll<HTMLElement>(".m-stats-item").forEach((item, i) => {
    setTimeout(() => celebrate(item, item.querySelector<HTMLElement>(".m-stat-tile-value")), i * 90)
  })
  const watch = (band: Element) => onCleanup(inView(band, { once: true, threshold: 1, rootMargin: "0px", enter: () => {
    ready.set(true)
    if (!reducedMotion()) { const t = setTimeout(() => burst(band), COUNT_MS); onCleanup(() => clearTimeout(t)) }
  } }))
  return <section class="sc-stats sc-card" aria-label="Rakamlarla MarchJS" ref={watch}>
    <StatsBand items={counted} variant="plain" duration={COUNT_MS} easing="in-out" reveal={{ effect: "scale", stagger: 60 }} />
  </section>
}

// ── the map: six sections, every category ───────────────────────────────────────────────────────────────────────

/** The order of the map: a long section (two columns of rows) starts each line of cards, the search card closes it. */
const MAP_ORDER = ["components", "built", "motion", "start", "look", "infra"];
/** A section with more categories than this lays its rows out in two columns. */
const LONG = 6;
/** How deep a page can sit under a category. */
const DEPTH = 8;

/** A map cell's ref: its card slides in from its own side when the cell first comes into view (the start column from
 * the start side, the middle one from below, the end column from the end side; the wide ones from below), once. */
const SIDES = ["start", "up", "end"] as const
const slideIn = (i: number, wide: boolean) => (el: Element): void => {
  let stop = (): void => {}, live = true
  // set up once the card is in the cell
  queueMicrotask(() => { if (live) stop = revealOnScroll(el, { effect: wide ? "up" : SIDES[i % SIDES.length], distance: 72, duration: 800 }) })
  onCleanup(() => { live = false; stop() })
}

function WorldMap() {
  const all = withMeta(pages()).filter((p) => p.path !== "/")
  type Entry = (typeof all)[number]
  const byPath = new Map(all.map((p) => [p.path, p]))
  const topOf = (p: Entry): Entry => { let x = p; for (let i = 0; i < DEPTH && x.parent && byPath.has(x.parent); i++) x = byPath.get(x.parent)!; return x }
  // the categories of a section: its top pages, in the order of its menu groups (the side menu's order)
  const rowsOf = (s: NavSection): Entry[] => all.filter((p) => !p.parent && sectionOf(p) === s)
    .sort((a, b) => s.groups.indexOf(s.pages?.includes(a.path) ? s.groups[0]! : a.group ?? "") - s.groups.indexOf(s.pages?.includes(b.path) ? s.groups[0]! : b.group ?? ""))
  /** Pages listed under a category (at any depth): the count the row shows. */
  const under = (top: Entry): number => all.filter((p) => p !== top && topOf(p) === top).length
  const worlds = MAP_ORDER.map((id) => SECTIONS.find((s) => s.id === id)).filter((s): s is NavSection => !!s).map((s) => ({ s, rows: rowsOf(s) }))
  const total = worlds.reduce((n, w) => n + w.rows.length, 0)
  let k = 0
  return <section class="sc-sec" aria-labelledby="sc-map-h">
    <Head id="sc-map-h" kicker="Harita" color="brand-orange" title="Her şey tek bakışta"
      lead={`${worlds.length} bölüm, ${total} kategori; hepsi bu ekranda. Soldaki şerit aynı bölümleri her sayfada taşır.`} />
    {/* each card slides in from its own side when it first comes into view (its rows after it): the lower cards are
        not played before they are seen */}
    <div class="sc-map">
      {worlds.map(({ s, rows }, i) => <div class={`sc-map-cell${rows.length > LONG ? " is-wide" : ""}`}
        ref={slideIn(i, rows.length > LONG)}>
        <Card class={`sc-map-world sc-card${rows.length > LONG ? " is-wide" : ""}`} title={s.label} subtitle={s.desc}>
          <Reveal class="sc-map-rows" effect="end" distance={24} stagger={40} delay={300} duration={500}>
            {rows.map((p) => { const n = under(p), color = BRAND_COLORS_ALL[k++ % BRAND_COLORS_ALL.length]!; return <ListRow class="sc-map-row" href={p.path} overflow="ellipsis" color={color}
              lead={<IconTile icon={p.icon} m:color={color} size="sm" />} title={p.title} sub={p.desc}
              trail={n ? <span class="sc-map-n" data-m-color={color}>{n}</span> : undefined} /> })}
          </Reveal>
        </Card>
      </div>)}
      <div class="sc-map-cell" ref={slideIn(1, false)}>
        <Card class="sc-map-find">
          <p class="sc-map-find-t">Adını biliyorsan doğrudan git.</p>
          <p class="sc-map-find-x">Bileşen, sayfa ya da eylem: yazmaya başla, Enter ile aç.</p>
          <Button icon={search} onClick={openPalette}>Ara <Kbd keys="mod+k" /></Button>
        </Card>
      </div>
    </div>
  </section>
}

// ── speed and size ──────────────────────────────────────────────────────────────────────────────────────────────

function Fast(props: { report: () => Report | null }) {
  // measured sizes of this build; no line when the build wrote none (never "0 KB")
  const measured = (): string | null => { const r = props.report(); return r?.boot?.js ? `Bu derlemede ölçülen açılış: ${kb(r.boot.js)} KB (gzip).` : null }
  const cards: Array<{ value: number; unit?: string; color: ColorToken; label: string; text: string; more?: () => string | null }> = [
    { value: S.budget.boot / 1024, unit: " KB", color: "brand-orange", label: "Açılış bütçesi", text: "Vitrinin tamamı bu bütçeyle açılır; yalnız kullandığın bileşen derlenir.", more: measured },
    { value: S.budget.route / 1024, unit: " KB", color: "brand-blue", label: "Sayfa bütçesi", text: "Hiçbir sayfa bundan büyük açılamaz; sayfalar ve ağır özellikler tembel gelir." },
    { value: S.dependencies, color: "brand-green", label: "Bağımlılık", text: "Çalışma zamanında başka paket yok. Sanal DOM yok, yapılandırma yok." },
  ]
  // small is the point: each figure counts down to its value from far above (six times as much; dependencies from a
  // couple dozen) when the cards come into view
  const high = (v: number): number => Math.max(v * 6, 24)
  return <section class="sc-sec" aria-labelledby="sc-fast-h">
    <Head id="sc-fast-h" kicker="Hız ve boyut" color="brand-blue" title="Küçük açılır, büyüdükçe yavaşlamaz" />
    <Reveal class="sc-fast" effect="up" distance={56} stagger={110}>
      {cards.map((c) => <StatTile class="sc-fast-card sc-card" variant="card" size="xl" align="start" m:color={c.color} value={<Counter from={high(c.value)} value={c.value} suffix={c.unit} duration={COUNT_MS} easing="in-out" />} label={c.label}
        hint={<>{c.text}{() => { const m = c.more?.(); return m ? <span class="sc-fast-more">{m}</span> : null }}</>} />)}
    </Reveal>
    <Link href="/speed" class="sc-fast-link">Canlı ağ paneli</Link>
  </section>
}

// ── first example ───────────────────────────────────────────────────────────────────────────────────────────────

// the package name is spliced in: the build rewrites `from "march…"` even inside strings
const PKG = "march"
const START = [
  `import { render } from "${PKG}"`,
  `import { Button } from "${PKG}/ui"`,
  `render(() => <Button variant="primary">Merhaba</Button>, document.body)`,
].join("\n")

function Start() {
  return <section class="sc-sec" aria-labelledby="sc-start-h">
    <Head id="sc-start-h" kicker="Başla" color="brand-green" title="Üç satırda ilk ekran" />
    <div class="sc-start">
      <Reveal class="sc-start-code" effect="start" distance={72}><CodeView code={START} lang="tsx" wrap label="Örnek kod" /></Reveal>
      <Reveal class="sc-start-cell" effect="end" distance={72} delay={90}>
        <div class="sc-start-out sc-card">
          <span class="sc-start-out-l">Sonuç</span>
          <Button variant="primary" icon={sparkles} on:click={(e: Event) => heartBurst(e.currentTarget as HTMLElement, { radius: 46 })}>Merhaba</Button>
        </div>
      </Reveal>
    </div>
    <div class="sc-start-cta">
      <Button variant="primary" href="/start">İlk Adımlar</Button>
      <Button href="/language">March dili</Button>
    </div>
  </section>
}

export default function HomeSections() {
  let $report: Report | null = null
  void fetch(appUrl("march-report.json")).then((r) => (r.ok ? r.json() : null)).then((x: Report | null) => { $report = x }, () => {})
  const report = () => $report
  return <div class="sc-home-rest">
    <Stats />
    <div class="sc-home-body">
      <Features />
      <Ai />
      <MoreUi />
      <Design />
      <MoreLive />
      <MorePeople />
      <WorldMap />
      <Fast report={report} />
      <Start />
      <Cta />
    </div>
    <footer class="sc-home-foot">
      <MadeWithMarch variant="badge" />
      <span class="sc-home-foot-links">
        <Link href="/start">İlk Adımlar</Link>
        <Link href="/api">API başvurusu</Link>
        <Link href="/speed">Hız</Link>
      </span>
    </footer>
  </div>
}
