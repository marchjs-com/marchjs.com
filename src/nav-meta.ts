// Page descriptions, groups and icons for the side menu and the home page (kept out of the entry).
import { activity, film, alertCircle, barChart, code, cpu, dashboard, edit, gauge, grid, layers, menu, message, palette, server, zap } from "hadi-march/icons";

export interface PageMeta { desc: string; group?: string; icon: unknown }
/** Pages under one wildcard route (kept out of the entry: nav.ts lists only top-level routes). */
export const SUB_PAGES: { path: string; title: string }[] = [
  { path: "/motion/svg", title: "SVG animasyonları" },
  { path: "/motion/morph", title: "Morph" },
]
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
  "/transitions": { desc: "Rota başına geçiş, geri yönde ters, paylaşılan öğe, RTL", group: "Hareket", icon: layers },
  "/motion/svg": { desc: "Yol çizimi, şekil morph, yol boyunca, kırpma, SVG filtreleri", group: "Hareket", icon: activity },
  "/motion/morph": { desc: "Düğme → diyalog, kart → sayfa, paylaşılan öğe, ikon ve şekil morph", group: "Hareket", icon: layers },
  "/motion": { desc: "Yay, FLIP listeler, parallax, parçacık", group: "Hareket", icon: activity },
  "/messaging": { desc: "Habersiz bileşenler arası türlü kanallar, sekmeler arası", group: "Temel", icon: message },
  "/speed": { desc: "Tembel yükleme, ön yükleme ve önbellek: canlı ağ paneli", group: "Temel", icon: gauge },
  "/network": { desc: "İstek politikaları, middleware, mock, WebSocket, hata kuralları", group: "Temel", icon: server },
  "/layout": { desc: "Grid: taşmasız sütunlar, fill ve balance", group: "Bileşenler", icon: grid },
  "/navigation": { desc: "NavSidebar: arama, son kullanılanlar, kategoriler", group: "Bileşenler", icon: menu },
  "/overlay": { desc: "Video, resim, SVG, canvas ve cam katmanları", group: "Hareket", icon: layers },
  "/managers": { desc: "Viewport, rıza (KVKK/GDPR) ve komut yöneticileri", group: "Temel", icon: cpu },
  "/language": { desc: "$ değişkenler, <For>, bind:, borular, sx", group: "Hareket", icon: code },
};
