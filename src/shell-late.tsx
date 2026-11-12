// What the first paint does not need: command palette, toasts, commands, motion extras, the Speed page's network log.
// Loaded right after the shell (when idle).
import { t } from "hadi-march";
import { CommandPalette, ToastHost, Dialog, registerCommands, toast, setColorTheme, colorThemes, setTheme } from "hadi-march/ui";
import { PortalTarget } from "hadi-march";
import { Outlet } from "hadi-march/router";
import { palette, moon, sun, sparkles } from "hadi-march/icons";
import "./perflog.ts";

// the motion engine (transitions, <For animate> FLIP, page transitions) is its own lazy part: the shell stays small.
// Started from a microtask: when the build puts both modules in one start-up group, an import() during the group's own
// evaluation would re-enter its lazy initialiser before it has returned (undefined.then).
queueMicrotask(() => void import("./motion-late.ts"));

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
  ]
}
