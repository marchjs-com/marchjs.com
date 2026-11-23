// Showcase stage for FlowPalette: a palette next to a small canvas to drop onto. Code is shown in the Code tab.
import { FlowPalette } from "march/components/composite/flow-palette";
import { FlowCanvas, createFlow } from "march/components/composite/flow-canvas";
import { sampleTypes } from "../flow-canvas/sample.ts";

export const code = `<FlowPalette flow={flow} types={types} />
<FlowCanvas flow={flow} />   // drag a card onto the canvas, or focus it and press Enter`

export default function FlowPaletteDemo(props: { values: { search: boolean; set: string; categories: boolean; descriptions: boolean; grip: boolean; card: string; labels: boolean } }) {
  const flow = createFlow({ types: sampleTypes, doc: { schema: "march.flow/v1", nodes: [{ id: "hook", type: "webhook", x: 0, y: 0 }], edges: [] } })
  const types = () => sampleTypes.filter((t) => props.values.set === "all" || (props.values.set === "actions" ? t.category === "Eylemler" : t.category === "Mantık"))
  return <div class="sc-flow-split">
    {() => <FlowPalette flow={flow} types={types()} search={props.values.search} categories={props.values.categories} descriptions={props.values.descriptions} grip={props.values.grip}
      renderCard={props.values.card === "own" ? (ty) => <span><b>{ty.label}</b> · {ty.category}</span> : undefined}
      labels={props.values.labels ? { search: "Bir adım bul…", empty: "Böyle bir adım yok." } : undefined} />}
    <div class="sc-flow-stage sc-flow-stage-sm"><FlowCanvas flow={flow} minimap={false} fields={false} /></div>
  </div>
}
