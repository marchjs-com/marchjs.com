import { definePlayground } from "../../spec.ts";
import type { ActivityItem } from "march/components/navigation/activity-bar";
import { files, search, gitBranch, bug, settings, user, fileText, clock, star, folder, compass, history, palette, layers, image, users } from "march/icons";

interface Values { items: readonly ActivityItem[]; value: string; orientation: string; badges: boolean; indicator: boolean; motion: string; color: string; tooltips: boolean; showLabels: boolean; glass: boolean; subItems: boolean }

// items and value are required: two bars to choose from (plain data, so the raw component in MarchIDE draws them).
// Both have the views files, search, git and debug, so the value option fits either.
/** An editor's views (the stage's default). */
export const EDITOR: readonly ActivityItem[] = [
  { id: "files", label: "Dosyalar", icon: files, shortcut: "mod+shift+e", children: [
    { id: "open", label: "Açık dosyalar", short: "Açık", icon: fileText }, { id: "recent", label: "Son kullanılanlar", short: "Son", icon: clock }, { id: "starred", label: "Yıldızlılar", short: "Yıldız", icon: star },
  ] },
  { id: "search", label: "Ara", icon: search, badge: 12 },
  { id: "git", label: "Kaynak denetimi", short: "Kaynak", icon: gitBranch, badge: 3 },
  { id: "debug", label: "Hata ayıkla", short: "Ayıkla", icon: bug },
  { id: "account", label: "Hesap", icon: user, position: "end" },
  { id: "settings", label: "Ayarlar", icon: settings, position: "end" },
];
/** A design studio's rail: the same view ids, other names. */
export const STUDIO: readonly ActivityItem[] = [
  { id: "files", label: "Projeler", icon: folder, children: [
    { id: "layers", label: "Katmanlar", icon: layers }, { id: "assets", label: "Görseller", icon: image },
  ] },
  { id: "search", label: "Keşfet", icon: compass, badge: 5 },
  { id: "git", label: "Sürümler", icon: history, badge: 2 },
  { id: "debug", label: "Renkler", icon: palette },
  { id: "team", label: "Ekip", icon: users, position: "end" },
];

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Görünümler (items)", default: EDITOR, options: [{ value: EDITOR, label: "editör" }, { value: STUDIO, label: "tasarım stüdyosu" }] },
    { key: "value", label: "Etkin görünüm (value)", default: "files", options: ["files", "search", "git", "debug", { value: "", label: "kapalı (null)" }] },
    { key: "orientation", label: "Yön", default: "vertical", options: [{ value: "vertical", label: "dikey" }, { value: "horizontal", label: "yatay" }] },
    // the badges are in the items' data (badge): this switch is the stage's, in MarchIDE they come with the items
    { key: "badges", label: "Rozetler", default: true, prop: false },
    { key: "indicator", label: "Etkin görünüm çizgisi", default: true, toCode: { false: "{false}" } },
    { key: "motion", label: "Çizginin geçişi", default: "glide", options: [{ value: "glide", label: "kayarak gider" }, { value: "fade", label: "yerinde belirir" }, { value: "none", label: "hareketsiz" }], visibleWhen: (v) => v.indicator },
    { key: "color", label: "Renk", default: "", options: [{ value: "", label: "tema" }, { value: "brand-orange", label: "turuncu" }, { value: "brand-blue", label: "mavi" }, { value: "brand-green", label: "yeşil" }, { value: "brand-purple", label: "mor" }], prop: "m:color" },
    { key: "showLabels", label: "Adlar ikonun altında", default: false },
    { key: "glass", label: "Buzlu cam", default: false },
    { key: "subItems", label: "Seçilenin alt öğeleri altında (files)", default: true },
    { key: "tooltips", label: "Ad ipuçları (üstüne gelince)", default: true, visibleWhen: (v) => !v.showLabels },
  ],
});
