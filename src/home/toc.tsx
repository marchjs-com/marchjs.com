// The home page's sections on a SectionTimeline (march/navigation): every section has its own #name, which the address
// follows as the page scrolls; on a wide screen the dots stand at the side, magnify near the pointer and scroll to a
// section when pressed (a section in a lazy part not loaded yet is reached through the part's slot).
import "./toc.css";
import { SectionTimeline, type SectionTimelineItem } from "march/navigation";

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

/** The heading's section. */
const sectionOf = (head: string): Element | null => document.getElementById(head)?.closest("section") ?? null
/** The slot of a lazy part (it holds the part's room until it arrives). */
const slotOf = (part: number): Element | null => document.querySelectorAll(".sc-home-body > .m-lazy-slot")[part] ?? null

const SECTIONS: SectionTimelineItem[] = ITEMS.map((it) => ({
  label: it.label, slug: it.slug, target: () => sectionOf(it.head),
  placeholder: it.part < 0 ? undefined : () => slotOf(it.part),
}))

export function HomeToc() {
  return <SectionTimeline class="sc-toc" items={SECTIONS} fixed hash intro />
}
