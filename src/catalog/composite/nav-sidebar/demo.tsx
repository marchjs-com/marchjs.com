// Showcase stage for NavSidebar: an admin menu in a framed box, drawn again when a Playground value changes.
import { NavSidebar } from "march/components/composite/nav-sidebar";
import { dashboard, users, settings, barChart } from "march/icons";
import type { Href } from "march/router";
import { load, save } from "../../demo-util.ts";

export const code = `<NavSidebar title="HADİ" items={items} groupOrder="none" defaultOpen="all" collapsible recent={3} />
<NavSidebar items={items} search={false} headings={false} groupCounts={false} />
<NavSidebar items={items} labels={{ recent: "Son açtıkların", categories: "Bölümler", expandAll: "Hepsini aç" }} />
<NavSidebar items={items} visibleGroups={["Satış"]} itemSize="lg" subOverflow="marquee" search={false} />   // bir bölüm, ferah satırlar, akan açıklama
<NavSidebar items={items} groupHeads={false} />   // iki düzey: kategori satırı yok, öğeler tek listede`

const ITEMS = [
  { id: "/demo/orders", label: "Siparişler", href: "/navigation" as Href, group: "Satış", icon: dashboard, sub: "Bugün 12 yeni" },
  { id: "/demo/invoices", label: "Faturalar", href: "/navigation" as Href, group: "Satış", icon: barChart, sub: "Kesilen, bekleyen ve gecikmiş faturalar; toplu gönderim ve hatırlatma" },
  { id: "/demo/invoices/late", label: "Gecikenler", href: "/navigation" as Href, group: "Satış", parent: "/demo/invoices" },
  { id: "/demo/invoices/drafts", label: "Taslaklar", href: "/navigation" as Href, group: "Satış", parent: "/demo/invoices" },
  { id: "/demo/users", label: "Kullanıcılar", href: "/navigation" as Href, group: "Yönetim", icon: users, sub: "Üyeler, roller ve davetler" },
  { id: "/demo/settings", label: "Ayarlar", href: "/navigation" as Href, group: "Yönetim", icon: settings },
  { id: "/demo/reports", label: "Raporlar", href: "/navigation" as Href, group: "Analiz", icon: barChart },
]

const SECTIONS: Record<string, string[] | undefined> = { all: undefined, sales: ["Satış"], admin: ["Yönetim", "Analiz"] }

export default function NavSidebarDemo(props: { values: { title: string; nested: boolean; hotkey: string; palette: boolean; groupOrder: string; defaultOpen: string; collapsible: boolean; recent: number; search: boolean; headings: boolean; expandAll: boolean; groupCounts: boolean; groupHeads: boolean; ownLabels: boolean; floating: boolean; glass: boolean; subMenus: string; pinCurrent: boolean; section: string; itemSize: string; subOverflow: string } }) {
  // read here: JSX attributes become getters, so the sidebar is drawn again only for values read in this function
  return <div class="sc-sb-frame">{() => { const { groupOrder, defaultOpen, collapsible, recent } = { groupOrder: props.values.groupOrder, defaultOpen: props.values.defaultOpen, collapsible: props.values.collapsible, recent: props.values.recent }
    const parts = { search: props.values.search, headings: props.values.headings, expandAll: props.values.expandAll, groupCounts: props.values.groupCounts, groupHeads: props.values.groupHeads }
    const itemSize = props.values.itemSize as "md", subOverflow = props.values.subOverflow as "scroll"
    const labels = props.values.ownLabels ? { recent: "Son açtıkların", categories: "Bölümler", expandAll: "Hepsini aç", collapseAll: "Hepsini kapat" } : undefined
    // a few visits to start with (the demo links stay on this page, so none would ever be recorded): the recent block
    // and how many it keeps show at once
    const storageKey = `sc.sb.pg.${defaultOpen}`, seen = load<{ recent?: unknown } | null>(storageKey, null), visits = seen?.recent
    if (!Array.isArray(visits) || !visits.length) save(storageKey, { ...seen, recent: ITEMS.map((x) => x.id) })
    return <NavSidebar title={props.values.title} items={props.values.nested ? ITEMS : ITEMS.filter((x) => !x.parent)} storageKey={storageKey}
      groupOrder={groupOrder === "alpha" ? "alpha" : "none"} defaultOpen={defaultOpen as "all"}
      collapsible={collapsible} recent={recent} {...parts} labels={labels} itemSize={itemSize} subOverflow={subOverflow} floating={props.values.floating} glass={props.values.glass} subMenus={props.values.subMenus as "inline"} pinCurrent={() => props.values.pinCurrent} visibleGroups={() => SECTIONS[props.values.section]} hotkey={props.values.hotkey === "focus" ? "focus" : false} palette={props.values.palette} label="Playground kenar çubuğu" /> }}</div>
}
