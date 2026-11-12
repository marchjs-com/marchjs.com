// Independent counters, Vue 3: each Counter component owns a ref and registers its increment; a step increments the
// fired counters and Vue re-renders only those components (templates compiled ahead of time: vue.template.html,
// vue-counter.template.html → *.render.gen.js). Vue renders in a microtask, before the paint.
import { createApp, defineComponent, ref, markRaw } from "vue"
import { render as gridRender } from "./vue.render.gen.js"
import { render as counterRender } from "./vue-counter.render.gen.js"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Model[]): ScenarioApp {
  const inc: (() => void)[] = []
  const counters = markRaw(data.map((c, i) => ({ id: c.id, i })))
  const CounterView = defineComponent({
    props: { i: { type: Number, required: true } },
    setup(props) { const n = ref(0); inc[props.i] = () => { n.value++ }; return { n } },
    render: counterRender,
  })
  const App = defineComponent({ components: { CounterView }, setup: () => ({ counters }), render: gridRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { for (const i of p as Fired) inc[i]!() },
    destroy: () => app.unmount(),
  }
}
