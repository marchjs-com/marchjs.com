// Data list, Vue 3: the query, categories, sort and the running selection count and total live in one reactive
// object; the filtered list and the sorted view are two computed values; a keyed v-for renders one row component per
// record (templates compiled ahead of time: vue*.template.html → *.render.gen.js). Selection is a reactive array of
// flags that each row component reads for its own record, and the summary is its own component, so a toggle
// re-renders one row and the summary, not the list. Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, computed, markRaw } from "vue"
import { render as listRender } from "./vue.render.gen.js"
import { render as rowRender } from "./vue-row.render.gen.js"
import { render as sumRender } from "./vue-sum.render.gen.js"
import { CATS, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  const recs = markRaw(data.map((r) => markRaw(r)))
  const st = reactive({ q: "", cats: CATS.map(() => true), key: "id" as Key, dir: 1 as 1 | -1, count: 0, total: 0 })
  const sel = reactive(new Array<boolean>(data.length).fill(false))
  const filtered = computed(() => { const q = st.q, cats = st.cats.slice(); return markRaw(recs.filter((r) => matches(r, q, cats))) })
  const view = computed(() => markRaw(filtered.value.slice().sort(compare(st.key, st.dir))))
  const setSel = (i: number, on: boolean) => {
    if (sel[i] === on) return
    sel[i] = on
    st.count += on ? 1 : -1
    st.total += on ? data[i]!.price : -data[i]!.price
  }
  const GridRow = defineComponent({ props: { r: { type: Object, required: true }, sel: { type: Array, required: true } }, setup: () => ({ cats: CATS, fmt: fmtPrice }), render: rowRender })
  const GridSum = defineComponent({ props: { n: { type: Number, required: true }, s: { type: Object, required: true } }, setup: () => ({ text: summary }), render: sumRender })
  const App = defineComponent({ components: { GridRow, GridSum }, setup: () => ({ view, st, sel }), render: listRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => {
      const a = p as Act
      if (a.t === "q") st.q = a.q
      else if (a.t === "cat") st.cats[a.c] = a.on
      else if (a.t === "sort") { st.key = a.key; st.dir = a.dir }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view.value) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
    },
    destroy: () => app.unmount(),
  }
}
