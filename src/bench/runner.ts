// Benchmark runner (browser): mounts every library in its own host element on the stage, then runs the selected
// operations library by library, March first (N measured rounds from the start, no warm-up, each sample timed from the
// call to the next paint) and reports progress. A hidden tab pauses the run (a sample that saw the tab hidden is
// measured again); before each sample it asks for garbage collection where the browser exposes it and waits for one
// paint.
import { OPS, TIMEOUT, rowSource, type BenchApp, type DomProbe, type Op, type RunResult } from "./core.ts"
import { afterPaint, afterPaintFrom, afterTask } from "./paint.ts"
import type { Lib } from "./libs.ts"

export interface Progress { lib: string; op: string; phase: "load" | "warm" | "run" | "cool" | "paused"; done: number; total: number }
export interface RunOptions { libs: Lib[]; ops: Op[]; reps: number; warm?: number | undefined; stage: HTMLElement; onProgress?: (p: Progress) => void; onSample?: (lib: string, op: string, ms: number) => void; signal?: AbortSignal | undefined }

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
  const res: RunResult = { v: 1, date: new Date().toISOString(), env: { ua: nav.userAgent, cores: nav.hardwareConcurrency, memory: nav.deviceMemory, screen: `${screen.width}×${screen.height}`, dpr: devicePixelRatio }, reps: o.reps, samples: {}, act: {}, heapMax: {}, cpuMax: {}, errors: {}, firstPaint: {}, memory: {} }
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
  // Order: every library is loaded and mounted first; then, for each operation, one library after another does all of
  // its rounds (no warm-up rounds), March first. Running first can cost more (the page's own JIT and layout warm-up: the
  // same March build once gave 73 ms on "create 1.000" first and 70 ms third): March takes that cost, not a rival.
  // Only the measured library's host is shown, and it is emptied after each sample, so every sample sees the same stage.
  interface Mounted { lib: Lib; host: HTMLElement; app: BenchApp; dom: DomProbe; errs: Record<string, string> }
  const mounted: Mounted[] = []
  // every library gets the same rows: the source starts again (same seed, ids from 1) for each library and operation
  let rows = rowSource(1)
  const show = (m: Mounted | null) => { for (const x of mounted) x.host.hidden = x !== m }
  try {
    for (const lib of o.libs) {
      if (stop()) break
      res.samples[lib.id] = {}; res.act![lib.id] = {}; res.heapMax![lib.id] = {}; res.cpuMax![lib.id] = {}
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
          rows = rowSource(1)
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
    report("", "", "cool")
    gc(); await idle(); await sleep(400)
    /**
     * One sample, timed from its start to its end: preparing the table (e.g. 1.000 rows to update) and its paint, the
     * operation and its paint, the check, then emptying the table and that paint. Nothing the library does happens
     * outside the time; only the pause for garbage collection comes before the start. Also returns the operation alone.
     * NaN when the tab was hidden during it, null when the check failed.
     */
    const sample = async (m: Mounted, op: Op): Promise<{ all: number; act: number; peak?: number; cpu?: number } | number | null> => {
      show(m)
      await settle()
      const seen = hides
      // the heap is read at the sample's start and after each of its paints (reading it takes no measurable time)
      // how long the main thread was busy: each call with its microtasks (to the end of its task), then each frame from its
      // start to the end of its paint; the rest of the sample it waited (for the next frame)
      let busy = 0
      const work = async (fn: () => void): Promise<number> => {
        const a = performance.now(); fn(); const b = await afterTask(); busy += b - a
        const p = await afterPaintFrom(); busy += p.done - p.frame
        return p.done
      }
      const h0 = heap()
      const start = performance.now()
      await work(() => op.setup(m.app, rows, m.dom))
      const h1 = heap()
      op.mark?.(m.dom)
      const t0 = performance.now()
      const act = (await work(() => op.act(m.app, rows, m.dom))) - t0
      const h2 = heap()
      const ok = hides !== seen || op.check(m.dom)
      // the next sample meets an empty stage: emptying it is part of the time (a library that is slow to tear down
      // what it drew pays for it here, not between samples where nobody sees it)
      const all = (await work(() => m.app.clear())) - start
      const h3 = heap()
      if (hides !== seen) return NaN
      if (!ok) return null
      const cpu = Math.min(100, (busy / all) * 100)
      const peak = h0 === undefined || h1 === undefined || h2 === undefined || h3 === undefined ? undefined : Math.max(0, h1 - h0, h2 - h0, h3 - h0) / 1048576
      return { all, act, peak, cpu }
    }
    for (const op of o.ops) {
      if (stop()) break
      const warm = o.warm ?? op.warm
      let live = mounted.filter((m) => !m.errs[op.id])
      const lists = new Map(live.map((m) => [m, [] as number[]])), acts = new Map(live.map((m) => [m, [] as number[]]))
      const peaks = new Map(live.map((m) => [m, -1])), cpus = new Map(live.map((m) => [m, -1]))
      const fail = (m: Mounted, left: number) => { m.errs[op.id] = "Sonuç beklenen tabloyla eşleşmedi"; done += left; live = live.filter((x) => x !== m) }
      // one library after another, each doing all of its rounds before the next starts; March runs first
      const order = [...live.filter((m) => m.lib.id === "march"), ...live.filter((m) => m.lib.id !== "march")]
      for (const m of order) {
        rows = rowSource(1)
        // the expected most for this library's whole test of the operation; its samples' own time counts (not the
        // pauses between them, not a hidden tab). A running call cannot be cut short: the check follows each sample
        const budget = op.limit * (warm + o.reps)
        let spent = 0
        for (let round = 0; round < warm + o.reps && !stop(); round++) {
          await guard(m.lib.id, op.id)
          report(m.lib.id, op.id, round < warm ? "warm" : "run")
          let ms = await sample(m, op)
          while (typeof ms === "number" && Number.isNaN(ms) && !stop()) { await guard(m.lib.id, op.id); ms = await sample(m, op) } // the tab was hidden: measure it again
          if (ms === null || typeof ms === "number") { if (ms === null) fail(m, warm + o.reps - round); break }
          done++
          spent += ms.all
          // one sample over the expected most, or all of them together over theirs: stopped at once
          if (ms.all > op.limit || spent > budget) {
            m.errs[op.id] = ms.all > op.limit
              ? `${TIMEOUT}: bir tekrar için en çok ${op.limit / 1000} sn beklenirdi, ${round + 1}. tekrar ${(ms.all / 1000).toFixed(1)} sn sürdü`
              : `${TIMEOUT}: ${warm + o.reps} tekrar için en çok ${budget / 1000} sn beklenirdi, ${round + 1}. tekrarda ${(spent / 1000).toFixed(1)} sn oldu`
            done += warm + o.reps - round - 1; live = live.filter((x) => x !== m)
            break
          }
          if (round >= warm) {
            lists.get(m)!.push(ms.all); acts.get(m)!.push(ms.act)
            if (ms.peak !== undefined) peaks.set(m, Math.max(peaks.get(m)!, ms.peak))
            if (ms.cpu !== undefined) cpus.set(m, Math.max(cpus.get(m)!, ms.cpu))
            o.onSample?.(m.lib.id, op.id, ms.all)
          }
        }
        if (stop()) break
      }
      for (const [m, list] of lists) {
        res.samples[m.lib.id]![op.id] = list; res.act![m.lib.id]![op.id] = acts.get(m)!
        if (peaks.get(m)! >= 0) res.heapMax![m.lib.id]![op.id] = Math.round(peaks.get(m)! * 100) / 100
        if (cpus.get(m)! >= 0) res.cpuMax![m.lib.id]![op.id] = Math.round(cpus.get(m)!)
      }
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
