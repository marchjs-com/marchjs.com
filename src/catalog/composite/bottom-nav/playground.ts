import { definePlayground } from "../../spec.ts";

interface Values { value: string; count: number; create: boolean; menu: string; labels: boolean; variant: string; tint: string; badges: boolean; bubble: boolean; ring: string; motion: boolean }

// MarchIDE: the raw BottomNav takes its tabs and the Create menu as JSON lists (emoji icons; actions without run)
const TABS = [
  { id: "home", label: "Akış", icon: "🏠" },
  { id: "explore", label: "Keşfet", icon: "🧭" },
  { id: "chat", label: "Sohbet", icon: "💬" },
  { id: "events", label: "Etkinlikler", icon: "📅" },
  { id: "alerts", label: "Bildirimler", icon: "🔔" },
  { id: "me", label: "Profil", icon: "👤" },
];
const ACTIONS = [
  { id: "post", label: "Gönderi", icon: "🖼️", desc: "Fotoğraf, video ya da yazı paylaş" },
  { id: "story", label: "Hikâye", icon: "🎬", desc: "24 saat görünür" },
  { id: "live", label: "Canlı yayın", icon: "📡", desc: "Takipçilerine bildirim gider", badge: "yeni" },
];
const itemsCode = (_: unknown, v: Values): string => `{${JSON.stringify(TABS.slice(0, Number(v.count) - 1).concat(TABS.slice(-1))
  .map((t) => (v.badges && t.id === "chat" ? { ...t, badge: 3 } : v.badges && t.id === "me" ? { ...t, dot: true } : t)))}}`;

export default definePlayground<Values>({
  options: [
    { key: "value", label: "Etkin sekme (value)", default: "home", options: [{ value: "home", label: "Akış" }, { value: "explore", label: "Keşfet" }, { value: "me", label: "Profil" }] },
    { key: "count", label: "Sekme sayısı", default: 4, kind: "segmented", options: [{ value: 3, label: "3" }, { value: 4, label: "4" }, { value: 5, label: "5" }, { value: 6, label: "6" }], prop: "items", toCode: itemsCode },
    { key: "create", label: "Ortada Oluştur düğmesi", default: true, prop: "createActions", toCode: (on, v) => (on && v.menu !== "none" ? `{${JSON.stringify(ACTIONS)}}` : null) },
    { key: "menu", label: "Oluştur menüsü", default: "fan", kind: "cards", options: [{ value: "none", label: "yok (tek eylem)" }, { value: "fan", label: "yelpaze" }, { value: "stack", label: "yığın" }, { value: "sheet", label: "alt sayfa" }], prop: "createMenu", toCode: { none: null, fan: '"fan"', stack: '"stack"', sheet: '"sheet"' },
      // MarchIDE: "none" is an empty action list (the Create button runs onCreate, no menu), also on an instance whose code lists actions
      toProps: (x, v) => (x === "none" ? (v.create ? { createActions: [] } : {}) : { createMenu: x }) },
    { key: "labels", label: "Etiketler", default: true },
    { key: "badges", label: "Rozetler", default: true, prop: "items", toCode: itemsCode },
    { key: "variant", label: "Görünüm", default: "floating", kind: "cards", options: [{ value: "floating", label: "yüzen" }, { value: "flat", label: "düz" }] },
    { key: "tint", label: "Baloncuk rengi", default: "brand", kind: "cards", options: [{ value: "brand", label: "sekme rengi" }, { value: "accent", label: "tema vurgusu" }] },
    { key: "bubble", label: "Aktif sekme baloncuğu", default: true },
    { key: "ring", label: "Oluştur düğmesi halkası", default: "hadi", visibleWhen: (v) => v.create, options: [{ value: "hadi", label: "dört HADİ rengi" }, { value: "accent", label: "tema vurgusu" }, { value: "off", label: "yok" }], toCode: { hadi: null, accent: '{["primary","neutral"]}', off: "{false}" } },
    { key: "motion", label: "Hareket", default: true },
  ],
});
