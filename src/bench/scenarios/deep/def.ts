// Scenario: state at the top of a component hierarchy, read by a few deep items (see ../core.ts for how scenarios
// are measured).
import { rng } from "../../core.ts"
import type { Scenario } from "../core.ts"

/** An item. A measured item (`v`, in metres; one per group) shows `fmt(v, unit)` with the page's current unit; the
 *  others (`v` null) show their fixed code. Only the measured items' output depends on the unit. */
export interface Item { id: number; label: string; v: number | null }
export interface Group { id: number; title: string; items: Item[] }
export interface Panel { id: number; title: string; note: string; groups: Group[] }
/** `items`: every item in document order (item `id` = index + 1). */
export interface Deep { panels: Panel[]; items: Item[] }
/** A step changes one piece of the top-level state: the focused item, or the display unit. */
export type Step = { focus: number } | { unit: string }

export const GROUPS = 10, ITEMS = 10, PANELS = 20, LARGE_PANELS = 100
/** Display units: factor from metres and decimals. The page starts on the first. */
const UNIT: Record<string, [number, number]> = { m: [1, 1], km: [0.001, 3], cm: [100, 0], ft: [3.28084, 1], yd: [1.09361, 1], in: [39.3701, 0] }
export const UNITS = Object.keys(UNIT)
export const FIRST_UNIT = UNITS[0]!
/** No item is focused at the start. */
export const NO_FOCUS = -1
export const fmt = (v: number, unit: string): string => { const [f, d] = UNIT[unit]!; return `${(v * f).toFixed(d)} ${unit}` }
/** What an item's value cell shows: the measured value in the unit, or the fixed code. */
export const itemText = (it: Item, unit: string): string => (it.v === null ? `#${it.id}` : fmt(it.v, unit))
export const itemClass = (on: boolean): string => (on ? "it on" : "it")
/** Which panel / group (global index) an item id belongs to; -1 for NO_FOCUS. Used to pass each child only the focus
 *  it needs (the component-render libraries' memo pattern). */
export const panelOf = (id: number): number => (id < 1 ? -1 : Math.floor((id - 1) / (GROUPS * ITEMS)))
export const groupOf = (id: number): number => (id < 1 ? -1 : Math.floor((id - 1) / ITEMS))

// Markup every app produces:
// <div class="deep"> per panel <section class="pnl"><h3>title</h3><p class="note">note</p><div class="grps">
//   per group <div class="grp"><h4>title</h4> per item <div class="it[ on]"><span class="k">label</span><b class="v">fmt</b></div>
const WORDS = ["sensör", "hat", "kuyu", "boru", "kablo", "direk", "köprü", "tünel", "kanal", "yol", "ray", "duvar"]
export const deep: Scenario<Deep, Step> = {
  id: "deep", label: "Bileşen sınırını aşan güncelleme", steps: 120, warm: 10,
  desc: "4 katlı bileşen hiyerarşisi: uygulama > 20 panel > 200 grup > 2.000 öğe; her katın kendi sabit içeriği vardır. Durum en üstte tutulur (görüntüleme birimi ve odaktaki öğe) ve aşağı aktarılır; her grupta bir ölçüm öğesi (toplam 200) kendi ölçüsünü bu birimle gösterir, kimliği odaktakiyle aynı olan öğe vurgulanır. 120 kare boyunca her karede odak başka bir öğeye geçer, her 10. karede birim değişir. Ölçülen: kare başına süre (işlem + boyama) ve 16,7 ms'yi aşan kare sayısı. İnce taneli kitaplıklarda değer aşağı aktarılsa da yalnız onu okuyan bağlar güncellenir; bileşen çizen kitaplıklarda en üstteki değişiklik ağaç boyunca aşağı iner. React, Preact ve Vue'da her kat memo/props karşılaştırmasıyla korunur ve her çocuğa yalnız ihtiyaç duyduğu değer aktarılır: odak değişince yalnız eski ve yeni öğenin paneli, grubu ve kendisi yeniden çizilir; birim değişince bütün paneller ve gruplar yeniden çizilip karşılaştırılır. Solid ve March birimi ve bir seçiciyi (selector) aşağı aktarır; Svelte'de odak her öğenin sınıf bağında yeniden karşılaştırılır; Lit her karede ağacı kökten yeniden işler. Sonuç: March ve Solid odak karelerinde vanilla'dan bile az iş yapar (ortanca yaklaşık ×0,8), React, Preact ve Vue memo ile korunsa da yolu yeniden çizer (×1,3–1,6); fark asıl birim karelerinde büyür: React, Preact ve Vue'da %95'lik dilim 9–12 ms'ye çıkar, March ve Solid'de vanilla düzeyinde (~7 ms) kalır; meşgul bir makinede bu kareler düşebilir. Svelte'nin seçicisi olmadığından odak karelerinde 2.000 karşılaştırma yapar ve ortancası en yüksektir (×4,8).",
  large: { label: "10.000 öğe", note: "10.000 öğede (100 panel, 1.000 ölçüm öğesi) birim değişen her karede tarayıcının stil, yerleşim ve boyama işi 30 ms'yi aşar ve her kitaplıkta bu kareler düşer; odak karelerinde ise her karede bütün öğeleri gezen kitaplıklar (Svelte'nin sınıf karşılaştırmaları, Lit'in kökten yeniden işlemesi) belirgin biçimde yavaşlar." },
  data(seed, large) {
    const r = rng(seed), w = () => WORDS[Math.floor(r() * WORDS.length)]!
    const items: Item[] = []
    const panels = Array.from({ length: large ? LARGE_PANELS : PANELS }, (_, p) => ({
      id: p + 1, title: `Panel ${p + 1}: ${w()} ${w()}`, note: `${w()} ${w()} ${w()} ölçümleri`,
      groups: Array.from({ length: GROUPS }, (_, g): Group => {
        const live = Math.floor(r() * ITEMS)
        return {
          id: p * GROUPS + g + 1, title: `Grup ${p + 1}.${g + 1}`,
          items: Array.from({ length: ITEMS }, (_, k) => {
            const it = { id: items.length + 1, label: `${w()} ${items.length + 1}`, v: k === live ? Math.round(r() * 500000) / 100 : null }
            items.push(it)
            return it
          }),
        }
      }),
    }))
    return { panels, items }
  },
  plan(data, seed, count) {
    // every 10th step changes the unit, the others move the focus; a step never repeats the current value and the
    // unit never returns to the starting one, so an app that skips its updates fails the check
    const r = rng(seed + 1), pick = UNITS.slice(1), n = data.items.length
    let unit = FIRST_UNIT, focus = NO_FOCUS
    return Array.from({ length: count }, (_, i): Step => {
      if ((i + 1) % 10 === 0) {
        let u = unit
        while (u === unit) u = pick[Math.floor(r() * pick.length)]!
        return { unit: (unit = u) }
      }
      let f = focus
      while (f === focus) f = 1 + Math.floor(r() * n)
      return { focus: (focus = f) }
    })
  },
  check(host, data, applied) {
    let unit = FIRST_UNIT, focus = NO_FOCUS
    for (const s of applied) if ("unit" in s) unit = s.unit; else focus = s.focus
    if (host.querySelectorAll(".deep > .pnl").length !== data.panels.length || host.querySelectorAll(".pnl > .grps > .grp").length !== data.panels.length * GROUPS) return false
    const items = host.querySelectorAll(".grp > .it")
    if (items.length !== data.items.length) return false
    for (let i = 0; i < items.length; i++) {
      const e = items[i]!, it = data.items[i]!
      if (e.className !== itemClass(it.id === focus)) return false
      if (e.lastChild?.textContent !== itemText(it, unit) || e.firstChild?.textContent !== it.label) return false
    }
    for (const p of [0, data.panels.length - 1]) {
      const s = host.querySelectorAll(".deep > .pnl")[p]!, d = data.panels[p]!
      if (s.querySelector("h3")?.textContent !== d.title || s.querySelector(".note")?.textContent !== d.note || s.querySelector(".grp > h4")?.textContent !== d.groups[0]!.title) return false
    }
    return true
  },
}

export default deep
