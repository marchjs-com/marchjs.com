// The topics of /feedback (one page each, /feedback/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "alert", title: "Uyarı", name: "Alert", desc: "Beş ton, eylem ve kapatma.", group: "Bildirim" },
  { slug: "empty", title: "Boş ekran", name: "Empty", desc: "Ne yapılacağını söyleyen boş durum.", group: "Bildirim" },
  { slug: "error-box", title: "Hata kutusu", name: "ErrorBox", desc: "Hata ve yeniden dene.", group: "Bildirim" },
  { slug: "status-dot", title: "Durum noktası", name: "StatusDot", desc: "Tonlu nokta; halka ya da yanıp sönme.", group: "Bildirim" },
  { slug: "check-mark", title: "Onay işareti", name: "CheckMark", desc: "Evet, hayır, kısmen; okunur metniyle.", group: "Bildirim" },
  { slug: "live-status", title: "Canlı durum satırı", name: "LiveStatus", desc: "Değişeni kibarca okutan satır: sayaç, aralık; görünür ya da yalnız okunur, yardım satırıyla.", group: "Bildirim" },
  { slug: "progress", title: "İlerleme", name: "Progress", desc: "Değer, belirsiz, renkler.", group: "Yükleme" },
  { slug: "skeleton", title: "İskelet", name: "Skeleton", desc: "İçerik gelmeden düzen.", group: "Yükleme" },
  { slug: "spinner", title: "Dönen halka", name: "Spinner", desc: "Küçük bekleme göstergesi.", group: "Yükleme" },
  { slug: "loader", title: "Yükleyici", name: "Loader", desc: "Bir alanı dolduran yükleme.", group: "Yükleme" },
];
