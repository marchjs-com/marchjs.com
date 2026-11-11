// Vitrin sayfaları (yalnız veri; tembel yükleyiciler app.tsx'te — sayfalar bu dosyayı içe aktarınca kabuğu ve öteki sayfaları çekmez).
import { activity, alertCircle, barChart, code, dashboard, edit, grid, layers, menu, message, palette, zap } from "hadi-march/icons";

export interface PageInfo { path: string; title: string; desc: string; icon: unknown; group?: string; }
export const PAGES: PageInfo[] = [
  { path: "/", title: "Merhaba", desc: "HADI March'a genel bakış", icon: dashboard },
  { path: "/temalar", title: "Temalar ve tokenlar", desc: "7 tema, renkler, yazı, yarıçap, gölge", icon: palette, group: "Temel" },
  { path: "/ikonlar", title: "İkonlar", desc: "Kendi SVG ikon seti", icon: grid, group: "Temel" },
  { path: "/dugmeler", title: "Düğmeler ve rozetler", desc: "Button, menü, çip, avatar, ipucu", icon: zap, group: "Bileşenler" },
  { path: "/formlar", title: "Formlar", desc: "Alanlar, seçiciler, doğrulama, sihirbaz", icon: edit, group: "Bileşenler" },
  { path: "/veri", title: "Veri", desc: "10.000 satırlık tablo, ağaç, pano, adımlar", icon: layers, group: "Bileşenler" },
  { path: "/grafikler", title: "Grafikler", desc: "Çizgi, alan, çubuk, pasta, ısı haritası", icon: barChart, group: "Bileşenler" },
  { path: "/katmanlar", title: "Pencereler ve bildirimler", desc: "Dialog, çekmece, toast, komut paleti", icon: message, group: "Bileşenler" },
  { path: "/durumlar", title: "Durumlar", desc: "Uyarı, ilerleme, iskelet, boş, hata", icon: alertCircle, group: "Bileşenler" },
  { path: "/hareket", title: "Hareket ve efektler", desc: "Yay, FLIP listeler, parallax, parçacık", icon: activity, group: "Hareket" },
  { path: "/yerlesim", title: "Yerleşim", desc: "Grid: taşmasız sütunlar, fill ve balance", icon: grid, group: "Bileşenler" },
  { path: "/gezinme", title: "Gezinme", desc: "NavSidebar: arama, son kullanılanlar, kategoriler", icon: menu, group: "Bileşenler" },
  { path: "/dil", title: "March dili", desc: "$ değişkenler, <For>, bind:, borular, sx", icon: code, group: "Hareket" },
];

