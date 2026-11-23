// Showcase stage for Drawer: a button opens it with the Playground values (playground.ts).
import { Drawer } from "march/components/overlays/drawer";
import { Button } from "march/components/actions/button";

export const code = `<Drawer open={$open} onClose={() => $open = false} side="bottom" snapPoints={[0.4, 0.9]} title="Filtreler">…</Drawer>
<Drawer open={$menu} onClose={() => $menu = false} side="start" size="sm" title="Menü">…</Drawer>     // RTL'de sağdan
<Drawer open={$panel} onClose={() => $panel = false} side="end" modal={false} title="Ayrıntı">…</Drawer>
<Drawer open={$open} onClose={close} handle={false} closeButton={false} motion={{ duration: 520, easing: "easeOutBack" }}>…</Drawer>  // parçalar ve hareket senin`

const SNAPS: Record<string, number[] | undefined> = { none: undefined, two: [0.4, 0.9], three: [0.25, 0.55, 0.9] }
const MOTIONS: Record<string, boolean | { duration: number; exit: number; easing: string }> = { default: true, bouncy: { duration: 620, exit: 380, easing: "easeOutBack" }, off: false }

// the motion is seen only while the drawer opens or closes: the stage says which one the next opening uses
const MOTION_SAYS: Record<string, string> = { default: "Hareket: hazır, 0,3 sn kayar", bouncy: "Hareket: 0,62 sn, yaylı gelir", off: "Hareket yok: anında açılır" }

export default function DrawerDemo(props: { values: { title: string; open: boolean; side: string; modal: boolean; snap: string; size: string; dragToClose: boolean; content: string; handle: boolean; closeButton: boolean; motion: string } }) {
  let $open = false
  // "Açık (open)" is the bare Drawer's in MarchIDE; here the button opens it, and the label says how it starts there
  const startsOpen = () => (props.values.open ? "MarchIDE'de açık başlar" : "MarchIDE'de kapalı başlar")
  let $snap = 0
  return <div class="sc-row">
    <Button variant="primary" data-audit-try="toggle" on:click={() => { $open = !$open }}>{() => ($open ? "Çekmeceyi kapat" : "Çekmeceyi aç")}</Button>
    <span class="sc-strip-label" aria-live="polite">{() => `${startsOpen()} · ${MOTION_SAYS[props.values.motion] ?? ""}${SNAPS[props.values.snap] && $open ? ` · Durma noktası: ${$snap + 1}` : ""}`}</span>
    {() => {
      const v = props.values
      const snaps = SNAPS[v.snap]
      // short: the sheet is as tall as its content (snap points above it are cut down); long: the body scrolls
      const rows = Array.from({ length: v.content === "short" ? 3 : 40 }, (_, i) => `Satır ${i + 1}`)
      return <Drawer open={() => $open} onClose={() => { $open = false }} side={v.side as "bottom"} modal={v.modal} dragToClose={v.dragToClose}
        snapPoints={snaps} size={v.size as "md"} onSnap={(i) => { $snap = i }} title={v.title}
        handle={v.handle} closeButton={v.closeButton} motion={MOTIONS[v.motion] ?? true}>
        <p>{snaps ? "Tutamaçtan ya da başlıktan sürükleyin; bırakınca en yakın durma noktasına oturur" : "Tutamaçtan ya da başlıktan sürükleyebilirsiniz"}{v.dragToClose ? ", kenara atınca kapanır." : "; sürükleyerek kapanmaz, kapatmak için düğmeyi ya da Escape tuşunu kullanın."}</p>
        <ul>{rows.map((r) => <li>{r}</li>)}</ul>
      </Drawer>
    }}
  </div>
}
