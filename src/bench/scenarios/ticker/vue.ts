// Live ticker, Vue 3: each quote is a reactive object rendered by its own row component (templates compiled ahead of
// time by Vue's compiler: vue.template.html, vue-row.template.html → *.render.gen.js). Changing a quote re-renders only
// its row component; the list is a plain array and does not render again. Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, markRaw } from "vue"
import { render as listRender } from "./vue.render.gen.js"
import { render as rowRender } from "./vue-row.render.gen.js"
import { fmtPrice, dir, type Quote, type Tick, type ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Quote[]): ScenarioApp {
  const rows = markRaw(data.map((q) => reactive({ id: q.id, sym: q.sym, price: q.price, cls: "px" })))
  const TickerRow = defineComponent({ props: { r: { type: Object, required: true } }, setup: () => ({ fmt: fmtPrice }), render: rowRender })
  const App = defineComponent({ components: { TickerRow }, setup: () => ({ rows }), render: listRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => {
      for (const t of p as Tick[]) {
        const r = rows[t.i]!
        r.cls = `px ${dir(t.price, r.price)}`
        r.price = t.price
      }
    },
    destroy: () => app.unmount(),
  }
}
