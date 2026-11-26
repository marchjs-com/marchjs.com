// Data list, Alpine.js (CSP build): the query, categories, sort, selection flags and the running count and total are
// reactive x-data; the keyed x-for draws view(), which filters and sorts (Alpine has no derived state, so the list
// binding re-runs when the query, a category or the sort changes, not on a selection). Each row's class reads its own
// flag, so a toggle re-runs one row's class binding and the summary. Updates run in Alpine's microtask (before the
// paint).
import Alpine from "@alpinejs/csp"
import { el, start } from "../../apps/alpine-dom.ts"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface State { q: string; cats: boolean[]; key: Key; dir: 1 | -1; sel: boolean[]; count: number; total: number; view(): Rec[] }
export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  // <div><p class="gsum" x-text="sum(view().length, count, total)"></p><table class="bt"><tbody>
  //   <template x-for="r in view()" :key="r.id"><tr :class="sel[r.i] ? 'sel' : ''"><td class="id" x-text="r.id"></td>…</tr></template></tbody></table></div>
  const root = el("div", {}, el("p", { class: "gsum", "x-text": "sum(view().length, count, total)" }),
    el("table", { class: "bt" }, el("tbody", {}, el("template", { "x-for": "r in view()", "x-bind:key": "r.id" },
      el("tr", { "x-bind:class": `sel[r.i] ? '${SEL}' : ''` }, el("td", { class: "id", "x-text": "r.id" }), el("td", { class: "nm", "x-text": "r.name" }),
        el("td", { class: "cat", "x-text": "catName(r.cat)" }), el("td", { class: "px", "x-text": "price(r.price)" }), el("td", { class: "st", "x-text": "r.stock" }))))))
  const s = start<State>(host, root, {
    q: "", cats: CATS.map(() => true), key: "id", dir: 1, sel: data.map(() => false), count: 0, total: 0,
    view(this: State) { const q = this.q, c = this.cats.slice(); return data.filter((r) => matches(r, q, c)).sort(compare(this.key, this.dir)) },
    sum: summary, price: fmtPrice, catName: (c: number) => CATS[c],
  } as State)
  const setSel = (i: number, on: boolean) => {
    if (s.sel[i] === on) return
    s.sel[i] = on; s.count += on ? 1 : -1; s.total += on ? data[i]!.price : -data[i]!.price
  }
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q") s.q = a.q
      else if (a.t === "cat") s.cats[a.c] = a.on
      else if (a.t === "sort") { s.key = a.key; s.dir = a.dir }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of s.view()) setSel(r.i, true)
      else for (let i = 0; i < data.length; i++) setSel(i, false)
    },
    destroy: () => { Alpine.destroyTree(root); root.remove() },
  }
}
