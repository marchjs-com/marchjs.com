// Start-up, Angular: a start destroys the previous page component and creates a new one on the running application
// (createComponent + one change detection, the work bootstrapping a component does); the counter is a signal and the
// "+1" button uses Angular's event binding. Compiled ahead of time with the benchmark app (tools/gen-bench.mjs →
// ../../apps/angular.gen.js).
import { ChangeDetectionStrategy, Component, Input, signal } from "@angular/core"
import { application, createRoot } from "../angular-host.ts"
import { rowsFor, HEADS, type Dash, type Row } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

@Component({
  selector: "bench-startup", changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="dash">
<header class="hd"><h1>{{ data.title }}</h1><span class="run">{{ k }}</span><span class="count">{{ n() }}</span><button class="inc" type="button" (click)="n.set(n() + 1)">+1</button></header>
<nav class="nv"><ul>@for (l of data.nav; track $index) {<li><a [attr.href]="l.href">{{ l.label }}</a></li>}</ul></nav>
<section class="cards">@for (s of data.stats; track $index) {<div class="card"><div class="lbl">{{ s.label }}</div><div class="val">{{ s.value }}</div><div class="delta">{{ s.delta }}</div></div>}</section>
<table class="bt"><thead><tr>@for (t of heads; track $index) {<th>{{ t }}</th>}</tr></thead><tbody>
@for (r of rows; track r.id) {<tr><td class="id">{{ r.id }}</td><td><a [attr.href]="'#u' + r.id">{{ r.name }}</a></td><td>{{ r.email }}</td><td><span [class]="'badge ' + r.status">{{ r.status }}</span></td><td class="amt">{{ r.amount }}</td><td>{{ r.date }}</td></tr>}
</tbody></table>
<form class="fm">@for (f of data.fields; track $index) {<div class="f"><label>{{ f.label }}</label><input [attr.name]="f.name" [attr.type]="f.type"></div>}<button type="button">Kaydet</button></form>
</div>`,
})
class Page {
  @Input({ required: true }) data!: Dash
  @Input({ required: true }) k!: number
  @Input({ required: true }) rows!: Row[]
  readonly n = signal(0)
  readonly heads = HEADS
}

export async function mount(host: HTMLElement, data: Dash): Promise<ScenarioApp> {
  const appRef = await application()
  const start = (k: number) => createRoot(appRef, Page, host, "bench-startup", { data, k, rows: rowsFor(data.rows, k) })
  let page = start(0)
  return {
    step: (k) => {
      page.destroy()
      page = start(k as number)
      page.now(() => (page.el.querySelector(".inc") as HTMLButtonElement).click())
    },
    destroy: () => page.destroy(),
  }
}
