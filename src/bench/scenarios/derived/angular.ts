// Derived values, Angular: every field is a signal and every computed cell a computed() reading its fields (and a
// computed() for its class), so an edit re-runs only the computeds that read that field and refreshes only the views
// that read them. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, computed, signal, type Signal, type WritableSignal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { evalComp, compClass, type Form, type Edit } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface Cell { value: Signal<number>; cls: Signal<string> }

@Component({
  selector: "bench-derived", changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="dv"><div class="dv-fs">@for (f of fields; track $index) {<span class="dv-f">{{ f() }}</span>}</div><div class="dv-cs">@for (c of cells; track $index) {<span [class]="c.cls()">{{ c.value() }}</span>}</div></div>`,
})
class Derived { @Input({ required: true }) fields!: WritableSignal<number>[]; @Input({ required: true }) cells!: Cell[] }

export async function mount(host: HTMLElement, data: Form): Promise<ScenarioApp> {
  const fields = data.fields.map((v) => signal(v)), get = (i: number) => fields[i]!()
  const cells: Cell[] = data.comps.map((c) => { const value = computed(() => evalComp(c, get)); return { value, cls: computed(() => compClass(c, value())) } })
  const app = await mountRoot(Derived, host, "bench-derived", { fields, cells })
  return {
    step: (p) => app.now(() => { const e = p as Edit; fields[e.i]!.set(e.v) }),
    destroy: app.destroy,
  }
}
