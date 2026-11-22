// The topics of /overlays (one page each, /overlays/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "command-palette", title: "Komut paleti bileşeni", name: "CommandPalette", desc: "Karmaşık bileşen: uygulamanın tek paleti; bu kart ekranda olduğu sürece kendi komutlarını ekler, kart…", group: "Karmaşık bileşenler" },
  { slug: "dialog", title: "Diyalog", name: "Dialog", desc: "Odak pencerenin içinde döner, Escape en üsttekini kapatır, kapanınca odak açan düğmeye döner.", group: "Katmanlar" },
  { slug: "toast", title: "Bildirim", name: "Toast", desc: "Engellemeyen kısa ileti; en fazla beş üst üste.", group: "Katmanlar" },
  { slug: "drawer", title: "Çekmece", name: "Drawer", desc: "Dört kenar, sürükle, durma noktaları", group: "Katmanlar" },
  { slug: "popover", title: "Açılır panel", name: "Popover", desc: "Tetikleyici ve yanında yüzen panel: dışarı tıkla ya da Esc ile kapanır, odak içeri girer ve geri döner.", group: "Katmanlar" },
  { slug: "option-list", title: "Seçenek listesi", name: "OptionList", desc: "Panel içinde seçenek satırları: tek ya da çoklu seçim, komut menüsü; ok tuşları ya da bir alanın tuşlarıyla.", group: "Katmanlar" },
  { slug: "context-menu", title: "Sağ tık menüsü", name: "ContextMenu", desc: "Sağ tıklanan ya da Shift+F10 ile açılan menü: öğeler tıklanan hedefe göre değişir, klavye Menu ile aynı.", group: "Katmanlar" },
  { slug: "consent-banner", title: "Çerez onayı", name: "ConsentBanner", desc: "Alt bant, tercihler paneli ve üçüncü taraf yer tutucu: reddetmek kabul etmek kadar kolay.", group: "Katmanlar" },
];
