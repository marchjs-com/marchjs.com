// Theme change, Alpine.js (CSP build): the theme is an Alpine store (Alpine's shared state) and every badge binds its
// class to it, so a change re-runs those 2.000 class bindings, in Alpine's microtask (before the paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  Alpine.store("benchTheme", { accent: FIRST })
  const theme = Alpine.store("benchTheme") as { accent: string }
  // <div class="cards"><template x-for="c in cards" :key="c.id"><div class="card"><h3 x-text="c.title"></h3><p x-text="c.text"></p>
  //   <span :class="badge($store.benchTheme.accent)" x-text="'#' + c.id"></span></div></template></div>
  const root = el("div", { class: "cards" }, el("template", { "x-for": "c in cards", "x-bind:key": "c.id" },
    el("div", { class: "card" }, el("h3", { "x-text": "c.title" }), el("p", { "x-text": "c.text" }), el("span", { "x-bind:class": "badge($store.benchTheme.accent)", "x-text": "'#' + c.id" }))))
  start(host, root, { cards: data, badge: badgeClass })
  return { step: (a) => { theme.accent = a as string }, destroy: () => { Alpine.destroyTree(root); root.remove() } }
}
