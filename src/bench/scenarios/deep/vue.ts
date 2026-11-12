// State at the top, Vue 3: App holds the unit and the focus in a reactive object and passes them down as props through
// PanelView > GroupView > ItemView components (templates compiled ahead of time by Vue's compiler: vue*.template.html
// → *.render.gen.js). Vue re-renders a child only when its props changed, and each child receives only the focus it
// needs (the focused id if it lies inside that child, else -1; the item gets a boolean, and the unit only if it is a measured item): a focus step re-renders App
// and the old and the new item's panel, group and item; a unit step changes the props of every panel, group and
// measured item, so they render and are patched. The data itself is plain (markRaw). Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, markRaw } from "vue"
import { render as appRender } from "./vue.render.gen.js"
import { render as panelRender } from "./vue-panel.render.gen.js"
import { render as groupRender } from "./vue-group.render.gen.js"
import { render as itemRender } from "./vue-item.render.gen.js"
import { FIRST_UNIT, NO_FOCUS, itemText, itemClass, panelOf, groupOf, type Deep, type Step } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const pf = (focus: number, id: number) => (panelOf(focus) === id - 1 ? focus : NO_FOCUS)
const gf = (focus: number, id: number) => (groupOf(focus) === id - 1 ? focus : NO_FOCUS)
export function mount(host: HTMLElement, data: Deep): ScenarioApp {
  const s = reactive({ unit: FIRST_UNIT, focus: NO_FOCUS })
  const panels = markRaw(data.panels)
  const ItemView = defineComponent({ props: { it: { type: Object, required: true }, unit: { type: String, required: true }, on: { type: Boolean, required: true } }, setup: () => ({ text: itemText, cls: itemClass }), render: itemRender })
  const GroupView = defineComponent({ components: { ItemView }, props: { g: { type: Object, required: true }, unit: { type: String, required: true }, focus: { type: Number, required: true } }, render: groupRender })
  const PanelView = defineComponent({ components: { GroupView }, props: { p: { type: Object, required: true }, unit: { type: String, required: true }, focus: { type: Number, required: true } }, setup: () => ({ gf }), render: panelRender })
  const App = defineComponent({ components: { PanelView }, setup: () => ({ s, panels, pf }), render: appRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { const st = p as Step; if ("unit" in st) s.unit = st.unit; else s.focus = st.focus },
    destroy: () => app.unmount(),
  }
}
