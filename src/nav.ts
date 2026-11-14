// Showcase pages: path and title only (start-up needs them for the breadcrumb and the document title). Descriptions,
// groups, icons and the menu group order live in nav-meta.ts (the menu manifest), which only the side menu (on first
// idle) and the home page load.
import { TOPIC_PAGES } from "./topics.ts";

export interface PageInfo { path: string; title: string; /** The page this one is listed under in the menu. */ parent?: string; desc?: string }
export const PAGES: PageInfo[] = [
  { path: "/", title: "Merhaba" },
  { path: "/start", title: "İlk Adımlar" },
  { path: "/api", title: "API" },
  { path: "/themes", title: "Temalar ve tokenlar" },
  { path: "/icons", title: "İkonlar" },
  { path: "/buttons", title: "Düğmeler ve rozetler" },
  { path: "/forms", title: "Formlar" },
  { path: "/editors", title: "Editörler" },
  { path: "/data", title: "Veri" },
  { path: "/big-data", title: "Büyük veri" },
  { path: "/charts", title: "Grafikler" },
  { path: "/overlays", title: "Pencereler ve bildirimler" },
  { path: "/feedback", title: "Durumlar" },
  { path: "/motion", title: "Hareket ve efektler" },
  { path: "/animation", title: "Animasyon motoru" },
  { path: "/text-motion", title: "Metin animasyonları" },
  { path: "/transitions", title: "Sayfa geçişleri" },
  { path: "/speed", title: "Hız" },
  { path: "/bench", title: "Hız: karşılaştırma" },
  { path: "/messaging", title: "Haberleşme" },
  { path: "/network", title: "Ağ ve hatalar" },
  { path: "/layout", title: "Yerleşim" },
  { path: "/navigation", title: "Gezinme" },
  { path: "/social", title: "Sosyal" },
  { path: "/overlay", title: "Overlay" },
  { path: "/language", title: "March dili" },
  { path: "/managers", title: "Yöneticiler" },
  { path: "/web", title: "Web siteleri" },
  { path: "/sites", title: "Örnek web siteleri" },
  { path: "/managers-data", title: "Yöneticiler: veri ve durum" },
  { path: "/managers-ops", title: "Yöneticiler: bayrak, günlük, performans" },
  { path: "/seo", title: "SEO" },
  { path: "/managers-a11y", title: "Yöneticiler: erişilebilirlik" },
  { path: "/managers-env", title: "Ortam yöneticileri" },
  { path: "/flow", title: "Akış editörü" },
  { path: "/ide", title: "IDE kabuğu" },
  { path: "/ide-live", title: "IDE kabuğu: canlı demo" },
];
/** Pages under one wildcard route (the menu lists them under their parent; titles for the breadcrumb). */
export const SUB_PAGES: PageInfo[] = [
  // one page per topic of a section (topics.ts): /editors/terminal, /forms/select…
  ...TOPIC_PAGES,
];
