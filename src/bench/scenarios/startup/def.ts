// Scenario: start-up and first interaction (see ../core.ts for how scenarios are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

export interface Row { id: number; name: string; email: string; status: string; amount: string; date: string }
export interface Link { href: string; label: string }
export interface Stat { label: string; value: string; delta: string }
export interface Field { name: string; label: string; type: string }
/** A small dashboard page: header with a counter, a nav of 10 links, 6 stat cards, a 200-row table, a 10-input form. */
export interface Dash { title: string; nav: Link[]; stats: Stat[]; rows: Row[]; fields: Field[] }
/** A step: the instance number k; the app tears down the previous page, mounts page k and clicks its "+1" button. */
export type Run = number

export const ROWS = 200
export const HEADS = ["#", "Ad", "E-posta", "Durum", "Tutar", "Tarih"]
const FIRST = ["Ada", "Can", "Deniz", "Ece", "Emre", "Ela", "Kaan", "Mert", "Nil", "Ozan", "Selin", "Tuna"]
const LAST = ["Aksoy", "Demir", "Kaya", "Yıldız", "Şahin", "Çelik", "Arslan", "Koç", "Kurt", "Öztürk"]
const STATUS = ["aktif", "bekliyor", "kapandi"]
/** The rows page k shows: the table rotated by k, so every instance renders different data. */
export const rowsFor = (rows: Row[], k: number): Row[] => { const s = k % rows.length; return rows.slice(s).concat(rows.slice(0, s)) }

export const startup: Scenario<Dash, Run> = {
  id: "startup", label: "Açılış ve ilk etkileşim", steps: 50, warm: 5,
  desc: "Küçük bir uygulama sayfası (başlık ve sayaç, 10 bağlantılı menü, 6 özet kartı, 200 satırlık tablo, 10 alanlı form; yaklaşık 1.900 öğe) her karede sıfırdan açılır: önceki örnek kaldırılır, sayfa baştan kurulur ve aynı karede \"+1\" düğmesine gerçek bir tıklama gönderilir; tıklamayı kitaplığın kendi olay düzeni işler ve başlıktaki sayaç 1 olur. Ölçülen: kare başına süre (kurulum + ilk etkileşim + boyama) ve 16,7 ms'yi aşan (düşen) kare sayısı; yani açılışın işlemci payı. İndirme bu senaryoda ölçülmez (ilk yüklemeden sonra paket önbellektedir): indirilen boyut, karşılaştırma tablosunun \"İndirilen (gzip)\" sütunudur (yalın DOM 0,7 KB, March ~6,5 KB, Solid ~6,2, Preact ~5,0, Lit ~5,0, Svelte ~22, Vue ~26,5, React ~69,5 KB). Derlenmiş şablonları kopyalayan kitaplıklar (March, Solid, Svelte, Lit) açılışta sanal DOM ağacı kurmaz; Preact ve Vue önce sanal düğümleri, React ayrıca tam bir fiber ağacını kurar. Sinyal tabanlı kitaplıklar ise her bağlama için bir abonelik kurar; bu sayfada bağlamaların çoğu durağan veridir. Ölçümde bu beklenen fark görünmez: yaklaşık 1.900 öğelik bir sayfada karenin çoğu tarayıcının öğe oluşturma, stil ve yerleşim işidir (yalın DOM'da da 17–18 ms); kitaplıkların ortancaları 16–25 ms arasında kalır ve sıralama çalıştırmadan çalıştırmaya değişir. Sanal DOM'un açılıştaki ek işlemci maliyeti bu boyutta ölçüm gürültüsü içinde kalır; açılışta kitaplıklar arasındaki asıl fark indirilen boyuttadır.",
  data(seed) {
    const r = rng(seed), pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)]!
    const rows = Array.from({ length: ROWS }, (_, i) => {
      const f = pick(FIRST), l = pick(LAST)
      return { id: i + 1, name: `${f} ${l}`, email: `${f.toLowerCase()}.${i + 1}@ornek.com`, status: pick(STATUS), amount: (r() * 10000).toFixed(2), date: `2026-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}` }
    })
    const nav = ["Özet", "Satışlar", "Müşteriler", "Ürünler", "Siparişler", "Stok", "Raporlar", "Ekip", "Ayarlar", "Yardım"].map((label, i) => ({ href: `#p${i}`, label }))
    const stats = ["Gelir", "Sipariş", "Ziyaret", "Dönüşüm", "İade", "Ortalama sepet"].map((label) => ({ label, value: (r() * 100000).toFixed(0), delta: `${r() < 0.5 ? "-" : "+"}${(r() * 10).toFixed(1)}%` }))
    const fields = ["ad", "soyad", "eposta", "telefon", "sirket", "unvan", "sehir", "ulke", "posta", "not"].map((name, i) => ({ name, label: name.toUpperCase(), type: i === 2 ? "email" : i === 3 ? "tel" : "text" }))
    return { title: "Panel", nav, stats, rows, fields }
  },
  plan(_data, _seed, count) { return Array.from({ length: count }, (_, i) => i + 1) },
  check(host, data, applied) {
    const k = applied.at(-1)!, rows = rowsFor(data.rows, k)
    if (host.querySelectorAll(".dash").length !== 1) return false
    const d = host.querySelector(".dash")!, txt = (s: string) => d.querySelector(s)?.textContent
    if (txt("h1") !== data.title || txt(".run") !== String(k) || txt(".count") !== "1") return false
    const links = d.querySelectorAll("nav a")
    if (links.length !== 10 || links[9]!.textContent !== data.nav[9]!.label || links[9]!.getAttribute("href") !== data.nav[9]!.href) return false
    const cards = d.querySelectorAll(".card")
    if (cards.length !== 6 || cards[5]!.querySelector(".val")?.textContent !== data.stats[5]!.value) return false
    if (d.querySelectorAll("thead th").length !== HEADS.length) return false
    const trs = d.querySelectorAll("tbody tr")
    if (trs.length !== ROWS) return false
    for (const i of [0, 1, 100, ROWS - 1]) {
      const td = trs[i]!.querySelectorAll("td"), r = rows[i]!
      if (td.length !== 6 || td[0]!.textContent !== String(r.id) || td[1]!.querySelector("a")?.textContent !== r.name || td[2]!.textContent !== r.email) return false
      if (!td[3]!.querySelector(`span.badge.${r.status}`) || td[4]!.textContent !== r.amount || td[5]!.textContent !== r.date) return false
    }
    const inputs = d.querySelectorAll("form input")
    if (inputs.length !== 10 || inputs[2]!.getAttribute("name") !== data.fields[2]!.name || inputs[2]!.getAttribute("type") !== "email") return false
    return true
  },
}

export default startup
