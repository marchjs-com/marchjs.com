// Benchmark app: Alpine.js, its CSP build (@alpinejs/csp: expressions read by Alpine's own parser, no eval or
// new Function, so it runs under the page's CSP). The markup is what one would write in HTML (x-data, a keyed x-for
// template, x-bind, x-on, x-text); here it is built with DOM calls (Trusted Types refuse HTML strings) and handed to
// Alpine. Alpine applies state changes in a microtask, before the next paint.
import Alpine from "@alpinejs/csp"
import type { BenchApp, Row } from "../core.ts"

interface State { rows: Row[]; selected: number; select(id: number): void; remove(id: number): void }
Alpine.data("bench", (): State => ({
  rows: [], selected: 0,
  select(id) { this.selected = id },
  remove(id) { this.rows = this.rows.filter((r) => r.id !== id) },
}))
let started = false

/** <tag attr="value"…>kids</tag> */
const el = (tag: string, attrs: Record<string, string>, ...kids: (Node | string)[]): HTMLElement => {
  const e = document.createElement(tag)
  for (const k in attrs) e.setAttribute(k, attrs[k]!)
  e.append(...kids)
  return e
}

export function mount(host: HTMLElement): BenchApp {
  // <table class="bt" x-data="bench"><tbody>
  //   <template x-for="item in rows" :key="item.id">
  //     <tr :class="item.id === selected ? 'danger' : ''">
  //       <td class="c1" x-text="item.id"></td>
  //       <td class="c4"><a class="lbl" @click="select(item.id)" x-text="item.label"></a></td>
  //       <td class="c1"><a class="rm" @click="remove(item.id)">×</a></td>
  //       <td class="c6"></td>
  //     </tr>
  //   </template>
  // </tbody></table>
  const tpl = document.createElement("template")
  tpl.setAttribute("x-for", "item in rows")
  tpl.setAttribute("x-bind:key", "item.id")
  tpl.content.append(el("tr", { "x-bind:class": "item.id === selected ? 'danger' : ''" },
    el("td", { class: "c1", "x-text": "item.id" }),
    el("td", { class: "c4" }, el("a", { class: "lbl", "x-on:click": "select(item.id)", "x-text": "item.label" })),
    el("td", { class: "c1" }, el("a", { class: "rm", "x-on:click": "remove(item.id)" }, "×")),
    el("td", { class: "c6" })))
  const table = el("table", { class: "bt", "x-data": "bench" }, el("tbody", {}, tpl))
  host.append(table)
  if (started) Alpine.initTree(table)
  else { started = true; Alpine.start() }
  const s = Alpine.$data(table) as State
  return {
    run: (r) => { s.rows = r; s.selected = 0 },
    add: (r) => { s.rows = s.rows.concat(r) },
    update: () => { s.rows = s.rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })) },
    swap: () => { const d = s.rows.slice(); if (d.length <= 998) return; const t = d[1]!; d[1] = d[998]!; d[998] = t; s.rows = d },
    clear: () => { s.rows = []; s.selected = 0 },
    destroy: () => { Alpine.destroyTree(table); table.remove() },
  }
}
