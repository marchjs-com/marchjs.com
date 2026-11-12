// Scenario: live ticker (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

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

export default ticker
