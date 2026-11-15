// The showcase navigation (the section rail + the side menu) with its manifest: loaded on first idle by shell-nav.tsx
// (not part of start-up). The rail lists the six sections (nav-meta.ts SECTIONS) and the start page; the menu
// (NavSidebar) shows the groups of one section. The top bar's trail gets its sections, categories and sibling menus
// from here too (the start-up trail knows only the page title).
import { signal, effect, untrack } from "march";
import { NavSidebar, ActivityBar, MadeWithMarch, type Crumb } from "march/ui";
import { Icon, defineIcon, home } from "march/icons";
import { Link, path, navigate, type Href } from "march/router";
import { viewport } from "march/managers/viewport";
import { pages, setTrail } from "./app.tsx";
import { withMeta, MENU_GROUPS, SECTIONS, sectionOf, type NavSection } from "./nav-meta.ts";

/** The March mark. */
export const marchMark = defineIcon("march", ["M5 19V6.5l7 7 7-7V19"]);

const SECTION_KEY = "sc.section";
const HOME = "home";
const remembered = (): string | null => { try { return globalThis.localStorage?.getItem(SECTION_KEY) ?? null; } catch { return null; } };
const remember = (id: string): void => { try { globalThis.localStorage?.setItem(SECTION_KEY, id); } catch { /* storage blocked */ } };

export default function ShellMenu() {
  const all = withMeta(pages()).filter((p) => p.path !== "/")
  type Entry = (typeof all)[number]
  const byPath = new Map(all.map((p) => [p.path, p]))
  const topOf = (p: Entry): Entry => { let x = p; for (let i = 0; i < 8 && x.parent && byPath.has(x.parent); i++) x = byPath.get(x.parent)!; return x }
  // a page under another one follows its top page's section
  const secOf = (p: Entry): NavSection | undefined => sectionOf(topOf(p))
  /** The page an address shows (the longest path it starts with: /api/ui/Button is the API page). */
  const pageAt = (p: string): Entry | undefined => {
    let best: Entry | undefined
    for (const x of all) if ((p === x.path || p.startsWith(`${x.path}/`)) && (!best || x.path.length > best.path.length)) best = x
    return best
  }
  // a component page shows its Turkish title with the March name under it ("Bülten formu" / Newsletter); a page a
  // section took from another group ("March dili") is listed under that section's first group
  const items = all.map((p) => {
    const s = secOf(p), moved = !!s?.pages?.includes(topOf(p).path)
    return { id: p.path, label: p.title, sub: p.name ?? p.desc, href: p.path as Href, icon: p.icon, group: moved ? s?.groups[0] : p.group, parent: p.parent, keywords: p.name ? `${p.name} ${p.desc ?? ""}` : p.desc }
  })
  /** The top pages of a section, in the order of its groups (the menu's order). */
  const topsOf = (s: NavSection | undefined): Entry[] => !s ? [] : all.filter((x) => !x.parent && secOf(x) === s)
    .sort((a, b) => s.groups.indexOf(items.find((i) => i.id === a.path)?.group ?? "") - s.groups.indexOf(items.find((i) => i.id === b.path)?.group ?? ""))

  // ---- which section the menu lists; the rail marks it ("home" on the start page until a section is chosen)
  const here = pageAt(untrack(path))
  const first = (here && secOf(here)?.id) ?? SECTIONS.find((s) => s.id === remembered())?.id ?? "components"
  const listed = signal(first)
  const marked = signal(here ? first : HOME)
  const section = (): NavSection => SECTIONS.find((s) => s.id === listed()) ?? SECTIONS[0]!
  effect(() => {
    const p = path()
    untrack(() => {
      const pg = pageAt(p), s = pg && secOf(pg)
      if (s) { listed.set(s.id); marked.set(s.id); remember(s.id) } else if (p === "/") marked.set(HOME)
    })
  })
  // phones: the rail is the bottom bar and the menu a bottom sheet a section opens
  const narrow = (): boolean => viewport().media("(max-width: 900px)")
  const sheet = signal(false)
  const pick = (id: string | null): void => {
    if (!id) return
    if (id === HOME) { sheet.set(false); void navigate("/"); return }
    // the rail only changes what the menu lists: the page stays
    const again = listed.peek() === id && marked.peek() === id
    listed.set(id); marked.set(id); remember(id)
    if (narrow()) sheet.set(again ? !sheet.peek() : true)
    else if (untrack(path) === "/") peek.set(again ? !peek.peek() : true)
  }
  // on the start page only the rail shows (wide screens): a section picked there opens the menu beside it until the
  // page changes; every other page has the menu open
  const peek = signal(false)
  effect(() => { path(); peek.set(false) })
  const railOnly = (): boolean => path() === "/" && !peek()
  const rail = [{ id: HOME, label: "Ana sayfa", icon: home }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label, short: s.short, icon: s.icon }))]

  // ---- the trail: March / section / category / page; every step lists what is beside it
  setTrail((p): readonly Crumb[] => {
    const start: Crumb = { id: "home", label: "March", href: "/" as Href }
    const pg = pageAt(p)
    if (!pg) return [start]
    const chain: Entry[] = []
    for (let x: Entry | undefined = pg, i = 0; x && i < 8; x = x.parent ? byPath.get(x.parent) : undefined, i++) chain.unshift(x)
    const sec = secOf(pg)
    return [start,
      ...(sec ? [{ id: `s-${sec.id}`, label: sec.label, siblings: SECTIONS.map((s) => ({ id: s.id, label: s.label, sub: s.desc, icon: s.icon, href: topsOf(s)[0]?.path as Href | undefined, current: s === sec })) }] : []),
      ...chain.map((x, i): Crumb => ({ id: x.path, label: x.title,
        siblings: (i === 0 ? topsOf(sec) : all.filter((y) => y.parent === chain[i - 1]!.path))
          .map((y) => ({ id: y.path, label: y.title, sub: y.name ?? (i === 0 ? y.desc : undefined), icon: i === 0 ? y.icon : undefined, href: y.path as Href, current: y === x })) })),
    ]
  })

  return <>
    <div class="sc-rail" data-rail-only={() => (railOnly() ? "" : null)}>
      <Link href="/" class="sc-rail-logo" aria-label="March: ana sayfa"><Icon of={marchMark} /></Link>
      <ActivityBar class="sc-rail-bar" label="Bölümler" items={rail} value={() => marked()} onChange={pick} collapsible={false} showLabels tooltips={false}
        orientation={() => (narrow() ? "horizontal" : "vertical")} />
    </div>
    <NavSidebar items={items} title={() => section().label} subtitle={() => section().desc}
      groupOrder={MENU_GROUPS} visibleGroups={() => section().groups} groupHeads={false} nestedSubs itemOrder="none" defaultOpen="all" search={false}
      itemSize="lg" subOverflow="marquee" recent={0} storageKey="sc.sidebar" label="Vitrin menüsü" resizable minWidth={220} maxWidth={460}
      sheetSide="bottom" menuButton={false} open={() => sheet()} onOpenChange={(o: boolean) => sheet.set(o)}
      footer={<div class="sc-nav-foot"><p class="sc-nav-foot-line">MIT · sıfır bağımlılık · CSP uyumlu</p><MadeWithMarch variant="small" /></div>} />
  </>
}
