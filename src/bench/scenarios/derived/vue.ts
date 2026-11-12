// Derived values, Vue 3: the fields are one reactive array and each computed cell is a computed() reading its fields
// (Vue tracks which array indexes it read), plus a computed class over the value. Each field and each computed cell is
// its own small component (templates compiled ahead of time by Vue's compiler: vue*.template.html → *.render.gen.js),
// so an edit re-renders only the edited field and the computed cells whose value changed; the form does not render
// again. Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, computed, markRaw } from "vue"
import { render as formRender } from "./vue.render.gen.js"
import { render as fieldRender } from "./vue-field.render.gen.js"
import { render as compRender } from "./vue-comp.render.gen.js"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Form): ScenarioApp {
  const f = reactive(data.fields.slice())
  const get = (i: number) => f[i]!
  const comps = markRaw(data.comps.map((c) => {
    const value = computed(() => evalComp(c, get))
    return { value, cls: computed(() => compClass(c, value.value)) }
  }))
  const FieldCell = defineComponent({ props: { i: { type: Number, required: true } }, setup: () => ({ f }), render: fieldRender })
  const CompCell = defineComponent({ props: { k: { type: Number, required: true } }, setup: (p) => ({ value: comps[p.k]!.value, cls: comps[p.k]!.cls }), render: compRender })
  const fieldIds = markRaw(data.fields.map((_, i) => i)), compIds = markRaw(data.comps.map((_, k) => k))
  const App = defineComponent({ components: { FieldCell, CompCell }, setup: () => ({ fieldIds, compIds }), render: formRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { const e = p as Edit; f[e.i] = e.v },
    destroy: () => app.unmount(),
  }
}
