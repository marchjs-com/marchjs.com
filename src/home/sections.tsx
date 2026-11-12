// Home page sections below the hero: live numbers rolling into view, the categories, highlights with
// small live previews, the performance band, a first example and the footer. Every number comes from home-stats.gen.ts
// (tools/gen-home-stats.js) or from march-report.json (this build's measured sizes); none is typed here.
import "./sections.css";
import { reveal, inView, animate, tween, reducedMotion } from "hadi-march/motion";
import { Link } from "hadi-march/router";
import { appUrl } from "hadi-march/base";
import { Button, CountRoll, MadeWithMarch, ThemeSwatch, colorThemes, colorTheme, setColorTheme, type IconTone } from "hadi-march/ui";
import { Icon, activity, arrowRight, edit, film, gauge, globe, heart, layers, palette, eye, sliders, packageBox, panelLeft } from "hadi-march/icons";
import { CATEGORIES } from "hadi-march/components/categories.ts";
import { HOME_STATS as S } from "../home-stats.gen.ts";

interface Report { entry?: { js: number }; boot?: { js: number } | null }
const kb = (bytes: number): number => Math.round((bytes / 1024) * 10) / 10;

/** Runs `start` while the element is on screen and cancels what it returned when it leaves (no work off screen). */
function whileVisible(start: (el: HTMLElement) => Array<{ cancel(): void } | { stop(): void }>) {
  return (el: Element): (() => void) => {
    let runs: Array<{ cancel(): void } | { stop(): void }> = []
    const stop = () => { for (const r of runs) ("cancel" in r ? r.cancel() : r.stop()); runs = [] }
    const off = inView(el, { enter: () => { stop(); runs = start(el as HTMLElement) }, leave: stop })
    return () => { off(); stop() }
  }
}
const rtl = (el: Element): boolean => !!el.closest("[dir=rtl]")

// ── live numbers ────────────────────────────────────────────────────────────────────────────────────────────────

/** How far a count has rolled (0..1 of its value): a few steps, so CountRoll rolls the digits up like a counter. */
const STEPS = [0, 0.3, 0.55, 0.75, 0.9, 1]
const stepOf = (p: number): number => { let s = 0; for (const x of STEPS) if (p >= x - 1e-6) s = x; return s }

// The numbers roll once, when the band first scrolls into view. The prerendered page (no IntersectionObserver at build
// time) and the takeover show zeros, so nothing jumps; with reduced motion the final values appear at once.
function StatsBand(props: { report: () => Report | null }) {
  let $shown = false
  let $still = false
  const rolled = tween(() => ($shown ? 1 : 0), { duration: 1500, easing: "easeOutCubic" })
  const progress = () => ($still ? ($shown ? 1 : 0) : stepOf(rolled()))
  const enter = () => { if (typeof IntersectionObserver !== "function") return; $still = reducedMotion(); $shown = true }
  const boot = () => { const r = props.report(); return r?.boot ? kb(r.boot.js) : null }
  const stats: Array<{ value: () => number | null; label: string; href: string }> = [
    { value: () => S.components, label: "bileşen", href: "/buttons" },
    { value: () => S.exports, label: "dışa aktarım", href: "/start" },
    { value: () => S.icons.total, label: "ikon", href: "/icons" },
    { value: () => S.animations.total, label: "animasyon", href: "/text-motion" },
    { value: () => S.managers, label: "yönetici", href: "/managers" },
    { value: () => S.tests, label: "test", href: "/start" },
    { value: () => (boot() == null ? null : Math.round(boot() as number)), label: "KB açılış (gzip)", href: "/speed" },
    { value: () => S.dependencies, label: "bağımlılık", href: "/start" },
  ]
  return <section class="sc-band sc-numbers" aria-label="Rakamlarla" use:inView={{ once: true, enter }}>
    {stats.map((s, i) => <Link href={s.href} class="sc-number" use:reveal={{ delay: i * 50 }}>
      <span class="sc-number-n"><CountRoll value={() => { const v = s.value(); return v == null ? null : Math.round(v * progress()) }} format="full" duration={260} /></span>
      <span class="sc-number-l">{s.label}</span>
    </Link>)}
  </section>
}

// ── highlights: each with a small live preview on the motion engine ────────────────────────────────────────────

/** Motion engine: bars of an equalizer, staggered on one clock. */
function MotionPreview() {
  return <div class="sc-pv sc-pv-bars" use:play={whileVisible((el) => [...el.children].map((b, i) =>
    animate(b, [{ transform: "scaleY(.25)" }, { transform: "scaleY(1)" }], { duration: 700, delay: i * 90, iterations: Infinity, direction: "alternate", easing: "easeInOutCubic" })))}>
    {CATEGORIES.slice(0, 7).map(() => <span />)}
  </div>
}

/** Text animations: the word waves letter by letter (each letter on the motion engine, staggered). */
function TextPreview() {
  return <div class="sc-pv sc-pv-text"><span class="sc-pv-word" aria-label="March" use:play={whileVisible((el) => [...el.children].map((ch, i) =>
    animate(ch, [{ transform: "translateY(0)" }, { transform: "translateY(-.3em)" }], { duration: 520, delay: i * 70, iterations: Infinity, direction: "alternate", easing: "easeInOutCubic" })))}>
    {[..."March"].map((c) => <span aria-hidden="true">{c}</span>)}
  </span></div>
}

/** Page transitions: two small pages take turns, sliding in the reading direction. */
function PagesPreview() {
  return <div class="sc-pv sc-pv-pages" use:play={whileVisible((el) => {
    const s = rtl(el) ? -1 : 1
    const [a, b] = [...el.children]
    const frames = (from: number) => [
      { transform: `translateX(${from * s * 100}%)`, offset: 0 }, { transform: "translateX(0)", offset: 0.12 }, { transform: "translateX(0)", offset: 0.5 },
      { transform: `translateX(${-from * s * 100}%)`, offset: 0.62 }, { transform: `translateX(${-from * s * 100}%)`, offset: 1 },
    ]
    return [animate(a!, frames(1), { duration: 4400, iterations: Infinity, easing: "easeInOutCubic" }),
      animate(b!, frames(1), { duration: 4400, delay: 2200, iterations: Infinity, easing: "easeInOutCubic" })]
  })}>
    <span class="sc-pv-page"><i /><i /><i /></span>
    <span class="sc-pv-page is-b"><i /><i /><i /></span>
  </div>
}

/** Flow editor: nodes joined by edges that carry data. */
function FlowPreview() {
  return <svg class="sc-pv sc-pv-flow" viewBox="0 0 220 96" aria-hidden="true" use:play={whileVisible((el) => [...el.querySelectorAll(".sc-pv-edge")].map((p) =>
    animate(p, [{ strokeDashoffset: "0" }, { strokeDashoffset: "-16" }], { duration: 700, iterations: Infinity, easing: "linear" })))}>
    <path class="sc-pv-edge" d="M58 30 C 90 30, 90 66, 122 66" />
    <path class="sc-pv-edge" d="M58 30 C 110 30, 130 22, 162 22" />
    <rect class="sc-pv-node" x="10" y="16" width="48" height="28" rx="8" />
    <rect class="sc-pv-node is-b" x="122" y="52" width="48" height="28" rx="8" />
    <rect class="sc-pv-node is-c" x="162" y="8" width="48" height="28" rx="8" />
  </svg>
}

/** IDE shell: activity bar, file tree, an editor whose lines type in, a status bar. */
function IdePreview() {
  return <div class="sc-pv sc-pv-ide" use:play={whileVisible((el) => [...el.querySelectorAll(".sc-pv-line")].map((l, i) =>
    animate(l, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, delay: i * 140, easing: "easeOutCubic", fill: "both" })))}>
    <span class="sc-pv-act" /><span class="sc-pv-tree"><i /><i /><i /><i /></span>
    <span class="sc-pv-editor">{CATEGORIES.slice(0, 5).map(() => <i class="sc-pv-line" />)}</span>
    <span class="sc-pv-status" />
  </div>
}

/** Social set: a like with the set's rolling count (CountRoll: only the digits that change roll). */
function SocialPreview() {
  let $liked = false
  let $count = S.components
  return <div class="sc-pv sc-pv-social">
    <span class="sc-pv-avatar" aria-hidden="true">A</span>
    <span class="sc-pv-post"><b>Acme</b><span class="hm-muted">Yeni sürüm yayında</span></span>
    <Button size="sm" variant={() => ($liked ? "primary" : "secondary")} icon={heart} aria-pressed={() => String($liked)} label="Beğen"
      onClick={() => { $liked = !$liked; $count += $liked ? 1 : -1 }}>
      <CountRoll value={() => $count} format="full" />
    </Button>
  </div>
}

/** Theme editor: every theme as a swatch; a click recolors the page. */
function ThemePreview() {
  return <div class="sc-pv sc-pv-themes" role="radiogroup" aria-label="Tema">
    {colorThemes().map((th) => <button type="button" role="radio" class="sc-pv-swatch" aria-checked={() => String(colorTheme() === th.id)} aria-label={th.name} title={th.name} on:click={() => setColorTheme(th.id)}>
      <ThemeSwatch id={th.id} />
    </button>)}
  </div>
}

const HIGHLIGHTS: Array<{ title: string; desc: string; href: string; icon: unknown; tone: IconTone; preview: () => unknown }> = [
  { title: "Hareket motoru", desc: "Tek saat: keyframe, timeline, yay; global hız, tümünü durdur ve azaltılmış hareket her animasyonda.", href: "/animation", icon: film, tone: "primary", preview: MotionPreview },
  { title: "Metin animasyonları", desc: `${S.animations.text} metin efekti: giriş, döngü, süsleme, daktilo, sayaç.`, href: "/text-motion", icon: edit, tone: "info", preview: TextPreview },
  { title: "Sayfa geçişleri", desc: `${S.animations.pageFx} geçiş efekti; geri yönde ters, sağdan solda aynalı.`, href: "/motion/pages", icon: layers, tone: "violet", preview: PagesPreview },
  { title: "Akış editörü", desc: "Düğüm tabanlı tuval, palet, çalıştır, duraklat, adım adım.", href: "/flow", icon: activity, tone: "success", preview: FlowPreview },
  { title: "IDE kabuğu", desc: "Panel yerleşimi, sekmeli editör, araç ve durum çubukları.", href: "/ide", icon: panelLeft, tone: "teal", preview: IdePreview },
  { title: "Sosyal set", desc: "Gönderi, akış, hikâye, sohbet; beğeni ve sayaçlar.", href: "/social", icon: heart, tone: "pink", preview: SocialPreview },
  { title: "Tema editörü", desc: "Hazır temalar, vurgu rengi ve kendi temanı yazma.", href: "/themes", icon: palette, tone: "warn", preview: ThemePreview },
]

function Highlights() {
  return <section class="sc-section" aria-labelledby="sc-hl-h">
    <header class="sc-section-head">
      <p class="sc-eyebrow">Öne çıkanlar</p>
      <h2 id="sc-hl-h" class="sc-section-title">Canlı, hareketli, hazır</h2>
      <p class="sc-section-sub">Her önizleme gerçek bileşenlerle çalışır; ayrıntısı kendi sayfasında.</p>
    </header>
    <div class="sc-highlights">
      {HIGHLIGHTS.map((f, i) => <article class="sc-feat" use:reveal={{ delay: (i % 3) * 70 }}>
        <div class="sc-feat-stage">{f.preview()}</div>
        <div class="sc-feat-body">
          <h3 class="sc-feat-title"><Link href={f.href} class="sc-feat-link">{f.title}</Link></h3>
          <p class="sc-feat-desc">{f.desc}</p>
        </div>
        <span class="sc-feat-go" aria-hidden="true"><Icon of={f.icon} /><Icon of={arrowRight} class="sc-feat-arrow" /></span>
      </article>)}
    </div>
  </section>
}

// ── performance ─────────────────────────────────────────────────────────────────────────────────────────────────

function Performance(props: { report: () => Report | null }) {
  const bootKb = () => { const r = props.report(); return r?.boot ? `${kb(r.boot.js)} KB` : `${S.budget.boot / 1024} KB` }
  const items: Array<{ icon: unknown; value: () => string; title: string; text: () => string }> = [
    { icon: gauge, value: bootKb, title: "Açılış", text: () => (props.report()?.boot ? `gzip, bu derlemede ölçüldü; bütçe ${S.budget.boot / 1024} KB` : "bütçe; ölçüm derlenmiş vitrinde") },
    { icon: packageBox, value: () => `${S.budget.partFloor / 1024} KB`, title: "Parça kuralı", text: () => "altında dosya yok: küçük modüller birleşir, sayfalar tembel gelir" },
    { icon: layers, value: () => `${S.dependencies}`, title: "Bağımlılık", text: () => "çalışma zamanında hiçbir paket yok" },
    { icon: globe, value: () => "RTL", title: "Sağdan sola", text: () => "mantıksal CSS, aynalanan animasyonlar" },
    { icon: sliders, value: () => "i18n", title: "Çok dilli", text: () => "her metin çeviri anahtarıyla, yerel sayı ve tarih" },
    { icon: eye, value: () => "a11y", title: "Erişilebilir", text: () => "rol, aria, klavye, odak ve azaltılmış hareket" },
  ]
  return <section class="sc-band sc-perf" aria-labelledby="sc-perf-h">
    <header class="sc-section-head">
      <p class="sc-eyebrow">Hız ve boyut</p>
      <h2 id="sc-perf-h" class="sc-section-title">Küçük açılır, büyüdükçe yavaşlamaz</h2>
    </header>
    <div class="sc-perf-grid">
      {items.map((it, i) => <div class="sc-perf-item" use:reveal={{ delay: i * 50 }}>
        <span class="sc-perf-icon"><Icon of={it.icon} /></span>
        <span class="sc-perf-v">{it.value}</span>
        <span class="sc-perf-t">{it.title}</span>
        <span class="sc-perf-x">{it.text}</span>
      </div>)}
    </div>
    <Link href="/speed" class="sc-perf-more">Canlı ağ paneli</Link>
  </section>
}

export default function HomeSections(props: { categories?: unknown; start?: unknown }) {
  let $report: Report | null = null
  void fetch(appUrl("march-report.json")).then((r) => (r.ok ? r.json() : null)).then((x: Report | null) => { $report = x }, () => {})
  const report = () => $report
  return <div class="sc-home-rest">
    <StatsBand report={report} />
    <div class="sc-home-body">
      {props.categories}
      <Highlights />
      <Performance report={report} />
      {props.start}
    </div>
    <footer class="sc-home-foot">
      <MadeWithMarch variant="badge" />
      <span class="sc-home-foot-links">
        <Link href="/start">İlk Adımlar</Link>
        <Link href="/start">API başvurusu</Link>
        <Link href="/speed">Hız</Link>
      </span>
    </footer>
  </div>
}

/** `use:play={whileVisible(…)}`: the action is the function itself. */
function play(el: Element, fn: unknown): () => void {
  return typeof fn === "function" ? (fn as (el: Element) => () => void)(el) : () => {}
}
