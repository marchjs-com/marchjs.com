// Scenario: one context value changes on a big page (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

export interface Card { id: number; title: string; text: string }
/** The accent names; the page starts on the first, the steps switch among the others. */
export const ACCENTS = ["blue", "green", "red", "amber", "violet", "teal"]
export const FIRST = ACCENTS[0]!
/** The badge's class for an accent: the only place the theme reaches the DOM. */
export const badgeClass = (accent: string): string => `badge acc-${accent}`
const WORDS = ["kart", "rapor", "özet", "görev", "not", "plan", "liste", "kayıt", "taslak", "duyuru", "takvim", "bütçe"]
export const theme: Scenario<Card[], string[]> = {
  id: "theme", label: "Bağlam / tema değişimi", steps: 100, warm: 10,
  desc: "2.000 kartlık sayfa; tema (vurgu rengi) en üstte bağlamla (context) verilir, yalnız her kartın rozeti bu değeri sınıf olarak okur. 100 kare boyunca her karede vurgu rengi değişir. Ölçülen: tek bir bağlam değeri değiştiğinde kare süresi (işlem + boyama) ve 16,7 ms'yi aşan kare sayısı. React ve Preact bağlamı okuyan her bileşeni, yani 2.000 rozet bileşenini yeniden çizer (kartlar memo ile atlanır); Vue yalnız değeri okuyan rozet bileşenlerini yeniden çizer; Svelte, Solid ve March yalnız rozetin sınıf bağını günceller. Lit'in çekirdeğinde bağlam yoktur: değer çizime aktarılır ve tüm liste değer karşılaştırmasıyla yeniden çizilir.",
  data(seed) {
    const r = rng(seed), w = () => WORDS[Math.floor(r() * WORDS.length)]!
    return Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, title: `${w()} ${w()} ${i + 1}`, text: `${w()} ${w()} ${w()} ${w()} ${w()}` }))
  },
  plan(_data, seed, count) {
    // steps never go back to the starting accent, so an app that skips its updates fails the check
    const r = rng(seed + 1), pick = ACCENTS.slice(1)
    let last = FIRST
    return Array.from({ length: count }, () => {
      let a = last
      while (a === last) a = pick[Math.floor(r() * pick.length)]!
      return (last = a)
    })
  },
  check(host, data, applied) {
    const want = `acc-${applied.at(-1)!}`
    const cards = host.querySelectorAll(".card"), badges = host.querySelectorAll(".card .badge")
    if (cards.length !== data.length || badges.length !== data.length) return false
    for (const b of badges) if (b.classList.length !== 2 || !b.classList.contains("badge") || !b.classList.contains(want)) return false
    for (const i of [0, 999, data.length - 1]) {
      const c = cards[i]!
      if (c.querySelector("h3")?.textContent !== data[i]!.title || c.querySelector("p")?.textContent !== data[i]!.text || badges[i]!.textContent !== `#${data[i]!.id}`) return false
    }
    return true
  },
}

export default theme
