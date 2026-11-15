// Sample web sites: full pages built only from the website blocks (src/components/landing). /sites lists them as
// cards (topics.ts "/sites"); /sites/<view> opens one in a frame with a bar: device width, full screen, theme and
// writing direction for the preview only, the blocks it is made of (links to their pages), its source and the
// previous / next sample. Inside the frame (?bare=1) the site draws alone.
import "./web.css";
import { computed, signal, effect, onCleanup } from "march";
import { Link, query, navigate } from "march/router";
import { colorThemes, loadTheme, ThemeSwatch } from "march/ui";
import { Icon, arrowLeft, arrowRight, maximize, minimize, externalLink, rotateCw } from "march/icons";
import { DevicePreview, previewFrame } from "march/components/layout/index.ts";
import { appUrl } from "march/base";
import { lazy } from "march/lazy";
import { Hub } from "../hub.tsx";
import { HUBS, SITE_KINDS } from "../topics.ts";

export const title = "Örnek uygulamalar"

// each sample loads only when it is opened, as its own part
const LOAD: Record<string, () => unknown> = {
  product: lazy(() => import("../web/product.tsx"), { placeholder: "block", height: "100vh" }),
  portfolio: lazy(() => import("../web/portfolio.tsx"), { placeholder: "block", height: "100vh" }),
  slides: lazy(() => import("../web/slides.tsx"), { placeholder: "card", height: "36rem" }),
  redesign: lazy(() => import("../web/redesign.tsx"), { placeholder: "block", height: "100vh" }),
  honest: lazy(() => import("../web/honest.tsx"), { placeholder: "block", height: "100vh" }),
  live: lazy(() => import("../web/live.tsx"), { placeholder: "block", height: "100vh" }),
  story: lazy(() => import("../web/story.tsx"), { placeholder: "block", height: "100vh" }),
}
// the source file and the blocks of each sample (title and description: topics.ts)
const PARTS: Record<string, { file: string; blocks: string[] }> = {
  product: { file: "product.tsx", blocks: ["site-nav", "hero", "logo-cloud", "feature-grid", "scroll-story", "stats-band", "counter", "pricing", "testimonials", "faq", "cta-band", "site-footer", "site-section", "scroll-progress"] },
  portfolio: { file: "portfolio.tsx", blocks: ["site-nav", "hero", "project-grid", "project-detail", "horizontal-scroll", "roadmap", "stats-band", "feature-grid", "site-footer", "site-section"] },
  slides: { file: "slides.tsx", blocks: ["presentation"] },
  redesign: { file: "redesign.tsx", blocks: ["before-after", "site-nav", "hero", "stats-band", "cta-band", "site-footer", "site-section"] },
  honest: { file: "honest.tsx", blocks: ["not-for-you", "honest-compare", "site-nav", "hero", "cta-band", "site-footer", "site-section"] },
  live: { file: "live.tsx", blocks: ["live-feed", "live-counter", "counter", "site-nav", "hero", "cta-band", "site-footer", "site-section"] },
  story: { file: "story.tsx", blocks: ["branching-story", "site-nav", "hero", "cta-band", "site-footer", "site-section"] },
}
const SAMPLES = (HUBS["/sites"] ?? []).filter((t) => LOAD[t.slug]).map((t) => ({ view: t.slug, title: t.title, ...PARTS[t.slug]! }))
type Sample = typeof SAMPLES[number]
const SOURCE = "https://github.com/marchjs/march/blob/main/examples/showcase/src/web/"
// desktop: the full frame; the others: a real device body (DevicePreview) with touch
const DEVICES = [{ id: "desktop", label: "Masaüstü" }, { id: "iphone-15", label: "iPhone" }, { id: "pixel-8", label: "Pixel" }, { id: "ipad", label: "iPad" }] as const
const blockName = (folder: string): string => folder.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")

/** A sample site in its frame, with the preview bar. */
function SampleView(props: { sample: Sample }) {
  const s = props.sample
  const at = SAMPLES.findIndex((x) => x.view === s.view)
  const prev = SAMPLES[(at + SAMPLES.length - 1) % SAMPLES.length]!, next = SAMPLES[(at + 1) % SAMPLES.length]!
  const full = signal(false), theme = signal<string>(""), rtl = signal(false), ready = signal(true)
  // device and rotation live in the address (?device=iphone-15&rotate=1): a shared link opens the same preview
  const device = computed(() => { const d = String(query()["device"] ?? ""); return DEVICES.some((x) => x.id === d) ? d : "desktop" })
  const rotate = computed(() => query()["rotate"] === "1")
  const setQuery = (k: string, v: string | null): void => {
    const u = new URLSearchParams(globalThis.location?.search ?? "")
    if (v) u.set(k, v); else u.delete(k)
    const q = u.toString()
    void navigate(`/sites/${s.view}${q ? `?${q}` : ""}` as never, { replace: true })
  }
  // a theme for this preview only: its stylesheet first, then the frame switches
  effect(() => { const id = theme(); if (!id) { ready.set(true); return } ready.set(false); void loadTheme(id).then(() => ready.set(true)) })
  // full screen: the frame covers the window; Esc comes back
  effect(() => {
    if (!full()) return
    const esc = (e: KeyboardEvent): void => { if (e.key === "Escape") full.set(false) }
    globalThis.addEventListener("keydown", esc)
    onCleanup(() => globalThis.removeEventListener("keydown", esc))
  })
  const fullLabel = (): string => (full() ? "Tam ekrandan çık (Esc)" : "Tam ekran")
  return <div class={() => (full() ? "sc-sample-wrap is-full" : "sc-sample-wrap")}>
    <div class="sc-sample-head">
    <div class="sc-sample-bar" role="toolbar" aria-label="Önizleme">
      <Link href="/sites/landing" class="sc-sample-back"><Icon of={arrowLeft} /><span>Açılış sayfaları</span></Link>
      <strong class="sc-sample-name">{s.title}</strong>
      <div class="sc-seg" role="radiogroup" aria-label="Cihaz">
        {DEVICES.map((d) => <button type="button" role="radio" class="sc-seg-btn" aria-checked={() => String(device() === d.id)} on:click={() => setQuery("device", d.id === "desktop" ? null : d.id)}>{d.label}</button>)}
      </div>
      {() => (device() === "desktop" ? null : <button type="button" class="sc-seg-btn sc-seg-solo" aria-pressed={() => String(rotate())} aria-label="Döndür" title="Döndür" on:click={() => setQuery("rotate", rotate() ? null : "1")}><Icon of={rotateCw} /></button>)}
      <div class="sc-seg" role="radiogroup" aria-label="Önizleme teması">
        <button type="button" role="radio" class="sc-seg-btn" aria-checked={() => String(theme() === "")} on:click={() => theme.set("")}>Sayfanınki</button>
        {colorThemes().map((th) => <button type="button" role="radio" class="sc-sample-swatch" title={th.name} aria-label={th.name} aria-checked={() => String(theme() === th.id)} on:click={() => theme.set(th.id)}><ThemeSwatch id={th.id} /></button>)}
      </div>
      <button type="button" class="sc-seg-btn sc-seg-solo" aria-pressed={() => String(rtl())} on:click={() => rtl.set(!rtl())}>Sağdan sola</button>
      <button type="button" class="sc-seg-btn sc-seg-solo" aria-pressed={() => String(full())} aria-label={fullLabel} title={fullLabel} on:click={() => full.set(!full())}>{() => <Icon of={full() ? minimize : maximize} />}</button>
    </div>
    <details class="sc-sample-parts">
      <summary>{`Bu site ${s.blocks.length} bloktan oluşur · kaynak`}</summary>
      <div class="sc-sample-chips">
        {s.blocks.map((b) => <Link class="sc-chip-link" href={`/web/${b}` as never}><code>{blockName(b)}</code></Link>)}
        <a class="sc-chip-link sc-chip-src" href={SOURCE + s.file} target="_blank" rel="noopener"><Icon of={externalLink} /><span>{`Kaynak: web/${s.file}`}</span></a>
      </div>
    </details>
    </div>
    <div class="sc-sample-stage">
      {() => {
        // the site runs in its own window (an iframe of /web/<view>?bare=1): its own viewport, scrolling, sticky menu,
        // media queries and layers — exactly as the real page; theme and direction go to it in the address
        const src = (): string => {
          const u = new URLSearchParams({ bare: "1" })
          if (theme()) u.set("theme", theme())
          if (rtl()) u.set("dir", "rtl")
          return `${appUrl(`sites/${s.view}`)}?${u}`
        }
        return device() === "desktop"
          ? previewFrame(src, `${s.title} önizleme`, "sc-sample-frame")
          : <DevicePreview device={device()} landscape={rotate} src={src} />
      }}
    </div>
    <nav class="sc-sample-pager" aria-label="Örnek siteler">
      <Link href={`/sites/${prev.view}` as never} class="sc-sample-step"><Icon of={arrowLeft} /><span><small>Önceki örnek</small>{prev.title}</span></Link>
      <Link href={`/sites/${next.view}` as never} class="sc-sample-step sc-sample-step-next"><span><small>Sonraki örnek</small>{next.title}</span><Icon of={arrowRight} /></Link>
    </nav>
  </div>
}

export default function SitesPage(props: { params?: { rest?: string } }) {
  // only the path matters here: query changes (the slide number) must not rebuild the sample
  const view = computed(() => (props.params?.rest ?? "").split("/")[0] ?? "")
  return <>{() => {
    const sample = SAMPLES.find((x) => x.view === view())
    if (!sample) {
      // a kind of sample app (/sites/landing): its apps; /sites: every kind
      const kind = SITE_KINDS.find((k) => k.slug === view())
      return kind
        ? <Hub section="/sites" kicker="Örnek uygulamalar" title={kind.title} lead={`${kind.desc} Her biri kendi penceresinde açılır: cihaz, tema ve yazı yönü yalnız önizlemede değişir; hangi bileşenlerden oluştuğu ve kaynağı üst çubukta.`} render={{}} />
        : <Hub section="/sites" kicker="Web tasarım araçları" title="Örnek uygulamalar" lead="Yalnız web sitesi bileşenleriyle kurulmuş tam uygulamalar, türlerine göre. Şimdilik açılış sayfaları; yönetim paneli, CRM ve e-ticaret sırada." render={{}} params={props.params} />
    }
    const S = LOAD[sample.view] as () => unknown
    // inside the preview iframe (?bare=1): the site alone, with the theme and direction the preview bar picked
    if (query()["bare"] !== undefined) {
      const q = query(), root = document.documentElement
      if (q["dir"] === "rtl") root.setAttribute("dir", "rtl")
      const th = String(q["theme"] ?? "")
      if (th) void loadTheme(th).then(() => root.setAttribute("data-m-theme", th))
      return <div class="sc-sample-page sc-sample-bare"><S /></div>
    }
    return <SampleView sample={sample} />
  }}</>
}
