// The menu manifest: page descriptions, groups and icons for the side menu and the home page (kept out of start-up:
// the side menu loads it on first idle, test/boot-pages.test.js checks that no start-up piece imports it). A group is one of
// MENU_GROUPS (src/components/categories.ts): İlk Adımlar, Temel, the component categories, Yöneticiler, Altyapı.
import { activity, film, alertCircle, barChart, code, cpu, dashboard, edit, gauge, grid, layers, menu, message, heart, palette, play, search, server, sparkles, zap } from "hadi-march/icons";
import { HOME_STATS } from "./home-stats.gen.ts";

export interface PageMeta { desc: string; group?: string; icon: unknown }
export const PAGE_META: Record<string, PageMeta> = {
  "/": { desc: "March'a genel bakış", icon: dashboard },
  "/start": { desc: "Kurulum, ilk bileşen, march CLI, proje yapısı", group: "İlk Adımlar", icon: zap },
  "/api": { desc: "Her dışa aktarım: imza, parametreler, örnekler, canlı demo", group: "İlk Adımlar", icon: code },
  "/themes": { desc: "7 tema, renkler, yazı, yarıçap, gölge", group: "Temel", icon: palette },
  "/icons": { desc: "SVG ikon seti ve açık kaynak ikon paketleri", group: "Temel", icon: grid },
  "/buttons": { desc: "Button, menü, çip, avatar, ipucu", group: "Eylemler", icon: zap },
  "/forms": { desc: "Alanlar, seçiciler, doğrulama, sihirbaz", group: "Formlar", icon: edit },
  "/editors": { desc: "Zengin metin, Markdown, JSON, renk, eğri, zaman çizelgesi, kırpma", group: "Formlar", icon: edit },
  "/data": { desc: "10.000 satırlık tablo, ağaç, pano, adımlar", group: "Veri gösterimi", icon: layers },
  "/big-data": { desc: "DataGrid, TreeView, takvim, Gantt, dosya yöneticisi", group: "Veri gösterimi", icon: grid },
  "/charts": { desc: "Çizgi, alan, çubuk, pasta, ısı haritası", group: "Veri gösterimi", icon: barChart },
  "/overlays": { desc: "Dialog, çekmece, toast, komut paleti", group: "Katmanlar", icon: message },
  "/feedback": { desc: "Uyarı, ilerleme, iskelet, boş, hata", group: "Geri bildirim", icon: alertCircle },
  "/animation": { desc: "Tek motor: keyframe, timeline, eğri, global hız ve durdurma", group: "Hareket", icon: film },
  "/text-motion": { group: "Hareket", desc: `${HOME_STATS.animations.text} metin animasyonu: giriş, döngü, süsleme, daktilo, sayaç`, icon: edit },
  "/transitions": { desc: "Rota başına geçiş, geri yönde ters, paylaşılan öğe, RTL", group: "Hareket", icon: layers },
  "/motion/svg": { desc: "Yol çizimi, şekil morph, yol boyunca, kırpma, SVG filtreleri", group: "Hareket", icon: activity },
  "/motion/morph": { desc: "Düğme → diyalog, kart → sayfa, paylaşılan öğe, ikon ve şekil morph", group: "Hareket", icon: layers },
  "/motion/pages": { desc: "Daire, silme, yığın, küp, çevir, perde, panjur, piksel, morph", group: "Hareket", icon: layers },
  "/motion/micro": { desc: "Dalga, mıknatıs, eğim ve katman parallax, yaylı basma, durum morph", group: "Hareket", icon: zap },
  "/motion/scroll": { desc: "Kaydırma zaman çizelgesi, parallax katmanları, yapışkan sahne, ilerleme", group: "Hareket", icon: activity },
  "/motion/lists": { desc: "Ekle / kaldır / sırala FLIP, çıkış kopyası, sırayla giriş", group: "Hareket", icon: grid },
  "/motion": { desc: "Yay, FLIP listeler, parallax, parçacık", group: "Hareket", icon: activity },
  "/messaging": { desc: "Habersiz bileşenler arası türlü kanallar, sekmeler arası", group: "Altyapı", icon: message },
  "/speed": { desc: "Tembel yükleme, ön yükleme ve önbellek: canlı ağ paneli", group: "Altyapı", icon: gauge },
  "/bench": { desc: "React, Vue, Svelte, Solid, Preact, Lit ve vanilla JS ile canlı render ve hız testi", group: "Altyapı", icon: gauge },
  "/network": { desc: "İstek politikaları, middleware, mock, WebSocket, hata kuralları", group: "Altyapı", icon: server },
  "/layout": { desc: "Grid: taşmasız sütunlar, fill ve balance", group: "Yerleşim", icon: grid },
  "/navigation": { desc: "NavSidebar: arama, son kullanılanlar, kategoriler", group: "Gezinme", icon: menu },
  "/overlay": { desc: "Video, resim, SVG, canvas ve cam katmanları", group: "Medya", icon: layers },
  "/social": { desc: "Gönderi, akış, hikâye, sohbet, profil, etkinlik", group: "Sosyal", icon: heart },
  "/managers": { desc: "Viewport, rıza (KVKK/GDPR) ve komut yöneticileri", group: "Yöneticiler", icon: cpu },
  "/managers-data": { desc: "Pano, geri al, kaydedilmemiş değişiklik, depolama, önbellek, yapılandırma", group: "Yöneticiler", icon: cpu },
  "/managers-ops": { desc: "Özellik bayrakları, günlük, Web Vitals, hız sınırı", group: "Yöneticiler", icon: cpu },
  "/seo": { desc: "Rota başına head, OG/Twitter, JSON-LD, prerender, sitemap", group: "Altyapı", icon: search },
  "/managers-a11y": { desc: "Katman, odak, kısayol, duyurucu, erişilebilirlik tercihleri, kısayol ipuçları", group: "Yöneticiler", icon: cpu },
  "/managers-env": { desc: "Yöneticiler: boşta, çevrimdışı eşitleme, cihaz, izin, konum, bildirim, sekme, kaydırma, oturum süresi, varlık", group: "Yöneticiler", icon: cpu },
  "/web": { desc: "Hero, menü, fiyatlar, yorumlar, portfolyo, sunum blokları", group: "Landing", icon: layers },
  "/web/product": { desc: "Örnek site: yüzen menü, ürün karesi, bento, fiyatlar, SSS", group: "Landing", icon: sparkles },
  "/web/portfolio": { desc: "Örnek site: süzgeçli projeler, ayrıntı geçişi, iletişim", group: "Landing", icon: grid },
  "/web/slides": { desc: "Örnek site: klavyeyle sunum, konuşmacı penceresi, tam ekran", group: "Landing", icon: play },
  "/language": { desc: "$ değişkenler, <For>, bind:, borular, sx", group: "Temel", icon: code },
  "/flow": { desc: "Düğüm tabanlı akış: tuval, palet, çalıştır/duraklat/adım, zaman çizelgesi", group: "Karmaşık bileşenler", icon: activity },
  "/ide": { desc: "Panel yerleşimi, özellik düzenleyici, araç ve durum çubukları, mini editör", group: "Karmaşık bileşenler", icon: code },
  "/ide-live": { desc: "Mini editör: dosya ağacı, sekmeli editör, ayarlar, konsol, komut paleti", group: "Karmaşık bileşenler", icon: code },
};

export { MENU_GROUPS } from "hadi-march/components/categories.ts";
/** The pages with their menu metadata (the start-up list has paths and titles only). */
export const withMeta = <P extends { path: string }>(list: readonly P[]): (P & Partial<PageMeta>)[] => list.map((p) => ({ ...p, ...PAGE_META[p.path] }));
