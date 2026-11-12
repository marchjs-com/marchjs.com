// Realistic scenarios (Speed › Comparison › "Gerçekçi senaryolar"): workloads where the update is small and frequent
// and the page is large, the case fine-grained signals are built for. Kept apart from the canonical operations.
// Every library gets the same seeded data and the same precomputed list of steps; each step is one frame: it is called
// at the start of an animation frame and timed until just after that frame's paint (script + style + layout + paint).
// A frame over 16.7 ms is a dropped frame at 60 fps. After the run the DOM is checked against the model.
import { rng } from "../core.ts"

/** What every scenario app does: apply one step's change, tear down. */
export interface ScenarioApp { step(payload: unknown): void; destroy(): void }
export type ScenarioMount<D = unknown> = (host: HTMLElement, data: D) => ScenarioApp | Promise<ScenarioApp>

export interface Scenario<D = unknown, P = unknown> {
  id: string
  label: string
  /** what it measures, plainly (shown on the page) */
  desc: string
  /** measured steps (frames) and warm-up steps */
  steps: number
  warm: number
  data(seed: number): D
  /** the step payloads, in order (warm-up first) */
  plan(data: D, seed: number, count: number): P[]
  /** the DOM after `applied` steps matches the model */
  check(host: HTMLElement, data: D, applied: P[]): boolean
}

export const FRAME_MS = 1000 / 60

// ------------------------------------------------------------------ 1. live ticker
export interface Quote { id: number; sym: string; price: number }
export interface Tick { i: number; price: number }
const SYL = ["AC", "BE", "CO", "DA", "EL", "FI", "GO", "HA", "IN", "JO", "KA", "LU", "MO", "NE", "OR", "PA", "RE", "SI", "TA", "VO"]
export const fmtPrice = (p: number): string => p.toFixed(2)
/** Price cell class: up or down against the previous price. */
export const dir = (now: number, before: number): string => (now >= before ? "up" : "down")
export const ticker: Scenario<Quote[], Tick[]> = {
  id: "ticker", label: "Canlı borsa", steps: 120, warm: 10,
  desc: "2.000 satırlık fiyat tablosu, 120 kare boyunca her karede rastgele %1–5 satırın fiyatı ve yön rengi değişir. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Sanal DOM'lu kitaplıklar değişen satırları bulmak için listeyi karşılaştırır; ince taneli kitaplıklar yalnız değişen hücreye dokunur.",
  data(seed) {
    const r = rng(seed)
    return Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, sym: `${SYL[Math.floor(r() * 20)]}${SYL[Math.floor(r() * 20)]}${i}`, price: Math.round((10 + r() * 490) * 100) / 100 }))
  },
  plan(data, seed, count) {
    const r = rng(seed + 1), price = data.map((q) => q.price)
    return Array.from({ length: count }, () => {
      const k = Math.floor(data.length * (0.01 + r() * 0.04)), seen = new Set<number>(), out: Tick[] = []
      while (out.length < k) {
        const i = Math.floor(r() * data.length)
        if (seen.has(i)) continue
        seen.add(i)
        const p = Math.max(1, Math.round(price[i]! * (1 + (r() - 0.5) * 0.04) * 100) / 100)
        price[i] = p
        out.push({ i, price: p })
      }
      return out
    })
  },
  check(host, data, applied) {
    const price = data.map((q) => q.price), prev = data.map((q) => q.price)
    for (const step of applied) for (const t of step) { prev[t.i] = price[t.i]!; price[t.i] = t.price }
    const rows = host.querySelectorAll("tbody tr")
    if (rows.length !== data.length) return false
    for (const i of [0, 1, 999, data.length - 1, ...applied.at(-1)!.map((t) => t.i)]) {
      const cell = rows[i]?.querySelector(".px")
      if (!cell || cell.textContent !== fmtPrice(price[i]!)) return false
      if (price[i] !== prev[i] && !cell.classList.contains(dir(price[i]!, prev[i]!))) return false
    }
    return true
  },
}

export const SCENARIOS: Scenario[] = [ticker as Scenario]
export const scenarioById = (id: string): Scenario | undefined => SCENARIOS.find((s) => s.id === id)
