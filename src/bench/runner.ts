// Benchmark runner (browser): mounts every library in its own host element on the stage, then runs the selected
// operations round-robin across them (warm-up rounds, then N measured rounds, each sample timed from the call to the
// next paint, the library order rotated every round) and reports progress. A hidden tab pauses the run (a sample that
// saw the tab hidden is measured again); before each sample it asks for garbage collection where the browser exposes
// it and waits for one paint.
import { OPS, rowSource, type BenchApp, type DomProbe, type Op, type RunResult } from "./core.ts"
import { afterPaint } from "./paint.ts"
import { BASELINE, libById, type Lib } from "./libs.ts"

export interface Progress { lib: string; op: string; phase: "load" | "warm" | "run" | "cool" | "paused"; done: number; total: number }
export interface RunOptions { libs: Lib[]; ops: Op[]; reps: number; warm?: number | undefined; stage: HTMLElement; onProgress?: (p: Progress) => void; onSample?: (lib: string, op: string, ms: number) => void; signal?: AbortSignal | undefined }

/** Unmeasured rounds of 1.000 rows made and cleared by the pure JavaScript app before any library is measured. */
const PAGE_WARM = 10
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const heap = (): number | undefined => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
const gc = (): void => { (globalThis as { gc?: () => void }).gc?.() }
/** The same wait before every sample, for every library: garbage collection where exposed, 20 ms, one paint. */
async function settle(): Promise<void> { gc(); await sleep(20); await afterPaint() }
const idle = (): Promise<void> => new Promise((r) => ("requestIdleCallback" in globalThis ? requestIdleCallback(() => r(), { timeout: 1000 }) : setTimeout(r, 50)))

/** Reads the benchmark table in a library's host (the operations' checks and clicks). */
export function probe(host: HTMLElement): DomProbe {
  const rows = (): HTMLCollectionOf<HTMLTableRowElement> => host.querySelector("tbody")?.rows ?? ([] as unknown as HTMLCollectionOf<HTMLTableRowElement>)
  const at = (i: number) => rows()[i]
  return {
    count: () => rows().length,
    label: (i) => at(i)?.querySelector("a.lbl")?.textContent ?? "",
    id: (i) => at(i)?.cells[0]?.textContent ?? "",
    selected: (i) => at(i)?.classList.contains("danger") ?? false,
    click: (i, link) => { at(i)?.querySelector(`a.${link}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })) },
  }
}

/** Resolves when the tab is visible (at once if it is). */
function visible(): Promise<void> {
  if (!document.hidden) return Promise.resolve()
  return new Promise((r) => { const on = () => { if (!document.hidden) { document.removeEventListener("visibilitychange", on); r() } }; document.addEventListener("visibilitychange", on) })
}

export async function runBench(o: RunOptions): Promise<RunResult> {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const res: RunResult = { v: 1, date: new Date().toISOString(), env: { ua: nav.userAgent, cores: nav.hardwareConcurrency, memory: nav.deviceMemory, screen: `${screen.width}×${screen.height}`, dpr: devicePixelRatio }, reps: o.reps, samples: {}, errors: {}, firstPaint: {}, memory: {} }
  let hides = 0
  const onVis = () => { if (document.hidden) hides++ }
  document.addEventListener("visibilitychange", onVis)
  const per = o.ops.reduce((s, op) => s + (o.warm ?? op.warm) + o.reps, 0)
  const total = o.libs.length * per
  let done = 0
  const report = (lib: string, op: string, phase: Progress["phase"]) => o.onProgress?.({ lib, op, phase, done, total })
  const stop = () => o.signal?.aborted ?? false
  /** Waits out a hidden tab (reported as paused). */
  const guard = async (lib: string, op: string) => { if (document.hidden) { report(lib, op, "paused"); await visible(); await sleep(300) } }
  // Fair order: every library is loaded and mounted first, then each operation is warmed up for all of them and
  // measured round-robin, one sample per library per round, the order rotated every round. Measured one library after
  // another, the first ones paid the page's own warm-up (JIT, layout caches): the same build gave March 73 ms on
  // "create 1.000" when it ran first and 70 ms when it ran third. Only the measured library's host is shown, and the
  // others are emptied after each of their samples, so every sample sees the same stage.
  interface Mounted { lib: Lib; host: HTMLElement; app: BenchApp; dom: DomProbe; errs: Record<string, string> }
  const mounted: Mounted[] = []
  const rows = rowSource(1)
  const show = (m: Mounted | null) => { for (const x of mounted) x.host.hidden = x !== m }
  try {
    for (const lib of o.libs) {
      if (stop()) break
      res.samples[lib.id] = {}
      report(lib.id, "", "load")
      gc(); await idle()
      await guard(lib.id, "")
      const host = document.createElement("div")
      host.className = "bt-host"
      host.dataset.lib = lib.id
      o.stage.append(host)
      try {
        const t0 = performance.now()
        const mod = await lib.load()
        const app = await mod.mount(host)
        res.firstPaint[lib.id] = (await afterPaint()) - t0
        const m: Mounted = { lib, host, app, dom: probe(host), errs: {} }
        mounted.push(m)
        show(m)
        // memory: heap growth from 1.000 rows alone (the library's code is already loaded and mounted)
        await settle(); await sleep(50)
        const h0 = heap()
        if (h0 !== undefined) {
          app.run(rows(1000)); await afterPaint(); await settle(); await sleep(50)
          const h1 = heap()
          if (h1 !== undefined) res.memory[lib.id] = Math.max(0, (h1 - h0) / 1048576)
          app.clear(); await afterPaint()
        }
      } catch (e) {
        res.errors[lib.id] = { load: e instanceof Error ? e.message : String(e) }
        done += per
        host.remove()
      }
    }
    // the page warms up first: 10 unmeasured rounds of 1.000 rows made and cleared by the pure JavaScript app (CPU
    // clock, the first layouts, the heap), loaded for this even when it is not among the compared ones
    if (!stop()) {
      report(BASELINE, "", "warm")
      const host = document.createElement("div")
      host.className = "bt-host"
      o.stage.append(host)
      show(null)
      try {
        const app = await (await libById(BASELINE)!.load()).mount(host)
        for (let i = 0; i < PAGE_WARM && !stop(); i++) { app.run(rows(1000)); await afterPaint(); app.clear(); await afterPaint() }
        app.destroy()
      } catch { /* the warm-up is a courtesy: a failure here must not stop the run */ } finally { host.remove() }
    }
    report("", "", "cool")
    gc(); await idle(); await sleep(400)
    /** One sample of `op` on `m`; NaN when the tab was hidden during it (measure again), null when the check failed. */
    const sample = async (m: Mounted, op: Op): Promise<number | null> => {
      show(m)
      op.setup(m.app, rows, m.dom)
      await afterPaint()
      await settle()
      op.mark?.(m.dom)
      const seen = hides
      const t0 = performance.now()
      op.act(m.app, rows, m.dom)
      const ms = (await afterPaint()) - t0
      const ok = hides !== seen || op.check(m.dom)
      // the next library meets an empty stage: this one's rows go before it is hidden
      m.app.clear(); await afterPaint()
      if (hides !== seen) return NaN
      return ok ? ms : null
    }
    for (const op of o.ops) {
      if (stop()) break
      const warm = o.warm ?? op.warm
      let live = mounted.filter((m) => !m.errs[op.id])
      const lists = new Map(live.map((m) => [m, [] as number[]]))
      const fail = (m: Mounted, left: number) => { m.errs[op.id] = "Sonuç beklenen tabloyla eşleşmedi"; done += left; live = live.filter((x) => x !== m) }
      for (let round = 0; round < warm + o.reps && !stop(); round++) {
        // the order turns by one every round: each library is measured first, second, … equally often
        const order = live.map((_, i) => live[(i + round) % live.length]!)
        for (const m of order) {
          if (stop()) break
          await guard(m.lib.id, op.id)
          report(m.lib.id, op.id, round < warm ? "warm" : "run")
          let ms = await sample(m, op)
          while (ms !== null && Number.isNaN(ms) && !stop()) { await guard(m.lib.id, op.id); ms = await sample(m, op) } // the tab was hidden: measure it again
          if (ms === null) { fail(m, warm + o.reps - round); continue }
          done++
          if (round >= warm) { lists.get(m)!.push(ms); o.onSample?.(m.lib.id, op.id, ms) }
        }
      }
      for (const [m, list] of lists) res.samples[m.lib.id]![op.id] = list
    }
  } finally {
    for (const m of mounted) {
      try { m.app.destroy() } catch { /* a failed app may not tear down */ }
      m.host.remove()
      if (Object.keys(m.errs).length) res.errors[m.lib.id] = { ...res.errors[m.lib.id], ...m.errs }
    }
    document.removeEventListener("visibilitychange", onVis)
  }
  return res
}
export { OPS }
