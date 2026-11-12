// Benchmark runner (browser): mounts one library at a time in its own host element on the stage, runs the selected
// operations (warm-up, then N measured samples, each timed from the call to the next paint) and reports progress.
// A hidden tab pauses the run (a sample that saw the tab hidden is thrown away); between libraries it tears the app
// down, asks for garbage collection where the browser exposes it and waits for the page to go idle.
import { OPS, rowSource, type BenchApp, type DomProbe, type Op, type RunResult } from "./core.ts"
import { afterPaint } from "./paint.ts"
import type { Lib } from "./libs.ts"

export interface Progress { lib: string; op: string; phase: "load" | "warm" | "run" | "cool" | "paused"; done: number; total: number }
export interface RunOptions { libs: Lib[]; ops: Op[]; reps: number; warm?: number | undefined; stage: HTMLElement; onProgress?: (p: Progress) => void; onSample?: (lib: string, op: string, ms: number) => void; signal?: AbortSignal | undefined }

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const heap = (): number | undefined => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
const gc = (): void => { (globalThis as { gc?: () => void }).gc?.() }
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
  try {
    for (const lib of o.libs) {
      if (stop()) break
      res.samples[lib.id] = {}
      const errs: Record<string, string> = {}
      report(lib.id, "", "cool")
      gc(); await idle(); await sleep(400)
      await guard(lib.id, "")
      const host = document.createElement("div")
      host.className = "bt-host"
      host.dataset.lib = lib.id
      o.stage.append(host)
      let app: BenchApp | null = null
      try {
        report(lib.id, "", "load")
        const h0 = heap()
        const t0 = performance.now()
        const mod = await lib.load()
        app = await mod.mount(host)
        res.firstPaint[lib.id] = (await afterPaint()) - t0
        const dom = probe(host)
        const rows = rowSource(1)
        if (h0 !== undefined) {
          app.run(rows(1000)); await afterPaint(); gc(); await sleep(50)
          const h1 = heap()
          if (h1 !== undefined) res.memory[lib.id] = Math.max(0, (h1 - h0) / 1048576)
          app.clear(); await afterPaint()
        }
        for (const op of o.ops) {
          if (stop()) break
          const list: number[] = []
          const warm = o.warm ?? op.warm
          for (let i = 0; i < warm + o.reps && !stop(); i++) {
            await guard(lib.id, op.id)
            report(lib.id, op.id, i < warm ? "warm" : "run")
            op.setup(app, rows, dom)
            await afterPaint()
            op.mark?.(dom)
            const seen = hides
            const t0 = performance.now()
            op.act(app, rows, dom)
            const ms = (await afterPaint()) - t0
            if (hides !== seen) { i--; continue } // the tab was hidden during the sample: measure it again
            if (!op.check(dom)) { errs[op.id] = "Sonuç beklenen tabloyla eşleşmedi"; done += warm + o.reps - i; break }
            done++
            if (i >= warm) { list.push(ms); o.onSample?.(lib.id, op.id, ms) }
            await sleep(16)
          }
          res.samples[lib.id]![op.id] = list
        }
      } catch (e) {
        errs.load = e instanceof Error ? e.message : String(e)
        done = o.libs.indexOf(lib) * per + per
      } finally {
        try { app?.destroy() } catch { /* a failed app may not tear down */ }
        host.remove()
      }
      if (Object.keys(errs).length) res.errors[lib.id] = errs
    }
  } finally {
    document.removeEventListener("visibilitychange", onVis)
  }
  return res
}
export { OPS }
