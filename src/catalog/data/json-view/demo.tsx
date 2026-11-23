// Showcase stage for JsonView: the value (JSON), the initially open depth, the arrow, the count texts and the name follow the Playground values (playground.ts).
import { JsonView, type JsonViewLabels } from "march/components/data/json-view";
import { ORDER } from "./playground.ts";

export const code = `<JsonView value={order} open={1} />   // open = initially expanded depth
<JsonView value={order} labels={{ items: "öğe", keys: "alan" }} arrow={(open) => <b>{() => (open() ? "−" : "+")}</b>} />   // or arrow={false}`

const parse = (json: string, or: unknown): unknown => { try { return JSON.parse(json) } catch { return or } }

export default function JsonViewDemo(props: { values: { value: string; open: number; arrow: string; labels: string; label: string } }) {
  return <div class="sc-col">{() => {
    const v = props.values, arrow = v.arrow
    return <JsonView value={parse(v.value || ORDER, null)} open={v.open} label={v.label || undefined} labels={parse(v.labels, undefined) as Partial<JsonViewLabels> | undefined}
      arrow={arrow === "off" ? false : arrow === "own" ? (isOpen: () => boolean) => <b>{() => (isOpen() ? "−" : "+")}</b> : true} />
  }}</div>
}
