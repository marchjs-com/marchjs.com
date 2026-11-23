import { definePlayground } from "../../spec.ts";
import type { NavItem } from "march/navigation";
import type { Href } from "march/router";
import { inbox, barChart, settings, book, calendar, message } from "march/icons";

interface Values { items: readonly NavItem[]; filter: boolean; groupsCollapsed: boolean; collapsible: boolean; pins: boolean; chevron: string; texts: boolean }

// items is required (the pages): two menus to choose from (plain data, so the raw component in MarchIDE draws them).
// The links stay on the component's own page (a hash), so following one never leaves it
const at = (id: string): Href => `/navigation/nav-menu#${id}` as Href;
/** A small admin panel (the stage's default). */
export const ADMIN: readonly NavItem[] = [
  { id: "inbox", title: "Gelen kutusu", href: at("inbox"), icon: inbox, badge: 4 },
  { id: "reports", title: "Raporlar", href: at("reports"), icon: barChart },
  { id: "members", title: "Üyeler", href: at("members"), group: "Yönetim" },
  { id: "roles", title: "Roller ve izinler", href: at("roles"), group: "Yönetim" },
  { id: "payments", title: "Ödemeler", href: at("payments"), group: "Finans" },
  { id: "invoices", title: "Faturalar ve iade talepleri arşivi", href: at("invoices"), group: "Finans" },
  { id: "settings", title: "Ayarlar", href: at("settings"), icon: settings },
];
/** A school's portal. */
export const SCHOOL: readonly NavItem[] = [
  { id: "courses", title: "Derslerim", href: at("courses"), icon: book },
  { id: "calendar", title: "Takvim", href: at("calendar"), icon: calendar },
  { id: "messages", title: "Mesajlar", href: at("messages"), icon: message, badge: 2 },
  { id: "homework", title: "Ödevler", href: at("homework"), group: "Öğrenci", badge: 3 },
  { id: "grades", title: "Notlar", href: at("grades"), group: "Öğrenci" },
  { id: "classes", title: "Sınıflar", href: at("classes"), group: "Öğretmen" },
  { id: "attendance", title: "Yoklama", href: at("attendance"), group: "Öğretmen", keywords: "devamsızlık" },
];

export default definePlayground<Values>({
  options: [
    { key: "items", label: "Sayfalar (items)", default: ADMIN, options: [{ value: ADMIN, label: "yönetim paneli" }, { value: SCHOOL, label: "okul" }] },
    { key: "filter", label: "Süzme kutusu", default: true },
    { key: "groupsCollapsed", label: "Gruplar kapalı başlar", default: false },
    { key: "collapsible", label: "İkon rayına daraltma", default: true },
    { key: "pins", label: "Sabitleme yıldızı", default: true },
    { key: "chevron", label: "Grup oku", default: "chevron", options: [{ value: "chevron", label: "ok" }, { value: "plus", label: "kendi ikonum (artı)" }, { value: "off", label: "yok" }], prop: false },
    { key: "texts", label: "Kendi metinlerim (süzme kutusu, boş sonuç, bölüm başlıkları)", default: false, prop: "labels", toCode: { false: null, true: '{{ filterPlaceholder: "Sayfa bul…", filter: "Sayfalarda ara", noMatches: "Böyle bir sayfa yok", pinned: "Sık kullandıklarım", recent: "Son baktıklarım" }}' } },
  ],
});
