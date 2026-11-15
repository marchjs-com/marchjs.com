// Data list, March: the query, categories and sort are signals; the filtered list and the sorted view are two
// computed values (a sort change does not filter again); a keyed <For> reuses rows by id and moves the fewest. Each
// record has its own selection signal, so a toggle wakes one row's class binding and the summary, not the list.
import { render, signal, computed, batch, For } from "march"
import { CATS, SEL, matches, compare, fmtPrice, summary, type Rec, type Act, type Key } from "./def.ts"
import type { ScenarioApp } from "../core.ts"

export function mount(host: HTMLElement, data: Rec[]): ScenarioApp {
  const sel = data.map(() => signal(false))
  let $q = ""
  let $cats: boolean[] = CATS.map(() => true)
  let $key: Key = "id"
  let $dir: 1 | -1 = 1
  let $count = 0
  let $total = 0
  const filtered = computed(() => { const q = $q, cats = $cats; return data.filter((r) => matches(r, q, cats)) })
  const view = computed(() => filtered().slice().sort(compare($key, $dir)))
  const setSel = (i: number, on: boolean) => {
    const s = sel[i]!
    if (s.peek() === on) return
    s.set(on)
    $count += on ? 1 : -1
    $total += on ? data[i]!.price : -data[i]!.price
  }
  const dispose = render(() => <div>
    <p class="gsum">{summary(view().length, $count, $total)}</p>
    <table class="bt"><tbody>
      <For each={view()} key="id">{(r) => <tr class={sel[r().i]!() ? SEL : ""}>
        <td class="id">{r().id}</td><td class="nm">{r().name}</td><td class="cat">{CATS[r().cat]}</td>
        <td class="px">{fmtPrice(r().price)}</td><td class="st">{r().stock}</td>
      </tr>}</For>
    </tbody></table>
  </div>, host)
  return {
    step: (p) => batch(() => {
      const a = p as Act
      if (a.t === "q") $q = a.q
      else if (a.t === "cat") { const c = $cats.slice(); c[a.c] = a.on; $cats = c }
      else if (a.t === "sort") { $key = a.key; $dir = a.dir }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view.peek()) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
    }),
    destroy: dispose,
  }
}
