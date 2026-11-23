// The topics of /managers-ops (one page each, /managers-ops/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "flags", title: "Özellik bayrakları", desc: "Kullanıcıya ve yüzdeye göre açılan özellikler.", group: "İşletim" },
  { slug: "log", title: "Günlük", desc: "Düzeyler, alt günlükler, sunucuya paketli gönderim.", group: "İşletim" },
  { slug: "perf", title: "Performans", desc: "Ölçümler, Web Vitals, uzun görevler.", group: "İşletim" },
  { slug: "rate", title: "Hız sınırı", desc: "Debounce, throttle ve kova sınırı.", group: "İşletim" },
];
