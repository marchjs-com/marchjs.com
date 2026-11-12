// Realistic scenarios: the runner. One library at a time in its own host; every step starts in a requestAnimationFrame
// callback and is timed until a message posted from it is handled, which is right after that frame's paint.
// (Not an animation: the motion engine's global speed or "stop all" must not change a measurement.)
import { stats, type Stats } from "../core.ts"
import { FRAME_MS, type Scenario, type ScenarioApp } from "./core.ts"
import { SCENARIO_LIBS, type ScenarioMounts } from "./libs.ts"

export interface ScenarioResult { samples: number[]; stats: Stats; dropped: number; /** mount call to its first paint (ms) */ mountMs?: number; /** JS heap growth from the mounted page (MB), where the browser reports it */ heapMB?: number; error?: string }
export interface ScenarioRun { /** scenario id → library id → result */ results: Record<string, Record<string, ScenarioResult>> }
export interface ScenarioProgress { scenario: string; lib: string; done: number; total: number }

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const gc = (): void => { (globalThis as { gc?: () => void }).gc?.() }
const heap = (): number | undefined => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
/** Runs `fn` at the start of the next frame; resolves with the time from there to just after that frame's paint. */
export function frame(fn: () => void): Promise<number> {
  return new Promise((done, fail) => {
    requestAnimationFrame(() => {
      const t0 = performance.now()
      try { fn() } catch (e) { fail(e); return }
      const ch = new MessageChannel()
      ch.port1.onmessage = () => { ch.port1.close(); done(performance.now() - t0) }
      ch.port2.postMessage(0)
    })
  })
}
const visible = (): Promise<void> => (document.hidden ? new Promise((r) => { const on = () => { if (!document.hidden) { document.removeEventListener("visibilitychange", on); r() } }; document.addEventListener("visibilitychange", on) }) : Promise.resolve())

export async function runScenarios(o: { scenarios: Scenario[]; libs: string[]; stage: HTMLElement; seed?: number; onProgress?: (p: ScenarioProgress) => void; signal?: AbortSignal; /** the scenarios' large size */ large?: boolean; /** library id → its scenario apps (default: the registered ones) */ registry?: Record<string, () => Promise<ScenarioMounts>> }): Promise<ScenarioRun> {
  const reg = o.registry ?? SCENARIO_LIBS
  const seed = o.seed ?? 7, res: ScenarioRun = { results: {} }
  const libs = o.libs.filter((l) => reg[l])
  const total = o.scenarios.reduce((s, sc) => s + libs.length * (sc.steps + sc.warm), 0)
  let done = 0
  for (const sc of o.scenarios) {
    const per: Record<string, ScenarioResult> = (res.results[sc.id] = {})
    const data = sc.data(seed, o.large && !!sc.large), plan = sc.plan(data, seed, sc.warm + sc.steps)
    for (const lib of libs) {
      if (o.signal?.aborted) break
      gc(); await sleep(300); await visible()
      const host = document.createElement("div")
      host.className = "bt-host"; host.dataset.lib = lib
      o.stage.append(host)
      let app: ScenarioApp | null = null
      const samples: number[] = []
      let mountMs: number | undefined, heapMB: number | undefined
      try {
        const mount = (await reg[lib]!())[sc.id]
        if (!mount) throw new Error("Bu kitaplığın bu senaryo için uygulaması yok")
        await sleep(50)
        const h0 = heap(), t0 = performance.now()
        app = await mount(host, data as never)
        await new Promise<void>((r) => { requestAnimationFrame(() => { const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); r() }; ch.port2.postMessage(0) }) }) // the first paint
        mountMs = performance.now() - t0 // mount call (data set-up included) to the first paint
        gc(); await sleep(50)
        const h1 = heap()
        if (h0 !== undefined && h1 !== undefined) heapMB = Math.max(0, (h1 - h0) / 1048576)
        for (let i = 0; i < plan.length && !o.signal?.aborted; i++) {
          if (document.hidden) await visible()
          const ms = await frame(() => app!.step(plan[i]))
          if (i >= sc.warm) samples.push(ms)
          done++
          if (i % 10 === 0) o.onProgress?.({ scenario: sc.id, lib, done, total })
        }
        await frame(() => {})
        const ok = sc.check(host, data, plan)
        per[lib] = { samples, stats: stats(samples), dropped: samples.filter((x) => x > FRAME_MS).length, mountMs, heapMB, ...(ok ? {} : { error: "Sonuç beklenen tabloyla eşleşmedi" }) }
      } catch (e) {
        per[lib] = { samples, stats: stats(samples), dropped: 0, error: e instanceof Error ? e.message : String(e) }
      } finally {
        try { app?.destroy() } catch { /* a failed app may not tear down */ }
        host.remove()
      }
    }
  }
  return res
}
