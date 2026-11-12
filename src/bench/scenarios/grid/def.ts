// Scenario: data list with filter, sort and selection (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** One record; `i` is its index in the data (id = i + 1), `lc` its lower-case name for the filter. */
export interface Rec { i: number; id: number; name: string; lc: string; cat: number; price: number; stock: number }
export type Key = "id" | "name" | "price" | "stock"
/** One user action: type/delete in the query, toggle a category, change the sort, toggle a row, select all visible, clear. */
export type Act =
  | { t: "q"; q: string }
  | { t: "cat"; c: number; on: boolean }
  | { t: "sort"; key: Key; dir: 1 | -1 }
  | { t: "sel"; i: number; on: boolean }
  | { t: "all" }
  | { t: "none" }
export const CATS = ["Kitap", "Oyun", "Müzik", "Ev", "Bahçe", "Spor", "Giyim", "Gıda"]
const SYL = ["ka", "mo", "re", "si", "ta", "lu", "ne", "do", "pa", "vi", "ze", "ro", "be", "gu", "hi", "fe"]
/** default size (the libraries' own work shows) and the large size */
export const COUNT = 2_000, LARGE = 10_000

/** Prices are integer kuruş, so every library sums them exactly. */
export const fmtPrice = (c: number): string => `${Math.floor(c / 100)}.${String(c % 100).padStart(2, "0")}`
export const summary = (visible: number, count: number, total: number): string => `${visible} satır · ${count} seçili · ${fmtPrice(total)}`
/** Row class: selected rows carry "sel". */
export const SEL = "sel"

/** The filter: the name contains the query and the category is on. */
export const matches = (r: Rec, q: string, cats: readonly boolean[]): boolean => cats[r.cat]! && (q === "" || r.lc.includes(q))
/** The sort: by the column, ties by id; the direction turns the whole order. */
export function compare(key: Key, dir: 1 | -1): (a: Rec, b: Rec) => number {
  if (key === "name") return (a, b) => dir * (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id - b.id)
  return (a, b) => dir * ((a[key] - b[key]) || a.id - b.id)
}

/** The model the plan and the check replay (each app keeps its own state in its own way). */
interface Model { q: string; cats: boolean[]; key: Key; dir: 1 | -1; sel: boolean[] }
const start = (n: number): Model => ({ q: "", cats: CATS.map(() => true), key: "id", dir: 1, sel: new Array<boolean>(n).fill(false) })
const viewOf = (data: Rec[], m: Model): Rec[] => data.filter((r) => matches(r, m.q, m.cats)).sort(compare(m.key, m.dir))
function apply(data: Rec[], m: Model, a: Act): void {
  if (a.t === "q") m.q = a.q
  else if (a.t === "cat") m.cats[a.c] = a.on
  else if (a.t === "sort") { m.key = a.key; m.dir = a.dir }
  else if (a.t === "sel") m.sel[a.i] = a.on
  else if (a.t === "all") for (const r of viewOf(data, m)) m.sel[r.i] = true
  else m.sel.fill(false)
}

export const grid: Scenario<Rec[], Act> = {
  id: "grid", label: "Liste, filtre, sıralama, seçim", steps: 120, warm: 10,
  desc: "2.000 kayıtlık (ad, kategori, fiyat, stok) anahtarlı tablo; üstünde metin araması, kategori süzgeci, sütuna göre sıralama ve satır seçimi vardır; özet satırı görünen satır sayısını, seçili satır sayısını ve seçililerin toplam fiyatını gösterir. 120 kare boyunca her karede tohumlu bir karışımdan tek kullanıcı eylemi uygulanır: aramaya harf yazma ya da silme, bir kategoriyi açma/kapama, sıralama sütununu ya da yönünü değiştirme, bir satırı seçme/bırakma, görünenlerin hepsini seçme, seçimi temizleme. Ölçülen: kare başına süre (işlem + boyama), 16,7 ms'yi aşan (düşen) kare sayısı, kurulum süresi ve bellek. Beklenti: ince taneli kitaplıklar süzülmüş ve sıralanmış görünümü türetilmiş değer olarak yalnız girdileri değişince yeniden hesaplar ve seçim değişikliğinde yalnız o satırın sınıfına dokunur; sanal DOM'lu kitaplıklar seçimde listeyi yeniden işler (satırlar memo ile atlansa da bütün satır öğeleri kurulup karşılaştırılır). Süzme ve sıralama ise satırların sırasını değiştirir: bu her kitaplık için anahtarlı liste karşılaştırması, tarayıcı için de tablonun yeniden yerleşimidir. Sonuç: bu boyutta beklenen fark görünmüyor. Seçim karesi bütün kitaplıklarda 1 ms dolayındadır; sıralama ve süzme kareleri tarayıcının yerleşim ve boyama işiyle belirlenir ve kitaplıklar arası farklar ölçüm gürültüsü içinde kalır. Belleği en az el yazımı DOM ve Lit kullanır (satır başına reaktif düğüm yok); satır başına seçim sinyali tutan kitaplıklar daha çok bellek kullanır, en çok Vue. Kurulumda (ilk boyama) March bu senaryoda en yavaştır (yaklaşık 250 ms; diğerleri 110–190 ms): satır başına sinyal ve hesaplanan görünümün ilk kurulumu ek iş yapar.",
  large: { label: "10.000 kayıt", note: "10.000 kayıtta seçim karesinde fark görünür: sanal DOM'lu kitaplıklar seçimde bütün listeyi yeniden işlediği için ince taneli kitaplıklardan belirgin biçimde yavaştır. Ama sıralama ve süzme karelerinde tarayıcının tablo yerleşimi her kitaplıkta 60 ms'yi aşar, her kitaplık kare düşürür ve kurulum bir saniyeye yaklaşır; bellek farkları da büyür." },
  data(seed, large) {
    const r = rng(seed), pick = () => SYL[Math.floor(r() * SYL.length)]!
    return Array.from({ length: large ? LARGE : COUNT }, (_, i) => {
      const lc = pick() + pick() + pick()
      return { i, id: i + 1, name: lc[0]!.toUpperCase() + lc.slice(1), lc, cat: Math.floor(r() * CATS.length), price: 100 + Math.floor(r() * 99_900), stock: Math.floor(r() * 500) }
    })
  },
  // a seeded mix of user actions; row toggles pick a visible row of the model's view
  plan(data, seed, count) {
    const r = rng(seed + 1), m = start(data.length), out: Act[] = []
    let target = ""
    const keys: Key[] = ["id", "name", "price", "stock"]
    while (out.length < count) {
      const x = r()
      let a: Act
      if (x < 0.3) {
        // typing: a query grows toward a target (part of a real name), then is deleted character by character
        if (m.q === "") { const lc = data[Math.floor(r() * data.length)]!.lc, at = 2 * Math.floor(r() * 2); target = lc.slice(at, at + 2 + Math.floor(r() * 3)) }
        const grow = m.q.length < target.length && (m.q === "" || r() < 0.7)
        a = { t: "q", q: grow ? target.slice(0, m.q.length + 1) : m.q.slice(0, -1) }
        if (!grow && a.q === "") target = ""
      } else if (x < 0.42) {
        const c = Math.floor(r() * CATS.length), on = m.cats.filter(Boolean).length <= 3 ? true : !m.cats[c]
        a = { t: "cat", c, on }
      } else if (x < 0.55) a = { t: "sort", key: keys[Math.floor(r() * keys.length)]!, dir: r() < 0.5 ? 1 : -1 }
      else if (x < 0.88) {
        const v = viewOf(data, m)
        if (!v.length) continue
        const i = v[Math.floor(r() * v.length)]!.i
        a = { t: "sel", i, on: !m.sel[i] }
      } else a = x < 0.94 ? { t: "all" } : { t: "none" }
      apply(data, m, a)
      out.push(a)
    }
    return out
  },
  check(host, data, applied) {
    const m = start(data.length)
    for (const a of applied) apply(data, m, a)
    const v = viewOf(data, m), rows = host.querySelectorAll("tbody tr")
    if (rows.length !== v.length) return false
    for (let k = 0; k < v.length; k++) {
      const tr = rows[k]!, rec = v[k]!
      if (tr.querySelector(".id")?.textContent !== String(rec.id)) return false
      if (tr.classList.contains(SEL) !== m.sel[rec.i]) return false
    }
    // spot-check the other cells of a few rows
    for (const k of [0, v.length >> 1, v.length - 1]) {
      const tr = rows[k], rec = v[k]
      if (!tr || !rec) continue
      const t = (c: string) => tr.querySelector(c)?.textContent
      if (t(".nm") !== rec.name || t(".cat") !== CATS[rec.cat] || t(".px") !== fmtPrice(rec.price) || t(".st") !== String(rec.stock)) return false
    }
    let count = 0, total = 0
    for (const r of data) if (m.sel[r.i]) { count++; total += r.price }
    return host.querySelector(".gsum")?.textContent === summary(v.length, count, total)
  },
}

export default grid
