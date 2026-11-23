// Showcase stage for HonestCompare: HADİ next to an ordinary small event group, including the rows where it is behind.
import { HonestCompare, type CompareColumn, type CompareRow } from "march/components/landing/honest-compare";

export const code = `<HonestCompare columns={[{ id: "us", name: "HADİ" }, { id: "group", name: "Küçük etkinlik grubu" }]}
  rows={[{ label: "Sade: tek sohbet", values: { us: false, group: true }, note: "HADİ çok şey yapar." }]} />
<HonestCompare columns={…} rows={…} m:color="brand-green" tags={false} filter={false} labels={{ partly: "Yarım" }}
  renderCell={(value) => (value === true ? "Var" : value === false ? "Yok" : undefined)} />   // undefined: the default mark`

export const COMPARE_COLUMNS: CompareColumn[] = [
  { id: "us", name: "HADİ" }, { id: "group", name: "Küçük etkinlik grubu" },
]
export const COMPARE_ROWS: CompareRow[] = [
  { label: "Yeni etkinlik keşfet", values: { us: true, group: false } },
  { label: "Yeni insanlarla tanış", values: { us: true, group: "partial" } },
  { label: "Planlı etkinlikler ve takvim", values: { us: true, group: "partial" } },
  { label: "Bilet satışı", values: { us: true, group: false } },
  { label: "Sohbet, akış, görüntülü görüşme", values: { us: true, group: "partial" } },
  { label: "Arkadaş listesi", values: { us: true, group: false } },
  { label: "Herkes birbirini tanır", values: { us: "partial", group: true }, note: "Küçük bir grupta herkes tanıdık. HADİ'de de kendi grubunu kurabilirsin, ama kapı yeni insanlara hep açık." },
  { label: "Sade: tek sohbet, başka bir şey yok", values: { us: false, group: true }, note: "HADİ çok şey yapar; yalnız beş arkadaşla buluşmak istiyorsan bir mesaj grubu daha sade." },
  { label: "Kurulum", values: { us: "Uygulama ya da tarayıcı", group: "Bir mesaj grubu" } },
]

export default function HonestCompareDemo(props: { values: { sample: number; sampleCols: number; captionText: string; summary: boolean; caption: boolean; filter: boolean; tags: boolean; cells: string; color: string } }) {
  return <div>
    {() => { const v = { ...props.values }; return <HonestCompare columns={Number(v.sampleCols) === 3 ? [...COMPARE_COLUMNS, { id: "chat", name: "Mesaj grubu" }] : COMPARE_COLUMNS} rows={COMPARE_ROWS.slice(0, v.sample ?? COMPARE_ROWS.length)} summary={v.summary} filter={v.filter} tags={v.tags} m:color={v.color === "accent" ? undefined : v.color as "brand-green"}
      renderCell={v.cells === "words" ? (value) => (value === true ? <b>Var</b> : value === false ? "Yok" : value === "partial" ? "Kısmen" : undefined) : undefined}
      showCaption={v.caption} caption={v.captionText || undefined} /> }}
  </div>
}
