// Showcase stage for Window: a small desk with two windows. Drag a title bar, drop it on an edge to dock, double
// click to fill, drag an edge to resize; the buttons minimize, fill / restore and close.
import { signal } from "march";
import { Button } from "march/components/actions/button";
import { Window } from "march/components/layout/window";
import { fileText, Icon } from "march/icons";

export const code = `<div class="desk">                               // the area: any positioned box
  <Window title="Notlar" chrome="mac" persist="notes">…</Window>
  <Window title="Sipariş #2041" chrome="windows" x={320} y={40} width={300} height={200}>…</Window>
  <Window title="Notlar" color="brand-orange" stripe={false} icons={{ close: "✕", minimize: "–" }} labels={{ close: "Notları kapat" }}>…</Window>
</div>`

export default function WindowDemo(props: { values: { chrome: string; snap: boolean; resizable: boolean; color: string; stripe: boolean; icons: boolean; title: string } }) {
  const notes = signal(true), order = signal(true)
  const chrome = (): "hadi" | "mac" | "windows" => props.values.chrome as "hadi"
  const OWN = { close: "✕", minimize: "–", maximize: "□", restore: "❐" }
  return <div class="sc-win-desk">
    {() => {
      // the frame options are read when a window is made: a change draws the two windows again
      const v = props.values, color = v.color as "primary", stripe = v.stripe, icons = v.icons ? OWN : undefined, snap = v.snap, resizable = v.resizable
      return <>
        <Window title={v.title} icon={<Icon of={fileText} />} chrome={chrome} snap={snap} resizable={resizable} color={color} stripe={stripe} icons={icons} x={24} y={24} width={330} height={210}
          open={() => notes()} onClose={() => notes.set(false)}>
          <div class="sc-win-pad"><strong>Bugün</strong><ul><li>HADİ vitrinini gözden geçir</li><li>Pencereyi kenara sürükle: yarısına yerleşir</li><li>Başlığa çift tıkla: alanı kaplar</li></ul></div>
        </Window>
        <Window title="Sipariş #2041" chrome={chrome} snap={snap} resizable={resizable} color={color} stripe={stripe} icons={icons} x={300} y={110} width={300} height={190}
          open={() => order()} onClose={() => order.set(false)}>
          <div class="sc-win-pad"><p>HADİ Kahve · 2 ürün</p><p class="m-muted">Kargoya hazırlanıyor</p></div>
        </Window>
      </>
    }}
    {() => (notes() && order() ? null : <Button size="sm" class="sc-win-reopen" onClick={() => { notes.set(true); order.set(true) }}>Pencereleri yeniden aç</Button>)}
  </div>
}
