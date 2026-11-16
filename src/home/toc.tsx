// The home page's sections as addresses and a timeline. Every section has its own #name; as the page scrolls, the
// section being read writes its name into the address bar (replaceState: no history entry per section). On a wide
// screen a timeline rail stands at the side: a mark per section, the one being read lit and named, the line filled up to
// it; a press on a mark scrolls to that section (a section in a part not loaded yet is loaded on the way).
import "./toc.css";
import { onCleanup, Portal, untrack } from "march";
import { nextFrame, reducedMotion } from "march/motion";
import { hash } from "march/router";

/** One section: the id of its heading, its address (#name), its timeline label, the lazy part it lives in (-1: none). */
interface Item { head: string; slug: string; label: string; part: number }
const I = (head: string, slug: string, label: string, part = -1): Item => ({ head, slug, label, part })

// in page order; `part` is the index of the section's lazy slot in .sc-home-body (sections.tsx)
export const ITEMS: readonly Item[] = [
  I("sc-live-h", "signals", "Sinyaller"),
  I("sc-kit-h", "one-package", "Tek paket"),
  I("sc-move-h", "motion", "Hareket"),
  I("sc-try-h", "ide", "Tarayıcıda IDE"),
  I("sc-intl-h", "languages", "Her dilde"),
  I("sc-safe-h", "security", "Güvenlik"),
  I("sc-ai-h", "ai", "Yapay zekâ", 0),
  I("sc-form-h", "forms", "Formlar", 1),
  I("sc-theme-h", "themes", "Temalar", 1),
  I("sc-icon-h", "icons", "İkonlar", 1),
  I("sc-layer-h", "layers", "Katmanlar", 1),
  I("sc-pal-h", "keyboard", "Klavye", 1),
  I("sc-design-h", "theme-editor", "Kendi teman", 2),
  I("sc-chart-h", "live-charts", "Grafikler", 3),
  I("sc-test-h", "tests", "Testler", 3),
  I("sc-vs-charts-h", "charts", "Grafik", 4),
  I("sc-vs-media-h", "media", "Medya", 4),
  I("sc-vs-landing-h", "pricing", "Satış sayfası", 4),
  I("sc-vs-social-h", "stories", "Hikâye ve sohbet", 4),
  I("sc-vs-md-h", "markdown", "Markdown", 4),
  I("sc-dt-table-h", "table", "Tablo", 5),
  I("sc-dt-board-h", "board", "Pano", 5),
  I("sc-dt-date-h", "calendar", "Takvim", 5),
  I("sc-dt-tree-h", "tree", "Ağaç", 5),
  I("sc-dt-flow-h", "steps", "Akış", 5),
  I("sc-mx-spring-h", "springs", "Yay fiziği", 6),
  I("sc-mx-flip-h", "flip", "FLIP", 6),
  I("sc-mx-loop-h", "text-effects", "Döngü efektleri", 6),
  I("sc-mx-fx-h", "effects", "Efektler", 6),
  I("sc-mx-page-h", "page-transitions", "Sayfa geçişleri", 6),
  I("sc-ap-route-h", "router", "Yönlendirici", 7),
  I("sc-ap-keep-h", "persist", "Kalıcı durum", 7),
  I("sc-ap-dev-h", "device", "Cihaz", 7),
  I("sc-ap-intl-h", "translation", "Çeviri", 7),
  I("sc-ap-sw-h", "offline", "Çevrimdışı", 7),
  I("sc-dv-lang-h", "language", "Dil", 8),
  I("sc-dv-cli-h", "cli", "Komut satırı", 8),
  I("sc-dv-size-h", "size", "Boyut", 8),
  I("sc-dv-ext-h", "extensions", "Eklentiler", 8),
  I("sc-dv-embed-h", "embed", "Her yere", 8),
  I("sc-tl-flow-h", "flow-editor", "Akış düzenleyici", 9),
  I("sc-tl-ease-h", "easing", "Yumuşatma eğrisi", 9),
  I("sc-tl-undo-h", "undo", "Geri al, yinele", 9),
  I("sc-tl-pick-h", "pickers", "Seçiciler", 9),
  I("sc-tl-a11y-h", "accessibility", "Erişilebilirlik", 9),
  I("sc-social-h", "social", "Sosyal", 10),
  I("sc-cmp-h", "compare", "Karşılaştırma", 10),
  I("sc-map-h", "map", "Harita"),
  I("sc-fast-h", "speed", "Hız ve boyut"),
  I("sc-start-h", "start", "Başla"),
]

/** The section of an item, when it is on the page (its part loaded). */
const sectionOf = (it: Item): HTMLElement | null => document.getElementById(it.head)?.closest("section") ?? null
/** The slot of a lazy part (it holds the part's room until it arrives). */
const slotOf = (part: number): Element | null => (part < 0 ? null : document.querySelectorAll(".sc-home-body > .m-lazy-slot")[part] ?? null)
/** Where an item stands now: its section, or while its part is not loaded the part's slot (for the part's first item). */
const placeOf = (it: Item, i: number): Element | null => sectionOf(it) ?? (ITEMS[i - 1]?.part !== it.part ? slotOf(it.part) : null)
/** Room left above a section when it is scrolled to (the sticky top bar and a little air). */
const TOP = 80
/** The line a section must pass to count as being read: a third of the way down the screen. */
const READ = 0.33
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function HomeToc() {
  let $active = -1
  let jumping = false
  let alive = true
  // the #name this page wrote last (replaceState does not tell the router)
  let shown = untrack(hash)

  /** The section being read: the last one whose top has passed the reading line. */
  const measure = () => {
    const line = innerHeight * READ
    let at = -1
    ITEMS.forEach((it, i) => { const el = placeOf(it, i); if (el && el.getBoundingClientRect().top <= line) at = i })
    return at
  }
  /** Write the section's name into the address (no history entry); above the first section the address has none. */
  const address = (i: number) => {
    const want = i < 0 ? "" : `#${ITEMS[i]!.slug}`
    if (shown === want) return
    shown = want
    window.history.replaceState(window.history.state, "", `${location.pathname}${location.search}${want}`)
  }
  let queued = false
  const spy = () => {
    if (queued || !alive) return
    queued = true
    nextFrame(() => {
      queued = false
      if (!alive || jumping) return
      const i = measure()
      if (i !== $active) { $active = i; address(i) }
    })
  }
  addEventListener("scroll", spy, { passive: true })
  addEventListener("resize", spy, { passive: true })

  const top = (el: Element) => el.getBoundingClientRect().top + scrollY - TOP
  /** Scroll to a section; a part not loaded yet is brought near (it loads as it comes into view), then the section. */
  const jump = async (i: number, smooth = true) => {
    const it = ITEMS[i]
    if (!it) return
    jumping = true
    $active = i
    address(i)
    try {
      for (let k = 0; k < 80 && alive && !sectionOf(it); k++) {
        const slot = slotOf(it.part)
        if (!slot) return
        scrollTo({ top: top(slot), behavior: "instant" })
        await wait(150)
      }
      const behavior = smooth && !reducedMotion() ? "smooth" : "instant"
      // parts above may still arrive and push the section down: scroll again until it stays where it should be
      for (let k = 0; k < 4 && alive; k++) {
        const el = sectionOf(it)
        if (!el) return
        if (Math.abs(el.getBoundingClientRect().top - TOP) < 6) break
        scrollTo({ top: top(el), behavior: k ? "instant" : behavior })
        await wait(k ? 250 : 700)
      }
    } finally {
      jumping = false
      spy()
    }
  }

  // an address that names a section (a shared link): go there once the page is drawn
  const first = ITEMS.findIndex((it) => `#${it.slug}` === shown)
  if (first >= 0) void wait(300).then(() => jump(first, false))
  else spy()

  onCleanup(() => { alive = false; removeEventListener("scroll", spy); removeEventListener("resize", spy) })

  // the fisheye: near the pointer (or the focused mark) the marks grow apart and show their names, the nearest the
  // largest; each item gets --k from 0 (far) to 1 (under the pointer). Distances are taken from where the marks stood
  // before they grew, so the list does not chase its own growth.
  let list: HTMLElement | undefined
  let base: number[] = []
  const REACH = 110
  const rest = () => {
    if (!list) return []
    const r = list.getBoundingClientRect(), n = ITEMS.length, step = r.height / n, mid = r.top + r.height / 2
    return ITEMS.map((_, i) => mid + (i - (n - 1) / 2) * step)
  }
  let lens: number | null = null, lensQueued = false
  const paint = () => {
    lensQueued = false
    if (!list) return
    const items = list.children
    for (let i = 0; i < items.length; i++) {
      const d = lens == null ? REACH : Math.abs(lens - (base[i] ?? 0))
      const k = d >= REACH ? 0 : (1 + Math.cos((d / REACH) * Math.PI)) / 2
      ;(items[i] as HTMLElement).style.setProperty("--k", k ? k.toFixed(3) : "0")
    }
  }
  const lensAt = (y: number | null) => { lens = y; if (!lensQueued) { lensQueued = true; nextFrame(paint) } }
  const enter = () => { if (lens == null) base = rest() }
  const fill = () => ($active < 0 ? 0 : $active / (ITEMS.length - 1))
  // in <body>: a section above may move or scale its content (transform), which would carry a fixed rail with it
  return <Portal mount={document.body}><nav class="sc-toc" aria-label="Bölümler">
    <span class="sc-toc-line" aria-hidden="true"><span class="sc-toc-fill" style={() => ({ "--sc-toc-fill": String(fill()) })} /></span>
    <ol class="sc-toc-list" ref={(el: HTMLElement) => { list = el }}
      on:pointerenter={enter} on:pointermove={(e: PointerEvent) => { if (!base.length) enter(); lensAt(e.clientY) }}
      on:pointerleave={() => { lensAt(null); base = [] }}
      on:focusin={(e: FocusEvent) => { const li = (e.target as Element).closest("li"); if (!li || !list) return; enter(); lensAt(base[[...list.children].indexOf(li)] ?? null) }}
      on:focusout={() => { lensAt(null); base = [] }}>
      {ITEMS.map((it, i) => <li class="sc-toc-item" class:is-on={() => $active === i} class:is-past={() => i < $active}>
        <a class="sc-toc-mark" href={`#${it.slug}`} aria-current={() => ($active === i ? "location" : null)}
          on:click={(e: MouseEvent) => { e.preventDefault(); void jump(i) }}>
          <span class="sc-toc-dot" aria-hidden="true" />
          <span class="sc-toc-label">{it.label}</span>
        </a>
      </li>)}
    </ol>
  </nav></Portal>
}
