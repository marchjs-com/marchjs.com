// Scenario: moving highlight (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

export interface Item { id: number; label: string }
const ADJ = ["quick", "calm", "bright", "dark", "soft", "loud", "tiny", "large", "plain", "fancy", "cold", "warm"]
const NOUN = ["table", "chair", "lamp", "river", "stone", "cloud", "field", "tower", "garden", "bridge", "window", "road"]
/** Class of the row under the (simulated) pointer. */
export const HOVER = "hover"
export const hover: Scenario<Item[], number> = {
  id: "hover", label: "Seçim ve vurgu", steps: 150, warm: 10,
  desc: "10.000 satırlık tabloda fare hareketi taklit edilir: 150 kare boyunca her karede vurgulanan satır bir sonrakine (çoğunlukla komşu satıra, ara sıra uzağa) geçer ve yalnız o satır \"hover\" sınıfını taşır. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Her karede yalnız iki satır değişir. Seçici (selector) kullanan ince taneli kitaplıklar yalnız eski ve yeni satırı uyandırır; sanal DOM'lu kitaplıklar ve listeyi tek durumdan yeniden çizen şablonlar her karede 10.000 satırın değerini karşılaştırır.",
  data(seed) {
    const r = rng(seed)
    return Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, label: `${ADJ[Math.floor(r() * ADJ.length)]} ${NOUN[Math.floor(r() * NOUN.length)]}` }))
  },
  // a pointer path: mostly the next neighbour in the current direction, sometimes a turn, sometimes a jump
  plan(data, seed, count) {
    const r = rng(seed + 1), n = data.length
    let at = Math.floor(r() * n), d = 1
    return Array.from({ length: count }, () => {
      const x = r()
      if (x < 0.08) at = Math.floor(r() * n)
      else {
        if (x < 0.18) d = -d
        at += d
        if (at < 0 || at >= n) { d = -d; at += 2 * d }
      }
      return at
    })
  },
  check(host, data, applied) {
    const rows = host.querySelectorAll("tbody tr")
    if (rows.length !== data.length) return false
    const on = host.querySelectorAll(`tbody tr.${HOVER}`), last = applied.at(-1)!
    if (on.length !== 1 || on[0] !== rows[last]) return false
    for (const i of [0, 1, 4999, data.length - 1, last]) {
      const tds = rows[i]!.querySelectorAll("td")
      if (tds.length !== 2 || tds[0]!.textContent !== String(data[i]!.id) || tds[1]!.textContent !== data[i]!.label) return false
    }
    return true
  },
}

export default hover
