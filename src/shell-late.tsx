// What the first paint does not need: command palette, toasts, commands, motion extras, the Speed page's network log.
// Loaded right after the shell (when idle).
import { t } from "march";
import { ideOpen } from "./playground/ide-open.ts";
import { CommandPalette, ToastHost, Dialog, MadeWithMarch, registerCommands, toast, setColorTheme, colorThemes, setTheme } from "march/ui";
import { PortalTarget } from "march";
import { Outlet, navigate, path } from "march/router";
import { palette, moon, sun, sparkles, hash } from "march/icons";
import "./perflog.ts";
import { busyLogo } from "./logo-busy.ts";
import { whenIdle, onLoad, loadsActive } from "march/lazy";

// the motion engine (transitions, <For animate> FLIP, page transitions) is its own lazy part, loaded once the browser
// is idle after start-up: the first paint and the start-up download do not wait for it (a navigation before then has
// no page transition, nothing else changes)
whenIdle(() => { void import("./motion-late.ts"); }, 3000);

// Ctrl+K also finds the demo sections inside pages ("terminal" → Editörler › Terminal): the index is its own chunk,
// loaded when idle; picking one opens the page, scrolls to the section and flashes it
whenIdle(() => { void import("./sections.gen.ts").then(({ SECTIONS }) => registerCommands(SECTIONS.map((s) => ({
  id: `sec-${s.path}-${s.id}`, title: `${s.page} › ${s.title}`, group: "Bölümler", icon: hash,
  keywords: [s.desc, s.comp, s.page].join(" "), run: () => void goToSection(s.path, s.id),
})))) }, 2500);

/** Open a page and bring one of its sections into view (it may still be loading: wait for it a moment). */
async function goToSection(path: string, id: string): Promise<void> {
  await navigate(`${path}#${id}` as never)
  const started = performance.now()
  let el: HTMLElement | null = null
  while (!(el = document.getElementById(id)) && performance.now() - started < 4000) await new Promise((r) => setTimeout(r, 80))
  if (!el) return
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })
  const head = el.querySelector<HTMLElement>("h2, h3") ?? el
  if (!head.hasAttribute("tabindex")) head.setAttribute("tabindex", "-1")
  head.focus({ preventScroll: true })
  // a short flash on the motion engine (global speed and reduced motion apply)
  const target = el
  void import("march/motion").then((m) => m.animate(target, [{ boxShadow: "0 0 0 0 transparent" }, { boxShadow: "0 0 0 6px color-mix(in srgb, var(--m-primary) 35%, transparent)" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 1400, easing: "easeInOutCubic" }))
}

/** The corner mark turns while anything loads: it listens to March's global load listener (onLoad), where every
 *  route and lazy() chunk, march/net request, fetchJson, march/ai call, theme file and MarchIDE page announces its
 *  start and end. Its dots leave the M for a turning spiral and come back when the last load ends (logo-busy.ts).
 *  Background loads (a version poll, a prefetch) do not count; a load shorter than BUSY_AFTER shows nothing. */
const BUSY_AFTER = 200
function busyMark(): void {
  const mark = globalThis.document?.querySelector<SVGSVGElement>(".sc-corner-logo .sc-logo-mark")
  if (!mark) return
  const set = busyLogo(mark)
  let wait: ReturnType<typeof setTimeout> | undefined
  const sync = (active: number): void => {
    if (active > 0) { wait ??= setTimeout(() => set(true), BUSY_AFTER); return }
    clearTimeout(wait); wait = undefined
    set(false)
  }
  onLoad((e) => { if (!e.background) sync(e.active) })
  sync(loadsActive())
}
busyMark()

export default function ShellLate() {
  registerCommands([
    ...colorThemes().map((th) => ({ id: `theme-${th.id}`, title: `Tema: ${t(th.name)}`, group: "Temalar", icon: palette, run: () => { setColorTheme(th.id); toast(`${t(th.name)} teması açıldı`, { kind: "success" }) } })),
    { id: "mode-dark", title: "Koyu görünüm", group: "Görünüm", icon: moon, run: () => setTheme("dark") },
    { id: "mode-light", title: "Açık görünüm", group: "Görünüm", icon: sun, run: () => setTheme("light") },
    { id: "hello", title: "Bir bildirim göster", group: "Eylemler", icon: sparkles, keywords: "toast", run: () => toast("Merhaba! Bu bir March bildirimi.", { kind: "info" }) },
  ])
  return [
    <CommandPalette placeholder="Sayfa, tema ya da eylem ara…" />, <ToastHost />,
    // a page opened with <Link modal> shows here, over the current page (back closes it)
    <Outlet name="modal">{(page: () => unknown, close: () => void) => <Dialog open onClose={close} title="Ayrıntı" size="md">{page()}</Dialog>}</Outlet>,
    // shell places that pages can fill: a side panel and the center action of a bottom bar
    <PortalTarget name="aside" as="aside" class="sc-target-aside" label="Yan panel" />,
    <PortalTarget name="bottom-action" class="sc-target-bottom" />,
    // the page footer (the start page has its own, with the same line; MarchIDE too, fixed under it)
    () => path() !== "/" && !ideOpen() && <footer class="sc-page-foot"><span>MIT · sıfır bağımlılık · CSP uyumlu</span><MadeWithMarch variant="small" /></footer>,
  ]
}
