// Showcase shell: the root layout of every route (mounted once, kept across navigations; the page goes into <Outlet />).
// What the first paint needs (frame, breadcrumb). No page list here: routes, titles and loaders live in src/routes.ts,
// a start-up chunk, so the entry does not grow with the number of pages. The side menu, the top bar tools and the rest
// (palette, toasts, motion extras) are lazy chunks with placeholders of the same size, so the entry stays small.
import { signal } from "march";
import { Outlet, Link, path } from "march/router";
import { MarchLogo } from "./logo.tsx";
import { AppShell, type BreadcrumbsProps, type Crumb } from "march/ui";
import { lazy } from "march/lazy";

const ShellNav = lazy(() => import("./shell-nav.tsx"), { fallback: () => <div class="sc-nav-placeholder" data-rail-only={() => (path() === "/" ? "" : null)} aria-hidden="true" /> })
// the full trail (section / category / page, each with the pages beside it) comes with the side menu's manifest
// (shell-menu.tsx, on first idle); until then the trail is March / page title
const trail = signal<((path: string) => readonly Crumb[]) | null>(null)
export const setTrail = (of: (path: string) => readonly Crumb[]): void => { trail.set(of) }
const ShellTools = lazy(() => import("./shell-tools.tsx"), { fallback: () => <div class="sc-tools sc-tools-placeholder" aria-hidden="true" /> })
// palette, toasts, commands: not part of start-up, loaded once the first paint is done (idle)
const ShellLate = lazy(() => import("./shell-late.tsx"), { when: "idle", fallback: () => null })
// the trail is the Breadcrumbs component in its own chunk (as <Page> loads it); its height is reserved, so nothing jumps
const Crumbs = lazy<BreadcrumbsProps>(() => import("march/components/navigation/breadcrumbs"), { pick: "Breadcrumbs", placeholder: "none", height: "1.875rem" })

/** A showcase page as the menu and the home page show it. */
export interface PageEntry { path: string; title: string; desc?: string | undefined; group?: string | undefined; icon?: unknown; /** The page this one is listed under. */ parent?: string | undefined; /** A page under another one's route (menu only). */ sub?: boolean }
// The page list and the title lookup are installed by src/routes.ts (a start-up chunk) before anything renders: the
// entry carries no page list, so adding a page never grows it
let pageList: readonly PageEntry[] = []
let titleOf: (path: string) => string | undefined = () => undefined
/** Every page (menu order) with its menu metadata. */
export const pages = (): readonly PageEntry[] => pageList
export const setPages = (list: readonly PageEntry[], title: typeof titleOf): void => { pageList = list; titleOf = title }

function Topbar() {
  // instant on the click: the path changes at once, the title is looked up from it
  const title = () => { const p = path(); return p !== "/" ? titleOf(p) : undefined }
  return <>
    <div class={() => (trail() ? "sc-top-crumbs is-full" : "sc-top-crumbs")}><Crumbs label="Konum" separator="/" labels={{ more: "Aradaki adımlar", goTo: (name: string) => `${name}: yanındakiler` }} items={() => {
      const full = trail(), p = path()
      if (full) return full(p)
      const t = title()
      return [{ id: "home", label: "MarchJS", href: "/" as const }, ...(t ? [{ id: "page", label: t }] : [])]
    }} /></div>
    <ShellTools />
  </>
}

/** Now and then (every 4 to 13 s, at random) a light sweeps across the glass round of the corner mark. */
function shine(el: HTMLElement): void {
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  const next = (): void => { setTimeout(() => { if (!el.isConnected) return; el.classList.remove("is-shine"); void el.offsetWidth; el.classList.add("is-shine"); next() }, 4000 + Math.random() * 9000) }
  next()
}

export function App() {
  // ?bare=1: the page alone, without the showcase frame (a sample site shown in a preview iframe)
  if (new URLSearchParams(globalThis.location?.search ?? "").has("bare")) return <Outlet />
  // AppShell is a Layout: every page gets back-to-top, the reading bar and route focus from here; no page repeats them
  // the mark is a control of its own at the top-left corner (wide screens), over the corner where the top bar and the
  // rail meet; both are cut round it (showcase.css, floating shell)
  return <>
    <Link href="/" class="sc-corner-logo" aria-label="MarchJS: ana sayfa" ref={shine}><MarchLogo /></Link>
    <AppShell class="sc-shell" header={<Topbar />} nav={<ShellNav />} titleTemplate="%s · MarchJS"
      features={{ scrollToTop: true, readingProgress: true, routeFocus: true }}>
      <Outlet />
      <ShellLate />
    </AppShell>
  </>
}
/** The shell as a layout loader (it comes with the route table, a start-up chunk: resolves at once, so the frame paints
 * before the page arrives). */
export const SHELL = async () => ({ default: App })
