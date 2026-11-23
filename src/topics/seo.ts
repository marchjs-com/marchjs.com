// The topics of /seo (one page each, /seo/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "live-head", title: "Canlı head", desc: "Alanları değiştir: bu sayfanın <head> etiketleri anında güncellenir (sekme başlığına bak).", group: "SEO" },
  { slug: "history-site", title: "Geçmiş yönlendirmeli bir sitede", desc: "Aynı girdi, site adresi ve yol ile: canonical ve og:url mutlak adres olur.", group: "SEO" },
  { slug: "json-ld", title: "Üretilen JSON-LD", desc: "ld.product / ld.article / ld.website ve ld.breadcrumbs: schema.org nesneleri.", group: "SEO" },
  { slug: "seo-check", title: "march seo check", desc: "Derlenen her sayfa için: eksik başlık, açıklama, canonical, alt metni, h1 ve geçersiz JSON-LD.", group: "SEO" },
  { slug: "prerender", title: "Ön işleme (prerender) ve hidrasyon", desc: "march build, rotaları derleme sırasında HTML'e çevirir (head dahil) ve sitemap.xml ile robots.txt yazar;…", group: "SEO" },
];
