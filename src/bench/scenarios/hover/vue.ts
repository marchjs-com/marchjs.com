// Moving highlight, Vue 3: the hovered index is a ref; the v-for rows carry v-memo="[i === hovered]", the pattern Vue
// documents for selection in large lists. A step re-runs the list render, but each row whose memo key did not change
// reuses its previous vnode, so only the two changed rows are patched. Template compiled ahead of time
// (vue.template.html → vue.render.gen.js). Vue renders in a microtask, before the paint.
import { createApp, defineComponent, ref, markRaw } from "vue"
import { render } from "./vue.render.gen.js"
import type { Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Item[]): ScenarioApp {
  const rows = markRaw(data), hovered = ref(-1)
  const App = defineComponent({ setup: () => ({ rows, hovered }), render })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { hovered.value = p as number },
    destroy: () => app.unmount(),
  }
}
