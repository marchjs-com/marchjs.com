// Theme change, Lit 3: lit-html's core has no context (that is @lit/context, for LitElement components), so the
// accent is passed down in the render: a step renders the whole card list again and lit-html checks every card's
// values, touching the DOM only where one changed (each badge's class). Card template in compiled form
// (../lit-tpl.ts), as the CSP refuses HTML strings.
import { render } from "lit/html.js"
import { template, el, attr, child } from "../lit-tpl.ts"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  const card = template(el("div", { class: "card" }, el("h3", {}, child()), el("p", {}, child()), el("span", { class: attr("class") }, child())))
  const root = document.createElement("div")
  root.className = "cards"; host.append(root)
  const ids = data.map((c) => `#${c.id}`)
  const draw = (accent: string) => { const cls = badgeClass(accent); render(data.map((c, i) => card(c.title, c.text, cls, ids[i])), root) }
  draw(FIRST)
  return { step: (p) => draw(p as string), destroy: () => { render(null, root); root.remove() } }
}
