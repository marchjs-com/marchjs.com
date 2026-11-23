// Showcase stage for KeyValueEditor: the sample rows, numbers on or off (see the stored object) and read-only.
import { KeyValueEditor, Field } from "march/forms";
import { START } from "./playground.ts";

export const code = `<Field label="Kota" group><KeyValueEditor bind:value={$limits} numbers keyPlaceholder="Plan" valuePlaceholder="Koltuk" /></Field>
<KeyValueEditor bind:value={$limits} removable={false} addable={false} labels={{ key: "Plan", value: "Koltuk", add: "Satır ekle" }} />`

type Limits = Record<string, string | number>

export default function KeyValueEditorDemo(props: { values: { sample: boolean; numbers: boolean; readonly: boolean; addable: boolean; removable: boolean } }) {
  let $limits: Limits = props.values.sample ? START : {}
  return <div class="sc-stack">
    {() => <Field label="Kota" group><KeyValueEditor value={$limits} onChange={(v: Limits) => { $limits = v }} numbers={props.values.numbers} readonly={props.values.readonly} keyPlaceholder="Plan" valuePlaceholder="Koltuk"
      addable={props.values.addable} removable={props.values.removable} labels={{ key: "Plan", value: "Koltuk", remove: "Kaldır", add: "Satır ekle", duplicate: "Bu ad zaten var" }} /></Field>}
    <pre class="m-muted">{() => JSON.stringify(props.values.numbers ? Object.fromEntries(Object.entries($limits).map(([k, x]) => [k, x !== "" && !isNaN(Number(x)) ? Number(x) : x])) : $limits)}</pre>
  </div>
}
