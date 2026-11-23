// The topics of /themes (one page each, /themes/<slug>): titles, one-line descriptions, groups. The section page loads
// only this file; src/topics.ts gathers every section for the menu, MarchIDE and the start-up titles.
import type { Topic } from "./types.ts";

export const TOPICS: readonly Topic[] = [
  { slug: "presets", title: "Hazır temalar", desc: "Her kart kendi temasıyla çizildi (data-m-theme kapsamı).", group: "Temalar" },
  { slug: "theme-menu", title: "Tema menüsü", name: "ThemeMenu", desc: "Karmaşık bileşen: açık / koyu / sistem, renk teması ve vurgu rengi tek açılır menüde; bölümler ThemePicker…", group: "Temalar" },
  { slug: "theme-editor", title: "Kendi temanı yaz", name: "ThemeEditor", desc: "Renkleri, yazı tiplerini ve yarıçapı seç; temanı dışa aktar.", group: "Temalar" },
  { slug: "brand-colors", title: "Marka renkleri", desc: "HADİ Sosyal'ın dört resmi rengi (hadi_colors.dart ile birebir).", group: "Tokenlar" },
  { slug: "color-tokens", title: "Renk tokenları", desc: "Etkin temanın anlamsal renkleri; koyu görünümde kendiliğinden değişir.", group: "Tokenlar" },
  { slug: "palette", title: "Kategorik palet", desc: "Grafikler, avatarlar ve etiketler için 8 renk (tema başına).", group: "Tokenlar" },
  { slug: "type-scale", title: "Yazı ölçeği", desc: "Gövde ve başlık yazı tipi temadan gelir (HADİ: Figtree + Bricolage Grotesque).", group: "Tokenlar" },
  { slug: "radius-elevation", title: "Yarıçap ve yükselti", desc: "Yarıçap ölçeği temanın tek değerinden türer; gölgeler koyu görünümde halkaya dönüşür.", group: "Tokenlar" },
];
