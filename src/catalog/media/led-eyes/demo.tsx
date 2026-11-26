// Showcase stage for LedEyes: a robot face. The first face takes every option; next to it a small one follows the
// pointer, so moving over the page shows the gaze springing after it.
import { LedEyes } from "march/led";
import type { LedLookValues } from "../../led-look.ts";

export const code = `<LedEyes />
<LedEyes expression="look-left" mouth="smile" color="blue" />
<LedEyes mouth="talk" follow shape="tube" />`

type V = LedLookValues & { expression: string; mouth: string; alive: boolean; follow: boolean; cols: number; rows: number };

export default function LedEyesDemo(props: { values: V }) {
  return <div class="sc-row" sx={{ w: "full", gap: 4 }}>
    {() => {
      const v = props.values
      return <div sx={{ flex: "grow" }}>
        <LedEyes expression={v.expression as "open"} mouth={v.mouth as "none"} alive={v.alive} follow={v.follow} cols={v.cols} rows={v.rows}
          color={v.color as "rgb"} shape={v.shape as "round"} gap={v.gap} bloom={v.bloom || false} ghost={v.ghost} scanlines={v.scanlines} panel={v.panel as "dark"} />
      </div>
    }}
    <div sx={{ w: "sm" }}><LedEyes follow cols={20} rows={9} color="green" label="İşaretçiyi izleyen gözler" /></div>
  </div>
}
