// Scenario: independent counters (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** One counter and its simulated timer: it fires on frames where (frame + phase) % period === 0. */
export interface Counter { id: number; period: number; phase: number }
/** A step: the indexes of the counters whose timer fires this frame; each one adds 1 to its own value. */
export type Fired = number[]
/** default size (the libraries' own work shows) and the large size (the browser's work dominates) */
export const COUNT = 2_000, LARGE = 10_000
export const counters: Scenario<Counter[], Fired> = {
  id: "counters", label: "Bağımsız sayaçlar", steps: 120, warm: 10,
  desc: "2.000 küçük sayaç bileşeni; her biri kendi değerini tutar ve kendi zamanlayıcısı varmış gibi çalışır: her sayacın 12–33 karelik kendi periyodu vardır, 120 kare boyunca her karede zamanlayıcısı dolan sayaçlar (yaklaşık %5'i, 500 kadar) birer artar. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Her kitaplıkta durum sayacın kendisindedir; sanal DOM'lu kitaplıklar artan her bileşeni yeniden çizip karşılaştırır, ince taneli kitaplıklar yalnız değişen metni yazar, Lit'in alışılmış yolunda ise her karede bütün ızgara yeniden işlenir.",
  large: { label: "10.000 sayaç", note: "10.000 sayaçta tarayıcının kendi stil, yerleşim ve boyama işi her karede 30 ms'yi aşar ve bütün kitaplıklarda aynıdır; bu boyutta her kitaplık her kareyi düşürür ve kitaplıklar arası fark kaybolur." },
  data(seed, large) {
    const r = rng(seed)
    return Array.from({ length: large ? LARGE : COUNT }, (_, i) => {
      const period = 12 + Math.floor(r() * 22)
      return { id: i + 1, period, phase: Math.floor(r() * period) }
    })
  },
  plan(data, _seed, count) {
    return Array.from({ length: count }, (_, f) => {
      const out: Fired = []
      for (let i = 0; i < data.length; i++) { const c = data[i]!; if ((f + 1 + c.phase) % c.period === 0) out.push(i) }
      return out
    })
  },
  check(host, data, applied) {
    const n = new Array<number>(data.length).fill(0)
    for (const step of applied) for (const i of step) n[i]!++
    const cells = host.querySelectorAll(".cg .ct")
    if (cells.length !== data.length) return false
    for (let i = 0; i < data.length; i++) if (cells[i]!.textContent !== String(n[i])) return false
    return true
  },
}

export default counters
