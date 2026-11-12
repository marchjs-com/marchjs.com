// Theme change, Vue 3: the top component provide()s a reactive theme object; each card's badge is a small component
// that inject()s it and reads the accent in its template, so a change re-renders only the 2.000 badge components (the
// list does not read the theme and does not render again). Templates compiled ahead of time by Vue's compiler
// (vue.template.html, vue-badge.template.html → *.render.gen.js). Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, markRaw, provide, inject } from "vue"
import { render as listRender } from "./vue.render.gen.js"
import { render as badgeRender } from "./vue-badge.render.gen.js"
import { FIRST, badgeClass, type Card } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

const THEME = Symbol("theme")
export function mount(host: HTMLElement, data: Card[]): ScenarioApp {
  const theme = reactive({ accent: FIRST })
  const cards = markRaw(data)
  const ThemeBadge = defineComponent({ props: { n: { type: Number, required: true } }, setup: () => ({ theme: inject(THEME) as { accent: string }, cls: badgeClass }), render: badgeRender })
  const App = defineComponent({ components: { ThemeBadge }, setup: () => { provide(THEME, theme); return { cards } }, render: listRender })
  const app = createApp(App)
  app.mount(host)
  return { step: (p) => { theme.accent = p as string }, destroy: () => app.unmount() }
}
