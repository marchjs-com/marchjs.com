// Showcase stage for OverlayScope: a small "app" whose drawer and dialog open inside its box, or on the page.
import { OverlayScope } from "march/components/layout/overlay-scope";
import { Button } from "march/components/actions/button";
import { openDrawer, openDialog } from "march/components/overlays/dialog";

export const code = `<OverlayScope class="app">
  <button onClick={() => openDrawer(() => <Menu />)}>Menü</button>      // opens inside the box
</OverlayScope>
openDrawer(render, { target: "page" })                                  // the whole page`

export default function OverlayScopeDemo(props: { values: { target: string; content: string } }) {
  const target = (): "page" | "nearest" => (props.values.target === "page" ? "page" : "nearest")
  return <OverlayScope class="sc-scope-demo">
    <div class="sc-scope-bar"><strong>HADİ panel</strong>
      <Button size="sm" data-audit-try onClick={() => void openDrawer(() => <ul class="sc-scope-list"><li>Özet</li><li>Raporlar</li><li>Ayarlar</li></ul>, { title: "Menü", side: "end", target: target() })}>Çekmece</Button>
      <Button size="sm" variant="primary" onClick={() => void openDialog(() => <p>Bu pencere yalnız bu kutuyu örter; sayfanın geri kalanı çalışmaya devam eder.</p>, { title: "Kutu içi pencere", target: target() })}>Pencere</Button>
    </div>
    <p class="m-muted sc-scope-body">{() => props.values.content} "Sayfada" seçilirse bütün sayfayı örter.</p>
  </OverlayScope>
}
