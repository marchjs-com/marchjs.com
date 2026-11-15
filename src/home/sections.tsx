// Home page below the hero: the counters, the map of the whole showcase (six sections, every category on one screen),
// speed and size, a first example and the footer. Every block assembles when it scrolls into view: headings word by
// word, cards one after another, the rows of the map one by one, code and result from the two sides (ready at once
// with reduced motion). Every number comes from home-stats.gen.ts (tools/gen-home-stats.js) or from march-report.json
// (this build's measured sizes); none is typed here.
import "./sections.css";
import { onCleanup } from "march";
import { reducedMotion, scrollTimeline } from "march/motion";
import { Link } from "march/router";
import { appUrl } from "march/base";
import { Button, Card, CodeView, IconTile, Kbd, ListRow, MadeWithMarch, StatTile, heartBurst, openPalette } from "march/ui";
import { Reveal, SectionHead, StatsBand, revealOnScroll } from "march/components/landing/index.ts";
import { search, sparkles } from "march/icons";
import { BRAND_COLORS_ALL, type ColorToken } from "march/theme/colors.ts";
import { HOME_STATS as S } from "../home-stats.gen.ts";
import { pages } from "../app.tsx";
import { withMeta, SECTIONS, sectionOf, type NavSection } from "../nav-meta.ts";

interface Report { entry?: { js: number }; boot?: { js: number } | null }
const kb = (bytes: number): number => Math.round((bytes / 1024) * 10) / 10;

/** Action on a heading: its words tilt in one after another as it scrolls into view, tied to the scroll position
 * (scrolling back up winds them back); the text is simply there with reduced motion. */
function words(el: Element): () => void {
  if (reducedMotion() || el.ownerDocument?.documentElement.hasAttribute("data-m-hydrating")) return () => {}
  const h = el as HTMLElement
  let stop = (): void => {}, text = "", live = true
  // the text goes in after the action runs: the words are split a moment later
  queueMicrotask(() => {
    text = h.textContent ?? ""
    if (!live || !text.trim()) return
    h.replaceChildren(...text.split(/(\s+)/).map((w) => {
      if (!w.trim()) return document.createTextNode(w)
      const s = document.createElement("span")
      s.className = "sc-word"
      s.textContent = w
      return s
    }))
    stop = scrollTimeline([...h.querySelectorAll<HTMLElement>(".sc-word")], { opacity: [0, 1], transform: ["perspective(600px) translateY(.45em) rotateX(-55deg)", "perspective(600px) translateY(0) rotateX(0deg)"] },
      { track: h, range: [0, 0.35], easing: "out", stagger: 70 })
  })
  return () => { live = false; stop() }
}

/** The head of a section: a small colored kicker, the title built word by word, an optional lead. */
function Head(props: { kicker: string; title: string; lead?: string; color: ColorToken; id: string }) {
  return <SectionHead class="sc-sec-head" align="start" width="full" size="lg" m:color={props.color} eyebrow={props.kicker} titleId={props.id}
    title={<span use:words>{props.title}</span>} lead={props.lead} reveal={{ effect: "up", scrub: true }} />
}

// ── counters ────────────────────────────────────────────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    { value: S.components, label: "bileşen" }, { value: S.exports, label: "dışa aktarım" }, { value: S.icons.total, label: "ikon" },
    { value: S.animations.total, label: "animasyon" }, { value: S.managers, label: "yönetici" }, { value: S.tests, label: "test" },
    { value: S.dependencies, label: "bağımlılık" },
  ]
  return <section class="sc-stats sc-card" aria-label="Rakamlarla March">
    <StatsBand items={items} variant="plain" reveal={{ effect: "scale", scrub: true }} />
  </section>
}

// ── the map: six sections, every category ───────────────────────────────────────────────────────────────────────

/** The order of the map: a long section (two columns of rows) starts each line of cards, the search card closes it. */
const MAP_ORDER = ["components", "built", "motion", "start", "look", "infra"];
/** A section with more categories than this lays its rows out in two columns. */
const LONG = 6;
/** How deep a page can sit under a category. */
const DEPTH = 8;

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
    {/* each card rises as it itself scrolls into view, tied to the scroll position (scrolling up winds it back); one
        Reveal around them all played as soon as the map's top came in, so the lower cards had finished unseen */}
    <div class="sc-map">
      {worlds.map(({ s, rows }, i) => <Card class={`sc-map-world sc-card${rows.length > LONG ? " is-wide" : ""}`} title={s.label} subtitle={s.desc}
        ref={(el: Element) => onCleanup(revealOnScroll(el, { effect: "up", self: true, scrub: true, distance: 36 + (i % 3) * 12 }))}>
        <Reveal class="sc-map-rows" effect="start" distance={14} scrub>
          {rows.map((p) => { const n = under(p), color = BRAND_COLORS_ALL[k++ % BRAND_COLORS_ALL.length]!; return <ListRow class="sc-map-row" href={p.path} overflow="ellipsis" color={color}
            lead={<IconTile icon={p.icon} m:color={color} size="sm" />} title={p.title} sub={p.desc}
            trail={n ? <span class="sc-map-n" data-m-color={color}>{n}</span> : undefined} /> })}
        </Reveal>
      </Card>)}
      <Card class="sc-map-find" ref={(el: Element) => onCleanup(revealOnScroll(el, { effect: "up", self: true, scrub: true }))}>
        <p class="sc-map-find-t">Adını biliyorsan doğrudan git.</p>
        <p class="sc-map-find-x">Bileşen, sayfa ya da eylem: yazmaya başla, Enter ile aç.</p>
        <Button icon={search} onClick={openPalette}>Ara <Kbd keys="mod+k" /></Button>
      </Card>
    </div>
  </section>
}

// ── speed and size ──────────────────────────────────────────────────────────────────────────────────────────────

function Fast(props: { report: () => Report | null }) {
  // measured sizes of this build; no line when the build wrote none (never "0 KB")
  const measured = (): string | null => { const r = props.report(); return r?.boot?.js ? `Bu derlemede ölçülen açılış: ${kb(r.boot.js)} KB (gzip).` : null }
  const cards: Array<{ value: string; color: ColorToken; label: string; text: string; more?: () => string | null }> = [
    { value: `${S.budget.boot / 1024} KB`, color: "brand-orange", label: "Açılış bütçesi", text: "Vitrinin tamamı bu bütçeyle açılır; yalnız kullandığın bileşen derlenir.", more: measured },
    { value: `${S.budget.route / 1024} KB`, color: "brand-blue", label: "Sayfa bütçesi", text: "Hiçbir sayfa bundan büyük açılamaz; sayfalar ve ağır özellikler tembel gelir." },
    { value: `${S.dependencies}`, color: "brand-green", label: "Bağımlılık", text: "Çalışma zamanında başka paket yok. Sanal DOM yok, yapılandırma yok." },
  ]
  return <section class="sc-sec" aria-labelledby="sc-fast-h">
    <Head id="sc-fast-h" kicker="Hız ve boyut" color="brand-blue" title="Küçük açılır, büyüdükçe yavaşlamaz" />
    <Reveal class="sc-fast" effect="up" scrub>
      {cards.map((c) => <StatTile class="sc-fast-card sc-card" variant="card" size="xl" align="start" m:color={c.color} value={c.value} label={c.label}
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
      <Reveal class="sc-start-code" self effect="start" distance={46} scrub><CodeView code={START} lang="tsx" wrap label="Örnek kod" /></Reveal>
      <Reveal class="sc-start-out sc-card" self effect="end" distance={46} scrub>
        <span class="sc-start-out-l">Sonuç</span>
        <Button variant="primary" icon={sparkles} on:click={(e: Event) => heartBurst(e.currentTarget as HTMLElement, { radius: 46 })}>Merhaba</Button>
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
      <WorldMap />
      <Fast report={report} />
      <Start />
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
