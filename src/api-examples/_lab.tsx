// The reactivity lab of the API pages of signal, computed, effect, batch and untrack: three boxes wired together
// (signal → computed → effect), written with the real primitives. A write lights the signal, a dot runs along the
// wire to the computed, then to the effect, which counts its runs; "Üç kez +1" runs the effect three times, or once
// inside batch. The box of the page's own export is ringed.
import { signal, computed, effect, batch, untrack, onCleanup } from "hadi-march";
import { Button, Toggle } from "hadi-march/ui";

export type LabFocus = "signal" | "computed" | "effect" | "batch" | "untrack"

/** The wires on the 520 × 230 canvas (the boxes sit on it at their centres, api.css): signal → computed,
 *  computed → effect, signal → effect. */
const WIRES = { sc: "M142 55 L296 55", ce: "M360 92 C360 135 400 170 364 170", se: "M80 92 C80 140 140 170 236 170" } as const

export function ReactivityLab(props: { focus: LabFocus }) {
  const count = signal(2)
  const double = computed(() => count() * 2)
  const runs = signal(0)
  const log = signal<string[]>([])
  const inBatch = signal(props.focus === "batch")
  let host: HTMLElement | undefined
  const timers = new Set<ReturnType<typeof setTimeout>>()
  onCleanup(() => { for (const t of timers) clearTimeout(t) })
  const later = (ms: number, fn: () => void): void => { const t = setTimeout(() => { timers.delete(t); fn() }, ms); timers.add(t) }
  /** Replays a CSS animation on a part of the lab (a box lighting up, a dot running along a wire). */
  const play = (sel: string, ms: number): void => later(ms, () => {
    const el = host?.querySelector(sel)
    if (!el) return
    el.classList.remove("is-on"); void (el as HTMLElement).offsetWidth; el.classList.add("is-on")
  })
  // the real effect: reads the signal and the computed, counts its runs, writes the log (untracked)
  effect(() => {
    const s = count(), d = double()
    untrack(() => {
      runs.update((n) => n + 1)
      log.update((l) => [...l.slice(-3), `etki çalıştı: sayi = ${s}, ikiKati = ${d}`])
    })
    if (untrack(runs) > 1) { play(".sc-lab-n-e", 640); play(".sc-lab-dot-ce", 320) }
  })
  const fire = (): void => { play(".sc-lab-n-s", 0); play(".sc-lab-dot-sc", 0); play(".sc-lab-dot-se", 0); play(".sc-lab-n-c", 320) }
  const write = (d: number): void => { fire(); count.update((n) => n + d) }
  // the three writes run after the click (an event handler already batches what it writes): plain, the effect runs
  // three times; inside batch(), once
  const thrice = (): void => {
    fire()
    later(0, () => {
      if (inBatch()) { log.update((l) => [...l.slice(-3), "batch: üç yazma, tek değişiklik"]); batch(() => { count.update((n) => n + 1); count.update((n) => n + 1); count.update((n) => n + 1) }) }
      else { count.update((n) => n + 1); count.update((n) => n + 1); count.update((n) => n + 1) }
    })
  }
  const ring = (k: string): string => (props.focus === k || (k === "effect" && (props.focus === "batch" || props.focus === "untrack")) ? " is-focus" : "")
  return <div class="sc-lab" ref={(el: HTMLElement) => { host = el }}>
    <div class="sc-lab-code">
      <pre><code><span class="sc-lab-k">const</span> sayi = <span class="sc-lab-f">signal</span>(<span class="sc-lab-v">2</span>){"\n"}
        <span class="sc-lab-k">const</span> ikiKati = <span class="sc-lab-f">computed</span>(() =&gt; sayi() * <span class="sc-lab-v">2</span>){"\n"}
        <span class="sc-lab-f">effect</span>(() =&gt; yaz(sayi(), ikiKati())){"\n"}
        {() => (inBatch() ? <><span class="sc-lab-f">batch</span>(() =&gt; {"{"} sayi.update(n =&gt; n + 1) × 3 {"}"})</> : <>sayi.update(n =&gt; n + 1) × 3</>)}</code></pre>
      <div class="sc-lab-ctl">
        <Button size="sm" variant="secondary" onClick={() => write(-1)}>−1</Button>
        <Button size="sm" variant="primary" onClick={() => write(1)}>+1</Button>
        <Button size="sm" variant="secondary" onClick={thrice}>Üç kez +1</Button>
        <Toggle value={inBatch} label="batch içinde" />
      </div>
    </div>
    <div class="sc-lab-side">
    <div class="sc-lab-graph">
      <svg viewBox="0 0 520 230" aria-hidden="true" focusable="false">
        {Object.entries(WIRES).map(([k, d]) => <path class={`sc-lab-wire sc-lab-wire-${k}`} d={d} />)}
        {Object.entries(WIRES).map(([k, d]) => <circle class={`sc-lab-dot sc-lab-dot-${k}`} r="5" style={{ "offset-path": `path("${d}")` }} />)}
      </svg>
      <div class={`sc-lab-node sc-lab-n-s${ring("signal")}`}><small>signal</small><b>{count}</b><span>sayi</span></div>
      <div class={`sc-lab-node sc-lab-n-c${ring("computed")}`}><small>computed</small><b>{double}</b><span>ikiKati</span></div>
      <div class={`sc-lab-node sc-lab-n-e${ring("effect")}`}><small>effect</small><b>{() => `${runs()}×`}</b><span>çalışma sayısı</span></div>
    </div>
    <ol class="sc-lab-log" aria-live="polite">{() => log().map((l) => <li>{l}</li>)}</ol>
    </div>
  </div>
}
