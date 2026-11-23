// Start-up's last step, in the route table's chunk (routes.ts re-exports it): the router, then the app drawn — or, on a
// prerendered page, hydrated. The entry (main.tsx) only loads: the router and the renderer arrive with the route table,
// which is needed before anything is drawn anyway, so the entry stays small and nothing waits longer.
import { render } from "march";
import { createRouter, Router } from "march/router";
import { skeleton } from "march/lazy";
import type * as Table from "./routes.ts";

/** What the router shows while a page loads. */
const PAGE_LOADING = <div class="m-loader" role="status" aria-label="Yükleniyor"><span class="m-loading m-spin-lg" /></div>
/** A page that is not here 100 ms after a click: its heading, lead and two cards as skeletons (no layout jump). */
const PAGE_SKELETON = () => <div class="sc-page-skel" role="status" aria-label="Yükleniyor">{skeleton("text")}{skeleton("card")}{skeleton("card")}</div>

/** Called by main.tsx once the route table is here (`table`: this chunk's routes.ts). */
export async function start(table: typeof Table, el: HTMLElement | null, hydrateChunk: Promise<typeof import("march/seo/hydrate")> | null): Promise<void> {
  // in an iframe, a reload that went back to the frame's first address returns to the page it showed
  table.restoreFrameRoute();
  // every page sits in the shell layout (kept alive while pages change)
  createRouter({ mode: "history", base: "auto", routes: table.ROUTES, outlets: table.OUTLETS, title: table.pageTitle });
  if (!el) return;
  const app = () => <Router loading={PAGE_LOADING} skeleton={PAGE_SKELETON} />;
  if (hydrateChunk) (await hydrateChunk).hydrate(app, el); else render(app, el);
  document.getElementById("m-boot")?.remove();
}
