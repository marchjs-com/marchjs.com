// The topics of /navigation (one page each, /navigation/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "routing", title: "Yönlendirici", name: "Router", desc: "Kalıcı yerleşim, adlı outlet, modal rota.", group: "Yönlendirme" },
  { slug: "nav-sidebar", title: "Kenar menüsü", name: "NavSidebar", desc: "Kategori sırası, daraltma, iç içe sayfalar.", group: "Menüler" },
  { slug: "nav-menu", title: "Uygulama menüsü", name: "NavMenu", desc: "Sabitlenen ve son kullanılan sayfalar.", group: "Menüler" },
  { slug: "bottom-nav", title: "Alt sekme çubuğu", name: "BottomNav", desc: "Mobil sekmeler, orta eylem.", group: "Menüler" },
  { slug: "tabs", title: "Sekmeler", name: "Tabs", desc: "Sekmeli paneller.", group: "Sayfa içi" },
  { slug: "steps", title: "Aşamalar", name: "Steps", desc: "Adım göstergesi.", group: "Sayfa içi" },
  { slug: "stepper", title: "Adım adım", name: "Stepper", desc: "Morph geçişli adımlar.", group: "Sayfa içi" },
  { slug: "pagination", title: "Sayfalama", name: "Pagination", desc: "Kısaltmalı sayfa numaraları.", group: "Sayfa içi" },
  { slug: "pull-to-refresh", title: "Çekerek yenile", name: "PullToRefresh", desc: "Dokunmatikte aşağı çek, yenile.", group: "Sayfa içi" },
  { slug: "overflow-text", title: "Taşan metin", name: "OverflowText", desc: "OverflowText ve Marquee.", group: "Sayfa içi" },
  { slug: "thread-nav", title: "İplik gezinme", name: "ThreadNav", desc: "Bölümler iplikte boncuk; kapsülde kategoriler, alt iplikte sayfalar, damla bulunduğun yerde.", group: "Sayfa içi" },
  { slug: "section-timeline", title: "Bölüm zaman çizelgesi", name: "SectionTimeline", desc: "Bölüm başına bir nokta, okunan renkli; Dock gibi büyür, basınca kayar, adresi izler.", group: "Sayfa içi" },
  { slug: "page-dots", title: "Sayfa noktaları", name: "PageDots", desc: "Sayfa başına bir nokta, etkin olan uzun ve renkli; tıklanır ya da yalnız konumu gösterir.", group: "Sayfa içi" },
  { slug: "period-nav", title: "Dönem gezinme", name: "PeriodNav", desc: "Önceki, bugün, sonraki; istenirse okların arasında dönemin adı.", group: "Sayfa içi" },
];
