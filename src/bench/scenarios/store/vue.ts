// Shared store, Vue 3: one reactive() store holds all the cells; each StoreCell component reads store.cells[i] in its
// template, so it depends on that index only. Sections are components too (templates compiled ahead of time:
// vue.template.html, vue-section.template.html, vue-cell.template.html → *.render.gen.js). A step writes the 50 cells
// and Vue re-renders only those cell components. Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, markRaw } from "vue"
import { render as gridRender } from "./vue.render.gen.js"
import { render as sectionRender } from "./vue-section.render.gen.js"
import { render as cellRender } from "./vue-cell.render.gen.js"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: StoreData): ScenarioApp {
  const appStore = reactive({ cells: data.cells.slice() })
  const sections = markRaw(sectionsOf(data.cells.length).map((idx, k) => markRaw({ k, idx })))
  const StoreCell = defineComponent({ props: { i: { type: Number, required: true } }, setup: () => ({ store: appStore }), render: cellRender })
  const StoreSection = defineComponent({ components: { StoreCell }, props: { idx: { type: Array, required: true } }, render: sectionRender })
  const App = defineComponent({ components: { StoreSection }, setup: () => ({ sections }), render: gridRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { for (const w of p as Write[]) appStore.cells[w.i] = w.v },
    destroy: () => app.unmount(),
  }
}
