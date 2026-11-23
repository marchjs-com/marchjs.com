// Showcase stage for ListEditor: the sample items it starts with, a cap on the list, the row buttons, the add line and the read-only state.
import { ListEditor, Field } from "march/forms";
import { SAMPLES } from "./playground.ts";

export const code = `<Field label="Etiketler" group><ListEditor bind:value={$tags} max={5} placeholder="Etiket ekle" /></Field>
<ListEditor bind:value={$tags} sortable={false}
  labels={{ item: (n) => \`\${n}. etiket\`, remove: "Kaldır" }} addLabel="Ekle" />`

interface Values { items: number; max: number; readonly: boolean; sortable: boolean; removable: boolean; addable: boolean; placeholder: string; addLabel: string }

export default function ListEditorDemo(props: { values: Values }) {
  let $tags = SAMPLES.slice(0, props.values.items)
  return <div>{() => <Field label="Etiketler" group help={`En fazla ${props.values.max}; birden çok satır yapıştırmak her satırı ekler.`}>
    <ListEditor value={$tags} onChange={(v: string[]) => { $tags = v }} max={props.values.max} readonly={props.values.readonly} placeholder={props.values.placeholder} addLabel={props.values.addLabel}
      sortable={props.values.sortable} removable={props.values.removable} addable={props.values.addable}
      labels={{ item: (n: number) => `${n}. etiket`, moveUp: "Yukarı taşı", moveDown: "Aşağı taşı", remove: "Kaldır" }} />
  </Field>}</div>
}
