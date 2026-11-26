// Moving highlight, Angular: the hovered index is a signal and each row's class binding reads it. Angular has no
// selector primitive, so a step refreshes every row's view (10.000 comparisons) and writes only the two classes that
// changed. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, signal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { HOVER, type Item } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({
  selector: "bench-hover", changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<table class="bt"><tbody>@for (it of items; track it.id; let i = $index) {<tr [class]="hovered() === i ? on : ''"><td class="id">{{ it.id }}</td><td class="lbl">{{ it.label }}</td></tr>}</tbody></table>`,
})
class Hover { @Input({ required: true }) items!: Item[]; readonly hovered = signal(-1); readonly on = HOVER }

export async function mount(host: HTMLElement, data: Item[]): Promise<ScenarioApp> {
  const app = await mountRoot(Hover, host, "bench-hover", { items: data })
  return { step: (i) => app.now(() => app.instance.hovered.set(i as number)), destroy: app.destroy }
}
