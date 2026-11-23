// The topics of /managers-data (one page each, /managers-data/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "clipboard", title: "Pano", desc: "Kopyala ve yapıştır; izin ve yedek yol.", group: "Veri ve durum" },
  { slug: "undo", title: "Geri al ve kaydedilmemiş", desc: "Geri al / yinele geçmişi, kaydedilmemiş değişiklik uyarısı.", group: "Veri ve durum" },
  { slug: "storage", title: "Depolama", desc: "local, session ve IndexedDB tek arayüzle; kota ve süre.", group: "Veri ve durum" },
  { slug: "cache", title: "Önbellek", desc: "Anahtarlı önbellek, tazelik, yeniden doğrulama.", group: "Veri ve durum" },
  { slug: "config", title: "Yapılandırma", desc: "Katmanlı ayarlar, ortam değişkenleri, canlı değişim.", group: "Veri ve durum" },
];
