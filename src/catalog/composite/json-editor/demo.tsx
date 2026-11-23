// Showcase stage for JsonEditor, for the Playground values (playground.ts: the samples and the schema are shared with
// MarchIDE's raw component).
import { untrack } from "march";
import { JsonEditor } from "march/components/composite/json-editor";
import type { JsonSchema } from "march/components/composite/tree-editor";
import { SAMPLES, SCHEMA } from "./playground.ts";

export default function JsonEditorDemo(props: { values: { data: string; mode: string; schema: boolean; readonly: boolean; switcher: boolean; format: boolean; status: boolean; labels: boolean } }) {
  let $v: unknown = SAMPLES[props.values.data] ?? SAMPLES["flags"]
  let data = props.values.data
  // the Format button and the status line belong to the text view: changing either option opens the text view, so the
  // change is seen at once
  let textParts = ""
  return <div class="sc-ed-split">
    {() => {
      const parts = `${props.values.format}${props.values.status}`; const mode = (textParts && parts !== textParts ? "text" : props.values.mode) as "tree" | "text"; textParts = parts
      // another sample: the value starts again from it
      if (props.values.data !== data) { data = props.values.data; untrack(() => { $v = SAMPLES[data] ?? SAMPLES["flags"] }) }
      return <JsonEditor value={untrack(() => $v)} onChange={(x: unknown) => { $v = x }} mode={mode} schema={props.values.schema ? SCHEMA as JsonSchema : undefined} readonly={props.values.readonly} rows={12}
        modes={props.values.switcher ? undefined : [mode]} format={props.values.format} status={props.values.status}
        labels={props.values.labels ? { text: "Kaynak", tree: "Ana hat", format: "Toparla", valid: "Sorun yok" } : undefined} />
    }}
    <pre class="sc-ed-out" aria-label="Değer">{JSON.stringify($v, null, 2)}</pre>
  </div>
}
