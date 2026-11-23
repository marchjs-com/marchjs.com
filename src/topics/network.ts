// The topics of /network (one page each, /network/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "monitor", title: "Canlı istek izleyici", desc: "Her istek: kategori, politika, öncelik, kaynak ve middleware adımlarının süreleri (satıra tıklayın).", group: "Ağ" },
  { slug: "dedupe", title: "dedupe", desc: "Aynı anahtar uçuştayken gelen istekler aynı yanıtı paylaşır; birinin iptali ötekileri bozmaz.", group: "Ağ" },
  { slug: "latest", title: "latest", desc: "Aynı kategoride yeni istek eskisini iptal eder; yalnız son yazılanın sonucu gelir.", group: "Ağ" },
  { slug: "mock", title: "Mock ↔ gerçek, yavaş ağ, hata oranı", desc: "Mock sağlayıcı tarayıcıda yanıt verir: tohumlu veri, durumlu CRUD, gecikme ve hata oranı.", group: "Ağ" },
  { slug: "websocket", title: "WebSocket bildirim akışı (mock)", desc: "Yönetilen bağlantı: jitter'lı yeniden bağlanma, heartbeat, konu aboneliği (yeniden bağlanınca yenilenir),…", group: "Ağ" },
  { slug: "errors", title: "Hata kuralları", desc: "window hataları, yakalanmamış sözler, sınırlar, net ve WS hataları tek toplayıcıya gelir; aynı hata tekrar…", group: "Ağ" },
];
