// The menu manifest: page descriptions, groups and icons for the side menu and the home page (kept out of start-up:
// the side menu loads it on first idle, test/boot-pages.test.js checks that no start-up piece imports it). A group is one of
// MENU_GROUPS (below): İlk Adımlar, Temel, the component categories, Yöneticiler, Altyapı.
import { activity, appWindow, film, alertCircle, barChart, code, compass, cpu, dashboard, edit, gauge, grid, layers, menu, message, heart, palette, play, search, server, sparkles, zap } from "march/icons";
import { HOME_STATS } from "./home-stats.gen.ts";

export interface PageMeta { desc: string; group?: string; icon: unknown }
export const PAGE_META: Record<string, PageMeta> = {
  "/": { desc: "March'a genel bakış", icon: dashboard },
  "/start": { desc: "Kurulum, ilk bileşen, march CLI, proje yapısı", group: "İlk Adımlar", icon: zap },
  "/api": { desc: "Her dışa aktarım: imza, parametreler, örnekler, canlı demo", group: "İlk Adımlar", icon: code },
  "/themes": { desc: "15 tema, renkler, yazı, yarıçap, gölge, stil", group: "Temel", icon: palette },
  "/icons": { desc: "SVG ikon seti ve açık kaynak ikon paketleri", group: "Temel", icon: grid },
  "/buttons": { desc: "Button, menü, çip, kopyala, geri al", group: "Eylemler", icon: zap },
  "/text": { desc: "Klavye tuşu, katlanan metin, bölüm etiketi, ipucu", group: "Tipografi", icon: edit },
  "/forms": { desc: "Alanlar, seçiciler, doğrulama, sihirbaz", group: "Formlar", icon: edit },
  "/editors": { desc: "Zengin metin, Markdown, JSON, renk, eğri, zaman çizelgesi, kırpma", group: "Formlar", icon: edit },
  "/data": { desc: "10.000 satırlık tablo, ağaç, pano, adımlar", group: "Veri gösterimi", icon: layers },
  "/big-data": { desc: "DataGrid, TreeView, takvim, Gantt, dosya yöneticisi", group: "Veri gösterimi", icon: grid },
  "/charts": { desc: "Çizgi, çubuk, pasta, saçılım, huni, ağaç, sankey, mum, ağ, harita…", group: "Veri gösterimi", icon: barChart },
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
  "/bench": { desc: "React, Vue, Svelte, Solid, Preact ve Lit ile (kıyas: saf JavaScript) canlı render ve hız testi", group: "Altyapı", icon: gauge },
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
  "/web": { desc: "Hero, menü, fiyatlar, yorumlar, canlı akış, hikâye: web sitesi bileşenleri", group: "Web tasarım araçları", icon: layers },
  "/sites": { desc: "Bileşenlerle kurulmuş tam uygulamalar: açılış sayfaları (yakında yönetim paneli, CRM, e-ticaret)", group: "Web tasarım araçları", icon: sparkles },
  "/language": { desc: "$ değişkenler, <For>, bind:, borular, sx", group: "Temel", icon: code },
  "/flow": { desc: "Düğüm tabanlı akış: tuval, palet, çalıştır/duraklat/adım, zaman çizelgesi", group: "Karmaşık bileşenler", icon: activity },
  "/test-bilesen": { desc: "Bileşen sayfası şablonu: sayfa ve altta önceki / sonraki", group: "Karmaşık bileşenler", icon: code },
  "/ide": { desc: "MarchIDE: bileşen çalışma alanı; önizleme, özellikler, dosyalar, konsol", group: "Karmaşık bileşenler", icon: code },
  "/app-ui": { desc: "March IDE çekirdeği: yanaşan, daralan, sekmeli paneller ve hazır düzenler", group: "Karmaşık bileşenler", icon: code },
  "/ide-shell": { desc: "Panel yerleşimi, özellik düzenleyici, araç ve durum çubukları, mini editör", group: "Karmaşık bileşenler", icon: code },
  "/ide-live": { desc: "Mini editör: dosya ağacı, sekmeli editör, ayarlar, konsol, komut paleti", group: "Karmaşık bileşenler", icon: code },
};

/** Menu groups in order: getting started and foundations first, March's component categories (in the order of its
 *  data/components.json), then managers and infrastructure. A page's group must be one of these labels. */
export const MENU_GROUPS: readonly string[] = ["İlk Adımlar", "Temel", "Yerleşim", "Tipografi", "Eylemler", "Formlar", "Veri gösterimi",
  "Geri bildirim", "Katmanlar", "Gezinme", "Medya", "Hareket", "Sosyal", "Karmaşık bileşenler", "Web tasarım araçları", "Yöneticiler", "Altyapı"];

/** A section of the showcase: the thin rail lists the sections, the side menu shows the groups of one section at a time. */
export interface NavSection {
  id: string;
  label: string;
  /** A shorter name for the rail. */
  short?: string;
  desc: string;
  icon: unknown;
  /** The menu groups (MENU_GROUPS) the section collects, in order. */
  groups: readonly string[];
  /** Pages moved here from a group of another section: listed under this section's first group. */
  pages?: readonly string[];
}
/** The one place that says which menu group belongs to which section (the groups themselves stay MENU_GROUPS). */
export const SECTIONS: readonly NavSection[] = [
  { id: "start", label: "Başla", desc: "Kur, öğren, başvur.", icon: compass, groups: ["İlk Adımlar"], pages: ["/language"] },
  { id: "components", label: "Bileşenler", desc: "Arayüzün yapı taşları.", icon: grid, groups: ["Eylemler", "Formlar", "Veri gösterimi", "Geri bildirim", "Katmanlar", "Gezinme", "Medya", "Sosyal", "Tipografi"] },
  { id: "look", label: "Görünüm", desc: "Tema, ikon, yerleşim.", icon: palette, groups: ["Temel", "Yerleşim"] },
  { id: "motion", label: "Hareket", desc: "Tek motor: animasyon, geçiş, efekt.", icon: activity, groups: ["Hareket"] },
  { id: "built", label: "Hazır yapılar", short: "Yapılar", desc: "Parçalardan kurulmuş bütünler.", icon: appWindow, groups: ["Karmaşık bileşenler", "Web tasarım araçları"] },
  { id: "infra", label: "Altyapı", desc: "Ekranın arkasındaki her şey.", icon: server, groups: ["Yöneticiler", "Altyapı"] },
];
/** The section of a page: the one that names the page itself, else the one that has its menu group. */
export const sectionOf = (page: { path: string; group?: string | undefined }): NavSection | undefined =>
  SECTIONS.find((s) => s.pages?.includes(page.path)) ?? SECTIONS.find((s) => !!page.group && s.groups.includes(page.group));
