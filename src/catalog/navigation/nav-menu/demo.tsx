// Showcase stage for NavMenu: the chosen menu (Playground items) in a framed column (values in playground.ts). On narrow
// screens the menu is a drawer: the menu button opens it.
import { NavMenu, type NavItem } from "march/navigation";
import { users, wallet, plus } from "march/icons";
import type { Href } from "march/router";
import { load, save } from "../../demo-util.ts";

export const code = `<NavMenu brand="HADİ" filter collapsible items={[
  { id: "inbox", title: "Gelen kutusu", href: "/inbox", icon: inbox, badge: () => $unread },
  { id: "members", title: "Üyeler", href: "/members", group: "Yönetim" },
  { id: "payments", title: "Ödemeler", href: "/payments", group: "Finans" },
]} groupIcons={{ Yönetim: users, Finans: wallet }} />
<NavMenu items={items} pins={false} icons={{ chevron: plus, search: false }}
  labels={{ filterPlaceholder: "Sayfa bul…", noMatches: "Böyle bir sayfa yok" }} />`

// demo links stay on this page (a query only)
const link = (id: string): Href => `/navigation?nm=${id}` as Href

export default function NavMenuDemo(props: { values: { items: readonly NavItem[]; filter: boolean; groupsCollapsed: boolean; collapsible: boolean; pins: boolean; chevron: string; texts: boolean } }) {
  return <div class="sc-navmenu-frame">
    {() => {
      // read here so the menu is drawn again when an option changes (it reads its props once)
      const { filter, groupsCollapsed, collapsible } = { filter: props.values.filter, groupsCollapsed: props.values.groupsCollapsed, collapsible: props.values.collapsible }
      const pins = props.values.pins, chevron = props.values.chevron, texts = props.values.texts
      // first visit: one pinned page, so the pinned block (and its heading) shows before anything is starred
      const storageKey = `sc.navmenu.${groupsCollapsed}`
      if (load<unknown>(storageKey, null) == null) save(storageKey, { pins: ["reports"] })
      // the chosen pages (playground.ts), their links pointed at this page
      const items = props.values.items.map((it) => ({ ...it, href: link(it.id) }))
      return <NavMenu items={items} brand={<strong>HADİ</strong>} label="Örnek menü" palette={false} storageKey={storageKey}
        filter={filter} groupsCollapsed={groupsCollapsed} collapsible={collapsible} groupIcons={{ "Yönetim": users, "Finans": wallet }}
        pins={pins} icons={chevron === "plus" ? { chevron: plus } : chevron === "off" ? { chevron: false } : undefined}
        labels={texts ? { filterPlaceholder: "Sayfa bul…", filter: "Sayfalarda ara", noMatches: "Böyle bir sayfa yok", pinned: "Sık kullandıklarım", recent: "Son baktıklarım" } : undefined} />
    }}
    <div class="sc-navmenu-main m-muted">Sayfa içeriği</div>
  </div>
}
