// Component page template (every component page will use it): the page in an Outlet, Previous / Next at the bottom
// (no title on the page: the top bar's breadcrumb names it). The frame is built once and stays while the page under it changes. Each route that
// uses it says what it shows through COMPONENT_PAGES (title, previous and next page).
import "./component-page.css";
import "../hub.css";
import { Outlet, Link, path, type Href } from "march/router";
import { Icon, arrowLeft, arrowRight } from "march/icons";

export interface ComponentPageInfo { title: string; prev?: { href: string; title: string }; next?: { href: string; title: string } }
/** The pages drawn in the template: path → title and neighbours. */
export const COMPONENT_PAGES: Record<string, ComponentPageInfo> = {
  "/test-bilesen": { title: "Test Bileşen", prev: { href: "/app-ui", title: "march-app-ui" }, next: { href: "/ide", title: "IDE kabuğu" } },
}

export default function ComponentPageLayout() {
  const info = (): ComponentPageInfo => COMPONENT_PAGES[path()] ?? { title: "" }
  return <div class="sc-cpage">
    <div class="sc-cpage-body"><Outlet /></div>
    <nav class="sc-topic-pager sc-cpage-foot" aria-label="Bileşen sayfaları">
      {() => { const p = info().prev; return p ? <Link href={p.href as Href} class="sc-topic-step"><Icon of={arrowLeft} /><span><small>Önceki</small>{p.title}</span></Link> : <span /> }}
      <span />
      {() => { const n = info().next; return n ? <Link href={n.href as Href} class="sc-topic-step sc-topic-next"><span><small>Sonraki</small>{n.title}</span><Icon of={arrowRight} /></Link> : <span /> }}
    </nav>
  </div>
}
