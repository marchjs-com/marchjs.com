// The topics of /managers-env (one page each, /managers-env/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "idle", title: "Boşta", desc: "Kullanıcı boşta mı; süre, duraklatma.", group: "Ortam" },
  { slug: "presence", title: "Varlık", desc: "Kim çevrimiçi, kim yazıyor.", group: "Ortam" },
  { slug: "sync", title: "Sekme eşitleme", desc: "Sekmeler arası durum ve mesaj.", group: "Ortam" },
  { slug: "session", title: "Oturum", desc: "Oturum süresi, yenileme, çıkış.", group: "Ortam" },
  { slug: "permission", title: "İzinler", desc: "Tarayıcı izinleri: durum ve isteme.", group: "Ortam" },
  { slug: "location", title: "Konum", desc: "Konum izni ve izleme.", group: "Ortam" },
  { slug: "notification", title: "Bildirim", desc: "Sistem bildirimleri ve izin.", group: "Ortam" },
  { slug: "window", title: "Pencere", desc: "Görünürlük, odak, tam ekran, boyut.", group: "Ortam" },
  { slug: "scroll", title: "Kaydırma", desc: "Sayfa ilerlemesi ve scrollspy.", group: "Ortam" },
  { slug: "device", title: "Cihaz", desc: "Ağ, pil, bellek, yetenekler.", group: "Ortam" },
];
