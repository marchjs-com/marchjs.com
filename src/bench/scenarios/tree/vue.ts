// One value deep in a large tree, Vue 3: a recursive TreeNode component per node (templates compiled ahead of time by
// Vue's compiler: vue.template.html, vue-node.template.html → *.render.gen.js). The tree itself is plain (markRaw);
// each leaf value is a reactive object read only in that leaf's render, so a step re-renders and patches only the
// target leaf component. Vue renders in a microtask, before the paint.
import { createApp, defineComponent, reactive, markRaw } from "vue"
import { render as treeRender } from "./vue.render.gen.js"
import { render as nodeRender } from "./vue-node.render.gen.js"
import type { Tree } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Tree): ScenarioApp {
  const cells = markRaw(data.values.map((v) => reactive({ v })))
  const roots = markRaw(data.roots)
  const TreeNode = defineComponent({ name: "TreeNode", props: { n: { type: Object, required: true } }, setup: () => ({ cells }), render: nodeRender })
  TreeNode.components = { TreeNode }
  const App = defineComponent({ components: { TreeNode }, setup: () => ({ roots }), render: treeRender })
  const app = createApp(App)
  app.mount(host)
  return {
    step: (p) => { cells[data.target]!.v = p as number },
    destroy: () => app.unmount(),
  }
}
