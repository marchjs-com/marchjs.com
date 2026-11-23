import { definePlayground } from "../../spec.ts";

// MarchIDE: the raw NavSidebar takes the menu as a JSON list (emoji icons, no links: a row picked is the current one)
const ITEMS = [
  { id: "orders", label: "Siparişler", group: "Satış", icon: "🛒", sub: "Bugün 12 yeni" },
  { id: "invoices", label: "Faturalar", group: "Satış", icon: "🧾", sub: "Kesilen, bekleyen ve gecikmiş faturalar; toplu gönderim ve hatırlatma" },
  { id: "invoices-late", label: "Gecikenler", group: "Satış", parent: "invoices" },
  { id: "invoices-drafts", label: "Taslaklar", group: "Satış", parent: "invoices" },
  { id: "users", label: "Kullanıcılar", group: "Yönetim", icon: "👥", sub: "Üyeler, roller ve davetler" },
  { id: "settings", label: "Ayarlar", group: "Yönetim", icon: "⚙️" },
  { id: "reports", label: "Raporlar", group: "Analiz", icon: "📊" },
];
const itemsCode = (nested: unknown): string => `{${JSON.stringify(ITEMS.filter((x) => nested || !x.parent))}}`;

export default definePlayground<{ title: string; nested: boolean; hotkey: string; palette: boolean; groupOrder: string; defaultOpen: string; collapsible: boolean; recent: number; search: boolean; headings: boolean; expandAll: boolean; groupCounts: boolean; groupHeads: boolean; ownLabels: boolean; floating: boolean; glass: boolean; subMenus: string; pinCurrent: boolean; section: string; itemSize: string; subOverflow: string }>({
  options: [
    { key: "title", label: "Başlık (title)", default: "HADİ", kind: "text" },
    { key: "nested", label: "Alt sayfalar (Faturalar altında)", default: true, prop: "items", toCode: (on) => itemsCode(on) },
    { key: "groupOrder", label: "Kategori sırası", default: "given", options: [{ value: "given", label: "Verilen" }, { value: "alpha", label: "Alfabetik" }], toCode: { given: '"none"', alpha: '"alpha"' } },
    { key: "defaultOpen", label: "İlk açılışta", default: "all", options: [{ value: "all", label: "Hepsi açık" }, { value: "active", label: "Yalnız etkin" }, { value: "none", label: "Kapalı" }] },
    { key: "section", label: "Listelenen kategoriler", default: "all", options: [{ value: "all", label: "Hepsi" }, { value: "sales", label: "Yalnız Satış" }, { value: "admin", label: "Yönetim + Analiz" }], prop: "visibleGroups", toCode: { all: null, sales: '{["Satış"]}', admin: '{["Yönetim","Analiz"]}' } },
    { key: "itemSize", label: "Satır boyu", default: "md", options: [{ value: "md", label: "sıkı" }, { value: "lg", label: "ferah (eşit yükseklik)" }] },
    { key: "subOverflow", label: "Sığmayan açıklama", default: "scroll", options: [{ value: "scroll", label: "duraklayarak kayar" }, { value: "marquee", label: "kesintisiz akar" }, { value: "ellipsis", label: "kesilir" }] },
    { key: "floating", label: "Yüzen kart", default: false },
    { key: "glass", label: "Buzlu cam", default: false },
    { key: "subMenus", label: "Alt sayfalar", default: "inline", options: [{ value: "inline", label: "listede açılır" }, { value: "flyout", label: "yanda yüzer (üzerine gelince)" }] },
    { key: "pinCurrent", label: "Geçerli dal listede iğneli", default: false },
    { key: "collapsible", label: "Daraltılabilir", default: true },
    { key: "recent", label: "Son kullanılanlar", default: 3, min: 0, max: 5, step: 1 },
    { key: "search", label: "Arama kutusu", default: true },
    { key: "headings", label: "Bölüm başlıkları", default: true },
    { key: "expandAll", label: "“Tümünü aç / kapat” düğmesi", default: true, visibleWhen: (v) => v.headings },
    { key: "groupHeads", label: "Kategori satırları", default: true },
    { key: "groupCounts", label: "Kategori sayıları", default: true },
    // off by default: the sidebar of a preview must not take the page's Ctrl+K or fill its command palette
    { key: "hotkey", label: "Ctrl+K kısayolu", default: "off", visibleWhen: (v) => v.search, options: [{ value: "off", label: "yok" }, { value: "focus", label: "arama kutusuna odaklanır" }], toCode: { off: "{false}", focus: '"focus"' } },
    { key: "palette", label: "Komut paletine kaydet", default: false, toCode: (on) => (on ? null : "{false}") },
    { key: "ownLabels", label: "Kendi metinlerim", default: false, visibleWhen: (v) => v.headings, prop: "labels", toCode: { true: '{{"recent":"Son açtıkların","categories":"Bölümler","expandAll":"Hepsini aç","collapseAll":"Hepsini kapat"}}', false: null } },
  ],
});
