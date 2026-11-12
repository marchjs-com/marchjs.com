// Data list, SolidJS: the query, categories and sort are signals; the filtered list and the sorted view are two
// createMemo; a keyed <For> reuses rows by record. Each record has its own selection signal, so a toggle wakes one
// row's class binding and the summary, not the list. Compiled with babel-preset-solid (tools/gen-bench.mjs →
// solid.gen.js).
import { createSignal, createMemo, batch } from "solid-js"
import { render, For } from "solid-js/web"
import { CATS, SEL, matches, compare, fmtPrice, summary } from "./def.ts"

export function mount(host, data) {
  let step
  const dispose = render(() => {
    const sel = data.map(() => createSignal(false))
    const [q, setQ] = createSignal(""), [cats, setCats] = createSignal(CATS.map(() => true))
    const [key, setKey] = createSignal("id"), [dir, setDir] = createSignal(1)
    const [count, setCount] = createSignal(0), [total, setTotal] = createSignal(0)
    const filtered = createMemo(() => { const s = q(), c = cats(); return data.filter((r) => matches(r, s, c)) })
    const view = createMemo(() => filtered().slice().sort(compare(key(), dir())))
    const setSel = (i, on) => {
      const [get, set] = sel[i]
      if (get() === on) return
      set(on)
      setCount((n) => n + (on ? 1 : -1))
      setTotal((t) => t + (on ? data[i].price : -data[i].price))
    }
    step = (a) => batch(() => {
      if (a.t === "q") setQ(a.q)
      else if (a.t === "cat") setCats((c) => { const n = c.slice(); n[a.c] = a.on; return n })
      else if (a.t === "sort") { setKey(a.key); setDir(a.dir) }
      else if (a.t === "sel") setSel(a.i, a.on)
      else if (a.t === "all") for (const r of view()) setSel(r.i, true)
      else for (let i = 0; i < sel.length; i++) setSel(i, false)
    })
    return (
      <div>
        <p class="gsum">{summary(view().length, count(), total())}</p>
        <table class="bt"><tbody>
          <For each={view()}>{(r) => (
            <tr class={sel[r.i][0]() ? SEL : ""}><td class="id">{r.id}</td><td class="nm">{r.name}</td><td class="cat">{CATS[r.cat]}</td><td class="px">{fmtPrice(r.price)}</td><td class="st">{r.stock}</td></tr>
          )}</For>
        </tbody></table>
      </div>
    )
  }, host)
  return { step: (a) => step(a), destroy: dispose }
}
