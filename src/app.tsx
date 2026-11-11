// Vitrin kabuğu: kenar menüsü (bölümler), üst çubuk (konum, Ctrl+K, tema seçici, açık/koyu), sayfalar.
import { Router, Link, path, type Href } from "hadi-march/router";
import {
  AppShell, NavMenu, Brand, Spacer, PaletteButton, ThemePicker, ThemeToggle, CommandPalette, ToastHost, Loader, registerCommands, toast,
  setColorTheme, colorThemes, setTheme,
} from "hadi-march/ui";
import {
  defineIcon, sparkles, palette, grid, zap, edit, layers, barChart, message, alertCircle, activity, code, dashboard, moon, sun,
} from "hadi-march/icons";

/** March işareti. */
export const marchMark = defineIcon("march", ["M5 19V6.5l7 7 7-7V19"]);

export interface PageInfo { path: string; title: string; desc: string; icon: unknown; group?: string; load: () => Promise<unknown> }
export const PAGES: PageInfo[] = [
  { path: "/", title: "Merhaba", desc: "HADI March'a genel bakış", icon: dashboard, load: () => import("./pages/home.tsx") },
  { path: "/temalar", title: "Temalar ve tokenlar", desc: "7 tema, renkler, yazı, yarıçap, gölge", icon: palette, group: "Temel", load: () => import("./pages/themes.tsx") },
  { path: "/ikonlar", title: "İkonlar", desc: "Kendi SVG ikon seti", icon: grid, group: "Temel", load: () => import("./pages/icons.tsx") },
  { path: "/dugmeler", title: "Düğmeler ve rozetler", desc: "Button, menü, çip, avatar, ipucu", icon: zap, group: "Bileşenler", load: () => import("./pages/buttons.tsx") },
  { path: "/formlar", title: "Formlar", desc: "Alanlar, seçiciler, doğrulama, sihirbaz", icon: edit, group: "Bileşenler", load: () => import("./pages/forms.tsx") },
  { path: "/veri", title: "Veri", desc: "10.000 satırlık tablo, ağaç, pano, adımlar", icon: layers, group: "Bileşenler", load: () => import("./pages/data.tsx") },
  { path: "/grafikler", title: "Grafikler", desc: "Çizgi, alan, çubuk, pasta, ısı haritası", icon: barChart, group: "Bileşenler", load: () => import("./pages/charts.tsx") },
  { path: "/katmanlar", title: "Pencereler ve bildirimler", desc: "Dialog, çekmece, toast, komut paleti", icon: message, group: "Bileşenler", load: () => import("./pages/overlays.tsx") },
  { path: "/durumlar", title: "Durumlar", desc: "Uyarı, ilerleme, iskelet, boş, hata", icon: alertCircle, group: "Bileşenler", load: () => import("./pages/feedback.tsx") },
  { path: "/hareket", title: "Hareket ve efektler", desc: "Yay, FLIP listeler, parallax, parçacık", icon: activity, group: "Hareket", load: () => import("./pages/motion.tsx") },
  { path: "/dil", title: "March dili", desc: "$ değişkenler, <For>, bind:, borular, sx", icon: code, group: "Hareket", load: () => import("./pages/language.tsx") },
];

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
    ...colorThemes().map((th) => ({ id: `theme-${th.id}`, title: `Tema: ${th.name}`, group: "Temalar", icon: palette, run: () => { setColorTheme(th.id); toast(`${th.name} teması açıldı`, { kind: "success" }) } })),
    { id: "mode-dark", title: "Koyu görünüm", group: "Görünüm", icon: moon, run: () => setTheme("dark") },
    { id: "mode-light", title: "Açık görünüm", group: "Görünüm", icon: sun, run: () => setTheme("light") },
    { id: "hello", title: "Bir bildirim göster", group: "Eylemler", icon: sparkles, keywords: "toast", run: () => toast("Merhaba! Bu bir March bildirimi.", { kind: "info" }) },
  ])
  const items = PAGES.map((p) => ({ id: p.path, title: p.title, href: p.path as Href, icon: p.icon, group: p.group, keywords: p.desc }))
  return <AppShell header={<Topbar />} nav={
    <NavMenu items={items} sort="none" storageKey="sc.nav" label="Vitrin menüsü" collapsible palette maxRecent={0} maxRecent={0}
      brand={<Brand href="/" mark={marchMark} name="HADI March" sub="Arayüz kitaplığı" />}
      footer={<p class="sc-nav-foot hm-rail-hide">MIT · sıfır bağımlılık · CSP uyumlu</p>} />}>
    <Router loading={<Loader />} />
    <CommandPalette placeholder="Sayfa, tema ya da eylem ara…" />
    <ToastHost />
  </AppShell>
}
