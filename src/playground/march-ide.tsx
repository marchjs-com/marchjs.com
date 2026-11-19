// MarchIDE: the showcase's IDE, a route layout shared by every page that is one (playground/ide-pages.ts, /ide,
// /ide/<path>). The router keeps a layout while the next route has it too, so moving between these pages keeps
// MarchIDE on screen: only the next page's ide.json is fetched, and the workspace takes its files. ide.json's `layout`
// picks the workspace (playground/ide.ts › LAYOUTS); one of another kind replaces it. While MarchIDE is on screen it
// takes the whole page: the shell does not pin its menu beside it (ide-open.ts), the page does not scroll, and its own
// footer, fixed under it, holds the previous / next page and the line the shell's page footer has.
import "./layouts/component.css";
import "../hub.css";
import { h, signal, computed, effect, untrack, onCleanup, createRoot } from "march";
import { Link, path, type Href } from "march/router";
import { appUrl } from "march/base";
import { beginLoad } from "march/lazy";
import { Alert, MadeWithMarch, Spinner } from "march/ui";
import { Icon, arrowLeft, arrowRight } from "march/icons";
import { HUBS } from "../topics.ts";
import { LAYOUTS, DEFAULT_IDE, parseIde, type IdeJson, type IdeLayout } from "./ide.ts";
import { ideOf, isIdePage } from "./ide-pages.ts";
import { ideOpen } from "./ide-open.ts";

/** Resolves when the browser has a free moment (at the latest after `ms`): heavy work waits for the page's own
 * transition and paints instead of blocking them. */
export const idle = (ms = 500): Promise<void> => new Promise((r) => {
  const g = globalThis as typeof globalThis & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
  if (g.requestIdleCallback) g.requestIdleCallback(() => r(), { timeout: ms }); else setTimeout(r, 50);
});

/** Fetches <id>/ide.json (the built-in files for ""): the parsed value, or a message saying what is wrong. */
const fetched = new Map<string, IdeJson>();
async function fetchIde(id: string): Promise<IdeJson | string> {
  if (!id) return DEFAULT_IDE;
  // one read per visit: a page opened again takes the same files at once
  const known = fetched.get(id);
  if (known) return known;
  const res = await fetch(appUrl(`${id}/ide.json`)).catch(() => null);
  // the server answers a missing file with the page itself: only JSON counts
  if (!res?.ok || !/json/.test(res.headers.get("content-type") ?? "")) return `${id}/ide.json bulunamadı`;
  const ide = parseIde(await res.text());
  if (typeof ide !== "string") fetched.set(id, ide);
  return ide;
}

/** The pages beside an IDE page, in its section's order (/buttons/button: the topics of /buttons); none elsewhere. */
function neighbours(p: string): { prev: { href: string; title: string }; next: { href: string; title: string } } | null {
  const base = p.slice(0, p.lastIndexOf("/")), list = HUBS[base], at = list?.findIndex((t) => `${base}/${t.slug}` === p) ?? -1;
  if (!list || at < 0) return null;
  const step = (d: number) => { const t = list[(at + d + list.length) % list.length]!; return { href: `${base}/${t.slug}`, title: t.title }; };
  return { prev: step(-1), next: step(1) };
}

/** The IDE fills the room from its top to the window's bottom: the page under it does not scroll. */
function fill(el: HTMLElement): void {
  // the page is held at its top (sc-ide-lock), so the IDE's top in the window is its top in the page
  // on a phone the shell's menu is a bar fixed at the bottom of the window: the IDE ends above it
  const barOf = (): number => {
    const bar = document.querySelector<HTMLElement>(".sc-shell > .m-shell-nav");
    return bar && getComputedStyle(bar).position === "fixed" ? bar.getBoundingClientRect().height : 0;
  };
  const fit = (): void => { el.style.setProperty("--sc-ide-h", `${Math.max(320, Math.floor(innerHeight - el.getBoundingClientRect().top - barOf()))}px`); };
  const root = document.documentElement;
  root.classList.add("sc-ide-lock");
  scrollTo(0, 0);
  fit();
  addEventListener("resize", fit);
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
  ro?.observe(root);
  onCleanup(() => { root.classList.remove("sc-ide-lock"); removeEventListener("resize", fit); ro?.disconnect(); });
}

// The workspace is made once and kept (its own root, not the route's): leaving for a page that is not MarchIDE takes
// it off the page, coming back puts the same one back: nothing is built again, only a new ide.json is loaded.
/** The ide.json the open MarchIDE asks for (its path; null before the first one). */
const wanted = signal<string | null>(null);
let workspace: Element | null = null;
function Workspace(): unknown {
  // what is shown: the workspace (its kind and component) and its ide.json; while the next one loads the current stays
  // under a loading layer, until the workspace has taken the next one's files (the layout's `ready`)
  const kind = signal(""), Layout = signal<IdeLayout | null>(null);
  const ide = signal<IdeJson>(DEFAULT_IDE), shownId = signal("");
  const status = signal<{ loading: true } | { error: string } | null>({ loading: true });
  // the ide.json being opened (its path) until the workspace says it is ready with it
  const opening = signal<string | null>(null);
  let readyAt: ReturnType<typeof setTimeout> | undefined;
  const ready = (id: string): void => { if (opening.peek() === id) { clearTimeout(readyAt); opening.set(null); } };
  // opening a page is one load for the global load listener (the corner mark turns): from the ide.json fetch until
  // the workspace is ready with it, or fails
  let endLoad: ((ok?: boolean) => void) | null = null
  effect(() => {
    const at = opening()
    if (at !== null && !endLoad) endLoad = untrack(() => beginLoad({ kind: "file", key: `${at || "ide"}/ide.json` }))
    else if (at === null && endLoad) { const st = untrack(status); endLoad(!(st && "error" in st)); endLoad = null }
  })
  onCleanup(() => { endLoad?.(); endLoad = null })
  effect(() => {
    const at = wanted();
    if (at === null || (Layout.peek() && at === shownId.peek())) return;
    let live = true;
    onCleanup(() => { live = false });
    untrack(() => { status.set(Layout() ? null : { loading: true }); opening.set(at); });
    void (async () => {
      const next = await fetchIde(at);
      if (!live) return;
      if (typeof next === "string") { opening.set(null); status.set({ error: next }); return; }
      // the loading layer is painted before the workspace takes the files (that step is not async itself)
      await idle(100);
      if (!live) return;
      // a workspace of another kind: its chunk, then it replaces the one on screen
      if (next.layout !== kind.peek()) {
        const mod = await LAYOUTS[next.layout]!();
        // the first time, the workspace is drawn in a free moment: the page's transition runs on undisturbed
        if (!Layout.peek()) await idle(700);
        if (!live) return;
        shownId.set(at); ide.set(next); kind.set(next.layout); Layout.set(mod.default);
      } else { shownId.set(at); ide.set(next); }
      status.set(null);
      // a workspace that never says it is ready does not keep the layer for ever
      clearTimeout(readyAt);
      readyAt = setTimeout(() => ready(at), 10000);
    })().catch((e: unknown) => { if (live) { opening.set(null); status.set({ error: String(e) }); } });
  });
  onCleanup(() => clearTimeout(readyAt));
  return <div class="sc-march-ide-work" aria-busy={() => (opening() !== null ? "true" : null)}>
    {() => { const L = Layout(); return L ? untrack(() => h(L as never, { ide, id: shownId, ready })) : null }}
    {() => {
      const s = status();
      if (s && "error" in s) return <div class="sc-march-ide-msg"><Alert tone="danger" title="MarchIDE açılamadı">{s.error}</Alert></div>;
      if (!untrack(Layout)) return s ? <div class="sc-ide-skel" role="status" aria-label="MarchIDE hazırlanıyor"><span /><span /><span /><span /></div> : null;
      // a page opened from another: the workspace on screen stays under a layer until the next one is ready
      return opening() !== null ? <div class="sc-ide-loading" role="status"><Spinner decorative /><span>Hazırlanıyor…</span></div> : null;
    }}
  </div>;
}

export default function MarchIDE() {
  ideOpen.set(true);
  onCleanup(() => ideOpen.set(false));
  const pager = computed(() => neighbours(path()));
  // while this page is MarchIDE, the workspace follows its address (the address of the page being left for one that
  // is not MarchIDE changes nothing: the workspace waits as it is)
  effect(() => { const p = path(); if (isIdePage(p)) { const at = ideOf(p); untrack(() => wanted.set(at)) } });
  workspace ??= createRoot(() => untrack(() => h(Workspace, {})), null) as Element;
  return <div class="sc-march-ide" ref={fill}>
    {workspace}
    <footer class="sc-march-ide-foot">
      {() => { const p = pager(); return p ? <Link href={p.prev.href as Href} class="sc-topic-step"><Icon of={arrowLeft} /><span><small>Önceki</small>{p.prev.title}</span></Link> : <span /> }}
      <div class="sc-march-ide-credit"><span>MIT · sıfır bağımlılık · CSP uyumlu</span><MadeWithMarch variant="small" /></div>
      {() => { const p = pager(); return p ? <Link href={p.next.href as Href} class="sc-topic-step sc-topic-next"><span><small>Sonraki</small>{p.next.title}</span><Icon of={arrowRight} /></Link> : <span /> }}
    </footer>
  </div>;
}
