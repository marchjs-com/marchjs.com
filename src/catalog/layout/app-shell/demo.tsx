// Showcase stage for AppShell: a framed miniature app (sidebar, optional banner, page) — Playground values in
// playground.ts. The frame keeps the shell's full-height layout inside the card.
import { AppShell } from "march/layout";

export const code = `<AppShell nav={<NavMenu items={items} />} top={<UpdateBanner />}>
  <Outlet />
</AppShell>`

export default function AppShellDemo(props: { values: { nav: boolean; top: boolean } }) {
  return <div class="sc-shell-frame">
    {() => { const nav = props.values.nav, top = props.values.top; return <AppShell mainId="sc-shell-main"
      nav={nav ? <div class="sc-shell-nav"><strong>HADİ</strong><span>Panel</span><span>Projeler</span><span>Ayarlar</span></div> : null}
      top={top ? <div class="sc-shell-banner">Yeni sürüm hazır: yenileyin.</div> : null}>
      <div class="sc-shell-page"><h4>Projeler</h4><p class="m-muted">Sayfa içeriği burada kayar; kenar çubuğu yerinde kalır.</p></div>
    </AppShell> }}
  </div>
}
