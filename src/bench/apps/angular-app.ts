// Benchmark app: Angular, compiled ahead of time (AOT) the way Angular's own build does it: ngtsc (@angular/compiler-cli)
// compiles the component and its template to instructions, the Angular linker finishes the framework's own partially
// compiled packages, and the whole is bundled and minified with ngDevMode off (tools/gen-bench.mjs → angular.gen.js).
// No JIT compiler and no eval at run time. Zoneless change detection; rows and the selection are signals. Calls from
// the benchmark run change detection at once (ApplicationRef.tick), as React's flushSync does; a click in the table
// is detected by Angular's own scheduler before the next paint.
import { ChangeDetectionStrategy, Component, createComponent, provideZonelessChangeDetection, signal } from "@angular/core"
import { createApplication } from "@angular/platform-browser"

interface Row { id: number; label: string }

@Component({
  selector: "bench-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<table class="bt"><tbody>
  @for (item of rows(); track item.id) {
    <tr [class.danger]="item.id === selected()">
      <td class="c1">{{ item.id }}</td>
      <td class="c4"><a class="lbl" (click)="selected.set(item.id)">{{ item.label }}</a></td>
      <td class="c1"><a class="rm" (click)="remove(item.id)">×</a></td>
      <td class="c6"></td>
    </tr>
  }
</tbody></table>`,
})
class BenchTable {
  readonly rows = signal<Row[]>([])
  readonly selected = signal(0)
  remove(id: number): void { this.rows.update((d) => d.filter((r) => r.id !== id)) }
}

export async function mount(host: HTMLElement) {
  const app = await createApplication({ providers: [provideZonelessChangeDetection()] })
  const el = document.createElement("bench-table")
  host.append(el)
  const ref = createComponent(BenchTable, { environmentInjector: app.injector, hostElement: el })
  app.attachView(ref.hostView)
  app.tick()
  const { rows, selected } = ref.instance
  const set = (fn: () => void) => { fn(); app.tick() }
  return {
    run: (r: Row[]) => set(() => { rows.set(r); selected.set(0) }),
    add: (r: Row[]) => set(() => rows.update((d) => d.concat(r))),
    update: () => set(() => rows.update((d) => d.map((r, i) => (i % 10 ? r : { id: r.id, label: r.label + " !!!" })))),
    swap: () => set(() => { const d = rows().slice(); if (d.length <= 998) return; const t = d[1]!; d[1] = d[998]!; d[998] = t; rows.set(d) }),
    clear: () => set(() => { rows.set([]); selected.set(0) }),
    destroy: () => { app.destroy(); el.remove() },
  }
}

// the realistic scenarios' Angular apps ride in this chunk (see ../scenarios/libs.ts)
export { scenarios } from "../scenarios/angular.ts"
