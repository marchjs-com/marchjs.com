// Start-up, Vue 3: the normal start, createApp().mount(); a start unmounts the previous app and mounts a new one.
// The counter is a ref in its own header component, so a click re-renders only the header. The page data is passed
// raw (markRaw: static, no reactive proxies). Templates compiled ahead of time by Vue's compiler (vue.template.html,
// vue-header.template.html → *.render.gen.js). Vue attaches the @click listener on the button; the update renders in
// a microtask, before the paint.
import { createApp, defineComponent, markRaw, ref, type App } from "vue"
import { render as pageRender } from "./vue.render.gen.js"
import { render as headerRender } from "./vue-header.render.gen.js"
import { rowsFor, HEADS, type Dash, type Run } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Dash): ScenarioApp {
  const d = markRaw(data)
  const PageHeader = defineComponent({ props: { title: { type: String, required: true }, k: { type: Number, required: true } }, setup: () => ({ n: ref(0) }), render: headerRender })
  const Page = defineComponent({
    components: { PageHeader },
    props: { k: { type: Number, required: true } },
    setup: (props) => ({ d, heads: HEADS, rows: markRaw(rowsFor(data.rows, props.k)) }),
    render: pageRender,
  })
  let app: App
  const start = (k: number) => { app = createApp(Page, { k }); app.mount(host) }
  start(0)
  return {
    step: (p) => {
      app.unmount()
      start(p as Run)
      ;(host.querySelector(".inc") as HTMLElement).click()
    },
    destroy: () => app.unmount(),
  }
}
