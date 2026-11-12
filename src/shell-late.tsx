// What the first paint does not need: command palette, toasts, commands, motion extras, the Speed page's network log.
// Loaded right after the shell (when idle).
import { t } from "hadi-march";
import { CommandPalette, ToastHost, registerCommands, toast, setColorTheme, colorThemes, setTheme } from "hadi-march/ui";
import { installTransitions, installFlip, pageTransitions } from "hadi-march/motion";
import { palette, moon, sun, sparkles } from "hadi-march/icons";
import "./perflog.ts";

installTransitions();
installFlip();
pageTransitions({ type: "fade", duration: 180 });

export default function ShellLate() {
  registerCommands([
    ...colorThemes().map((th) => ({ id: `theme-${th.id}`, title: `Tema: ${t(th.name)}`, group: "Temalar", icon: palette, run: () => { setColorTheme(th.id); toast(`${t(th.name)} teması açıldı`, { kind: "success" }) } })),
    { id: "mode-dark", title: "Koyu görünüm", group: "Görünüm", icon: moon, run: () => setTheme("dark") },
    { id: "mode-light", title: "Açık görünüm", group: "Görünüm", icon: sun, run: () => setTheme("light") },
    { id: "hello", title: "Bir bildirim göster", group: "Eylemler", icon: sparkles, keywords: "toast", run: () => toast("Merhaba! Bu bir March bildirimi.", { kind: "info" }) },
  ])
  return [<CommandPalette placeholder="Sayfa, tema ya da eylem ara…" />, <ToastHost />]
}
