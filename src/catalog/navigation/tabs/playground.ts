import { definePlayground } from "../../spec.ts";
import type { TabSpec } from "march/navigation";

interface Values { tabs: readonly TabSpec[]; variant: string; icons: boolean; closable: boolean; actions: boolean; badges: boolean; disabled: boolean; motion: string; indicator: boolean }

// tabs is required (without it and without <Tab> children there is nothing to draw): two sets to choose from, plain
// data with text panels, so the raw component in MarchIDE draws them. prop: false keeps the written code as
// `tabs={tabs}` (code.props); the value still reaches the component as its tabs
/** A project's sections (the stage's default; the stage gives them their badges, icons and close marks). */
export const PROJECT: readonly TabSpec[] = [
  { id: "overview", label: "Genel bakış", content: "HADİ web sitesi: 12 görev açık, son sürüm dün yayımlandı." },
  { id: "members", label: "Üyeler", badge: 3, content: "3 davet onay bekliyor." },
  { id: "settings", label: "Ayarlar", content: "Bildirimler açık; haftalık özet pazartesi gelir." },
  { id: "billing", label: "Faturalama", disabled: true, title: "Ücretsiz planda kapalı", content: "Ücretsiz plan: 3 proje sınırı." },
];
/** A shop's sales by period. */
export const PERIODS: readonly TabSpec[] = [
  { id: "day", label: "Gün", content: "Bugün 18 sipariş, 2.340 ₺ ciro." },
  { id: "week", label: "Hafta", content: "Bu hafta 112 sipariş; en çok satan: filtre kahve." },
  { id: "month", label: "Ay", content: "Kasım: 486 sipariş, geçen aya göre %12 artış." },
  { id: "year", label: "Yıl", content: "2026: 5.120 sipariş, 41 yeni ürün." },
];

export default definePlayground<Values>({
  code: { props: { "bind:value": "{$tab}", label: '"Proje"', tabs: "{tabs}" } },
  options: [
    { key: "tabs", label: "Sekmeler (tabs)", default: PROJECT, options: [{ value: PROJECT, label: "proje" }, { value: PERIODS, label: "dönemler" }], prop: false },
    { key: "variant", label: "Görünüm", default: "line", options: [{ value: "line", label: "çizgi" }, { value: "pill", label: "hap" }] },
    { key: "motion", label: "Panel hareketi", default: "default", options: [{ value: "default", label: "ilk açılışta yüksel" }, { value: "slide", label: "kay (yöne göre)" }, { value: "fade", label: "belir" }, { value: "rise", label: "yüksel (her geçişte)" }, { value: "own", label: "kendi hareketim (büyü)" }, { value: "none", label: "yok" }], toCode: { default: null, own: "{grow}" } },
    { key: "indicator", label: "Alt çizgi", default: true, visibleWhen: (v) => v.variant === "line" },
    { key: "icons", label: "Sekme ikonu", default: false, prop: false },
    { key: "closable", label: "Kapatılabilir sekmeler ve \"değişti\" noktası", default: false, prop: "onClose", toCode: { true: "{close}", false: null } },
    { key: "actions", label: "Şeridin sonunda eylem", default: false, toCode: { true: "{<IconButton icon={plus} label=\"Yeni sekme\" />}", false: null } },
    { key: "badges", label: "Sayı rozeti", default: true, prop: false },
    { key: "disabled", label: "Faturalama sekmesi devre dışı", default: true, prop: false },
  ],
});
