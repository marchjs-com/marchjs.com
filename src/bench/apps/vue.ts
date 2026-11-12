// Benchmark app: Vue 3. The template (vue.template.html) is compiled ahead of time with Vue's own compiler
// (tools/gen-bench.mjs → vue.render.gen.js), as a single-file component would be. Rows live in a shallowRef;
// Vue renders changes in a microtask, before the next paint.
import { createApp, defineComponent, shallowRef, ref } from "vue"
import { render } from "./vue.render.gen.js"
import type { BenchApp, Row } from "../core.ts"

export function mount(host: HTMLElement): BenchApp {
  const rows = shallowRef<Row[]>([])
  const selected = ref(0)
  const App = defineComponent({
    setup: () => ({ rows, selected, select: (id: number) => { selected.value = id }, remove: (id: number) => { rows.value = rows.value.filter((r) => r.id !== id) } }),
    render,
  })
  const app = createApp(App)
  app.mount(host)
  return {
    run: (r) => { rows.value = r; selected.value = 0 },
    add: (r) => { rows.value = rows.value.concat(r) },
    update: () => { const d = rows.value.slice(); for (let i = 0; i < d.length; i += 10) { const r = d[i]!; d[i] = { id: r.id, label: r.label + " !!!" } } rows.value = d },
    swap: () => { const d = rows.value.slice(); if (d.length <= 998) return; const t = d[1]!; d[1] = d[998]!; d[998] = t; rows.value = d },
    clear: () => { rows.value = []; selected.value = 0 },
    destroy: () => app.unmount(),
  }
}

// the realistic scenarios' vue apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/vue.ts"
