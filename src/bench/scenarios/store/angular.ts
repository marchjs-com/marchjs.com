// Shared store, Angular: one injectable store service (Angular's usual app state) holds every cell as a signal; the
// cell bindings read store.cells[i](), so a step that sets 50 signals refreshes only the views that read them.
// Compiled ahead of time with the benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Injectable, Input, inject, signal, type WritableSignal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { sectionsOf, type StoreData, type Write } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Injectable()
class Store { cells: WritableSignal<number>[] = [] }

@Component({
  selector: "div[stSection]", host: { class: "ss" }, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (i of idx; track i) {<span class="sc">{{ store.cells[i]!() }}</span>}`,
})
class Section { @Input({ required: true }) idx!: number[]; readonly store = inject(Store) }

@Component({
  selector: "bench-store", changeDetection: ChangeDetectionStrategy.OnPush, imports: [Section], providers: [Store],
  template: `<div class="sg">@for (idx of sections; track $index) {<div stSection [idx]="idx"></div>}</div>`,
})
class Grid {
  @Input({ required: true }) sections!: number[][]
  readonly store = inject(Store)
  /** the store's starting state */
  @Input({ required: true }) set cells(v: WritableSignal<number>[]) { this.store.cells = v }
}

export async function mount(host: HTMLElement, data: StoreData): Promise<ScenarioApp> {
  const cells = data.cells.map((v) => signal(v))
  const app = await mountRoot(Grid, host, "bench-store", { sections: sectionsOf(data.cells.length), cells })
  return { step: (p) => app.now(() => { for (const w of p as Write[]) cells[w.i]!.set(w.v) }), destroy: app.destroy }
}
