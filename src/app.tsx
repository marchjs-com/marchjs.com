// Showcase shell: what the first paint needs (frame, breadcrumb, router). The side menu, the top bar tools and the rest
// (palette, toasts, motion extras) are lazy chunks with placeholders of the same size, so the entry stays small.
import { Router, Link, path } from "hadi-march/router";
import { AppShell, Spacer } from "hadi-march/ui";
import { lazy } from "hadi-march/lazy";

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
  "/charts": () => import("./pages/charts.tsx"),
  "/overlays": () => import("./pages/overlays.tsx"),
  "/feedback": () => import("./pages/feedback.tsx"),
  "/motion": () => import("./pages/motion.tsx"),
  "/speed": () => import("./pages/speed.tsx"),
  "/layout": () => import("./pages/layout.tsx"),
  "/navigation": () => import("./pages/navigation.tsx"),
  "/overlay": () => import("./pages/overlay.tsx"),
  "/language": () => import("./pages/language.tsx"),
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
    <Router loading={<div class="hm-loader" role="status" aria-label="Yükleniyor"><span class="hm-loading hm-spin-lg" /></div>} />
    <ShellLate />
  </AppShell>
}
