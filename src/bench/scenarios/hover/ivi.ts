// Moving highlight, ivi: a keyed List() of row components receiving hovered={hovered === i}; a step updates the list
// and each row skips its update unless its boolean changed, so only two rows are patched (ivi updates synchronously
// in update()). Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, component, List, html } from "ivi"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface RowProps { it: Item; hovered: boolean }
const RowView = component<RowProps>(() => ({ it, hovered }) => html`<tr class=${hovered ? HOVER : ""}><td class="id">${it.id}</td><td class="lbl">${it.label}</td></tr>`,
  (a, b) => a.it === b.it && a.hovered === b.hovered)

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const root = createRoot(host)
  const idx = data.map((_, i) => i), key = (i: number) => data[i]!.id
  const draw = (h: number) => update(root, html`<table class="bt"><tbody>${List(idx, key, (i) => RowView({ it: data[i]!, hovered: i === h }))}</tbody></table>`)
  draw(-1)
  return { step: (i) => draw(i as number), destroy: () => update(root, null) }
}
