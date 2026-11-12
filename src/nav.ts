// Showcase pages (data only; the lazy loaders are in app.tsx, so a page importing this file does not pull in the shell or other pages).
import { activity, alertCircle, barChart, code, dashboard, edit, gauge, grid, layers, menu, message, palette, zap } from "hadi-march/icons";

export interface PageInfo { path: string; title: string; desc: string; icon: unknown; group?: string; }
export const PAGES: PageInfo[] = [
  { path: "/", title: "Merhaba", desc: "HADI March'a genel bakış", icon: dashboard },
  { path: "/themes", title: "Temalar ve tokenlar", desc: "7 tema, renkler, yazı, yarıçap, gölge", icon: palette, group: "Temel" },
  { path: "/icons", title: "İkonlar", desc: "Kendi SVG ikon seti", icon: grid, group: "Temel" },
  { path: "/buttons", title: "Düğmeler ve rozetler", desc: "Button, menü, çip, avatar, ipucu", icon: zap, group: "Bileşenler" },
  { path: "/forms", title: "Formlar", desc: "Alanlar, seçiciler, doğrulama, sihirbaz", icon: edit, group: "Bileşenler" },
  { path: "/data", title: "Veri", desc: "10.000 satırlık tablo, ağaç, pano, adımlar", icon: layers, group: "Bileşenler" },
  { path: "/charts", title: "Grafikler", desc: "Çizgi, alan, çubuk, pasta, ısı haritası", icon: barChart, group: "Bileşenler" },
  { path: "/overlays", title: "Pencereler ve bildirimler", desc: "Dialog, çekmece, toast, komut paleti", icon: message, group: "Bileşenler" },
  { path: "/feedback", title: "Durumlar", desc: "Uyarı, ilerleme, iskelet, boş, hata", icon: alertCircle, group: "Bileşenler" },
  { path: "/motion", title: "Hareket ve efektler", desc: "Yay, FLIP listeler, parallax, parçacık", icon: activity, group: "Hareket" },
  { path: "/speed", title: "Hız", desc: "Tembel yükleme, ön yükleme ve önbellek: canlı ağ paneli", icon: gauge, group: "Temel" },
  { path: "/layout", title: "Yerleşim", desc: "Grid: taşmasız sütunlar, fill ve balance", icon: grid, group: "Bileşenler" },
  { path: "/navigation", title: "Gezinme", desc: "NavSidebar: arama, son kullanılanlar, kategoriler", icon: menu, group: "Bileşenler" },
  { path: "/language", title: "March dili", desc: "$ değişkenler, <For>, bind:, borular, sx", icon: code, group: "Hareket" },
];

