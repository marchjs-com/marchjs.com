// Showcase stage for the page corners: add a control to a corner of this page and take it out again.
import { addCornerControl, type Corner } from "march/layout";
import { Button } from "march/actions";
import { signal, effect, onCleanup } from "march";

export const code = `import { addCornerControl, BottomRightControls } from "march/layout"

const off = addCornerControl("bottom-end", <button>Geri bildirim</button>, 10)
off()  // take it out (also when the component goes away)`

const CORNER_NAMES: Record<Corner, string> = { "top-start": "üst baş", "top-end": "üst son", "bottom-start": "alt baş", "bottom-end": "alt son" }

export default function CornersDemo(props: { values: { corner: Corner; label: string } }) {
  const added = signal<Node[]>([])
  let offs: (() => void)[] = []
  const add = (): void => {
    const n = added().length + 1
    const el = <Button size="sm" variant="primary" class="sc-corner-chip">{`HADİ ${n}`}</Button> as Node
    added.set([...added(), el])
  }
  const clear = (): void => { added.set([]) }
  // the added controls sit in the chosen corner: picking another corner moves them there
  effect(() => {
    const corner = props.values.corner
    offs.forEach((off) => off())
    offs = added().map((el, i) => addCornerControl(corner, el, i + 1))
  })
  onCleanup(() => offs.forEach((off) => off()))
  return <div class="sc-corner-demo">
    <p class="m-muted">Seçili köşeye sayfa çapında bir denetim ekle; köşedekiler sırayla dizilir, üst üste binmez.</p>
    <p class="m-muted">{() => `Köşenin ekran okuyucudaki adı: ${props.values.label}`}</p>
    <p>Hedef köşe: <strong>{() => CORNER_NAMES[props.values.corner]}</strong>{() => (added().length ? ` (${added().length} denetim orada)` : "")}</p>
    <div class="sc-row">
      <Button variant="primary" data-audit-try onClick={add}>Köşeye ekle</Button>
      <Button onClick={clear} disabled={() => added().length === 0}>{() => `Hepsini çıkar (${added().length})`}</Button>
    </div>
  </div>
}
