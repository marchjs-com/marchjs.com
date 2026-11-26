// Theme change, ivi: the accent is passed down and the app updated again; each card is a template whose values ivi
// compares, so a change writes only the 2.000 badges' class (ivi updates synchronously in update()).
// Templates compiled with ivi's template compiler (tools/gen-bench.mjs → ivi.gen.js).
import { createRoot, update, html } from "ivi"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  const card = (c: Card, accent: string) => html`<div class="card"><h3>${c.title}</h3><p>${c.text}</p><span class=${badgeClass(accent)}>${`#${c.id}`}</span></div>`
  const root = createRoot(host)
  const draw = (accent: string) => update(root, html`<div class="cards">${data.map((c) => card(c, accent))}</div>`)
  draw(FIRST)
  return { step: (a) => draw(a as string), destroy: () => update(root, null) }
}
