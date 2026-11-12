// Moving highlight, SolidJS: the hovered index is a signal and each row reads it through createSelector, so a step
// wakes only the old and the new row. Compiled with babel-preset-solid (tools/gen-bench.mjs → solid.gen.js).
import { createSignal, createSelector } from "solid-js"
import { render } from "solid-js/web"
import { HOVER } from "./def.ts"

export function mount(host, data) {
  let setHovered
  const dispose = render(() => {
    const [hovered, set] = createSignal(-1)
    setHovered = set
    const isHovered = createSelector(hovered)
    return (
      <table class="bt"><tbody>
        {data.map((it, i) => <tr class={isHovered(i) ? HOVER : ""}><td class="id">{it.id}</td><td class="lbl">{it.label}</td></tr>)}
      </tbody></table>
    )
  }, host)
  return {
    step: (i) => setHovered(i),
    destroy: dispose,
  }
}
