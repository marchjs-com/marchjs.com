// Yerleşim: Grid'in son satır davranışları (varsayılan / fill="stretch" / fill="last" / balance) yan yana; kart sayısı,
// sütun sayısı ve kapsayıcı genişliği değiştirilebilir. Hepsi yalnız CSS (flex-wrap + :has()), JS ölçümü yok.
import { Grid, Segmented, Slider, Field, Card, Badge } from "hadi-march/ui";
import { Demo, Section } from "../demo.tsx";

const MODES = [
  { value: "default", label: "Varsayılan" },
  { value: "stretch", label: "fill=stretch" },
  { value: "last", label: "fill=last" },
  { value: "balance", label: "balance" },
  { value: "balance-stretch", label: "balance + stretch" },
]

function Tile(props: { n: number }) {
  return <div class="sc-tile"><Badge tone="primary">{props.n}</Badge><span>Kart {props.n}</span></div>
}

export default function Layout() {
  let $count = 5
  let $cols = "4"
  let $width = 100
  let $mode = "stretch"
  const grid = (mode: string) => {
    const cols = Number($cols), items = Array.from({ length: $count }, (_, i) => <Tile n={i + 1} />)
    if (mode === "default") return <Grid cols={cols} gap={3}>{items}</Grid>
    if (mode === "stretch") return <Grid cols={cols} gap={3} fill="stretch">{items}</Grid>
    if (mode === "last") return <Grid cols={cols} gap={3} fill="last">{items}</Grid>
    if (mode === "balance") return <Grid cols={cols} gap={3} balance>{items}</Grid>
    return <Grid cols={cols} gap={3} balance fill="stretch">{items}</Grid>
  }
  return <Section kicker="Bileşenler" title="Yerleşim" lead="Grid hiçbir genişlikte yatay taşmaz. Son satır için isteğe bağlı fill (stretch: kalan alanı eşit paylaş, last: son kart genişlesin) ve balance (satırlara dengeli dağıt). Yalnız CSS; telefonda tek sütun.">
    <Demo wide title="Canlı karşılaştırma" desc="Kart sayısını, sütunu ve kapsayıcı genişliğini değiştir; seçili mod tam genişlikte, altında beşi yan yana."
      code={`<Grid cols={4} gap={3}>…</Grid>                 // varsayılan: hizalı sütunlar
<Grid cols={4} fill="stretch">…</Grid>           // son satır alanı eşit paylaşır
<Grid cols={4} fill="last">…</Grid>              // son kart kalan alana uzar
<Grid cols={4} balance>…</Grid>                  // 5 kart → 3 + 2 (4 + 1 değil)
<Grid min="17rem" fill="stretch">…</Grid>        // otomatik sütun + doldur`}>
      <div class="sc-row sc-row-between">
        <Segmented bind:value={$mode} aria-label="Mod" options={MODES} />
        <Segmented bind:value={$cols} aria-label="Sütun" options={["2", "3", "4", "5", "6"].map((v) => ({ value: v, label: `${v} sütun` }))} />
      </div>
      <div class="sc-grid-controls">
        <Field label={() => `Kart sayısı: ${$count}`}><Slider bind:value={$count} min={1} max={16} /></Field>
        <Field label={() => `Kapsayıcı genişliği: %${$width}`}><Slider bind:value={$width} min={30} max={100} step={10} /></Field>
      </div>
      <div class={() => `sc-grid-frame sc-w-${$width}`}>{() => grid($mode)}</div>
    </Demo>
    <Demo wide title="Beş mod yan yana" desc="Aynı kart ve sütun sayısıyla.">
      <div class="sc-grid-compare">
        {MODES.map((m) => <Card title={m.label}><div class={() => `sc-grid-frame sc-w-${$width}`}>{() => grid(m.value)}</div></Card>)}
      </div>
    </Demo>
  </Section>
}
