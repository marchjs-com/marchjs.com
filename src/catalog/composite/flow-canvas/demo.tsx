// Showcase stage for FlowCanvas: the sample order flow with the Playground values. Code is shown in the Code tab.
// FlowCanvas has its own entry (march/flow): the flow page imports this demo statically.
import { computed } from "march";
import { FlowCanvas, createFlow } from "march/components/composite/flow-canvas";
import { sampleTypes, sampleDoc } from "./sample.ts";

export const code = `const flow = createFlow({ types, doc })
<FlowCanvas flow={flow} snap={16} minimap tool="select" />
flow.toJSON()   // { schema: "march.flow/v1", nodes, edges: [{ from: "hook.out", to: "customer.in" }] }`

const CONTROLS: Record<string, boolean | ("zoom" | "fit" | "layout")[]> = { all: true, zoom: ["zoom"], none: false }

export default function FlowCanvasDemo(props: { values: { snap: number; minimap: boolean; tool: string; fields: boolean; controls: string; motion: boolean } }) {
  const flow = createFlow({ types: sampleTypes, doc: sampleDoc() })
  // motion shows only while something moves: when the option changes the canvas is drawn again (the same flow), so the
  // edges draw in once with motion on and are simply there with it off
  const motion = computed(() => props.values.motion)
  return <div class="sc-col">
    <div class="sc-flow-stage">
      {() => {
        const on = motion()
        return <FlowCanvas flow={flow} snap={() => props.values.snap} minimap={() => props.values.minimap} tool={() => props.values.tool as "select"} fields={() => props.values.fields}
          controls={() => CONTROLS[props.values.controls] ?? true} motion={on} />
      }}
    </div>
    <span class="sc-demo-call">{() => (motion() ? "Hareket açık: kenarlar çizilerek gelir; görünüm ve otomatik yerleşim kayarak oturur." : "Hareket kapalı: kenarlar, görünüm ve otomatik yerleşim anında yerinde.")}</span>
  </div>
}
