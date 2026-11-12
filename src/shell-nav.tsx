// The showcase side menu: a lazy chunk (the shell paints first with a placeholder of the same width).
import { NavSidebar, Brand, MadeWithMarch, openPalette } from "hadi-march/ui";
import { defineIcon, dashboard, command } from "hadi-march/icons";
import type { Href } from "hadi-march/router";
import { pages } from "./app.tsx";
import { MENU_GROUPS } from "hadi-march/components/categories.ts";

/** The March mark. */
export const marchMark = defineIcon("march", ["M5 19V6.5l7 7 7-7V19"]);

export default function ShellNav() {
  const items = pages().filter((p) => p.path !== "/").map((p) => ({ id: p.path, label: p.title, sub: p.desc, href: p.path as Href, icon: p.icon, group: p.group, keywords: p.desc }))
  const featured = [
    { id: "/", label: "Merhaba", sub: "Genel bakış ve canlı sayaç", href: "/" as Href, icon: dashboard },
    { id: "palette", label: "Komut paleti", sub: "Sayfa, tema ya da eylem ara", icon: command, onSelect: openPalette },
  ]
  return <NavSidebar items={items} featured={featured} title={<Brand href="/" mark={marchMark} name="HADI March" />}
    groupOrder={MENU_GROUPS} itemOrder="none" defaultOpen="all" hotkey="palette" placeholder="Ara ya da sor…"
    storageKey="sc.sidebar" label="Vitrin menüsü" collapsible resizable minWidth={220} maxWidth={420} collapseBelow={150}
    footer={<div class="sc-nav-foot hm-rail-hide"><p class="sc-nav-foot-line">MIT · sıfır bağımlılık · CSP uyumlu</p><MadeWithMarch variant="small" /></div>} />
}
