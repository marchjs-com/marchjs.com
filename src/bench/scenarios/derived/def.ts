// Scenario: derived values (see ../core.ts for how scenarios are measured). A form of 200 numeric fields and 500
// computed cells, each depending on a fixed, seeded subset of the fields: group sums (10 fields), products (2 fields)
// and limit flags (sum of 5 fields against a threshold, shown as a class). A step changes ONE field; only the
// computed cells that depend on it have a new value.
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** kind 0: sum of deps; kind 1: product of deps; kind 2: sum of deps, flagged against `th` */
export interface Comp { kind: 0 | 1 | 2; deps: number[]; th: number }
export interface Form { fields: number[]; comps: Comp[] }
export interface Edit { i: number; v: number }

export const FIELDS = 200, COMPS = 500
/** The computed value (the same formula in every app). */
export function evalComp(c: Comp, get: (i: number) => number): number {
  let x = c.kind === 1 ? 1 : 0
  if (c.kind === 1) for (const d of c.deps) x *= get(d)
  else for (const d of c.deps) x += get(d)
  return x
}
/** The computed cell's class: limit flags show whether the sum is over the threshold. */
export const compClass = (c: Comp, v: number): string => (c.kind === 2 ? (v > c.th ? "dv-c hi" : "dv-c ok") : "dv-c")
/** For each field, the computed cells that read it (what a hand-written app keeps to recompute only dependents). */
export function dependents(form: Form): number[][] {
  const out: number[][] = Array.from({ length: form.fields.length }, () => [])
  form.comps.forEach((c, k) => { for (const d of new Set(c.deps)) out[d]!.push(k) })
  return out
}

export const derived: Scenario<Form, Edit> = {
  id: "derived", label: "Türetilmiş değerler", steps: 120, warm: 10,
  desc: "200 sayısal alan ve bunlardan hesaplanan 500 değer (10 alanlık toplamlar, iki alanın çarpımı, eşiği aşınca rengi değişen sınır uyarıları) aynı sayfada. 120 kare boyunca her karede tek bir alanın değeri değişir; o alana bağlı ortalama 16 hesaplanan değer yenilenmelidir. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Türetilmiş değeri bağımlılıklarıyla izleyen kitaplıklar (computed, $derived, createMemo) yalnız etkilenen hücreleri yeniden hesaplar; bileşeni baştan çizen kitaplıklar ya hepsini hesaplar ya da neyin değiştiğini kendi kodunda izlemek zorundadır.",
  data(seed) {
    const r = rng(seed + 11), pick = () => Math.floor(r() * FIELDS)
    const fields = Array.from({ length: FIELDS }, () => 1 + Math.floor(r() * 99))
    const comps = Array.from({ length: COMPS }, (_, k): Comp => {
      const kind = (k % 5 < 2 ? 0 : k % 5 < 4 ? 2 : 1) as 0 | 1 | 2
      const deps = Array.from({ length: kind === 0 ? 10 : kind === 1 ? 2 : 5 }, pick)
      return { kind, deps, th: kind === 2 ? 200 + Math.floor(r() * 100) : 0 }
    })
    return { fields, comps }
  },
  plan(_data, seed, count) {
    const r = rng(seed + 12)
    return Array.from({ length: count }, () => ({ i: Math.floor(r() * FIELDS), v: 1 + Math.floor(r() * 99) }))
  },
  check(host, data, applied) {
    const f = data.fields.slice()
    for (const e of applied) f[e.i] = e.v
    const fs = host.querySelectorAll(".dv-f"), cs = host.querySelectorAll(".dv-c")
    if (fs.length !== FIELDS || cs.length !== COMPS) return false
    for (let i = 0; i < FIELDS; i++) if (fs[i]!.textContent !== String(f[i])) return false
    for (let k = 0; k < COMPS; k++) {
      const c = data.comps[k]!, v = evalComp(c, (i) => f[i]!)
      if (cs[k]!.textContent !== String(v) || cs[k]!.className !== compClass(c, v)) return false
    }
    return true
  },
}

export default derived
