// Benchmark app: Alpine.js, its CSP build (@alpinejs/csp: expressions read by Alpine's own parser, no eval or
// new Function, so it runs under the page's CSP). The markup is what one would write in HTML (x-data, a keyed x-for
// template, x-bind, x-on, x-text); here it is built with DOM calls (Trusted Types refuse HTML strings) and handed to
// Alpine (alpine-dom.ts). Alpine applies state changes in a microtask, before the next paint.
import Alpine from "@alpinejs/csp"
import { el, start } from "./alpine-dom.ts"
import type { BenchApp, Row } from "../core.ts"

interface State { rows: Row[]; selected: number; select(id: number): void; remove(id: number): void }

export function mount(host: HTMLElement): BenchApp {
  // <table class="bt" x-data="…"><tbody>
  //   <template x-for="item in rows" :key="item.id">
  //     <tr :class="item.id === selected ? 'danger' : ''">
  //       <td class="c1" x-text="item.id"></td>
  //       <td class="c4"><a class="lbl" @click="select(item.id)" x-text="item.label"></a></td>
  //       <td class="c1"><a class="rm" @click="remove(item.id)">×</a></td>
  //       <td class="c6"></td>
  //     </tr>
  //   </template>
  // </tbody></table>
  const table = el("table", { class: "bt" }, el("tbody", {}, el("template", { "x-for": "item in rows", "x-bind:key": "item.id" },
    el("tr", { "x-bind:class": "item.id === selected ? 'danger' : ''" },
      el("td", { class: "c1", "x-text": "item.id" }),
      el("td", { class: "c4" }, el("a", { class: "lbl", "x-on:click": "select(item.id)", "x-text": "item.label" })),
      el("td", { class: "c1" }, el("a", { class: "rm", "x-on:click": "remove(item.id)" }, "×")),
      el("td", { class: "c6" })))))
  const s = start<State>(host, table, {
    rows: [], selected: 0,
    select(id) { this.selected = id },
    remove(id) { this.rows = this.rows.filter((r) => r.id !== id) },
  })
  return {
    run: (r) => { s.rows = r; s.selected = 0 },
    add: (r) => { s.rows = s.rows.concat(r) },
    update: () => { s.rows = s.rows.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })) },
    swap: () => { const d = s.rows.slice(); if (d.length <= 998) return; const t = d[1]!; d[1] = d[998]!; d[998] = t; s.rows = d },
    clear: () => { s.rows = []; s.selected = 0 },
    destroy: () => { Alpine.destroyTree(table); table.remove() },
  }
}

// the realistic scenarios' Alpine apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/alpine.ts"
