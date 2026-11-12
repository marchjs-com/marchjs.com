// Showcase shell: side menu (sections), top bar (location, Ctrl+K, theme picker, light/dark), pages.
import { t } from "hadi-march";
import { Router, Link, path, type Href } from "hadi-march/router";
import {
  AppShell, NavSidebar, Brand, openPalette, Spacer, PaletteButton, ThemePicker, ThemeToggle, CommandPalette, ToastHost, Loader, registerCommands, toast,
  setColorTheme, colorThemes, setTheme,
} from "hadi-march/ui";
import {
  defineIcon, sparkles, palette, grid, zap, edit, layers, barChart, message, alertCircle, activity, code, dashboard, moon, sun, command, menu,
} from "hadi-march/icons";

/** The March mark. */
export const marchMark = defineIcon("march", ["M5 19V6.5l7 7 7-7V19"]);

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
  "/language": () => import("./pages/language.tsx"),
};

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
    <PaletteButton label="Bileşen ara…" />
    <ThemePicker label="Tema" />
    <ThemeToggle />
  </>
}

export function App() {
  registerCommands([
    ...colorThemes().map((th) => ({ id: `theme-${th.id}`, title: `Tema: ${t(th.name)}`, group: "Temalar", icon: palette, run: () => { setColorTheme(th.id); toast(`${t(th.name)} teması açıldı`, { kind: "success" }) } })),
    { id: "mode-dark", title: "Koyu görünüm", group: "Görünüm", icon: moon, run: () => setTheme("dark") },
    { id: "mode-light", title: "Açık görünüm", group: "Görünüm", icon: sun, run: () => setTheme("light") },
    { id: "hello", title: "Bir bildirim göster", group: "Eylemler", icon: sparkles, keywords: "toast", run: () => toast("Merhaba! Bu bir March bildirimi.", { kind: "info" }) },
  ])
  const items = PAGES.filter((p) => p.path !== "/").map((p) => ({ id: p.path, label: p.title, sub: p.desc, href: p.path as Href, icon: p.icon, group: p.group, keywords: p.desc }))
  const featured = [
    { id: "/", label: "Merhaba", sub: "Genel bakış ve canlı sayaç", href: "/" as Href, icon: dashboard },
    { id: "palette", label: "Komut paleti", sub: "Sayfa, tema ya da eylem ara", icon: command, onSelect: openPalette },
  ]
  return <AppShell header={<Topbar />} nav={
    <NavSidebar items={items} featured={featured} title={<Brand href="/" mark={marchMark} name="HADI March" sub="Arayüz kitaplığı" />}
      groupOrder={["Temel", "Bileşenler", "Hareket"]} itemOrder="none" defaultOpen="all" hotkey="palette" placeholder="Ara ya da sor…"
      storageKey="sc.sidebar" label="Vitrin menüsü" collapsible
      footer={<p class="sc-nav-foot hm-rail-hide">MIT · sıfır bağımlılık · CSP uyumlu</p>} />}>
    <Router loading={<Loader />} />
    <CommandPalette placeholder="Sayfa, tema ya da eylem ara…" />
    <ToastHost />
  </AppShell>
}
