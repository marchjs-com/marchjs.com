// Moving highlight, March: the hovered index is one signal and each row reads it through selector(), so a step
// wakes only the row that loses the highlight and the row that gains it (two class bindings), not 10.000 rows.
import { render, signal, selector } from "hadi-march"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const hovered = signal(-1)
  const isHovered = selector(() => hovered())
  const dispose = render(() => <table class="bt"><tbody>
    {data.map((it, i) => <tr class={isHovered(i) ? HOVER : ""}><td class="id">{it.id}</td><td class="lbl">{it.label}</td></tr>)}
  </tbody></table>, host)
  return {
    step: (p) => hovered.set(p as number),
    destroy: dispose,
  }
}
