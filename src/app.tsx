// Showcase shell: the root layout of every route (mounted once, kept across navigations; the page goes into <Outlet />).
// What the first paint needs (frame, breadcrumb). The side menu, the top bar tools and the rest
// (palette, toasts, motion extras) are lazy chunks with placeholders of the same size, so the entry stays small.
import { Outlet, Link, path } from "hadi-march/router";
import { AppShell, Spacer } from "hadi-march/ui";
import { lazy, skeleton } from "hadi-march/lazy";

export { PAGES, type PageInfo } from "./nav.ts";
import { PAGES } from "./nav.ts";
/** Lazy page loaders (path → module). */
export const LOADERS: Record<string, () => Promise<unknown>> = {
  "/": () => import("./pages/home.tsx"),
  "/themes": () => import("./pages/themes.tsx"),
  "/icons": () => import("./pages/icons.tsx"),
  "/buttons": () => import("./pages/buttons.tsx"),
  "/forms": () => import("./pages/forms.tsx"),
  "/data": () => import("./pages/data.tsx"),
  "/big-data": () => import("./pages/big-data.tsx"),
  "/charts": () => import("./pages/charts.tsx"),
  "/overlays": () => import("./pages/overlays.tsx"),
  "/feedback": () => import("./pages/feedback.tsx"),
  "/motion": () => import("./pages/motion.tsx"),
  "/animation": () => import("./pages/animation.tsx"),
  "/speed": () => import("./pages/speed.tsx"),
  "/messaging": () => import("./pages/messaging.tsx"),
  "/network": () => import("./pages/network.tsx"),
  "/layout": () => import("./pages/layout.tsx"),
  "/navigation": () => import("./pages/navigation.tsx"),
  "/overlay": () => import("./pages/overlay.tsx"),
  "/language": () => import("./pages/language.tsx"),
  "/managers": () => import("./pages/managers.tsx"),
};

const ShellNav = lazy(() => import("./shell-nav.tsx"), { fallback: () => <div class="sc-nav-placeholder" aria-hidden="true" /> })
const ShellTools = lazy(() => import("./shell-tools.tsx"), { fallback: () => <div class="sc-tools sc-tools-placeholder" aria-hidden="true" /> })
const ShellLate = lazy(() => import("./shell-late.tsx"), { fallback: () => null })

function Topbar() {
  const here = () => PAGES.find((p) => p.path === path())
  return <>
    <nav class="hm-crumbs" aria-label="Konum">
      <ol>
        <li><Link href="/">HADI March</Link></li>
        {() => { const p = here(); return p && p.path !== "/" ? <li><span aria-current="page">{p.title}</span></li> : null }}
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
