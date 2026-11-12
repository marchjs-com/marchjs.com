// Scenario: one shared application store (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** The page's data: the store's starting cell values; the cells are shown in sections of SECTION cells. */
export interface StoreData { cells: number[] }
/** A step: the cells written this frame, each with its new value. */
export interface Write { i: number; v: number }
export const SECTION = 100, WRITES = 50
/** default size (the libraries' own work shows) and the large size */
export const COUNT = 1_000, LARGE = 20_000
/** The cells' indexes grouped by section (section k holds cells k*SECTION … k*SECTION+SECTION-1). */
export const sectionsOf = (n: number): number[][] =>
  Array.from({ length: Math.ceil(n / SECTION) }, (_, k) => Array.from({ length: Math.min(SECTION, n - k * SECTION) }, (_, j) => k * SECTION + j))

export const store: Scenario<StoreData, Write[]> = {
  id: "store", label: "Paylaşılan depo", steps: 120, warm: 10,
  desc: "Tek bir paylaşılan uygulama deposu (1.000 değerlik bir tablo) sayfadaki 1.000 bağımsız hücre bileşenini besler; hücreler 10 bölüm bileşenine dağılmıştır. 120 kare boyunca her karede depodaki rastgele 50 hücrenin değeri değişir; yazmalar her kitaplığın önerdiği gibi toplu yapılır. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı. Her kitaplık paylaşılan depo için önerilen yolu kullanır: React'te tek dış depo ve hücre başına seçicili useSyncExternalStore aboneliği, Preact'te aynısı kancalarla; bu yolda her bildirimde bütün abonelerin seçicisi çalışır, yalnız değeri değişen 50 hücre yeniden çizilir. Vue (reactive), Svelte ($state), Solid (createStore) ve March (store) depodaki her değeri ayrı izler ve yalnız değişen 50 hücreyi günceller; Lit'te her karede bütün sayfa yeniden işlenir ve bütün değerler karşılaştırılır. Bu iş yükünün ince taneli kitaplıkları öne çıkarması beklenir, ancak ölçüm bunu göstermiyor: 1.000 aboneli bir sayfada seçicileri çalıştırmak bir milisaniyenin çok altında kalır ve kare süresinin çoğu tarayıcının stil, yerleşim ve boyama işidir; kitaplıklar birbirine yakındır. March'ın store() yolu okumada yol kurmaz, var olan bir öğeye yazımda yalnız o öğenin hücresini günceller ve toplu yazımda tek bildirim yapar; bu boyutta March vanilla düzeyindedir, büyük boyutta (20.000) kitaplıklar arasında en az kareyi düşürenlerdendir.",
  large: { label: "20.000 hücre", note: "20.000 hücrede (200 bölüm) her karede yine 50 hücre değişir; seçici çalıştıran ve bütün sayfayı karşılaştıran yollar dört kat iş yapar, değeri ayrı izleyen yollarda kare işi hücre sayısıyla büyümez. Yine de tarayıcının kendi işi her karede 16,7 ms'yi aşar; bu boyutta da bütün kitaplıklar kareleri düşürür ve aradaki fark gürültü içinde kalır." },
  data(seed, large) {
    const r = rng(seed)
    return { cells: Array.from({ length: large ? LARGE : COUNT }, () => Math.floor(r() * 1000)) }
  },
  plan(data, seed, count) {
    const r = rng(seed + 1), n = data.cells.length, val = data.cells.slice()
    return Array.from({ length: count }, () => {
      const seen = new Set<number>(), out: Write[] = []
      while (out.length < WRITES) {
        const i = Math.floor(r() * n)
        if (seen.has(i)) continue
        seen.add(i)
        // always a different value, so an app that skips a write fails the check
        const v = (val[i]! + 1 + Math.floor(r() * 998)) % 1000
        val[i] = v
        out.push({ i, v })
      }
      return out
    })
  },
  check(host, data, applied) {
    const val = data.cells.slice()
    for (const step of applied) for (const w of step) val[w.i] = w.v
    const secs = host.querySelectorAll(".sg > .ss")
    if (secs.length !== Math.ceil(val.length / SECTION)) return false
    const cells = host.querySelectorAll(".sg > .ss > .sc")
    if (cells.length !== val.length) return false
    for (let i = 0; i < val.length; i++) if (cells[i]!.textContent !== String(val[i])) return false
    return true
  },
}

export default store
