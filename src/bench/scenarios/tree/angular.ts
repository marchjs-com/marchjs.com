// One value deep in a large tree, Angular: a recursive OnPush component per inner node and a leaf component reading
// its own value signal, so a step that sets one signal refreshes only that leaf's view.
// Compiled ahead of time with the benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, signal, type WritableSignal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import type { Tree, TNode } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({
  selector: "div[tLeaf]", host: { class: "n leaf" }, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="l">{{ n.label }}</span><b class="v">{{ v() }}</b>`,
})
class LeafView { @Input({ required: true }) n!: TNode; @Input({ required: true }) v!: WritableSignal<number> }

@Component({
  selector: "div[tNode]", host: { class: "n" }, changeDetection: ChangeDetectionStrategy.OnPush, imports: [LeafView],
  template: `<span class="l">{{ n.label }}</span>@for (c of n.kids; track c.id) {@if (c.kids) {<div tNode [n]="c" [vs]="vs"></div>} @else {<div tLeaf [n]="c" [v]="vs[c.leaf!]"></div>}}`,
})
class NodeView { @Input({ required: true }) n!: TNode; @Input({ required: true }) vs!: WritableSignal<number>[] }

@Component({
  selector: "bench-tree", changeDetection: ChangeDetectionStrategy.OnPush, imports: [NodeView],
  template: `<div class="tree">@for (c of roots; track c.id) {<div tNode [n]="c" [vs]="vs"></div>}</div>`,
})
class TreeView { @Input({ required: true }) roots!: TNode[]; @Input({ required: true }) vs!: WritableSignal<number>[] }

export async function mount(host: HTMLElement, data: Tree): Promise<ScenarioApp> {
  const vs = data.values.map((v) => signal(v))
  const app = await mountRoot(TreeView, host, "bench-tree", { roots: data.roots, vs })
  return {
    step: (v) => app.now(() => vs[data.target]!.set(v as number)),
    destroy: app.destroy,
  }
}
