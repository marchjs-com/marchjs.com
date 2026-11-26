// Live ticker, Angular: signals with OnPush components. Each row is a component (an attribute selector on <tr>)
// reading its quote's price and class signals, so a tick that sets them refreshes only those rows' views.
// Compiled ahead of time with the benchmark app (tools/gen-bench.mjs → ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, signal, type WritableSignal } from "@angular/core"
import { mountRoot } from "../angular-host.ts"
import { fmtPrice, dir, type Quote, type Tick } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

interface Cell { sym: string; price: WritableSignal<number>; cls: WritableSignal<string> }

@Component({
  selector: "tr[tkRow]", changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<td class="sym">{{ c.sym }}</td><td [class]="c.cls()">{{ fmt(c.price()) }}</td>`,
})
class TickerRow { @Input({ required: true }) c!: Cell; readonly fmt = fmtPrice }

@Component({
  selector: "bench-ticker", changeDetection: ChangeDetectionStrategy.OnPush, imports: [TickerRow],
  template: `<table class="bt"><tbody>@for (c of cells; track $index) {<tr tkRow [c]="c"></tr>}</tbody></table>`,
})
class Ticker { @Input({ required: true }) cells!: Cell[] }

export async function mount(host: HTMLElement, data: Quote[]): Promise<ScenarioApp> {
  const cells: Cell[] = data.map((q) => ({ sym: q.sym, price: signal(q.price), cls: signal("px") }))
  const app = await mountRoot(Ticker, host, "bench-ticker", { cells })
  return {
    step: (p) => app.now(() => { for (const t of p as Tick[]) { const c = cells[t.i]!; c.cls.set(`px ${dir(t.price, c.price())}`); c.price.set(t.price) } }),
    destroy: app.destroy,
  }
}
