// Independent counters, Angular: each counter is an OnPush component with its own count signal and registers its
// increment; a step increments the fired counters, so only their views refresh. Compiled ahead of time with the
// benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, signal, type OnInit } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import type { Counter as Model, Fired } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({ selector: "span[ctr]", host: { class: "ct" }, changeDetection: ChangeDetectionStrategy.OnPush, template: `{{ n() }}` })
class CounterView implements OnInit {
  @Input({ required: true }) i!: number
  @Input({ required: true }) inc!: (() => void)[]
  readonly n = signal(0)
  ngOnInit(): void { this.inc[this.i] = () => this.n.update((v) => v + 1) }
}

@Component({
  selector: "bench-counters", changeDetection: ChangeDetectionStrategy.OnPush, imports: [CounterView],
  template: `<div class="cg">@for (c of counters; track c.id; let i = $index) {<span ctr [i]="i" [inc]="inc"></span>}</div>`,
})
class Counters { @Input({ required: true }) counters!: Model[]; @Input({ required: true }) inc!: (() => void)[] }

export async function mount(host: HTMLElement, data: Model[]): Promise<ScenarioApp> {
  const inc: (() => void)[] = []
  const app = await mountRoot(Counters, host, "bench-counters", { counters: data, inc })
  return { step: (p) => app.now(() => { for (const i of p as Fired) inc[i]!() }), destroy: app.destroy }
}
