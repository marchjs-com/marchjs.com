// Showcase stage for Checkbox: look, size, the indeterminate state and label-less selection cells with Shift ranges.
import { signal } from "march";
import { Checkbox } from "march/components/forms/checkbox";
import { users } from "march/icons";

export const code = `<Checkbox bind:value={$agree} label="Kullanım koşullarını okudum" />
<Checkbox value={true} indeterminate label="Bazı alt öğeler seçili" />
<Checkbox variant="card" label="Ekip planı" hint="10 kişiye kadar" icon={users} />
<Checkbox value={$picked.has(row.id)} aria-label="Satırı seç" onClick={(e) => toggle(row, { range: e.shiftKey })} />   // etiketsiz, Shift ile aralık`

const ROWS = ["Ayşe Yılmaz", "Mehmet Demir", "Zeynep Kaya", "Can Öztürk", "Elif Şahin"]

export default function CheckboxDemo(props: { values: { label: string; variant: string; size: string; indeterminate: boolean; grid: boolean } }) {
  let $agree = true
  const picked = signal<number[]>([1])
  let anchor = 1
  // a plain click toggles one row; Shift + click selects the range from the last clicked row
  const toggle = (i: number, range: boolean): void => {
    const now = picked()
    if (range) { const a = Math.min(anchor, i), b = Math.max(anchor, i); picked.set([...new Set([...now, ...ROWS.map((_, k) => k).filter((k) => k >= a && k <= b)])]) }
    else picked.set(now.includes(i) ? now.filter((k) => k !== i) : [...now, i])
    anchor = i
  }
  return <div class="sc-stack">{() => {
    const v = { ...props.values }
    if (v.grid) return <div>
      <p class="m-muted"><Checkbox size={v.size as "md"} value={picked().length === ROWS.length} indeterminate={picked().length > 0 && picked().length < ROWS.length} aria-label="Tümünü seç"
        onChange={(on: boolean) => picked.set(on ? ROWS.map((_, k) => k) : [])} /> {() => `${picked().length} / ${ROWS.length} seçili · Shift ile tıklayınca aradakiler de seçilir`}</p>
      {ROWS.map((name, i) => <p><Checkbox size={v.size as "md"} value={picked().includes(i)} aria-label={`${name}: seç`} onClick={(e: MouseEvent) => toggle(i, e.shiftKey)} /> {name}</p>)}
    </div>
    const partial = v.indeterminate && (v.variant === "classic" || v.variant === "soft")
    return <div class="sc-col">
      <Checkbox value={$agree} onChange={(x: boolean) => { $agree = x }} variant={v.variant as "classic"} size={v.size as "md"} indeterminate={v.indeterminate}
        label={v.label || "Bildirimleri al"} hint={v.variant === "card" ? "Yeni yorum ve üye katılınca haber ver" : undefined} icon={v.variant === "card" ? users : undefined} />
      <p class="m-muted">{() => (partial ? "Kısmi: kutuda işaret yerine çizgi durur (alt öğelerin bir bölümü seçili)." : $agree ? "Seçili" : "Seçili değil")}</p>
    </div>
  }}</div>
}
