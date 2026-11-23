// Showcase stage for ColorInput: start from one of the HADİ colors.
import { ColorInput } from "march/components/forms/color-input";
import { Field } from "march/forms";

export const code = `<Field label="Marka rengi"><ColorInput bind:value={$color} /></Field>
<ColorInput bind:value={$color} text={false} swatchLabel="Marka rengi" />   // only the swatch; swatch={false}: only the text`

export default function ColorInputDemo(props: { values: { start: string; swatch: boolean; text: boolean } }) {
  return <div>{() => {
    let $color = props.values.start
    const swatch = props.values.swatch !== false, text = !swatch || props.values.text !== false
    return <Field label="Marka rengi"><ColorInput bind:value={$color} swatch={swatch} text={text} swatchLabel="Renk seç" /></Field>
  }}</div>
}
