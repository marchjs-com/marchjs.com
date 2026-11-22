// The topics of /speed (one page each, /speed/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "slow-3g", title: "Yavaş 3G", desc: "Yavaş ağda sayfa ve parçaların nasıl geldiği.", group: "Hız" },
  { slug: "instant", title: "Anında geçiş", desc: "Menüde bir sayfaya tıklayınca adres, etkin bağlantı ve konum çubuğu hemen değişir.", group: "Hız" },
  { slug: "parts", title: "Canlı parça listesi", desc: "Derlemedeki her tembel birim (sayfalar, lazy bileşenler, kabuk parçaları, dil paketi) ve bu sekmede inip…", group: "Hız" },
  { slug: "network-log", title: "Canlı ağ paneli", desc: "Bu sekme açıldığından beri yüklenen her dosya.", group: "Hız" },
  { slug: "route-size", title: "Rota başına boyut (gzip)", desc: "march build her derlemede yazar (march-report.json): giriş, her sayfa (yoluyla) ve her tembel parça (lazy…", group: "Hız" },
  { slug: "offline", title: "Çevrimdışı önbellek (service worker)", desc: "İsteğe bağlı: march.config.js › sw: true derlemede sw.js yazar.", group: "Hız" },
];
