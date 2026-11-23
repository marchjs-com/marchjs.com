// Showcase stage for Disclosure: two sections, one open (Playground values in playground.ts).
import { signal } from "march";
import { Disclosure } from "march/layout";
import { settings, Icon } from "march/icons";

export const code = `<Disclosure title={<span>Gelişmiş ayarlar</span>} open={$open} onToggle={(o) => $open = o}>…</Disclosure>
<Disclosure title="Gelişmiş ayarlar" marker={<Icon of={settings} />}>…</Disclosure>   // marker={false}: işaretsiz`

export default function DisclosureDemo(props: { values: { title: string; open: boolean; marker: string; content: string } }) {
  const last = signal("—")
  return <div class="sc-disc-demo">
    {() => { const open = props.values.open, marker = props.values.marker === "off" ? false : props.values.marker === "own" ? <Icon of={settings} /> : true; return <Disclosure title={props.values.title} open={open} marker={marker} onToggle={(o: boolean) => last.set(o ? "açıldı" : "kapandı")}>
      <p>{props.values.content}</p>
    </Disclosure> }}
    <Disclosure title="Sık sorulan: verilerim nerede tutulur?">
      <p>Avrupa'daki veri merkezlerinde, şifreli olarak.</p>
    </Disclosure>
    <p class="m-muted">{() => `Son değişiklik: ${last()}`}</p>
  </div>
}
