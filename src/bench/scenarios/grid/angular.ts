// Data list, Angular: the query, categories and sort are signals; the filtered list and the sorted view are two
// computed(); a @for tracked by record reuses rows. Each record has its own selection signal, so a toggle refreshes
// one row's view and the summary, not the list. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs →
// ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, computed, signal, type WritableSignal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({
  selector: "bench-grid", changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div><p class="gsum">{{ sum(view().length, count(), total()) }}</p><table class="bt"><tbody>@for (r of view(); track r.id) {<tr [class]="sel[r.i]!() ? on : ''"><td class="id">{{ r.id }}</td><td class="nm">{{ r.name }}</td><td class="cat">{{ cats[r.cat] }}</td><td class="px">{{ price(r.price) }}</td><td class="st">{{ r.stock }}</td></tr>}</tbody></table></div>`,
})
class Grid {
  @Input({ required: true }) data!: Rec[]
  @Input({ required: true }) sel!: WritableSignal<boolean>[]
  readonly q = signal("")
  readonly catsOn = signal(CATS.map(() => true))
  readonly key = signal<Key>("id")
  readonly dir = signal<1 | -1>(1)
  readonly count = signal(0)
  readonly total = signal(0)
  readonly filtered = computed(() => { const q = this.q(), c = this.catsOn(); return this.data.filter((r) => matches(r, q, c)) })
  readonly view = computed(() => this.filtered().slice().sort(compare(this.key(), this.dir())))
  readonly on = SEL
  readonly cats = CATS
  readonly sum = summary
  readonly price = fmtPrice
}

export async function mount(host: HTMLElement, data: Rec[]): Promise<ScenarioApp> {
  const sel = data.map(() => signal(false))
  const app = await mountRoot(Grid, host, "bench-grid", { data, sel })
  const g = app.instance
  const setSel = (i: number, on: boolean) => {
    if (sel[i]!() === on) return
    sel[i]!.set(on); g.count.update((n) => n + (on ? 1 : -1)); g.total.update((t) => t + (on ? data[i]!.price : -data[i]!.price))
  }
  return {
    step: (p) => app.now(() => {
      const a = p as Act
      if (a.t === "q") g.q.set(a.q)
      else if (a.t === "cat") g.catsOn.update((c) => { const n = c.slice(); n[a.c] = a.on; return n })
      else if (a.t === "sort") { g.key.set(a.key); g.dir.set(a.dir) }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of g.view()) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
    }),
    destroy: app.destroy,
  }
}
