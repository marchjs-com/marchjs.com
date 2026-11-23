// The showcase navigation (the section rail + the side menu) with its manifest: loaded on first idle by shell-nav.tsx
// (not part of start-up). The rail lists the six sections (nav-meta.ts SECTIONS) and the start page; the menu
// (NavSidebar) shows the groups of one section. The top bar's trail gets its sections, categories and sibling menus
// from here too (the start-up trail knows only the page title).
import { signal, effect, untrack } from "march";
import { NavSidebar, ActivityBar, type Crumb } from "march/ui";
import { home } from "march/icons";
import { Link, path, navigate, type Href } from "march/router";
import { viewport } from "march/managers/viewport";
import { pages, setTrail } from "./app.tsx";
import { ideOpen } from "./playground/ide-open.ts";
import { MENU_GROUPS, SECTIONS, sectionOf, type NavSection } from "./nav-meta.ts";
import { withMeta } from "./nav-pages.ts";

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
  /** While a page transition plays (data-m-vt on the root), runs `fn` once it is over (on the next frame) and says
   *  true; otherwise false. */
  let waiting: (() => void)[] = [], watcher: MutationObserver | undefined
  const afterSwap = (fn: () => void): boolean => {
    const root = globalThis.document?.documentElement
    if (!root?.hasAttribute("data-m-vt") || typeof MutationObserver !== "function") return false
    if (!waiting.includes(fn)) waiting.push(fn)
    watcher ??= new MutationObserver(() => {
      if (root.hasAttribute("data-m-vt")) return
      watcher?.disconnect(); watcher = undefined
      const run = waiting; waiting = []
      globalThis.requestAnimationFrame?.(() => { for (const f of run) f() })
    })
    watcher.observe(root, { attributes: true, attributeFilter: ["data-m-vt"] })
    return true
  }
  // phones: the rail is the bottom bar and the menu a bottom sheet a section opens
  const narrow = (): boolean => viewport().media("(max-width: 900px)")
  const sheet = signal(false)
  const pick = (id: string | null): void => {
    if (!id) return
    if (id === HOME) { sheet.set(false); pin.set(false); void navigate("/"); return }
    const again = listed.peek() === id && marked.peek() === id
    listed.set(id); marked.set(id); remember(id)
    // phones: a section opens its menu as a bottom sheet; wide screens: a section opens its own first page
    if (narrow()) { sheet.set(again ? !sheet.peek() : true); return }
    const first = topsOf(SECTIONS.find((s) => s.id === id))[0]
    if (first) { pinNext = true; void navigate(first.path as Href) }
  }
  // wide screens: choosing a section on the rail, or a page in the menu that has pages under it, pins the menu: it
  // sits beside the page (the page makes room for it) with the chosen page's branch open in it (NavSidebar pinCurrent);
  // the start page has none, nor MarchIDE (it takes the whole page: playground/ide-open.ts)
  const pin = signal(false)
  // (on the start page the menu leaves after the page transition, together with the frame sliding in)
  // (the menu comes in with the new page, in the same swap: shown before it, the old page would move first)
  // (the address changes before the transition takes its picture of the old page; the outlet's content changes inside
  // the swap, so the menu is shown when the new page is put in)
  let pinNext = false
  const outlet = globalThis.document?.querySelector(".m-shell-main .m-outlet")
  if (outlet && typeof MutationObserver === "function") new MutationObserver(() => { if (pinNext) { pinNext = false; pin.set(true) } }).observe(outlet, { childList: true })
  else effect(() => { path(); if (pinNext) { pinNext = false; untrack(() => pin.set(true)) } })
  effect(() => { if (path() === "/") { const off = (): void => { if (untrack(path) === "/") pin.set(false) }; if (!afterSwap(off)) off() } })
  globalThis.document?.addEventListener("click", (e) => {
    const row = (e.target as Element | null)?.closest?.(".m-sb-li.is-parent > .m-sb-row") as HTMLAnchorElement | null | undefined
    if (!wide() || !row) return
    if (row.href && new URL(row.href).pathname !== untrack(path)) pinNext = true; else pin.set(true)
  }, true)
  // on the start page only the rail shows (wide screens): a section picked there opens the menu beside it until the
  // page changes; every other page has the menu open
  const peek = signal(false)
  effect(() => { path(); peek.set(false) })
  const railOnly = (): boolean => path() === "/" && !peek()
  // wide screens: pointing at a section on the rail shows its menu floating beside the rail (over the page, which does
  // not move); it goes a moment after the pointer leaves both the rail and the menu
  let hoverOff: ReturnType<typeof setTimeout> | undefined
  const wide = (): boolean => !narrow()
  const inMenu = (t: EventTarget | null): boolean => !!(t as Element | null)?.closest?.(".sc-rail, .m-sb-wrap, .m-sb-fly")
  // (a pinned menu goes back to the section of the page)
  const hideSoon = (): void => { clearTimeout(hoverOff); hoverOff = setTimeout(() => { peek.set(false); listed.set(marked.peek() === HOME ? listed.peek() : marked.peek()) }, 220) }
  globalThis.document?.addEventListener("pointerover", (e) => {
    if (!wide()) return
    clearTimeout(hoverOff)
    const tab = (e.target as Element | null)?.closest?.(".sc-rail-bar [data-view]") as HTMLElement | null | undefined
    const id = tab?.dataset["view"]
    const own = id === HOME
    if (id && !own) { listed.set(id); peek.set(true); return }
    if ((own || !inMenu(e.target)) && peek.peek()) hideSoon()
  })
  // the pointer leaving the window altogether
  globalThis.document?.addEventListener("pointerout", (e) => { if (wide() && !e.relatedTarget && peek.peek()) hideSoon() })
  // wide screens: when the page's content is narrower than the room it has, the frame comes in to it: the rail and the
  // mark slide toward the content's start, the top bar narrows to the content (--sc-shift-l / --sc-shift-r on the root,
  // read by showcase.css; they slide). The page itself does not move.
  const fit = (): void => {
    const root = globalThis.document?.documentElement, main = globalThis.document?.querySelector<HTMLElement>(".m-shell-main")
    if (!root || !main) return
    // while a page transition plays, the frame waits: moving it then is not seen (the page is busy building) and it
    // would jump; it slides once the new page is in
    if (afterSwap(fit)) return
    // a page's content column: a showcase page, or the start page's hero (its content, not the silk that runs wide)
    const page = main.querySelector<HTMLElement>(".m-outlet > .sc-page") ?? main.querySelector<HTMLElement>(".sc-home .sc-hero")
    // a page still loading (its skeleton, a part not in yet) keeps the frame where it is: it is set again once the page
    // is in (the observer below), so a page does not first open wide and then narrow
    if (!page && main.querySelector(".m-outlet .sc-page-skel")) return
    let left = 0, right = 0
    if (page && !narrow()) {
      const r = page.getBoundingClientRect(), cs = getComputedStyle(page), m = main.getBoundingClientRect(), gap = parseFloat(getComputedStyle(root).fontSize) * 0.75
      const start = r.left + parseFloat(cs.paddingLeft), end = r.right - parseFloat(cs.paddingRight)
      left = Math.max(0, start - m.left - 2 * gap)
      right = Math.max(0, root.clientWidth - end - 2 * gap)
    }
    // set on the parts that move, not on the root: a value on the root restyles the whole page (a stall when a page
    // changes); the properties do not inherit (showcase.css @property). The start page's "Açık Kaynak" ribbon hangs
    // from the bar's end, so it follows the bar (home.css)
    const l = `${Math.round(left)}px`, rr = `${Math.round(right)}px`
    for (const el of globalThis.document.querySelectorAll<HTMLElement>(".sc-shell .m-shell-header, .sc-rail, .sc-corner-logo, .m-shell-nav .m-nav.m-sb, .sc-shell .sc-oss")) {
      if (el.style.getPropertyValue("--sc-shift-l") !== l) el.style.setProperty("--sc-shift-l", l)
      if (el.style.getPropertyValue("--sc-shift-r") !== rr) el.style.setProperty("--sc-shift-r", rr)
    }
    // the start page's ribbon unrolls once the bar it hangs from has stopped sliding (home.css .is-in)
    const ribbon = globalThis.document.querySelector<HTMLElement>(".sc-shell .sc-oss:not(.is-in)")
    const bar = globalThis.document.querySelector<HTMLElement>(".sc-shell .m-shell-header")
    if (ribbon) {
      const slides = bar?.getAnimations?.().filter((a) => String((a as CSSTransition).transitionProperty ?? "").startsWith("inset")) ?? []
      void Promise.all(slides.map((a) => a.finished.catch(() => undefined))).then(() => ribbon.classList.add("is-in"))
    }
  }
  effect(() => { path(); globalThis.requestAnimationFrame?.(() => globalThis.requestAnimationFrame?.(fit)) })
  globalThis.addEventListener?.("resize", () => globalThis.requestAnimationFrame?.(fit))
  if (typeof ResizeObserver === "function") { const main = globalThis.document?.querySelector(".m-shell-main"); if (main) new ResizeObserver(() => fit()).observe(main) }
  const rail = [{ id: HOME, label: "Ana sayfa", icon: home }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label, short: s.short, icon: s.icon }))]

  // ---- the trail: March / section / category / page; every step lists what is beside it
  setTrail((p): readonly Crumb[] => {
    const start: Crumb = { id: "home", label: "MarchJS", href: "/" as Href }
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
    <div class="sc-rail" data-rail-only={() => (railOnly() ? "" : null)} data-float={() => (peek() ? "" : null)} data-pin={() => (pin() && wide() && !ideOpen() ? "" : null)}>
      <ActivityBar class="sc-rail-bar" label="Bölümler" items={rail} value={() => marked()} onChange={pick} collapsible={false} showLabels tooltips={false} glass={() => !narrow()}
        orientation={() => (narrow() ? "horizontal" : "vertical")} />
    </div>
    <NavSidebar items={items} title={() => section().label} subtitle={() => section().desc}
      groupOrder={MENU_GROUPS} visibleGroups={() => section().groups} groupHeads={false} itemOrder="none" defaultOpen="all" search={false}
      itemSize="lg" subOverflow="marquee" recent={0} storageKey="sc.sidebar" label="Vitrin menüsü" floating glass={() => !narrow()} subMenus="flyout" pinCurrent resizable minWidth={220} maxWidth={460}
      sheetSide="bottom" menuButton={false} open={() => sheet()} onOpenChange={(o: boolean) => sheet.set(o)} />
  </>
}
