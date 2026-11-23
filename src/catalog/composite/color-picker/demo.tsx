// Showcase stage for ColorPicker: the picker and a card painted with its value, for the Playground values (playground.ts).
import { setStyle } from "../../demo-util.ts";
import { effect, untrack, computed } from "march";
import { ColorPicker, type ColorFormat } from "march/composite";

export default function ColorPickerDemo(props: { values: { format: string; alpha: boolean; palettes: boolean; contrast: boolean; eyedropper: boolean; readonly: boolean; preview: boolean; formats: boolean; input: boolean } }) {
  let $c = "#1d9ad6"
  const card = (<div class="sc-cp-card"><b>HADİ</b><span>{$c}</span></div>) as HTMLElement
  effect(() => setStyle(card, { "--sc-cp": $c }))
  // the starting format and the parts of the bottom rows are read once: the picker is built again only when one of them
  // changes (the color is kept)
  const once = computed(() => [props.values.format, props.values.preview, props.values.formats, props.values.input].join("|"))
  return <div class="sc-cp-demo">
    {() => {
      once()
      return untrack(() => {
        const format = props.values.format, preview = props.values.preview, formats = props.values.formats, input = props.values.input
        return <ColorPicker value={untrack(() => $c)} onChange={(v: string) => { $c = v }} format={format as ColorFormat} alpha={props.values.alpha} palettes={props.values.palettes ? undefined : false}
      contrast={props.values.contrast} eyedropper={props.values.eyedropper} readonly={props.values.readonly}
        preview={preview} formats={formats} input={input} />
      })
    }}
    {card}
  </div>
}
