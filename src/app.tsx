// Showcase shell: the root layout of every route (mounted once, kept across navigations; the page goes into <Outlet />).
// What the first paint needs (frame, breadcrumb). No page list here: routes, titles and loaders live in src/routes.ts,
// a start-up chunk, so the entry does not grow with the number of pages. The side menu, the top bar tools and the rest
// (palette, toasts, motion extras) are lazy chunks with placeholders of the same size, so the entry stays small.
import { Outlet, path } from "hadi-march/router";
import { AppShell, Spacer, type BreadcrumbsProps } from "hadi-march/ui";
import { lazy, skeleton } from "hadi-march/lazy";

const ShellNav = lazy(() => import("./shell-nav.tsx"), { fallback: () => <div class="sc-nav-placeholder" aria-hidden="true" /> })
const ShellTools = lazy(() => import("./shell-tools.tsx"), { fallback: () => <div class="sc-tools sc-tools-placeholder" aria-hidden="true" /> })
const ShellLate = lazy(() => import("./shell-late.tsx"), { fallback: () => null })
// the trail is the Breadcrumbs component in its own chunk (as <Page> loads it); its height is reserved, so nothing jumps
const Crumbs = lazy<BreadcrumbsProps>(() => import("hadi-march/components/navigation/breadcrumbs"), { pick: "Breadcrumbs", placeholder: "none", height: "1.875rem" })

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
    <div class="sc-top-crumbs"><Crumbs label="Konum" separator="/" items={() => { const t = title(); return [{ id: "home", label: "March", href: "/" as const }, ...(t ? [{ id: "page", label: t }] : [])] }} /></div>
    <Spacer />
    <ShellTools />
  </>
}

export function App() {
  // ?bare=1: the page alone, without the showcase frame (a sample site shown in a preview iframe)
  if (new URLSearchParams(globalThis.location?.search ?? "").has("bare")) return <Outlet />
  // AppShell is a Layout: every page gets back-to-top, the reading bar and route focus from here; no page repeats them
  return <AppShell header={<Topbar />} nav={<ShellNav />} titleTemplate="%s · March"
    features={{ scrollToTop: true, readingProgress: true, routeFocus: true }}>
    <Outlet />
    <ShellLate />
  </AppShell>
}
/** The shell as a layout loader (it is in the entry: resolves at once, so the frame paints before the page arrives). */
export const SHELL = async () => ({ default: App })
export const PAGE_LOADING = <div class="m-loader" role="status" aria-label="Yükleniyor"><span class="m-loading m-spin-lg" /></div>
/** A page that is not here 100 ms after a click: its heading, lead and two cards as skeletons (no layout jump). */
export const PAGE_SKELETON = () => <div class="sc-page-skel" role="status" aria-label="Yükleniyor">{skeleton("text")}{skeleton("card")}{skeleton("card")}</div>
