// Page descriptions, groups and icons for the side menu and the home page (kept out of the entry).
import { activity, film, alertCircle, barChart, code, cpu, dashboard, edit, gauge, grid, layers, menu, message, palette, search, server, zap } from "hadi-march/icons";

export interface PageMeta { desc: string; group?: string; icon: unknown }
export const PAGE_META: Record<string, PageMeta> = {
  "/": { desc: "HADI March'a genel bakış", icon: dashboard },
  "/themes": { desc: "7 tema, renkler, yazı, yarıçap, gölge", group: "Temel", icon: palette },
  "/icons": { desc: "Kendi SVG ikon seti", group: "Temel", icon: grid },
  "/buttons": { desc: "Button, menü, çip, avatar, ipucu", group: "Bileşenler", icon: zap },
  "/forms": { desc: "Alanlar, seçiciler, doğrulama, sihirbaz", group: "Bileşenler", icon: edit },
  "/data": { desc: "10.000 satırlık tablo, ağaç, pano, adımlar", group: "Bileşenler", icon: layers },
  "/charts": { desc: "Çizgi, alan, çubuk, pasta, ısı haritası", group: "Bileşenler", icon: barChart },
  "/overlays": { desc: "Dialog, çekmece, toast, komut paleti", group: "Bileşenler", icon: message },
  "/feedback": { desc: "Uyarı, ilerleme, iskelet, boş, hata", group: "Bileşenler", icon: alertCircle },
  "/animation": { desc: "Tek motor: keyframe, timeline, eğri, global hız ve durdurma", group: "Hareket", icon: film },
  "/text-motion": { desc: "56 metin animasyonu: giriş, döngü, süsleme, daktilo, sayaç", group: "Hareket", icon: edit },
  "/transitions": { desc: "Rota başına geçiş, geri yönde ters, paylaşılan öğe, RTL", group: "Hareket", icon: layers },
  "/motion": { desc: "Yay, FLIP listeler, parallax, parçacık", group: "Hareket", icon: activity },
  "/messaging": { desc: "Habersiz bileşenler arası türlü kanallar, sekmeler arası", group: "Temel", icon: message },
  "/speed": { desc: "Tembel yükleme, ön yükleme ve önbellek: canlı ağ paneli", group: "Temel", icon: gauge },
  "/network": { desc: "İstek politikaları, middleware, mock, WebSocket, hata kuralları", group: "Temel", icon: server },
  "/layout": { desc: "Grid: taşmasız sütunlar, fill ve balance", group: "Bileşenler", icon: grid },
  "/navigation": { desc: "NavSidebar: arama, son kullanılanlar, kategoriler", group: "Bileşenler", icon: menu },
  "/overlay": { desc: "Video, resim, SVG, canvas ve cam katmanları", group: "Hareket", icon: layers },
  "/managers": { desc: "Viewport, rıza (KVKK/GDPR) ve komut yöneticileri", group: "Temel", icon: cpu },
  "/managers-data": { desc: "Pano, geri al, kaydedilmemiş değişiklik, depolama, önbellek, yapılandırma", group: "Temel", icon: cpu },
  "/managers-ops": { desc: "Özellik bayrakları, günlük, Web Vitals, hız sınırı", group: "Temel", icon: cpu },
  "/seo": { desc: "Rota başına head, OG/Twitter, JSON-LD, prerender, sitemap", group: "Temel", icon: search },
  "/managers-a11y": { desc: "Katman, odak, kısayol, duyurucu, erişilebilirlik tercihleri, kısayol ipuçları", group: "Temel", icon: cpu },
  "/managers-env": { desc: "Yöneticiler: boşta, çevrimdışı eşitleme, cihaz, izin, konum, bildirim, sekme, kaydırma, oturum süresi, varlık", group: "Temel", icon: cpu },
  "/language": { desc: "$ değişkenler, <For>, bind:, borular, sx", group: "Hareket", icon: code },
};
