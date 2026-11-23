// Showcase stage for Splitter: a list and a preview side by side (Playground values in playground.ts).
import { Splitter } from "march/layout";
import { moreVertical, Icon } from "march/icons";

export const code = `<Splitter start={<FileList />} end={<Preview />} initial={0.35} min={0.2} />
<Splitter start={…} end={…} handle={<Icon of={moreVertical} />} m:color="brand-orange" />   // handle={false}: sabit`

// the handle takes its color while it is used (pointer over it, focused, dragged): the stage names the color
const COLORS: Record<string, string> = { primary: "vurgu", "brand-blue": "mavi", "brand-purple": "mor", success: "yeşil" }

export default function SplitterDemo(props: { values: { start: string; end: string; orientation: string; initial: number; min: number; handle: string; color: string } }) {
  return <div class="sc-split-frame">
    {() => { const initial = props.values.initial / 100, min = props.values.min / 100, color = props.values.color as "primary"
      const handle = props.values.handle === "off" ? false : props.values.handle === "grip" ? <Icon of={moreVertical} /> : true
      return <Splitter orientation={props.values.orientation as "horizontal"} initial={initial} min={min} handle={handle} m:color={color} label="Liste genişliği"
      start={<ul class="sc-split-list"><li><strong>{props.values.start}</strong></li><li>rapor.pdf</li><li>sunum.key</li><li>bütçe.xlsx</li><li>logo.svg</li></ul>}
      end={<div class="sc-split-preview"><strong>{props.values.end}: rapor.pdf</strong><p class="m-muted">Tutamacı sürükleyin ya da odaklayıp ← → kullanın; Enter başa döndürür.</p>
        {props.values.handle === "off" ? null : <p class="m-muted">{`Tutamaç rengi: ${COLORS[props.values.color]} (üstüne gelince, odaklanınca ve sürüklerken görünür).`}</p>}</div>} /> }}
  </div>
}
