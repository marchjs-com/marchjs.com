// Showcase stage for EasingCurveEditor: the curve is registered as "hadi-pop" in the motion engine; the button runs a
// real engine animation with that name, for the Playground values (playground.ts).
import { untrack } from "march";
import { animate, EasingCurveEditor } from "march/motion";
import type { ColorToken } from "march/theme";

// the Playground's handleColors (JSON): two colour tokens, else the editor's own
const colors = (json: string): readonly [ColorToken, ColorToken] | undefined => { try { const x = JSON.parse(json); return Array.isArray(x) && x.length === 2 ? x as [ColorToken, ColorToken] : undefined } catch { return undefined } }

export default function EasingCurveEditorDemo(props: { values: { value: string; preview: string; duration: number; presets: boolean; readonly: boolean; compact: boolean; inputs: boolean; cssLine: boolean; grid: boolean; handleColors: string } }) {
  let $e = "cubic-bezier(.34, 1.56, .64, 1)"
  let typed = ""
  const card = (<div class="sc-ec-card">HADİ</div>) as HTMLElement
  const run = () => animate(card, [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-1.5rem) scale(1.08)" }, { transform: "translateY(0) scale(1)" }], { duration: props.values.duration, easing: "hadi-pop" })
  return <div class="sc-ec-demo">
    {() => {
      const v = { ...props.values }
      // a curve typed in the Playground starts the editor there; a change of another option keeps the dragged one
      if (v.value && v.value !== typed) { typed = v.value; $e = v.value }
      return <EasingCurveEditor value={untrack(() => $e)} onChange={(x: string) => { $e = x }} name="hadi-pop" preview={v.preview as "move"} duration={v.duration}
        presets={v.presets ? undefined : false} readonly={v.readonly} compact={v.compact}
        inputs={v.inputs} cssLine={v.cssLine} nameNote={v.cssLine} grid={v.grid} handleColors={colors(v.handleColors)} />
    }}
    <div class="sc-ec-try">{card}<button type="button" class="m-btn m-btn-primary" onClick={run}>"hadi-pop" ile oynat</button></div>
  </div>
}
