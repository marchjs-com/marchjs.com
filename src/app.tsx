// Showcase shell: the root layout of every route (mounted once, kept across navigations; the page goes into <Outlet />).
// What the first paint needs (frame, breadcrumb). No page list here: routes, titles and loaders live in src/routes.ts,
// a start-up chunk, so the entry does not grow with the number of pages. The side menu, the top bar tools and the rest
// (palette, toasts, motion extras) are lazy chunks with placeholders of the same size, so the entry stays small.
import { Outlet, Link, path } from "hadi-march/router";
import { AppShell, Spacer } from "hadi-march/ui";
import { lazy, skeleton } from "hadi-march/lazy";

const ShellNav = lazy(() => import("./shell-nav.tsx"), { fallback: () => <div class="sc-nav-placeholder" aria-hidden="true" /> })
const ShellTools = lazy(() => import("./shell-tools.tsx"), { fallback: () => <div class="sc-tools sc-tools-placeholder" aria-hidden="true" /> })
const ShellLate = lazy(() => import("./shell-late.tsx"), { fallback: () => null })

/** Page title by path: installed by src/routes.ts (the entry carries no page list). */
let titleOf: (path: string) => string | undefined = () => undefined
export const setPageTitles = (fn: typeof titleOf): void => { titleOf = fn }

function Topbar() {
  // instant on the click: the path changes at once, the title is looked up from it
  const title = () => { const p = path(); return p !== "/" ? titleOf(p) : undefined }
  return <>
    <nav class="hm-crumbs" aria-label="Konum">
      <ol>
        <li><Link href="/">HADI March</Link></li>
        {() => { const t = title(); return t ? <li><span aria-current="page">{t}</span></li> : null }}
      </ol>
    </nav>
    <Spacer />
    <ShellTools />
  </>
}

export function App() {
  return <AppShell header={<Topbar />} nav={<ShellNav />}>
    <Outlet />
    <ShellLate />
  </AppShell>
}
/** The shell as a layout loader (it is in the entry: resolves at once, so the frame paints before the page arrives). */
export const SHELL = async () => ({ default: App })
export const PAGE_LOADING = <div class="hm-loader" role="status" aria-label="Yükleniyor"><span class="hm-loading hm-spin-lg" /></div>
/** A page that is not here 100 ms after a click: its heading, lead and two cards as skeletons (no layout jump). */
export const PAGE_SKELETON = () => <div class="sc-page-skel" role="status" aria-label="Yükleniyor">{skeleton("text")}{skeleton("card")}{skeleton("card")}</div>
